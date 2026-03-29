import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Hero, CounterHero, CompatibilityHero } from '../../../types';
import { heroToSlug } from '../../../utils/heroSlug';
import { getHeroName } from '../../../utils/translation';
import { LazyImage } from '../../../components/LazyImage';
import { assignTier, TIERS } from '../../TierListPage/constants';
import { CounterData, CompatibilityData } from './interface';
import { parseMaybeJson } from '../../../utils/parseMaybeJson';
import styles from '../styles.module.scss';

interface MetaOverviewProps {
  hero: Hero;
  allHeroes: Hero[];
  counterData?: CounterData | null;
  compatibilityData?: CompatibilityData | null;
}

export const MetaOverview: React.FC<MetaOverviewProps> = React.memo(({
  hero, allHeroes, counterData, compatibilityData,
}) => {
  const { t, i18n } = useTranslation();

  const wr = hero.main_hero_win_rate;
  const br = hero.main_hero_ban_rate;

  if (!wr) return null;

  const wrNum = wr < 1 ? wr * 100 : wr;
  const brNum = br ? (br < 1 ? br * 100 : br) : 0;
  const tier = assignTier(wrNum);
  const tierConfig = TIERS.find(t => t.key === tier)!;

  const contextKey = `metaContext${tier}` as const;

  const findHero = (heroId: number) =>
    allHeroes.find(h => h.hero_game_id === heroId) || allHeroes.find(h => h.id === heroId);

  const resolvedCounterData: CounterData | null =
    counterData ?? parseMaybeJson<CounterData>(hero.counter_data);
  const resolvedCompatData: CompatibilityData | null =
    compatibilityData ?? parseMaybeJson<CompatibilityData>(hero.compatibility_data);

  const topCounters: Hero[] = (resolvedCounterData?.best_counters ?? [])
    .slice(0, 3)
    .map((c: CounterHero) => findHero(c.heroid ?? c.hero_id ?? 0))
    .filter((h): h is Hero => !!h);

  const topWith: Hero[] = (resolvedCompatData?.compatible ?? [])
    .slice(0, 3)
    .map((c: CompatibilityHero) => findHero(c.heroid ?? c.hero_id ?? 0))
    .filter((h): h is Hero => !!h);

  return (
    <div className={styles.metaOverview}>
      {/* Tier badge + win rate row */}
      <div className={styles.metaHeader}>
        <div
          className={styles.metaTierBadge}
          style={{ background: tierConfig.bg, borderColor: tierConfig.border, color: tierConfig.color }}
        >
          <span className={styles.metaTierKey}>{tier}</span>
          <span className={styles.metaTierLabel}>{t(`tierList.label_${tier}`)}</span>
        </div>
        <div className={styles.metaStats}>
          <span className={styles.metaStatLine}>
            {t('heroDetail.metaWinRate', { wr: wrNum.toFixed(1), context: t(`heroDetail.${contextKey}`) })}
          </span>
          {brNum >= 5 && (
            <span className={styles.metaStatLine}>
              {t('heroDetail.metaBanRate', {
                br: brNum.toFixed(1),
                context: t(`heroDetail.${brNum >= 20 ? 'metaBanHigh' : 'metaBanMid'}`),
              })}
            </span>
          )}
        </div>
      </div>

      {/* Counters row */}
      {topCounters.length > 0 && (
        <div className={styles.metaRow}>
          <span className={styles.metaRowLabel}>{t('heroDetail.metaCounteredBy')}</span>
          <div className={styles.metaHeroChips}>
            {topCounters.map(h => (
              <Link
                key={h.id}
                to={`/${hero.game_id}/heroes/${heroToSlug(h.name)}`}
                className={styles.metaHeroChip}
              >
                <LazyImage
                  src={h.head || h.image}
                  alt={getHeroName(h, i18n.language)}
                  className={styles.metaChipAvatar}
                  wrapperStyle={{ borderRadius: '50%' }}
                />
                <span className={styles.metaChipName}>{getHeroName(h, i18n.language)}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Best with row */}
      {topWith.length > 0 && (
        <div className={styles.metaRow}>
          <span className={styles.metaRowLabel}>{t('heroDetail.metaBestWith')}</span>
          <div className={styles.metaHeroChips}>
            {topWith.map(h => (
              <Link
                key={h.id}
                to={`/${hero.game_id}/heroes/${heroToSlug(h.name)}`}
                className={styles.metaHeroChip}
              >
                <LazyImage
                  src={h.head || h.image}
                  alt={getHeroName(h, i18n.language)}
                  className={styles.metaChipAvatar}
                  wrapperStyle={{ borderRadius: '50%' }}
                />
                <span className={styles.metaChipName}>{getHeroName(h, i18n.language)}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});
