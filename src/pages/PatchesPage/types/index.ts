export interface PatchSkill {
  type: string | null;
  name: string;
  balance: string | null;
  changes: string[];
}

export interface SkillAdjustment {
  skill_type: string;
  skill_name?: string;
  badge?: string;
  description: string;
}

export interface AttributeAdjustment {
  attribute_name: string;
  badge?: string;
  description: string;
}

export interface PatchHeroChanges {
  summary?: string;
  skills?: PatchSkill[];
  badge?: string;
  description?: string;
  adjustments?: SkillAdjustment[];
  attribute_adjustments?: AttributeAdjustment[];
}

export interface NewHeroSkill {
  skill_type?: string;
  type?: string;
  skill_name?: string;
  name?: string;
  description: string;
}

export interface NewHero {
  name: string;
  title: string;
  description: string;
  skills: NewHeroSkill[];
}

export interface BattlefieldSection {
  name: string;
  balance: string | null;
  changes: string[];
}

export interface BattlefieldItem {
  description: string[];
  sections: BattlefieldSection[];
  changes: string[];
}

export interface BattlefieldAdjustment {
  type?: 'section' | 'item';
  badge?: string;
  description?: string | string[];
  items?: Record<string, BattlefieldItem>;
  changes?: string[];
}

export interface EquipmentAdjustmentItem {
  name?: string;
  badge?: string;
  description?: string;
}

export interface ItemAdjustment {
  badge?: string;
  description?: string;
  adjustments?: (string | EquipmentAdjustmentItem)[];
}

export interface RevampedHeroAdjustment {
  skill_type: string;
  skill_name: string;
  description: string;
}

export interface RevampedHeroData {
  badge: string;
  description: string;
  adjustments: RevampedHeroAdjustment[];
}

export interface SystemAdjustment {
  name: string;
  description: string;
}

export interface Patch {
  version: string;
  release_date: string;
  designers_note?: string;
  new_hero: NewHero | null;
  hero_adjustments: Record<string, PatchHeroChanges>;
  emblem_adjustments: Record<string, { sections?: BattlefieldSection[]; badge?: string; description?: string; adjustments?: string[] }>;
  equipment_adjustments?: Record<string, ItemAdjustment>;
  battlefield_adjustments: Record<string, BattlefieldAdjustment>;
  system_adjustments: (string | SystemAdjustment)[];
  revamped_heroes?: string[];
  revamped_heroes_data?: Record<string, RevampedHeroData>;
}

export interface PatchVersion {
  version: string;
  release_date: string;
}
