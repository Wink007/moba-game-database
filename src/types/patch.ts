export interface SkillChange {
  name: string;
  type: string; // "Passive", "Ultimate", "Skill 1", etc.
  balance: 'BUFF' | 'NERF' | 'ADJUST' | 'REVAMP';
  changes: string[];
}

export interface HeroChange {
  summary: string;
  skills: SkillChange[];
}

// New format from admin panel
export interface SkillAdjustment {
  skill_type: string;
  skill_name: string;
  badge: 'BUFF' | 'NERF' | 'ADJUST' | 'REVAMP' | 'NEW';
  description: string;
}

export interface AttributeAdjustment {
  attribute_name: string;
  badge: 'BUFF' | 'NERF' | 'ADJUST';
  description: string;
}

export interface HeroAdjustment {
  badge: 'BUFF' | 'NERF' | 'ADJUST' | 'REVAMP' | 'NEW';
  description: string;
  adjustments?: SkillAdjustment[];
  attribute_adjustments?: AttributeAdjustment[];
}

export interface Patch {
  version: string;
  release_date: string;
  url?: string;
  hero_changes?: Record<string, HeroChange>; // Old format
  hero_adjustments?: Record<string, HeroAdjustment>; // New format from admin panel
  item_changes?: any;
  system_changes?: any;
  new_hero?: any;
}
