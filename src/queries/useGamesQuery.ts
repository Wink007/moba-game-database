import { useQuery } from '@tanstack/react-query';
import { gamesApi } from '../api/games';
import { queryKeys, STALE_5_MIN } from './keys';
import type { Game } from '../types';

// Injected at build time by scripts/generate-sitemap.js — eliminates API
// waterfall for LCP on first visit. Falls back to undefined (normal fetch).
const buildTimeGames: Game[] | undefined = (window as any).__GAMES_DATA__;

export const useGamesQuery = () => {
  return useQuery({
    queryKey: queryKeys.games.all,
    queryFn: gamesApi.getGames,
    staleTime: STALE_5_MIN,
    initialData: buildTimeGames,
  });
};


