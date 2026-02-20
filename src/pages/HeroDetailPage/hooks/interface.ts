import { Hero, HeroSkill } from '../../../types/hero';

export interface UseHeroSkillsProps {
  skills: HeroSkill[];
  selectedSkillIndex: number;
  transformIndex: number;
}

export interface UseHeroSkillsReturn {
  baseSkills: HeroSkill[];
  transformedSkills: HeroSkill[];
  displaySkills: HeroSkill[];
  selectedSkill: HeroSkill | undefined;
  maxTransforms: number;
  transformIndex: number;
  changedIndices: Set<number>;
  cycleTransform: () => void;
  setSelectedSkillIndex: (index: number) => void;
  setTransformIndex: (index: number) => void;
}

export interface UseHeroTabsProps {
  activeTab: 'info' | 'about' | 'counter' | 'synergy' | 'history' | 'builds';
  counterSubTab: 'best' | 'worst';
  synergySubTab: 'compatible' | 'incompatible';
}

export interface UseHeroTabsReturn extends UseHeroTabsProps {
  setActiveTab: (tab: 'info' | 'about' | 'counter' | 'synergy' | 'history' | 'builds') => void;
  setCounterSubTab: (tab: 'best' | 'worst') => void;
  setSynergySubTab: (tab: 'compatible' | 'incompatible') => void;
}

export interface UseHeroRelationsProps {
  heroName: string;
  counterData: any;
  compatibilityData: any;
  allHeroes: Hero[];
}

export interface CounterHero {
  hero: Hero;
  counterScore: number;
}

export interface UseHeroRelationsReturn {
  bestCounters: CounterHero[];
  worstMatchups: CounterHero[];
  compatibleHeroes: CounterHero[];
  incompatibleHeroes: CounterHero[];
}
