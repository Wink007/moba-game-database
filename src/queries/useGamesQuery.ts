import { useQuery } from '@tanstack/react-query';
import { gamesApi } from '../api/games';
import { queryKeys } from './keys';

export const useGamesQuery = () => {
  return useQuery({
    queryKey: queryKeys.games.all,
    queryFn: gamesApi.getGames,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useGameQuery = (id: number) => {
  return useQuery({
    queryKey: queryKeys.games.detail(id),
    queryFn: () => gamesApi.getGame(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useGameStatsQuery = (id: number) => {
  return useQuery({
    queryKey: queryKeys.games.stats(id),
    queryFn: () => gamesApi.getGameStats(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};
