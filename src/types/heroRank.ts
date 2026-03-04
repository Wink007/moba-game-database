export interface HeroSynergy {
  hero_id: number;
  heroid?: number;
  increase_win_rate: number;
  synergy?: number;
}

export type CounterMode = 'counters' | 'countered_by';

export interface HeroRank {
  id: number;
  hero_id: number;
  hero_game_id?: number;
  name: string;
  painting?: string;
  image?: string;
  head?: string;
  roles?: string[];
  win_rate: number;
  ban_rate: number;
  pick_rate?: number;
  appearance_rate: number;
  rank_position?: number;
  synergy_heroes: HeroSynergy[];
  counter_heroes?: HeroSynergy[];
  countered_by_heroes?: HeroSynergy[];
  days: number;
  rank: string;
  updated_at: string;
}
