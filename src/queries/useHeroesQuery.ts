import { useQuery, useInfiniteQuery, keepPreviousData } from '@tanstack/react-query';
import { heroesApi, HeroesFilterParams } from '../api/heroes';
import { queryKeys, STALE_5_MIN } from './keys';

export const useHeroesQuery = (gameId: number) => {
  return useQuery({
    queryKey: queryKeys.heroes.all(gameId),
    queryFn: () => heroesApi.getHeroes(gameId),
    enabled: !!gameId,
    staleTime: STALE_5_MIN,
  });
};

export const useLatestHeroesQuery = (gameId: number, count = 6) => {
  return useQuery({
    queryKey: queryKeys.heroes.paginated(gameId, { sort: 'newest', size: count }),
    queryFn: () => heroesApi.getHeroesPaginated(gameId, { page: 1, size: count, sort: 'newest' }),
    select: (data) => data.data,
    enabled: !!gameId,
    staleTime: STALE_5_MIN,
  });
};

export const useInfiniteHeroesQuery = (
  gameId: number,
  filters: Omit<HeroesFilterParams, 'page'>,
) => {
  return useInfiniteQuery({
    queryKey: queryKeys.heroes.paginated(gameId, filters),
    queryFn: ({ pageParam }) =>
      heroesApi.getHeroesPaginated(gameId, {
        page: pageParam,
        ...filters,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.has_more ? lastPage.page + 1 : undefined,
    enabled: !!gameId,
    staleTime: STALE_5_MIN,
    placeholderData: keepPreviousData,
  });
};

export const useHeroSearchQuery = (gameId: number, search: string) => {
  return useQuery({
    queryKey: queryKeys.heroes.paginated(gameId, { search, size: 5 }),
    queryFn: () => heroesApi.getHeroesPaginated(gameId, { page: 1, size: 5, search }),
    enabled: !!gameId && search.length > 0,
    staleTime: STALE_5_MIN,
  });
};

export const useHeroQuery = (id: number) => {
  return useQuery({
    queryKey: queryKeys.heroes.detail(id),
    queryFn: () => heroesApi.getHero(id),
    enabled: !!id,
    staleTime: STALE_5_MIN,
  });
};

export const useHeroSkillsQuery = (heroId: number) => {
  return useQuery({
    queryKey: queryKeys.heroes.skills(heroId),
    queryFn: () => heroesApi.getHeroSkills(heroId),
    enabled: !!heroId,
    staleTime: STALE_5_MIN,
    placeholderData: keepPreviousData,
  });
};

export const useHeroCounterDataQuery = (gameId: number, rank = 'all', days = 1) => {
  return useQuery({
    queryKey: queryKeys.heroes.counterData(gameId, rank, days),
    queryFn: () => heroesApi.getHeroCounterData(gameId, rank, days),
    staleTime: STALE_5_MIN,
    enabled: !!gameId,
  });
};

export const useHeroCompatibilityDataQuery = (gameId: number, rank = 'all', days = 1) => {
  return useQuery({
    queryKey: queryKeys.heroes.compatibilityData(gameId, rank, days),
    queryFn: () => heroesApi.getHeroCompatibilityData(gameId, rank, days),
    staleTime: STALE_5_MIN,
    enabled: !!gameId,
  });
};

export const useHeroRanksQuery = (
  gameId: number,
  page?: number,
  size?: number,
  days?: number,
  rank?: string,
  sortField?: 'pick_rate' | 'ban_rate' | 'win_rate',
  sortOrder?: 'asc' | 'desc'
) => {
  return useQuery({
    queryKey: queryKeys.heroes.ranks(gameId, { page, size, days, rank, sortField, sortOrder }),
    queryFn: () => heroesApi.getHeroRanks(gameId, page, size, days, rank, sortField, sortOrder),
    staleTime: STALE_5_MIN,
    enabled: !!gameId,
  });
};


