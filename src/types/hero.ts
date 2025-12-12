import { Lanes } from "../enum";

export interface Hero {
  id: number;
  game_id: number;
  name: string;
  hero_game_id?: string;
  image?: string;
  roles: string[];
  description?: string;
  difficulty?: string;
  lane?: Lanes[];
  specialty?: string;
  painting?: string;
  head?: string;
  abilityshow: number[];
}

export interface HeroSkill {
  id: number;
  hero_id: number;
  skill_name: string;
  skill_type: 'passive' | 'active';
  skill_description?: string;
  image?: string;
  preview?: string;
  effect?: string;
  effect_types?: string;
  skill_parameters?: string;
  level_scaling?: string;
  display_order?: number | null;
  is_transformed?: boolean | null;
  replaces_skill_id?: number | null;
  transformation_order?: number | null;
  triggered_by_skill_id?: number | null;
}
