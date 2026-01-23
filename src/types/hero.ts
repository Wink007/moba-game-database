import { Lanes } from "../enum";

export interface SkillParameter {
  label: string;
  value: string;
}

export interface HeroStat {
  id: number;
  hero_id: number;
  stat_name: string;
  value?: string | number;
  base_value?: number;
  growth_value?: number;
  max_level_value?: number;
}

export interface HeroStatsObject {
  hp?: number;
  hp_regen?: number;
  mana?: number;
  mana_regen?: number;
  physical_attack?: number;
  magic_power?: number;
  physical_defense?: number;
  magic_defense?: number;
  attack_speed?: number;
  attack_speed_ratio?: number;
  movement_speed?: number;
  [key: string]: number | undefined;
}

export interface HeroRelationTarget {
  data: {
    head: string;
    heroid: number;
    name: string;
  };
}

export interface HeroRelation {
  assist?: {
    desc: string;
    target_hero: HeroRelationTarget[];
  };
  strong?: {
    desc: string;
    target_hero: HeroRelationTarget[];
  };
  weak?: {
    desc: string;
    target_hero: HeroRelationTarget[];
  };
}

export interface CounterHero {
  heroid: number;
  win_rate: number;
  increase_win_rate: number;
  appearance_rate: number;
}

export interface HeroCounterData {
  main_hero_win_rate?: number;
  best_counters: CounterHero[];
  most_countered_by: CounterHero[];
}

export interface CompatibilityHero {
  heroid: number;
  win_rate: number;
  increase_win_rate: number;
  appearance_rate: number;
}

export interface HeroCompatibilityData {
  main_hero_win_rate?: number;
  compatible: CompatibilityHero[];
  not_compatible: CompatibilityHero[];
}

export interface Hero {
  id: number;
  game_id: number;
  name: string;
  name_uk?: string;
  hero_game_id?: number;
  image?: string;
  head?: string;
  painting?: string;
  roles: string[];
  lane?: string[];
  specialty?: string[];
  damage_type?: string;
  short_description?: string;
  short_description_uk?: string;
  full_description?: string;
  full_description_uk?: string;
  abilityshow: string[];
  use_energy?: boolean;
  hero_stats?: HeroStatsObject;
  skills?: HeroSkill[];
  pro_builds?: any[];
  selected_talents?: any;
  main_hero_appearance_rate?: number;
  main_hero_ban_rate?: number;
  main_hero_win_rate?: number;
  created_at?: string;
  createdat?: number;
}

export interface HeroSkill {
  id: number;
  hero_id: number;
  skill_name: string;
  skill_name_uk?: string;
  skill_type: 'passive' | 'active';
  skill_description?: string;
  skill_description_uk?: string;
  image?: string;
  preview?: string;
  effect?: string[];
  effect_types?: string[];
  skill_parameters?: SkillParameter;
  level_scaling?: string;
  display_order?: number | null;
  is_transformed?: boolean | null;
  replaces_skill_id?: number | null;
  transformation_order?: number | null;
  triggered_by_skill_id?: number | null;
  cooldown?: string;
  mana_cost?: string;
  cast_range?: string;
  damage?: string;
  duration?: string;
}
