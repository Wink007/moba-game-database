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

export interface Patch {
  version: string;
  release_date: string;
  url?: string;
  hero_changes?: Record<string, HeroChange>;
  item_changes?: any;
  system_changes?: any;
  new_hero?: any;
}
