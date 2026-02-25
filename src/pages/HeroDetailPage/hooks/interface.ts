import { HeroSkill } from '../../../types/hero';

export interface UseHeroSkillsReturn {
  baseSkills: HeroSkill[];
  transformedSkills: HeroSkill[];
  displaySkills: HeroSkill[];
  selectedSkillIndex: number;
  selectedSkill: HeroSkill | undefined;
  maxTransforms: number;
  transformIndex: number;
  changedIndices: Set<number>;
  cycleTransform: () => void;
  setSelectedSkillIndex: (index: number) => void;
  setTransformIndex: (index: number) => void;
}

export interface UseHeroTabsReturn {
  activeTab: 'info' | 'about' | 'counter' | 'synergy' | 'history' | 'builds';
  counterSubTab: 'best' | 'worst';
  synergySubTab: 'compatible' | 'incompatible';
  setActiveTab: (tab: 'info' | 'about' | 'counter' | 'synergy' | 'history' | 'builds') => void;
  setCounterSubTab: (tab: 'best' | 'worst') => void;
  setSynergySubTab: (tab: 'compatible' | 'incompatible') => void;
}
