import { Hero, HeroSkill, Patch, CounterHero, CompatibilityHero, ProBuild } from '../../../types';

export type HeroTab = 'info' | 'about' | 'counter' | 'synergy' | 'history' | 'builds' | 'stats';

export interface TabsNavigationProps {
  activeTab: HeroTab;
  onTabChange: (tab: HeroTab) => void;
}

export interface SkillsSectionProps {
  displaySkills: HeroSkill[];
  selectedSkillIndex: number;
  selectedSkill: HeroSkill | undefined;
  maxTransforms: number;
  transformIndex: number;
  changedIndices: Set<number>;
  onSkillSelect: (index: number) => void;
  onTransformCycle: () => void;
}

export interface InfoTabProps {
  hero: Hero;
  abilitiesLabel: string[];
  getRatingLevel: (rate: number) => { level: string; color: string };
}

export interface AboutTabProps {
  hero: Hero;
}

export interface CounterTabProps {
  hero: Hero;
  allHeroes: Hero[];
  counterSubTab: 'best' | 'worst';
  setCounterSubTab: (tab: 'best' | 'worst') => void;
  counterData?: CounterData | null;
}

export interface SynergyTabProps {
  hero: Hero;
  allHeroes: Hero[];
  synergySubTab: 'compatible' | 'incompatible';
  setSynergySubTab: (tab: 'compatible' | 'incompatible') => void;
  isLoading?: boolean;
  compatibilityData?: CompatibilityData | null;
}

export interface HistoryTabProps {
  hero: Hero;
  heroPatches: Patch[];
}

export interface BuildsTabProps {
  hero: Hero;
  buildsSubTab: 'builds' | 'my';
  setBuildsSubTab: (tab: 'builds' | 'my') => void;
}

export interface CounterData {
  main_hero_win_rate?: number;
  best_counters?: CounterHero[];
  counters?: CounterHero[];
  most_countered_by?: CounterHero[];
  allies?: CounterHero[];
}

export interface CompatibilityData {
  main_hero_win_rate?: number;
  compatible?: CompatibilityHero[];
  not_compatible?: CompatibilityHero[];
}

export interface CommunityBuildsSectionProps {
  heroId: number;
  gameId: number;
  showOnly?: 'my' | 'community';
}

export interface ProBuildsSectionProps {
  builds: ProBuild[];
  gameId: number;
}
