import { useHeroRanksQuery } from '../../../queries/useHeroesQuery';
import { Hero } from '../../../types';

export const PERIODS = [1, 3, 7, 15, 30] as const;
export type Period = typeof PERIODS[number];

export interface PeriodPoint {
  period: Period;
  win_rate: number;
  ban_rate: number;
  pick_rate: number;
}

export function useAllPeriodData(hero: Hero, rank: string) {
  const q1  = useHeroRanksQuery(hero.game_id, 1, 999, 1,  rank, 'win_rate', 'desc');
  const q3  = useHeroRanksQuery(hero.game_id, 1, 999, 3,  rank, 'win_rate', 'desc');
  const q7  = useHeroRanksQuery(hero.game_id, 1, 999, 7,  rank, 'win_rate', 'desc');
  const q15 = useHeroRanksQuery(hero.game_id, 1, 999, 15, rank, 'win_rate', 'desc');
  const q30 = useHeroRanksQuery(hero.game_id, 1, 999, 30, rank, 'win_rate', 'desc');

  const allLoading = q1.isLoading || q3.isLoading || q7.isLoading || q15.isLoading || q30.isLoading;

  const extract = (data: typeof q1.data, period: Period): PeriodPoint | null => {
    if (!data) return null;
    const s = data.find(r => r.hero_id === hero.id || r.hero_game_id === hero.hero_game_id);
    return s ? { period, win_rate: s.win_rate, ban_rate: s.ban_rate, pick_rate: s.appearance_rate } : null;
  };

  const points: PeriodPoint[] = [
    extract(q1.data, 1),
    extract(q3.data, 3),
    extract(q7.data, 7),
    extract(q15.data, 15),
    extract(q30.data, 30),
  ].filter(Boolean) as PeriodPoint[];

  return { points, allLoading };
}
