import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { heroesApi, HeroesFilterParams } from '../api/heroes';
import { queryKeys } from './keys';

export const useHeroesQuery = (gameId: number) => {
  return useQuery({
    queryKey: queryKeys.heroes.all(gameId),
    queryFn: () => heroesApi.getHeroes(gameId),
    enabled: !!gameId,
    staleTime: 5 * 60 * 1000,
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
    staleTime: 5 * 60 * 1000,
  });
};

export const useHeroSearchQuery = (gameId: number, search: string) => {
  return useQuery({
    queryKey: queryKeys.heroes.paginated(gameId, { search, size: 5 }),
    queryFn: () => heroesApi.getHeroesPaginated(gameId, { page: 1, size: 5, search }),
    enabled: !!gameId && search.length > 0,
    staleTime: 5 * 60 * 1000,
  });
};

export const useHeroQuery = (id: number) => {
  return useQuery({
    queryKey: queryKeys.heroes.detail(id),
    queryFn: () => heroesApi.getHero(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useHeroSkillsQuery = (heroId: number) => {
  return useQuery({
    queryKey: queryKeys.heroes.skills(heroId),
    queryFn: () => heroesApi.getHeroSkills(heroId),
    enabled: !!heroId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useHeroRelationsQuery = (gameId: number) => {
  return useQuery({
    queryKey: queryKeys.heroes.relations(gameId),
    queryFn: () => heroesApi.getHeroRelations(gameId),
    staleTime: 5 * 60 * 1000,
    enabled: !!gameId,
  });
};

export const useHeroCounterDataQuery = (gameId: number) => {
  return useQuery({
    queryKey: queryKeys.heroes.counterData(gameId),
    queryFn: () => heroesApi.getHeroCounterData(gameId),
    staleTime: 5 * 60 * 1000,
    enabled: !!gameId,
  });
};

export const useHeroCompatibilityDataQuery = (gameId: number) => {
  return useQuery({
    queryKey: queryKeys.heroes.compatibilityData(gameId),
    queryFn: () => heroesApi.getHeroCompatibilityData(gameId),
    staleTime: 5 * 60 * 1000,
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
    staleTime: 5 * 60 * 1000,
    enabled: !!gameId,
  });
};

export const useHeroRankQuery = (heroId: number) => {
  return useQuery({
    queryKey: queryKeys.heroes.rank(heroId),
    queryFn: () => heroesApi.getHeroRank(heroId),
    staleTime: 5 * 60 * 1000,
    enabled: !!heroId,
  });
};

export const useHeroRankHistoryQuery = (gameId: number, heroGameId: number) => {
  return useQuery({
    queryKey: queryKeys.heroes.rankHistory(gameId, heroGameId),
    queryFn: () => heroesApi.getHeroRankHistory(gameId, heroGameId),
    staleTime: 5 * 60 * 1000,
    enabled: !!gameId && !!heroGameId,
  });
};
