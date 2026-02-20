import { useQueries, useQuery } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { queryKeys } from '../../queries/keys';
import { heroesApi } from '../../api/heroes';
import { Loader } from '../Loader';

interface DataLoaderProps {
  gameId: number;
  children: ReactNode;
}

export const DataLoader = ({ gameId, children }: DataLoaderProps) => {
  // Спочатку завантажуємо список героїв щоб дізнатися ID останнього
  const { data: heroes, isLoading: heroesLoading } = useQuery({
    queryKey: queryKeys.heroes.all(gameId),
    queryFn: () => heroesApi.getHeroes(gameId),
    staleTime: 5 * 60 * 1000,
  });

  const latestHeroId = heroes?.sort((a, b) => b.id - a.id)[0]?.id;

  const queries = useQueries({
    queries: [
      // RandomHeroStats queries
      {
        queryKey: queryKeys.heroes.ranks(gameId, { page: 1, size: 100, rank: 'glory' }),
        queryFn: () => heroesApi.getHeroRanks(gameId, 1, 100, undefined, 'glory'),
        staleTime: 5 * 60 * 1000,
        enabled: !heroesLoading,
      },
      {
        queryKey: queryKeys.heroes.ranks(gameId, { page: 1, size: 200, days: 1, rank: 'glory' }),
        queryFn: () => heroesApi.getHeroRanks(gameId, 1, 200, 1, 'glory'),
        staleTime: 5 * 60 * 1000,
        enabled: !heroesLoading,
      },
      {
        queryKey: queryKeys.heroes.ranks(gameId, { page: 1, size: 200, days: 3, rank: 'glory' }),
        queryFn: () => heroesApi.getHeroRanks(gameId, 1, 200, 3, 'glory'),
        staleTime: 5 * 60 * 1000,
        enabled: !heroesLoading,
      },
      {
        queryKey: queryKeys.heroes.ranks(gameId, { page: 1, size: 200, days: 7, rank: 'glory' }),
        queryFn: () => heroesApi.getHeroRanks(gameId, 1, 200, 7, 'glory'),
        staleTime: 5 * 60 * 1000,
        enabled: !heroesLoading,
      },
      {
        queryKey: queryKeys.heroes.ranks(gameId, { page: 1, size: 200, days: 15, rank: 'glory' }),
        queryFn: () => heroesApi.getHeroRanks(gameId, 1, 200, 15, 'glory'),
        staleTime: 5 * 60 * 1000,
        enabled: !heroesLoading,
      },
      {
        queryKey: queryKeys.heroes.ranks(gameId, { page: 1, size: 200, days: 30, rank: 'glory' }),
        queryFn: () => heroesApi.getHeroRanks(gameId, 1, 200, 30, 'glory'),
        staleTime: 5 * 60 * 1000,
        enabled: !heroesLoading,
      },
      // TopHeroesRanked query
      {
        queryKey: queryKeys.heroes.ranks(gameId, { 
          page: 1, 
          size: 5, 
          days: 30, 
          rank: 'glory', 
          sortField: 'win_rate', 
          sortOrder: 'desc' 
        }),
        queryFn: () => heroesApi.getHeroRanks(gameId, 1, 5, 30, 'glory', 'win_rate', 'desc'),
        staleTime: 5 * 60 * 1000,
        enabled: !heroesLoading,
      },
      // LastHeroesInfo skills query
      {
        queryKey: queryKeys.heroes.skills(latestHeroId || 0),
        queryFn: () => heroesApi.getHeroSkills(latestHeroId!),
        staleTime: 5 * 60 * 1000,
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
        <p>Error loading data</p>
      </div>
    );
  }

  return <>{children}</>;
};
