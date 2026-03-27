import React from 'react';
import { Link } from 'react-router-dom';
import type { Hero } from '../../../types';
import { ATTR_LABEL } from '../constants';
import { heroToSlug } from '../../../utils/heroSlug';
import { FavoriteButton } from '../../../components/FavoriteButton';
import { LazyImage } from '../../../components/LazyImage';
import { getOptimizedImageUrl } from '../../../utils/cloudinary';
import styles from '../../HeroesPage/styles.module.scss';

interface HeroListRowProps {
  hero: Hero;
  gameId: number;
}

export const Dota2HeroListRow: React.FC<HeroListRowProps> = ({ hero, gameId }) => {
  const attrIcon = ATTR_LABEL[(hero.hero_stats as any)?.primary_attr ?? ''] ?? '';

  return (
    <Link to={`/${gameId}/heroes/${heroToSlug(hero.name)}`} className={styles.heroListRow}>
      <div className={styles.heroListAvatar}>
        {hero.image ? (
          <LazyImage fill src={getOptimizedImageUrl(hero.image, 64)} alt={hero.name} className={styles.heroListAvatarImg} />
        ) : (
          <div className={styles.heroListAvatarPlaceholder}>{hero.name.charAt(0)}</div>
        )}
      </div>

      <div className={styles.heroListInfo}>
        <span className={styles.heroListName}>{hero.name}</span>
        {hero.roles && hero.roles.length > 0 && (
          <span className={styles.heroListRoles}>{hero.roles.slice(0, 2).join(' · ')}</span>
        )}
      </div>

      {attrIcon && (
        <div className={styles.heroListLanes}>
          <span style={{ fontSize: '18px' }}>{attrIcon}</span>
        </div>
      )}

      <div className={styles.heroListFavorite} onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
        <FavoriteButton heroId={hero.id} tooltipPosition="top" />
      </div>
    </Link>
  );
};
