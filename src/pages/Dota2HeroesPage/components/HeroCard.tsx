import React from 'react';
import { Link } from 'react-router-dom';
import type { Hero } from '../../../types';
import { ATTR_LABEL } from '../constants';
import { heroToSlug } from '../../../utils/heroSlug';
import { FavoriteButton } from '../../../components/FavoriteButton';
import { LazyImage } from '../../../components/LazyImage';
import { getOptimizedImageUrl } from '../../../utils/cloudinary';
import styles from '../../HeroesPage/styles.module.scss';

interface HeroCardProps {
  hero: Hero;
  gameId: number;
}

export const Dota2HeroCard: React.FC<HeroCardProps> = ({ hero, gameId }) => {
  const attrIcon = ATTR_LABEL[(hero.hero_stats as any)?.primary_attr ?? ''] ?? '';

  return (
    <Link to={`/${gameId}/heroes/${heroToSlug(hero.name)}`} className={styles.heroCard}>
      <div className={styles.heroImageWrapper}>
        {hero.image ? (
          <LazyImage fill src={getOptimizedImageUrl(hero.image, 200)} alt={hero.name} className={styles.heroImage} />
        ) : (
          <div className={styles.heroImagePlaceholder}>
            <span>{hero.name.charAt(0)}</span>
          </div>
        )}
        <div className={styles.heroImageOverlay} />
        {attrIcon && (
          <div className={styles.heroLanes}>
            <span style={{ fontSize: '16px', lineHeight: 1 }}>{attrIcon}</span>
          </div>
        )}
      </div>

      <div className={styles.heroFavorite} onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
        <FavoriteButton heroId={hero.id} tooltipPosition="top" />
      </div>

      <div className={styles.heroContent}>
        <h3 className={styles.heroName}>{hero.name}</h3>
        <div className={styles.heroFooter} />
        {hero.roles && hero.roles.length > 0 && (
          <p className={styles.heroRoles}>
            {hero.roles.slice(0, 2).join(' • ')}
          </p>
        )}
      </div>
    </Link>
  );
};
