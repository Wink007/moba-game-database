import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Hero } from '../../../types';
import { Lanes, LanesIcons } from '../../../enum';
import { heroToSlug } from '../../../utils/heroSlug';
import { getHeroName, translateRoles, translateLanes } from '../../../utils/translation';
import { getOptimizedImageUrl } from '../../../utils/cloudinary';
import { FavoriteButton } from '../../../components/FavoriteButton';
import { LazyImage } from '../../../components/LazyImage';
import styles from '../styles.module.scss';

interface HeroListRowProps {
  hero: Hero;
  gameId: number;
}

export const HeroListRow = ({ hero, gameId }: HeroListRowProps) => {
  const { i18n } = useTranslation();
  const name = getHeroName(hero, i18n.language);
  const roles = translateRoles(hero.roles ?? [], i18n.language);
  const lanes = translateLanes(hero.lane ?? [], i18n.language);

  const getLaneIcon = (lane: string) => {
    const key = Object.values(Lanes).find(l => l.toLowerCase() === lane.toLowerCase());
    return key ? LanesIcons[key as Lanes] : undefined;
  };

  return (
    <Link to={`/${gameId}/heroes/${heroToSlug(hero.name)}`} className={styles.heroListRow}>
      {/* Avatar */}
      <div className={styles.heroListAvatar}>
        {hero.image ? (
          <LazyImage
            fill
            src={getOptimizedImageUrl(hero.image, 64)}
            alt={name}
            className={styles.heroListAvatarImg}
          />
        ) : (
          <div className={styles.heroListAvatarPlaceholder}>{name.charAt(0)}</div>
        )}
      </div>

      {/* Name + roles */}
      <div className={styles.heroListInfo}>
        <span className={styles.heroListName}>{name}</span>
        {roles.length > 0 && (
          <span className={styles.heroListRoles}>{roles.slice(0, 2).join(' · ')}</span>
        )}
      </div>

      {/* Lane icons */}
      {(hero.lane ?? []).length > 0 && (
        <div className={styles.heroListLanes}>
          {(hero.lane ?? []).slice(0, 3).map((lane, i) => {
            const icon = getLaneIcon(lane);
            return icon ? (
              <img key={lane} src={icon} alt={lanes[i] || lane} title={lanes[i] || lane} className={styles.heroListLaneIcon} />
            ) : null;
          })}
        </div>
      )}

      {/* Win rate */}
      {hero.main_hero_win_rate != null && (
        <span className={styles.heroListWinRate}>{hero.main_hero_win_rate.toFixed(1)}%</span>
      )}

      {/* Damage type */}
      {hero.damage_type && (
        <span className={styles.heroListDamageType}>{hero.damage_type}</span>
      )}

      {/* Favorite */}
      <div className={styles.heroListFavorite} onClick={e => { e.preventDefault(); e.stopPropagation(); }}>
        <FavoriteButton heroId={hero.id} tooltipPosition="top" />
      </div>
    </Link>
  );
};
