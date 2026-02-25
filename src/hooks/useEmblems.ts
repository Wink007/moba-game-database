import { useQuery } from '@tanstack/react-query';
import { STALE_5_MIN, queryKeys } from '../queries/keys';
import { fetcherRaw } from '../api/http/fetcher';

interface BaseStats {
  [key: string]: string | number;
}

interface Talent {
  id: number;
  name: string;
  name_uk?: string;
  tier: number;
  effect: string;
  effect_uk?: string;
  icon_url?: string;
  game_id: number;
}

interface Emblem {
  id: number;
  game_id: number;
  name: string;
  name_uk?: string;
  description: string;
  description_uk?: string;
  icon_url?: string;
  base_stats?: BaseStats;
  tier1_talents?: Talent[];
  tier2_talents?: Talent[];
  tier3_talents?: Talent[];
}

export const useEmblems = (gameId: string | undefined) => {
  return useQuery<Emblem[]>({
    queryKey: queryKeys.emblems.all(Number(gameId)),
    queryFn: () => fetcherRaw<Emblem[]>(`/emblems?game_id=${gameId}`),
    enabled: !!gameId,
    staleTime: STALE_5_MIN,
  });
};

export const useEmblemTalents = (gameId: string | undefined) => {
  const allTalentsQuery = useQuery<Talent[]>({
    queryKey: queryKeys.emblems.talents(Number(gameId)),
    queryFn: () => fetcherRaw<Talent[]>(`/emblem-talents?game_id=${gameId}`),
    enabled: !!gameId,
    staleTime: STALE_5_MIN,
  });

  const allTalents = allTalentsQuery.data ?? [];

  return {
    tier1: allTalents.filter(t => t.tier === 1),
    tier2: allTalents.filter(t => t.tier === 2),
    tier3: allTalents.filter(t => t.tier === 3),
    isLoading: allTalentsQuery.isLoading,
  };
};

export type { Emblem, Talent, BaseStats };
