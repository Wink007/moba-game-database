import { Hero } from '../../../types';

export interface SparklineProps {
  values: number[];
  color: string;
}

export interface StatCardProps {
  label: string;
  value: number | null;
  trend: number | null;
  values: number[];
  color: string;
  periods: number[];
}

export interface StatsHistoryTabProps {
  hero: Hero;
}
