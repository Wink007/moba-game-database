import { useQueries, useQuery } from '@tanstack/react-query';
import { ReactNode, useMemo } from 'react';
import { queryKeys, STALE_5_MIN } from '../../queries/keys';
import { heroesApi } from '../../api/heroes';
import { useFilterSettingsStore } from '../../store/filterSettingsStore';
import { Loader } from '../Loader';

interface DataLoaderProps {
  gameId: number;
  children: ReactNode;
}

export const DataLoader = ({ gameId, children }: DataLoaderProps) => {
  const { defaultRank, defaultDays } = useFilterSettingsStore();

  // Спочатку завантажуємо список героїв щоб дізнатися ID останнього
  const { data: heroes, isLoading: heroesLoading } = useQuery({
    queryKey: queryKeys.heroes.all(gameId),
    queryFn: () => heroesApi.getHeroes(gameId),
    staleTime: STALE_5_MIN,
  });

  const latestHeroId = useMemo(
    () => heroes ? [...heroes].sort((a, b) => b.id - a.id)[0]?.id : undefined,
    [heroes]
  );

  const queries = useQueries({
    queries: [
      // RandomHeroStats queries — all 5 periods, user's default rank
      {
        queryKey: queryKeys.heroes.ranks(gameId, { page: 1, size: 100, rank: defaultRank }),
        queryFn: () => heroesApi.getHeroRanks(gameId, 1, 100, undefined, defaultRank),
        staleTime: STALE_5_MIN,
        enabled: !heroesLoading,
      },
      {
        queryKey: queryKeys.heroes.ranks(gameId, { page: 1, size: 200, days: 1, rank: defaultRank }),
        queryFn: () => heroesApi.getHeroRanks(gameId, 1, 200, 1, defaultRank),
        staleTime: STALE_5_MIN,
        enabled: !heroesLoading,
      },
      {
        queryKey: queryKeys.heroes.ranks(gameId, { page: 1, size: 200, days: 3, rank: defaultRank }),
        queryFn: () => heroesApi.getHeroRanks(gameId, 1, 200, 3, defaultRank),
        staleTime: STALE_5_MIN,
        enabled: !heroesLoading,
      },
      {
        queryKey: queryKeys.heroes.ranks(gameId, { page: 1, size: 200, days: 7, rank: defaultRank }),
        queryFn: () => heroesApi.getHeroRanks(gameId, 1, 200, 7, defaultRank),
        staleTime: STALE_5_MIN,
        enabled: !heroesLoading,
      },
      {
        queryKey: queryKeys.heroes.ranks(gameId, { page: 1, size: 200, days: 15, rank: defaultRank }),
        queryFn: () => heroesApi.getHeroRanks(gameId, 1, 200, 15, defaultRank),
        staleTime: STALE_5_MIN,
        enabled: !heroesLoading,
      },
      {
        queryKey: queryKeys.heroes.ranks(gameId, { page: 1, size: 200, days: 30, rank: defaultRank }),
        queryFn: () => heroesApi.getHeroRanks(gameId, 1, 200, 30, defaultRank),
        staleTime: STALE_5_MIN,
        enabled: !heroesLoading,
      },
      // TopHeroesRanked query — user's default rank + days
      {
        queryKey: queryKeys.heroes.ranks(gameId, {
          page: 1,
          size: 5,
          days: defaultDays,
          rank: defaultRank,
          sortField: 'win_rate',
          sortOrder: 'desc'
        }),
        queryFn: () => heroesApi.getHeroRanks(gameId, 1, 5, defaultDays, defaultRank, 'win_rate', 'desc'),
        staleTime: STALE_5_MIN,
        enabled: !heroesLoading,
      },
      // LastHeroesInfo skills query
      {
        queryKey: queryKeys.heroes.skills(latestHeroId || 0),
        queryFn: () => heroesApi.getHeroSkills(latestHeroId!),
        staleTime: STALE_5_MIN,
        enabled: !!latestHeroId && !heroesLoading,
      },
    ],
  });

  const isLoading = heroesLoading || queries.some(query => query.isLoading);
  const isError = queries.some(query => query.isError);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Loader />
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <p style={{ color: '#94a3b8' }}>Failed to load data. Please try refreshing.</p>
      </div>
    );
  }

  return <>{children}</>;
};
