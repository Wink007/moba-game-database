import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from '../styles.module.scss';
import { LazyImage } from '../../../components/LazyImage';
import { Hero, HeroRank, CounterMode, HeroCounterData } from '../../../types';

interface HeroRankCardProps {
  hero: HeroRank;
  index: number;
  heroes: Hero[] | undefined;
  selectedGameId: number;
  counterMode: CounterMode;
  onToggleCounterMode: () => void;
  counterData: Record<number, HeroCounterData> | undefined;
}

export const HeroRankCard = React.memo(({ hero, index, heroes, selectedGameId, counterMode, onToggleCounterMode, counterData }: HeroRankCardProps) => {
  const { t } = useTranslation();
  const heroData = heroes?.find(h => h.id === hero.hero_id);

  // Get counter list from the dedicated counter-data endpoint keyed by hero_game_id
  const heroGameId = hero.hero_game_id ?? heroData?.hero_game_id;
  const counters = heroGameId ? counterData?.[heroGameId] : undefined;

  const counterList = counterMode === 'counters'
    ? (counters?.best_counters ?? [])
    : (counters?.most_countered_by ?? []);

  const normalizeRate = (value: number | null | undefined) => value ?? 0;
  const cardClass = index === 0 ? styles.first : index === 1 ? styles.second : index === 2 ? styles.third : '';

  return (
    <div className={`${styles.heroCard} ${cardClass}`}>

      {/* Col 1 — Rank */}
      <div className={styles.rankBadge}>{index + 1}</div>

      {/* Col 2 — Hero */}
      <div className={styles.heroInfo}>
        <Link to={`/${selectedGameId}/heroes/${heroData?.id}`} className={styles.heroImage}>
          <LazyImage fill src={hero.head || hero.image} alt={hero.name} />
        </Link>
        <div className={styles.heroName}>{hero.name}</div>
      </div>

      {/* Mobile-only: toggle button between hero and stats */}
      <div className={styles.toggleBtnCell}>
        <button
          className={styles.toggleCounterBtn}
          onClick={onToggleCounterMode}
          title={counterMode === 'counters' ? t('heroDetail.bestCounters') : t('heroDetail.mostCounteredBy')}
          aria-label="Toggle counter mode"
        >
          ⟲
        </button>
      </div>

      {/* Col 3 — Counter Heroes */}
      <div className={styles.synergyHeroes}>
        <button
          className={`${styles.toggleCounterBtn} ${styles.toggleCounterBtnDesktop}`}
          onClick={onToggleCounterMode}
          title={counterMode === 'counters' ? t('heroDetail.bestCounters') : t('heroDetail.mostCounteredBy')}
          aria-label="Toggle counter mode"
        >
          ⟲
        </button>
        {counterData === undefined ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={styles.synergyHeroSkeleton} />
          ))
        ) : counterList.length > 0 ? (
          counterList.slice(0, 5).map((counter: any) => {
            const gameId = counter.heroid ?? counter.hero_id;
            const enemy = heroes?.find(h => h.hero_game_id === gameId);
            if (!enemy) return null;
            const rate = counter.win_rate ?? counter.increase_win_rate ?? 0;
            return (
              <Link
                to={`/${selectedGameId}/heroes/${enemy.id}`}
                key={gameId}
                className={styles.synergyHero}
              >
                <img
                  src={enemy.head || enemy.image}
                  alt={enemy.name}
                  className={styles.synergyHeroIcon}
                  title={`${enemy.name}: ${normalizeRate(rate).toFixed(1)}%`}
                />
              </Link>
            );
          })
        ) : (
          <span className={styles.noSynergy}>—</span>
        )}
      </div>

      {/* Col 4-6 — Stats */}
      <div className={styles.statPick} data-label={t('heroRank.pickRate')} data-short={t('heroRank.pick')}>
        {normalizeRate(hero.appearance_rate).toFixed(2)}%
      </div>
      <div className={styles.statWin} data-label={t('heroRank.winRate')} data-short={t('heroRank.win')}>
        {normalizeRate(hero.win_rate).toFixed(2)}%
      </div>
      <div className={styles.statBan} data-label={t('heroRank.banRate')} data-short={t('heroRank.ban')}>
        {normalizeRate(hero.ban_rate).toFixed(2)}%
      </div>

    </div>
  );
});
