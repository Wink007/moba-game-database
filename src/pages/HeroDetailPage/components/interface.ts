import { Hero, HeroSkill, HeroStat } from '../../../types/hero';
import { Patch } from '../../../types';

export interface HeroSidebarProps {
  hero: Hero;
}

export interface HeroBackgroundProps {
  painting?: string;
  image?: string;
  name: string;
}

export interface TabsNavigationProps {
  activeTab: 'info' | 'about' | 'counter' | 'synergy' | 'history';
  onTabChange: (tab: 'info' | 'about' | 'counter' | 'synergy' | 'history') => void;
}

export interface PerformanceStatsProps {
  appearanceRate?: number;
  banRate?: number;
  winRate?: number;
}

export interface StatsTableProps {
  stats: HeroStat;
}

export interface AbilitiesChartProps {
  stats: HeroStat;
  labels: string[];
}

export interface SkillsSectionProps {
  displaySkills: HeroSkill[];
  selectedSkillIndex: number;
  selectedSkill: HeroSkill | undefined;
  maxTransforms: number;
  transformIndex: number;
  onSkillSelect: (index: number) => void;
  onTransformCycle: () => void;
}

export interface AboutTabProps {
  hero: Hero;
  showFullDescription: boolean;
  onToggleDescription: () => void;
}

export interface CounterTabProps {
  hero: Hero;
  allHeroes: Hero[];
  counterData: any;
  counterSubTab: 'best' | 'worst';
  onSubTabChange: (tab: 'best' | 'worst') => void;
}

export interface SynergyTabProps {
  hero: Hero;
  allHeroes: Hero[];
  compatibilityData: any;
  synergySubTab: 'compatible' | 'incompatible';
  onSubTabChange: (tab: 'compatible' | 'incompatible') => void;
}

export interface HistoryTabProps {
  hero: Hero;
  patches: Patch[];
}
