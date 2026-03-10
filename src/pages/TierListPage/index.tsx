import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { heroToSlug } from '../../utils/heroSlug';
import { useGameStore } from '../../store/gameStore';
import { useFilterSettingsStore } from '../../store/filterSettingsStore';
import { useHeroRanksQuery, useHeroesQuery } from '../../queries/useHeroesQuery';
import { useSEO } from '../../hooks/useSEO';
import { Loader } from '../../components/Loader';
import { getRankOptions } from '../HeroRankPage/constants';
import { HeroRank } from '../../types';
import { TIERS, TierKey, assignTier } from './constants';
import { LazyImage } from '../../components/LazyImage';
import styles from './styles.module.scss';

const LANES = [
  { value: 'all',    labelKey: 'heroes.filters.allLanes' },
  { value: 'exp',    labelKey: 'heroes.filters.expLane',  match: ['Exp Lane', 'EXP Lane'] },
  { value: 'gold',   labelKey: 'heroes.filters.goldLane', match: ['Gold Lane'] },
  { value: 'mid',    labelKey: 'heroes.filters.midLane',  match: ['Mid Lane'] },
  { value: 'jungle', labelKey: 'heroes.filters.jungle',   match: ['Jungle'] },
  { value: 'roam',   labelKey: 'heroes.filters.roam',     match: ['Roam'] },
];

export const TierListPage: React.FC = () => {
  const { t } = useTranslation();
  const rankOpts = useMemo(() => getRankOptions(t), [t]);
  const { selectedGameId } = useGameStore();
  const { defaultRank } = useFilterSettingsStore();
  const [rank, setRank] = useState(() => defaultRank);
  const [lane, setLane] = useState('all');

  useSEO({
    title: t('tierList.title'),
    description: t('tierList.description'),
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mobawiki.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tier List', item: `https://mobawiki.com/${selectedGameId}/tier-list` },
      ],
    },
  });

  const { data: rankData, isLoading, isError } = useHeroRanksQuery(
    selectedGameId, 1, 999, 1, rank, 'win_rate', 'desc'
  );

  const { data: heroes } = useHeroesQuery(selectedGameId);

  const tieredHeroes = useMemo(() => {
    if (!rankData) return {} as Record<TierKey, HeroRank[]>;
    const groups: Record<TierKey, HeroRank[]> = { S: [], A: [], B: [], C: [], D: [] };
    for (const hero of rankData) {
      groups[assignTier(hero.win_rate)].push(hero);
    }
    return groups;
  }, [rankData]);

  // Build set of hero IDs that belong to selected lane
  const laneFilteredIds = useMemo(() => {
    if (lane === 'all' || !heroes) return null;
    const laneConfig = LANES.find(l => l.value === lane);
    if (!laneConfig?.match) return null;
    const ids = new Set<number>();
    for (const h of heroes) {
      const heroLanes = (h.lane || []).map((l: string) => l.toLowerCase());
      if (laneConfig.match.some(m => heroLanes.includes(m.toLowerCase()))) {
        ids.add(h.id);
      }
    }
    return ids;
  }, [lane, heroes]);

  const displayTieredHeroes = useMemo(() => {
    if (!laneFilteredIds) return tieredHeroes;
    const result: Record<TierKey, HeroRank[]> = { S: [], A: [], B: [], C: [], D: [] };
    for (const key of Object.keys(tieredHeroes) as TierKey[]) {
      result[key] = tieredHeroes[key].filter(h => laneFilteredIds.has(h.hero_id));
    }
    return result;
  }, [tieredHeroes, laneFilteredIds]);

  if (isLoading) return <Loader />;
  if (isError) return <div className={styles.error}>{t('tierList.noData')}</div>;

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>{t('tierList.title')}</h1>
          <p className={styles.description}>{t('tierList.description')}</p>
        </div>
        <span className={styles.totalBadge}>
          {Object.values(displayTieredHeroes).flat().length} {t('tierList.heroes')}
        </span>
      </div>

      {/* Rank segmented filter */}
      <div className={styles.rankFilters}>
        {rankOpts.map((opt) => (
          <button
            key={opt.value}
            className={`${styles.rankPill} ${rank === opt.value ? styles.rankPillActive : ''}`}
            onClick={() => setRank(opt.value as string)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Lane filter */}
      <div className={styles.laneFilters}>
        {LANES.map(({ value, labelKey }) => (
          <button
            key={value}
            className={`${styles.lanePill} ${lane === value ? styles.lanePillActive : ''}`}
            onClick={() => setLane(value)}
          >
            {t(labelKey)}
          </button>
        ))}
      </div>

      {/* Tiers */}
      <div className={styles.tierList}>
        {TIERS.map(({ key, color, bg, border }) => {
          const list = displayTieredHeroes[key] ?? [];
          return (
            <div
              key={key}
              className={styles.tierSection}
              style={{
                '--tc': color,
                '--tbg': bg,
                '--tborder': border,
              } as React.CSSProperties}
            >
              {/* Tier header */}
              <div className={styles.tierHeader}>
                <div className={styles.tierBadge}>
                  <span className={styles.tierLetter}>{key}</span>
                </div>
                <span className={styles.tierLabel}>{t(`tierList.label_${key}`)}</span>
                <div className={styles.tierLine} />
                <span className={styles.tierCount}>{list.length}</span>
              </div>

              {/* Hero cards */}
              <div className={styles.heroGrid}>
                {list.length === 0 ? (
                  <span className={styles.emptyMsg}>{t('tierList.noHeroesInTier')}</span>
                ) : (
                  list.map((hero) => {
                    const heroData = heroes?.find(
                      h => h.id === hero.hero_id || h.hero_game_id === hero.hero_game_id
                    );
                    return (
                      <Link
                        key={hero.id}
                        to={`/${selectedGameId}/heroes/${heroToSlug(hero.name)}`}
                        className={styles.heroCard}
                      >
                        <div className={styles.heroImgWrap}>
                          <LazyImage
                            src={hero.head || hero.image}
                            alt={hero.name}
                            className={styles.heroImg}
                            fill
                          />
                        </div>
                        <div className={styles.heroInfo}>
                          <span className={styles.heroName}>{hero.name}</span>
                          <span className={styles.heroWr}>{hero.win_rate.toFixed(1)}%</span>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        <span className={styles.legendTitle}>{t('tierList.winRateThresholds')}</span>
        {TIERS.map(tier => (
          <span key={tier.key} className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: tier.color }} />
            <strong style={{ color: tier.color }}>{tier.key}</strong>
            <span>{tier.min > 0 ? `≥ ${tier.min}%` : `< ${TIERS[TIERS.length - 2].min}%`}</span>
          </span>
        ))}
      </div>
    </div>
  );
};

