import { Hero } from '../../../types';

export interface HeroFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedRole: string;
  selectedLane: string;
  selectedComplexity: string;
  selectedSpecialty: string;
  selectedDamageType: string;
  sortBy: string;
  onRoleChange: (value: string) => void;
  onLaneChange: (value: string) => void;
  onComplexityChange: (value: string) => void;
  onSpecialtyChange: (value: string) => void;
  onDamageTypeChange: (value: string) => void;
  onSortChange: (value: string) => void;
  totalCount: number;
  displayedCount: number;
}

export interface HeroGridProps {
  heroes: Hero[];
  gameId: number;
  hasMore: boolean;
  remainingCount: number;
  onLoadMore: () => void;
  isFiltering?: boolean;
}
