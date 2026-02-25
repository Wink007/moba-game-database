import { Hero } from '../../../types';

export interface HeroFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedRole: string;
  selectedLane: string;
  selectedComplexity: string;
  sortBy: string;
  onRoleChange: (value: string) => void;
  onLaneChange: (value: string) => void;
  onComplexityChange: (value: string) => void;
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
