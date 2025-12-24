import { Link } from 'react-router-dom';
import styles from '../styles.module.scss';
import { Hero } from '../../../types';

interface HeroRankCardProps {
  hero: any;
  index: number;
  heroes: Hero[] | undefined;
  selectedGameId: number;
}

export const HeroRankCard = ({ hero, index, heroes, selectedGameId }: HeroRankCardProps) => {
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
        <div className={styles.statValue} data-label="Pick Rate">
          {(hero.appearance_rate * 100).toFixed(2)}%
        </div>

        <div className={styles.statValue} data-label="Win Rate">
          {(hero.win_rate * 100).toFixed(2)}%
        </div>

        <div className={styles.statValue} data-label="Ban Rate">
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
                  title={`${synergyHero?.name}: +${(synergy.increase_win_rate * 100).toFixed(1)}% win rate`}
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
