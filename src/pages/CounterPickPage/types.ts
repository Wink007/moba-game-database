import type { Hero, CounterHero } from '../../types';

export type Mode = 'single' | 'team';

export interface AggregatedCounter {
  heroId: number;
  hero: Hero;
  totalScore: number;
  avgWinRate: number;
  details: { enemyHero: Hero; increaseWinRate: number; winRate: number }[];
}

export type EnrichedCounter = CounterHero & { hero?: Hero; winRate: number; increaseWinRate: number };

export interface SingleResultsData {
  mainWinRate: number | null;
  bestCounters: EnrichedCounter[];
  mostCounteredBy: EnrichedCounter[];
}
