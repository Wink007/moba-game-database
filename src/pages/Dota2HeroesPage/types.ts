export type ViewMode = 'grid' | 'list';

export interface HeroFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedRole: string;
  selectedAttr: string;
  selectedComplexity: string;
  sortBy: string;
  onRoleChange: (value: string) => void;
  onAttrChange: (value: string) => void;
  onComplexityChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onClearAll: () => void;
  totalCount: number;
  displayedCount: number;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}
