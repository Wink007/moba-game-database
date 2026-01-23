import { Item } from '../../../types';

export interface ItemFiltersProps {
  tiers: string[];
  categories: string[];
  selectedTier: string | null;
  selectedCategory: string | null;
  searchQuery: string;
  filteredCount: number;
  onTierChange: (tier: string | null) => void;
  onCategoryChange: (category: string | null) => void;
  onSearchChange: (query: string) => void;
  isOpen: boolean;
}

export interface ItemGridProps {
  items: Item[];
  selectedItemId: number | undefined;
  onItemClick: (item: Item) => void;
}

export interface ItemDetailsProps {
  selectedItem: Item | null;
  craftingComponents: Item[];
  usedInItems: Item[];
  isOpen: boolean;
  onClose: () => void;
  onItemClick: (item: Item) => void;
  getCraftingTree: (item: Item | null) => Item[];
}
