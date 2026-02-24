import { useQuery } from '@tanstack/react-query';
import { API_URL } from '../config';

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
    queryKey: ['emblems', gameId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/emblems?game_id=${gameId}`);
      return res.json();
    },
    enabled: !!gameId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useEmblemTalents = (gameId: string | undefined) => {
  const allTalentsQuery = useQuery<Talent[]>({
    queryKey: ['emblem-talents', gameId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/emblem-talents?game_id=${gameId}`);
      return res.json();
    },
    enabled: !!gameId,
    staleTime: 5 * 60 * 1000,
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
