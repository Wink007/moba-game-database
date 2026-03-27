export type Dota2PrimaryAttr = 'str' | 'agi' | 'int' | 'universal';
export type Dota2AttackType = 'Melee' | 'Ranged';
export type Dota2Complexity = 1 | 2 | 3;

export interface Dota2Stats {
  primary_attr: Dota2PrimaryAttr;
  attack_type: Dota2AttackType;
  str_base?: number;
  str_gain?: number;
  agi_base?: number;
  agi_gain?: number;
  int_base?: number;
  int_gain?: number;
  damage_min?: number;
  damage_max?: number;
  attack_rate?: number;
  attack_range?: number;
  armor?: number;
  magic_resistance?: number;
  movement_speed?: number;
  turn_rate?: number;
  sight_range_day?: number;
  sight_range_night?: number;
  max_health?: number;
  health_regen?: number;
  max_mana?: number;
  mana_regen?: number;
  complexity?: Dota2Complexity;
}

export interface Dota2Talent {
  name: string;
  level: number;
}

export interface Dota2Ability {
  name: string;
  internal_name: string;
  description: string;
  lore?: string;
  icon: string;
  type?: number;
  behavior?: string;
  damage?: number;
  cooldowns?: number[];
  mana_costs?: number[];
  cast_ranges?: number[];
  has_scepter?: boolean;
  has_shard?: boolean;
  is_innate?: boolean;
  shard_desc?: string;
  scepter_desc?: string;
  is_talents?: false;
}

export interface Dota2TalentsEntry {
  name: string;
  internal_name: '_talents';
  icon: string;
  is_talents: true;
  items: Dota2Talent[];
}

export type Dota2AbilityShow = Dota2Ability | Dota2TalentsEntry;

export interface Dota2Hero {
  id: number;
  game_id: number;
  name: string;
  hero_game_id?: number;
  image?: string;
  painting?: string;
  roles: string[];
  short_description?: string;
  full_description?: string;
  hero_stats?: Dota2Stats;
  abilityshow: Dota2AbilityShow[];
}
