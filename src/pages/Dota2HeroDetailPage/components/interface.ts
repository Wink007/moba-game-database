import type { Dota2Hero, Dota2Ability, Dota2TalentsEntry } from '../../../types/dota2';

export interface HeroStatsProps {
  hero: Dota2Hero;
}

export interface AbilitiesSectionProps {
  abilities: (Dota2Ability | Dota2TalentsEntry)[];
}

export interface TalentsSectionProps {
  talents: Dota2TalentsEntry;
}
