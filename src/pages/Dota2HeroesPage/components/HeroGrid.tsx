import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { Hero } from '../../../types';
import { Dota2HeroCard } from './HeroCard';
import { Dota2HeroListRow } from './HeroListRow';
import type { ViewMode } from '../types';
import gridStyles from '../../HeroesPage/components/HeroGrid.module.scss';

interface HeroGridProps {
  heroes: Hero[];
  gameId: number;
  hasMore: boolean;
  onLoadMore: () => void;
  isFiltering: boolean;
  viewMode: ViewMode;
}

export const Dota2HeroGrid: React.FC<HeroGridProps> = React.memo(({
  heroes, gameId, hasMore, onLoadMore, isFiltering, viewMode,
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
    return <div className={gridStyles.noData}>{t('heroes.noHeroesFound')}</div>;
  }

  const fadingStyle = isFiltering
    ? { opacity: 0.5, transition: 'opacity 0.2s' }
    : { transition: 'opacity 0.2s' };

  return (
    <>
      {viewMode === 'grid' ? (
        <div className={gridStyles.heroGrid} style={fadingStyle}>
          {heroes.map((hero) => <Dota2HeroCard key={hero.id} hero={hero} gameId={gameId} />)}
        </div>
      ) : (
        <div className={gridStyles.heroList} style={fadingStyle}>
          {heroes.map((hero) => <Dota2HeroListRow key={hero.id} hero={hero} gameId={gameId} />)}
        </div>
      )}
      {hasMore && <div ref={sentinelRef} className={gridStyles.sentinel} aria-hidden="true" />}
    </>
  );
});
