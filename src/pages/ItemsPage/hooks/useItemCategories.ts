import { useMemo } from 'react';
import { Item } from '../../../types';

export const useItemCategories = (items: Item[]) => {
  const tiers = useMemo(() => {
    const tierSet = new Set(
      items.map(item => item.tier).filter((tier): tier is string => tier !== undefined && tier !== null)
    );
    return Array.from(tierSet).sort();
  }, [items]);

  const categories = useMemo(() => {
    const catSet = new Set(
      items.map(item => item.category).filter((cat): cat is string => cat !== undefined && cat !== null)
    );
    return Array.from(catSet);
  }, [items]);

  return { tiers, categories };
};
