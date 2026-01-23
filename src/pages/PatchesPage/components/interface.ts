import { Patch, PatchVersion } from '../types';

export interface PatchSidebarProps {
  patchVersions: PatchVersion[];
  selectedPatch: string | null;
  onPatchSelect: (version: string) => void;
}

export interface PatchHeaderProps {
  version: string;
  releaseDate: string;
  designersNote?: string;
}

export interface NewHeroSectionProps {
  newHero: any;
  heroNameToId: Record<string, number>;
  gameId: string | undefined;
}

export interface RevampedHeroesSectionProps {
  revampedHeroes: string[];
  revampedHeroesData: Record<string, any>;
  heroNameToId: Record<string, number>;
  gameId: string | undefined;
}

export interface HeroAdjustmentsSectionProps {
  heroAdjustments: Record<string, any>;
  heroNameToId: Record<string, number>;
  gameId: string | undefined;
  currentPatchData: Patch;
}

export interface EquipmentAdjustmentsSectionProps {
  equipmentAdjustments: Record<string, any>;
  itemNameToId: Record<string, number>;
  gameId: string | undefined;
}

export interface BattlefieldAdjustmentsSectionProps {
  battlefieldAdjustments: Record<string, any>;
}

export interface SystemAdjustmentsSectionProps {
  systemAdjustments: any[];
}
