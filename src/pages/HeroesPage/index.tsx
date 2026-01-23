import { useTranslation } from 'react-i18next';
import { Loader } from '../../components/Loader';
import { useHeroesQuery } from '../../queries/useHeroesQuery';
import { useGameStore } from '../../store/gameStore';
import { useHeroFilters } from './hooks/useHeroFilters';
import { HeroFilters } from './components/HeroFilters';
import { HeroGrid } from './components/HeroGrid';
import styles from './styles.module.scss';

function HeroesPage() {
  const { t } = useTranslation();
  const { selectedGameId } = useGameStore();
  const { data: heroes, isLoading, isError } = useHeroesQuery(selectedGameId);

  const {
    filters,
    setters,
    results,
    actions,
  } = useHeroFilters({ heroes });

  if (isLoading) return <Loader />;
  if (isError) return <div className={styles.error}>{t('heroes.failedToLoad')}</div>;
  if (!selectedGameId) return <div className={styles.error}>{t('heroes.selectGame')}</div>;

  return (
    <div className={styles.container}>
      <HeroFilters
        searchQuery={filters.searchQuery}
        onSearchChange={setters.setSearchQuery}
        selectedRole={filters.selectedRole}
        selectedLane={filters.selectedLane}
        selectedComplexity={filters.selectedComplexity}
        sortBy={filters.sortBy}
        onRoleChange={(value) => {
          setters.setSelectedRole(value);
          actions.handleFilterChange();
        }}
        onLaneChange={(value) => {
          setters.setSelectedLane(value);
          actions.handleFilterChange();
        }}
        onComplexityChange={(value) => {
          setters.setSelectedComplexity(value);
          actions.handleFilterChange();
        }}
        onSortChange={(value) => {
          setters.setSortBy(value);
          actions.handleFilterChange();
        }}
        totalCount={results.filteredAndSortedHeroes.length}
        displayedCount={results.displayedHeroes.length}
      />

      <HeroGrid
        heroes={results.displayedHeroes}
        gameId={selectedGameId}
        hasMore={results.hasMore}
        remainingCount={results.filteredAndSortedHeroes.length - results.displayedHeroes.length}
        onLoadMore={actions.handleLoadMore}
      />
    </div>
  );
}

export default HeroesPage;
