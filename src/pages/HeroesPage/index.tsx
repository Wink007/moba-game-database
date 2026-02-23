import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader } from '../../components/Loader';
import { useInfiniteHeroesQuery } from '../../queries/useHeroesQuery';
import { useGameStore } from '../../store/gameStore';
import { useHeroFilters } from './hooks/useHeroFilters';
import { useFavorites } from '../../hooks/useFavorites';
import { HeroFilters } from './components/HeroFilters';
import { HeroGrid } from './components/HeroGrid';
import { useSEO } from '../../hooks/useSEO';
import { Hero } from '../../types';
import styles from './styles.module.scss';

const HEROES_PER_PAGE = 24;

function HeroesPage() {
  const { t } = useTranslation();
  useSEO({ title: 'Heroes', description: 'Browse all Mobile Legends heroes — filter by role, lane, and specialty.' });
  const { selectedGameId } = useGameStore();
  const { isFavorite } = useFavorites();

  const { filters, apiFilters, setters } = useHeroFilters();

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteHeroesQuery(selectedGameId, { size: HEROES_PER_PAGE, ...apiFilters });

  const allHeroes: Hero[] = useMemo(() => {
    if (!data?.pages) return [];
    const heroes = data.pages.flatMap((page) => page.data);
    // Sort favorites to top within already-loaded heroes
    return [...heroes].sort((a, b) => {
      const aFav = isFavorite(a.id) ? 0 : 1;
      const bFav = isFavorite(b.id) ? 0 : 1;
      return aFav - bFav;
    });
  }, [data, isFavorite]);

  const total = data?.pages[0]?.total ?? 0;
  const remaining = total - allHeroes.length;

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
        onRoleChange={setters.setSelectedRole}
        onLaneChange={setters.setSelectedLane}
        onComplexityChange={setters.setSelectedComplexity}
        onSortChange={setters.setSortBy}
        totalCount={total}
        displayedCount={allHeroes.length}
      />

      <HeroGrid
        heroes={allHeroes}
        gameId={selectedGameId}
        hasMore={!!hasNextPage}
        remainingCount={remaining}
        onLoadMore={() => fetchNextPage()}
      />
    </div>
  );
}

export default HeroesPage;
