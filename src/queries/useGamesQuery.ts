import { useQuery } from '@tanstack/react-query';
import { gamesApi } from '../api/games';
import { queryKeys, STALE_5_MIN } from './keys';

export const useGamesQuery = () => {
  return useQuery({
    queryKey: queryKeys.games.all,
    queryFn: gamesApi.getGames,
    staleTime: STALE_5_MIN,
  });
};


