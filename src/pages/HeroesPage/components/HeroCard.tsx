import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Hero } from '../../../types';
import { Lanes, LanesIcons } from '../../../enum';
import { getHeroName, translateRoles, translateLanes } from '../../../utils/translation';
import styles from '../styles.module.scss';

interface HeroCardProps {
  hero: Hero;
  gameId: number;
}

export const HeroCard = ({ hero, gameId }: HeroCardProps) => {
  const { i18n } = useTranslation();
  const getLaneIcon = (lane: string): string | undefined => {
    const laneKey = Object.values(Lanes).find(l => l.toLowerCase() === lane.toLowerCase());
    return laneKey ? LanesIcons[laneKey as Lanes] : undefined;
  };

  return (
    <Link to={`/${gameId}/heroes/${hero.id}`} className={styles.heroCard}>
      <div className={styles.heroImageWrapper}>
        {hero.image ? (
          <img src={hero.image} alt={getHeroName(hero, i18n.language)} className={styles.heroImage} />
        ) : (
          <div className={styles.heroImagePlaceholder}>
            <span>{getHeroName(hero, i18n.language).charAt(0)}</span>
          </div>
        )}
        <div className={styles.heroImageOverlay} />
        
        {/* Lane icons in top left corner */}
        {hero.lane && hero.lane.length > 0 && (
          <div className={styles.heroLanes}>
            {hero.lane.slice(0, 2).map((lane, index) => {
              const icon = getLaneIcon(lane);
              const translatedLanes = translateLanes(hero.lane || [], i18n.language);
              return icon ? (
                <img 
                  key={lane} 
                  src={icon} 
                  alt={translatedLanes[index] || lane}
                  className={styles.laneIcon}
                  title={translatedLanes[index] || lane}
                />
              ) : null;
            })}
          </div>
        )}
      </div>
      
      <div className={styles.heroContent}>
        <h3 className={styles.heroName}>{getHeroName(hero, i18n.language)}</h3>
        <div className={styles.heroFooter} />
        {hero.roles && hero.roles.length > 0 && (
          <p className={styles.heroRoles}>
            {translateRoles(hero.roles, i18n.language).slice(0, 2).join(' • ')}
          </p>
        )}
        
      </div>
    </Link>
  );
};

