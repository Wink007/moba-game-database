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
  const { selectedGameId } = useGameStore();
  useSEO({
    title: 'Heroes',
    description: 'Browse all Mobile Legends heroes — filter by role, lane, and specialty. Stats, skills, builds and counters for every hero.',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mobawiki.com/' },
          { '@type': 'ListItem', position: 2, name: 'Heroes', item: `https://mobawiki.com/${selectedGameId}/heroes` },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Mobile Legends Heroes',
        description: 'Complete list of all Mobile Legends heroes with stats, skills and builds.',
        url: `https://mobawiki.com/${selectedGameId}/heroes`,
      },
    ],
  });
  const { favorites } = useFavorites();

  const { filters, apiFilters, setters } = useHeroFilters();

  const favoriteHeroIds = useMemo(
    () => favorites.map((f) => f.hero_id),
    [favorites]
  );

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isPlaceholderData,
  } = useInfiniteHeroesQuery(selectedGameId, {
    size: HEROES_PER_PAGE,
    ...apiFilters,
    favorite_ids: favoriteHeroIds,
  });

  const allHeroes: Hero[] = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.data);
  }, [data]);

  const total = data?.pages[0]?.total ?? 0;
  const remaining = total - allHeroes.length;

  if (isLoading && !isPlaceholderData) return <Loader />;
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
        selectedSpecialty={filters.selectedSpecialty}
        selectedDamageType={filters.selectedDamageType}
        sortBy={filters.sortBy}
        onRoleChange={setters.setSelectedRole}
        onLaneChange={setters.setSelectedLane}
        onComplexityChange={setters.setSelectedComplexity}
        onSpecialtyChange={setters.setSelectedSpecialty}
        onDamageTypeChange={setters.setSelectedDamageType}
        onSortChange={setters.setSortBy}
        totalCount={total}
        displayedCount={allHeroes.length}
      />

      <HeroGrid
        heroes={allHeroes}
        gameId={selectedGameId}
        hasMore={!!hasNextPage && !isPlaceholderData}
        remainingCount={remaining}
        onLoadMore={() => fetchNextPage()}
        isFiltering={isFetching && isPlaceholderData}
      />
    </div>
  );
}

export default HeroesPage;
