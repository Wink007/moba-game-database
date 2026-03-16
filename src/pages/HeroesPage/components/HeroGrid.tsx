import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { HeroCard } from './HeroCard';
import { HeroListRow } from './HeroListRow';
import { HeroGridProps } from './interface';
import styles from './HeroGrid.module.scss';
import { Hero } from '../../../types';

export const HeroGrid: React.FC<HeroGridProps> = React.memo(({
  heroes,
  gameId,
  hasMore,
  onLoadMore,
  isFiltering,
  viewMode,
}) => {
  const { t } = useTranslation();
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore) return;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) onLoadMore(); },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, onLoadMore]);

  if (heroes.length === 0) {
    return (
      <div className={styles.noData}>
        {t('heroes.noHeroesFound')}
      </div>
    );
  }

  return (
    <>
      {viewMode === 'grid' ? (
        <div className={styles.heroGrid} style={isFiltering ? { opacity: 0.5, transition: 'opacity 0.2s' } : { transition: 'opacity 0.2s' }}>
          {heroes.map((hero: Hero) => (
            <HeroCard key={hero.id} hero={hero} gameId={gameId} />
          ))}
        </div>
      ) : (
        <div className={styles.heroList} style={isFiltering ? { opacity: 0.5, transition: 'opacity 0.2s' } : { transition: 'opacity 0.2s' }}>
          {heroes.map((hero: Hero) => (
            <HeroListRow key={hero.id} hero={hero} gameId={gameId} />
          ))}
        </div>
      )}

      {hasMore && <div ref={sentinelRef} className={styles.sentinel} aria-hidden="true" />}
    </>
  );
});
