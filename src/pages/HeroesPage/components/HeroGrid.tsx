import React from 'react';
import { useTranslation } from 'react-i18next';
import { HeroCard } from './HeroCard';
import LoadMoreButton from '../../../components/LoadMoreButton';
import { HeroGridProps } from './interface';
import styles from './HeroGrid.module.scss';
import { Hero } from '../../../types';

export const HeroGrid: React.FC<HeroGridProps> = ({
  heroes,
  gameId,
  hasMore,
  remainingCount,
  onLoadMore,
  isFiltering,
}) => {
  const { t } = useTranslation();
  if (heroes.length === 0) {
    return (
      <div className={styles.noData}>
        {t('heroes.noHeroesFound')}
      </div>
    );
  }

  return (
    <>
      <div className={styles.heroGrid} style={isFiltering ? { opacity: 0.5, transition: 'opacity 0.2s' } : { transition: 'opacity 0.2s' }}>
        {heroes.map((hero: Hero) => (
          <HeroCard key={hero.id} hero={hero} gameId={gameId} />
        ))}
      </div>

      {hasMore && (
        <LoadMoreButton onClick={onLoadMore}>
          {t('heroes.showMore', { count: remainingCount })}
        </LoadMoreButton>
      )}
    </>
  );
};
