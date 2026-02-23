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
  const tier1Query = useQuery<Talent[]>({
    queryKey: ['emblem-talents', gameId, 1],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/emblem-talents?game_id=${gameId}&tier=1`);
      return res.json();
    },
    enabled: !!gameId,
    staleTime: 5 * 60 * 1000,
  });

  const tier2Query = useQuery<Talent[]>({
    queryKey: ['emblem-talents', gameId, 2],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/emblem-talents?game_id=${gameId}&tier=2`);
      return res.json();
    },
    enabled: !!gameId,
    staleTime: 5 * 60 * 1000,
  });

  const tier3Query = useQuery<Talent[]>({
    queryKey: ['emblem-talents', gameId, 3],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/emblem-talents?game_id=${gameId}&tier=3`);
      return res.json();
    },
    enabled: !!gameId,
    staleTime: 5 * 60 * 1000,
  });

  return {
    tier1: tier1Query.data ?? [],
    tier2: tier2Query.data ?? [],
    tier3: tier3Query.data ?? [],
    isLoading: tier1Query.isLoading || tier2Query.isLoading || tier3Query.isLoading,
  };
};

export type { Emblem, Talent, BaseStats };
