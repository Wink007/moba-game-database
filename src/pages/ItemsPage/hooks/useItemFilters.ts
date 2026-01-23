import { useMemo } from 'react';
import { UseItemFiltersProps } from './interface';

export const useItemFilters = ({ 
  items, 
  selectedTier, 
  selectedCategory, 
  searchQuery 
}: UseItemFiltersProps) => {
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (selectedTier && item.tier !== selectedTier) return false;
      if (selectedCategory && item.category !== selectedCategory) return false;
      if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [items, selectedTier, selectedCategory, searchQuery]);

  return { filteredItems };
};
