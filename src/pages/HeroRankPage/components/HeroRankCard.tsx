import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from '../styles.module.scss';
import { Hero, HeroCounterData, HeroRank } from '../../../types';

interface HeroRankCardProps {
  hero: HeroRank;
  index: number;
  heroes: Hero[] | undefined;
  counterData: Record<number, HeroCounterData> | undefined;
  selectedGameId: number;
}

export const HeroRankCard = React.memo(({ hero, index, heroes, counterData, selectedGameId }: HeroRankCardProps) => {
  const { t } = useTranslation();
  const counterHero = heroes?.find(h => h.id === hero.hero_id);
  const heroGameId = hero.hero_game_id ?? counterHero?.hero_game_id ?? counterHero?.id;
  const counters = heroGameId ? (counterData?.[heroGameId]?.best_counters || []) : [];

  const normalizeRate = (value: number | null | undefined) => {
    if (value == null) return 0;
    return value;
  };

  const getCardClass = (index: number) => {
    if (index === 0) return styles.first;
    if (index === 1) return styles.second;
    if (index === 2) return styles.third;
    return '';
  };

  return (
    <div className={`${styles.heroCard} ${getCardClass(index)}`}>
      <div className={styles.heroRow}>
        <div className={styles.rankBadge}>
          {index + 1}
        </div>
        <div className={styles.heroInfo}>
          <Link to={`/${selectedGameId}/heroes/${counterHero?.id}`} className={styles.heroImage}>
            <img src={hero.head || hero.image} alt={hero.name} />
          </Link>
          <div className={styles.heroName}>{hero.name}</div>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statValue} data-label={t('heroRank.pickRate')}>
          {normalizeRate(hero.appearance_rate).toFixed(2)}%
        </div>

        <div className={styles.statValue} data-label={t('heroRank.winRate')}>
          {normalizeRate(hero.win_rate).toFixed(2)}%
        </div>

        <div className={styles.statValue} data-label={t('heroRank.banRate')}>
          {normalizeRate(hero.ban_rate).toFixed(2)}%
        </div>
      </div>

      <div className={styles.synergyHeroes} data-label={t('heroRank.bestWith')}>
        {counters.length > 0 ? (
          counters.slice(0, 5).map((counter) => {
            const counterGameId = counter.heroid ?? counter.hero_id;
            const enemyHero = heroes?.find(h =>
              h.hero_game_id === counterGameId
            );

            if (!enemyHero) return null;

            return (
              <Link
                to={`/${selectedGameId}/heroes/${enemyHero.id}`}
                key={counterGameId}
                className={styles.synergyHero}
              >
                <img
                  src={enemyHero.head || enemyHero.image}
                  alt={enemyHero.name || `Hero ${counterGameId}`}
                  className={styles.synergyHeroIcon}
                  title={`${enemyHero.name}: ${normalizeRate(counter.increase_win_rate).toFixed(1)}%`}
                />
              </Link>
            );
          })
        ) : (
          <span className={styles.noSynergy}>—</span>
        )}
      </div>
    </div>
  );
});
