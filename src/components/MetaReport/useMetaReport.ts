import { useQuery } from '@tanstack/react-query';
import { heroesApi } from '../../api/heroes';
import { queryKeys, STALE_5_MIN } from '../../queries/keys';
import { useFilterSettingsStore } from '../../store/filterSettingsStore';
import type { HeroRank } from '../../types/heroRank';

export interface MetaHero {
  hero: HeroRank;
  winRate: number;
  banRate: number;
  delta: number;
}

export function useMetaReport(gameId: number | null) {
  const { defaultRank } = useFilterSettingsStore();

  const q1 = useQuery({
    queryKey: queryKeys.heroes.ranks(gameId!, { page: 1, size: 999, days: 1, rank: defaultRank }),
    queryFn: () => heroesApi.getHeroRanks(gameId!, 1, 999, 1, defaultRank),
    staleTime: STALE_5_MIN,
    enabled: !!gameId,
  });

  const q7 = useQuery({
    queryKey: queryKeys.heroes.ranks(gameId!, { page: 1, size: 999, days: 7, rank: defaultRank }),
    queryFn: () => heroesApi.getHeroRanks(gameId!, 1, 999, 7, defaultRank),
    staleTime: STALE_5_MIN,
    enabled: !!gameId,
  });

  const isLoading = q1.isLoading || q7.isLoading;
  const isError = q1.isError || q7.isError;

  if (!q1.data || !q7.data) {
    return { isLoading, isError, rising: [], falling: [], topBanned: [] };
  }

  const map7 = new Map<number, HeroRank>();
  q7.data.forEach(h => map7.set(h.hero_id, h));

  const deltas: MetaHero[] = [];
  for (const h1 of q1.data) {
    const h7 = map7.get(h1.hero_id);
    if (!h7) continue;
    deltas.push({
      hero: h1,
      winRate: h1.win_rate,
      banRate: h1.ban_rate,
      delta: +(h1.win_rate - h7.win_rate).toFixed(2),
    });
  }

  const rising = [...deltas]
    .filter(d => d.delta > 0)
    .sort((a, b) => b.delta - a.delta)
    .slice(0, 5);

  const falling = [...deltas]
    .filter(d => d.delta < 0)
    .sort((a, b) => a.delta - b.delta)
    .slice(0, 5);

  const topBanned = [...deltas]
    .sort((a, b) => b.banRate - a.banRate)
    .slice(0, 7);

  return { isLoading, isError, rising, falling, topBanned };
}
