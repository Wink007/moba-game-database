import type { Item } from '../../../types';

export interface UseItemFiltersProps {
  items: Item[];
  selectedTier: string | null;
  selectedCategory: string | null;
  searchQuery: string;
}

export interface RecipeNode {
  item: Item;
  count: number;
  children: RecipeNode[];
}

export interface UseItemRecipeProps {
  selectedItem: Item | null;
  allItems: Item[];
}
