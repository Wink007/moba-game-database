import { Emblem, Talent } from '../../../hooks/useEmblems';

interface BaseStats {
  [key: string]: string | number;
}

export interface EmblemCardProps {
  emblem: {
    id: number;
    name: string;
    name_uk?: string;
    description?: string;
    description_uk?: string;
    icon_url?: string;
    base_stats?: BaseStats;
  };
}

export interface TalentCardProps {
  talent: Talent;
}

export interface TalentsSectionProps {
  title: string;
  talents: Talent[];
  tier: number;
}
