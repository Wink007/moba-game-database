export interface HeroSynergy {
  hero_id: number;
  increase_win_rate: number;
}

export interface HeroRank {
  id: number;
  hero_id: number;
  name: string;
  painting?: string;
  image?: string;
  head?: string;
  roles?: string[];
  win_rate: number;
  ban_rate: number;
  appearance_rate: number;
  synergy_heroes: HeroSynergy[];
  days: number; // Період статистики: 1, 3, 7, 15, 30
  rank: string; // Rank category: 'all', 'epic', 'legend', 'mythic', 'honor', 'glory'
  updated_at: string;
}
