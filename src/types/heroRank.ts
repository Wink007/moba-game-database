export interface HeroSynergy {
  hero_id: number;
  increase_win_rate: number;
}

export interface HeroRank {
  id: number;
  hero_id: number;
  name: string;
  painting: string;
  win_rate: number;
  ban_rate: number;
  appearance_rate: number;
  synergy_heroes: HeroSynergy[];
  updated_at: string;
}
