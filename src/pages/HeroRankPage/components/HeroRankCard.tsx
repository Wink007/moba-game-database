import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from '../styles.module.scss';
import { Hero } from '../../../types';

interface HeroRankCardProps {
  hero: any;
  index: number;
  heroes: Hero[] | undefined;
  selectedGameId: number;
}

export const HeroRankCard = ({ hero, index, heroes, selectedGameId }: HeroRankCardProps) => {
  const { t } = useTranslation();
  const counterHero = heroes?.find(h => h.id === hero.hero_id);

  const getCardClass = (index: number) => {
    if (index === 0) return styles.first;
    if (index === 1) return styles.second;
    if (index === 2) return styles.third;
    return '';
  };

  return (
    <div className={`${styles.heroCard} ${getCardClass(index)}`}>
      <div className={styles.rankBadge}>
        {index + 1}
      </div>

      <div className={styles.heroInfo}>
        <Link to={`/${selectedGameId}/heroes/${counterHero?.id}`} className={styles.heroImage}>
          <img src={hero.head || hero.image} alt={hero.name} />
        </Link>
        <div className={styles.heroName}>{hero.name}</div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statValue} data-label={t('heroRank.pickRate')}>
          {(hero.appearance_rate * 100).toFixed(2)}%
        </div>

        <div className={styles.statValue} data-label={t('heroRank.winRate')}>
          {(hero.win_rate * 100).toFixed(2)}%
        </div>

        <div className={styles.statValue} data-label={t('heroRank.banRate')}>
          {(hero.ban_rate * 100).toFixed(2)}%
        </div>
      </div>

      <div className={styles.synergyHeroes}>
        {hero.synergy_heroes && hero.synergy_heroes.length > 0 ? (
          hero.synergy_heroes.slice(0, 5).map((synergy: any) => {
            const synergyHero = heroes?.find(h => h.id === synergy.hero_id);

            return (
              <Link
                to={`/${selectedGameId}/heroes/${synergy.hero_id}`}
                key={synergy.hero_id}
                className={styles.synergyHero}
              >
                <img
                  src={synergyHero?.head}
                  alt={synergyHero?.name || `Hero ${synergy.hero_id}`}
                  className={styles.synergyHeroIcon}
                  title={t('heroRank.synergyTooltip', { 
                    hero: synergyHero?.name, 
                    rate: (synergy.increase_win_rate * 100).toFixed(1) 
                  })}
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
};
