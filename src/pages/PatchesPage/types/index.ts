// Reddit patch notes format (from u/Tigreal posts)
// All *_en/*_uk fields are normalized to plain description by the API (?lang=)

export interface SkillAdjustment {
  badge: string;        // BUFF | NERF | ADJUST | CHANGE
  skill_name: string;
  description: string;
}

export interface HeroAdjustment {
  badge: string;
  description: string;
  adjustments?: SkillAdjustment[];
}

export interface EquipmentAdjustment {
  badge: string;
  description: string;
  adjustments?: SkillAdjustment[];
}

export interface BattlefieldAdjustment {
  badge: string;
  description: string;
}

export interface Patch {
  version: string;
  release_date: string;
  game_id: number;
  is_adv_server: boolean;
  reddit_source: boolean;
  reddit_permalink?: string;
  hero_adjustments: Record<string, HeroAdjustment>;
  equipment_adjustments: Record<string, EquipmentAdjustment>;
  battlefield_adjustments: Record<string, BattlefieldAdjustment>;
  system_adjustments: string[];
  revamped_heroes: string[];
}

export interface PatchVersion {
  version: string;
  release_date: string;
}
