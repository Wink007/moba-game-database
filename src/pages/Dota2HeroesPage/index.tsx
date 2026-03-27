import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader } from '../../components/Loader';
import { useInfiniteHeroesQuery } from '../../queries/useHeroesQuery';
import { useFavorites } from '../../hooks/useFavorites';
import { useSEO } from '../../hooks/useSEO';
import { Dota2HeroFilters } from './components/HeroFilters';
import { Dota2HeroGrid } from './components/HeroGrid';
import { useDota2HeroFilters } from './hooks/useFilters';
import { DOTA2_GAME_ID } from './constants';
import type { Hero } from '../../types';
import type { ViewMode } from './types';
import styles from '../HeroesPage/styles.module.scss';

const HEROES_PER_PAGE = 24;

function Dota2HeroesPage() {
  const { t } = useTranslation();

  useSEO({
    title: 'Dota 2 Heroes',
    description: 'Browse all Dota 2 heroes — filter by role and attribute. Stats, skills and abilities for every hero.',
  });

  const { favorites } = useFavorites();
  const { filters, apiFilters, setters } = useDota2HeroFilters();

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('dota2-heroes-view-mode');
    return saved === 'list' ? 'list' : 'grid';
  });

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem('dota2-heroes-view-mode', mode);
  };

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
  } = useInfiniteHeroesQuery(DOTA2_GAME_ID, {
    size: HEROES_PER_PAGE,
    ...apiFilters,
    favorite_ids: favoriteHeroIds,
  });

  const allHeroes: Hero[] = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.data);
  }, [data]);

  const total = data?.pages[0]?.total ?? 0;

  if (isLoading && !isPlaceholderData) return <Loader />;
  if (isError) return <div className={styles.error}>{t('heroes.failedToLoad')}</div>;

  return (
    <div className={styles.container}>
      <Dota2HeroFilters
        searchQuery={filters.searchQuery}
        onSearchChange={setters.setSearchQuery}
        selectedRole={filters.selectedRole}
        selectedAttr={filters.selectedAttr}
        selectedComplexity={filters.selectedComplexity}
        sortBy={filters.sortBy}
        onRoleChange={setters.setSelectedRole}
        onAttrChange={setters.setSelectedAttr}
        onComplexityChange={setters.setSelectedComplexity}
        onSortChange={setters.setSortBy}
        onClearAll={setters.clearAll}
        totalCount={total}
        displayedCount={allHeroes.length}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
      />
      <Dota2HeroGrid
        heroes={allHeroes}
        gameId={DOTA2_GAME_ID}
        hasMore={!!hasNextPage}
        onLoadMore={fetchNextPage}
        isFiltering={isFetching && isPlaceholderData}
        viewMode={viewMode}
      />
    </div>
  );
}

export default Dota2HeroesPage;
