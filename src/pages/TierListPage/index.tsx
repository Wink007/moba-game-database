import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../../store/gameStore';
import { useHeroRanksQuery, useHeroesQuery } from '../../queries/useHeroesQuery';
import { useSEO } from '../../hooks/useSEO';
import { Loader } from '../../components/Loader';
import { getRankOptions } from '../HeroRankPage/constants';
import { HeroRank } from '../../types';
import { TIERS, TierKey, assignTier } from './constants';
import styles from './styles.module.scss';

export const TierListPage: React.FC = () => {
  const { t } = useTranslation();
  const rankOpts = useMemo(() => getRankOptions(t), [t]);
  const { selectedGameId } = useGameStore();
  const [rank, setRank] = useState('glory');

  useSEO({
    title: t('tierList.title'),
    description: t('tierList.description'),
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
        <span className={styles.totalBadge}>{rankData?.length ?? 0} {t('tierList.heroes')}</span>
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

      {/* Tiers */}
      <div className={styles.tierList}>
        {TIERS.map(({ key, color, bg, border }) => {
          const list = tieredHeroes[key] ?? [];
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
                        to={`/${selectedGameId}/heroes/${heroData?.id ?? hero.hero_id}`}
                        className={styles.heroCard}
                      >
                        <div className={styles.heroImgWrap}>
                          <img
                            src={hero.head || hero.image}
                            alt={hero.name}
                            className={styles.heroImg}
                            loading="lazy"
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

