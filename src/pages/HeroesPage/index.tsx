import { useState, useMemo } from 'react';
import { Loader } from '../../components/Loader';
import LoadMoreButton from '../../components/LoadMoreButton';
import { FilterSection, FilterGroup } from '../../components/FilterSection';
import { useHeroes } from '../../hooks/useHeroes';
import { useGameStore } from '../../store/gameStore';
import type { Hero } from '../../types';
import { ROLE_OPTIONS, LANE_OPTIONS, COMPLEXITY_OPTIONS, SORT_OPTIONS, HEROES_PER_PAGE } from './constants';
import { HeroCard } from './components/HeroCard';
import styles from './styles.module.scss';

function HeroesPage() {
  const { selectedGameId } = useGameStore();  
  const { data: heroes, isLoading, isError } = useHeroes(selectedGameId);
  
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedLane, setSelectedLane] = useState('all');
  const [selectedComplexity, setSelectedComplexity] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [searchQuery, setSearchQuery] = useState('');
  const [displayCount, setDisplayCount] = useState(HEROES_PER_PAGE);

  // Фільтрація та сортування
  const filteredAndSortedHeroes = useMemo(() => {
    if (!heroes) return [];

    let filtered = heroes.filter((hero: Hero) => {
      const matchesRole = selectedRole === 'all' || hero.roles?.includes(selectedRole);
      const matchesLane = selectedLane === 'all' || hero.lane?.includes(selectedLane as any);
      
      // Complexity filter based on abilityshow[3]
      let matchesComplexity = selectedComplexity === 'all';
      if (!matchesComplexity && hero.abilityshow && hero.abilityshow[3] !== undefined) {
        const difficultyValue = Number(hero.abilityshow[3]);
        
        // Map difficulty value ranges to complexity levels
        if (selectedComplexity === 'Easy' && difficultyValue <= 33) {
          matchesComplexity = true;
        } else if (selectedComplexity === 'Medium' && difficultyValue > 33 && difficultyValue <= 66) {
          matchesComplexity = true;
        } else if (selectedComplexity === 'Hard' && difficultyValue > 66) {
          matchesComplexity = true;
        }
      }
      
      const matchesSearch = !searchQuery || hero.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesRole && matchesLane && matchesComplexity && matchesSearch;
    });

    // Сортування
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'newest':
          return b.id - a.id;
        default:
          return 0;
      }
    });

    return filtered;
  }, [heroes, selectedRole, selectedLane, selectedComplexity, sortBy, searchQuery]);

  // Pagination
  const displayedHeroes = useMemo(() => {
    return filteredAndSortedHeroes.slice(0, displayCount);
  }, [filteredAndSortedHeroes, displayCount]);

  const hasMore = displayCount < filteredAndSortedHeroes.length;

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + HEROES_PER_PAGE);
  };

  const handleFilterChange = () => {
    setDisplayCount(HEROES_PER_PAGE);
  };

  const filterGroups: FilterGroup[] = [
    {
      label: 'Role',
      emoji: '🎭',
      options: ROLE_OPTIONS,
      selectedValue: selectedRole,
      onChange: (value) => {
        setSelectedRole(value);
        handleFilterChange();
      }
    },
    {
      label: 'Lane',
      emoji: '🛣️',
      options: LANE_OPTIONS,
      selectedValue: selectedLane,
      onChange: (value) => {
        setSelectedLane(value);
        handleFilterChange();
      }
    },
    {
      label: 'Complexity',
      emoji: '⚡',
      options: COMPLEXITY_OPTIONS,
      selectedValue: selectedComplexity,
      onChange: (value) => {
        setSelectedComplexity(value);
        handleFilterChange();
      }
    },
    {
      label: 'Sort By',
      emoji: '📊',
      options: SORT_OPTIONS,
      selectedValue: sortBy,
      onChange: (value) => {
        setSortBy(value);
        handleFilterChange();
      }
    }
  ];

  if (isLoading) return <Loader />;
  if (isError) return <div className={styles.error}>Failed to load heroes</div>;
  if (!selectedGameId) return <div className={styles.error}>Please select a game first</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Heroes</h1>
          <p className={styles.subtitle}>
            Browse all heroes • Showing {displayedHeroes.length} of {filteredAndSortedHeroes.length} heroes
          </p>
        </div>

        {/* Search Bar */}
        <div className={styles.searchWrapper}>
          <input
            type="text"
            placeholder="🔍 Search heroes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className={styles.clearButton}>
              ✕
            </button>
          )}
        </div>

        {/* Filters */}
        <FilterSection 
          filterGroups={filterGroups} 
          collapsible={true}
          defaultExpanded={false}
        />
      </div>

      {/* Heroes Grid */}
      <div className={styles.heroGrid}>
        {displayedHeroes.length > 0 ? (
          displayedHeroes.map((hero: Hero) => (
            <HeroCard key={hero.id} hero={hero} gameId={selectedGameId} />
          ))
        ) : (
          <div className={styles.noData}>
            No heroes found matching your filters
          </div>
        )}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <LoadMoreButton onClick={handleLoadMore}>
          Show More Heroes ({filteredAndSortedHeroes.length - displayCount} remaining)
        </LoadMoreButton>
      )}
    </div>
  );
}

export default HeroesPage;
