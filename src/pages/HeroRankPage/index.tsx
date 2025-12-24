import { useState } from 'react';
import { useHeroes, useHeroRanks } from '../../hooks/useHeroes';
import LoadMoreButton from '../../components/LoadMoreButton';
import { FilterSection, FilterGroup } from '../../components/FilterSection';
import styles from './styles.module.scss';
import { useGameStore } from '../../store/gameStore';
import { DAYS_OPTIONS, RANK_OPTIONS, SORT_OPTIONS, ITEMS_PER_PAGE } from './constants';
import { HeroRankSkeleton } from './components/HeroRankSkeleton';
import { HeroRankCard } from './components/HeroRankCard';

export const HeroRankPage = () => {
  const { selectedGameId } = useGameStore();
  const [days, setDays] = useState(1);
  const [rank, setRank] = useState('all');
  const [sortField, setSortField] = useState<'win_rate' | 'ban_rate' | 'pick_rate'>('win_rate');
  const [page, setPage] = useState(1);
  const [allHeroes, setAllHeroes] = useState<any[]>([]);

  const { data: heroRanksData, isLoading, isError } = useHeroRanks(
    selectedGameId,
    page,
    ITEMS_PER_PAGE,
    days,
    rank,
    sortField,
    'desc'
  );

  const { data: heroes } = useHeroes(selectedGameId);

  if (heroRanksData && !isLoading) {
    const existingIds = new Set(allHeroes.map(h => h.id));
    const newHeroes = heroRanksData.filter(h => !existingIds.has(h.id));
    if (newHeroes.length > 0 && page === 1) {
      setAllHeroes(heroRanksData);
    } else if (newHeroes.length > 0) {
      setAllHeroes(prev => [...prev, ...newHeroes]);
    }
  }

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  const handleFilterChange = () => {
    setPage(1);
    setAllHeroes([]);
  };

  const filterGroups: FilterGroup[] = [
    {
      label: 'Time Period',
      emoji: '⏱️',
      options: DAYS_OPTIONS,
      selectedValue: days,
      onChange: (value) => {
        setDays(Number(value));
        handleFilterChange();
      }
    },
    {
      label: 'Rank Tier',
      emoji: '🏆',
      options: RANK_OPTIONS,
      selectedValue: rank,
      onChange: (value) => {
        setRank(value);
        handleFilterChange();
      }
    },
    {
      label: 'Sort By',
      emoji: '📊',
      options: SORT_OPTIONS,
      selectedValue: sortField,
      onChange: (value) => {
        setSortField(value as 'win_rate' | 'ban_rate' | 'pick_rate');
        handleFilterChange();
      }
    }
  ];

  const displayHeroes = page === 1 ? heroRanksData || [] : allHeroes;
  const hasMore = heroRanksData && heroRanksData.length === ITEMS_PER_PAGE;

  if (isError) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Failed to load hero rankings</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Hero Rankings</h1>
          <p className={styles.subtitle}>Competitive tier list based on current meta</p>
        </div>

        <FilterSection filterGroups={filterGroups} collapsible={true} defaultExpanded={false} />
      </div>

      <div className={styles.tableHeader}>
        <div className={styles.headerRank}>#</div>
        <div className={styles.headerHero}>HERO</div>
        <div className={styles.headerStat}>PICK RATE</div>
        <div className={styles.headerStat}>WIN RATE</div>
        <div className={styles.headerStat}>BAN RATE</div>
        <div className={styles.headerSynergy}>BEST WITH</div>
      </div>

      <div className={styles.heroGrid}>
        {isLoading && page === 1 ? (
          <HeroRankSkeleton count={ITEMS_PER_PAGE} />
        ) : (
          displayHeroes.map((hero, index) => (
            <HeroRankCard
              key={`${hero.id}-${index}`}
              hero={hero}
              index={index}
              heroes={heroes}
              selectedGameId={selectedGameId}
            />
          ))
        )}

        {isLoading && page > 1 && (
          <HeroRankSkeleton count={ITEMS_PER_PAGE} />
        )}
      </div>

      {hasMore && !isLoading && (
        <LoadMoreButton onClick={handleLoadMore}>
          Show More Heroes
        </LoadMoreButton>
      )}

      {!isLoading && displayHeroes.length === 0 && (
        <div className={styles.noData}>
          No hero rankings available for selected filters
        </div>
      )}
    </div>
  );
};
