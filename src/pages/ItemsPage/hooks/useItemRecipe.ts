import { useMemo } from 'react';
import { Item, ItemRecipe } from '../../../types';
import { RecipeNode } from './interface';

export const useItemRecipe = (selectedItem: Item | null, allItems: Item[]) => {
  const getCraftingTree = (item: Item | null): Item[] => {
    if (!item || !item.recipe) return [];
    
    if (Array.isArray(item.recipe)) {
      return item.recipe
        .map((recipeItem: ItemRecipe | number) => {
          const recipeId = typeof recipeItem === 'object' ? recipeItem.id : recipeItem;
          return allItems.find((i: Item) => i.id === recipeId);
        })
        .filter((i: Item | undefined): i is Item => i !== undefined);
    }
    
    return [];
  };

  const buildRecipeTree = (item: Item, parentCount: number = 1): RecipeNode => {
    const components = getCraftingTree(item);
    return {
      item,
      count: parentCount,
      children: components.map(comp => buildRecipeTree(comp, parentCount))
    };
  };

  const flattenWithCounts = (
    node: RecipeNode, 
    result: Map<number, { item: Item, count: number }> = new Map(), 
    skipRoot: boolean = true
  ) => {
    if (!skipRoot) {
      const existing = result.get(node.item.id);
      if (existing) {
        existing.count += node.count;
      } else {
        result.set(node.item.id, { item: node.item, count: node.count });
      }
    }
    
    node.children.forEach(child => flattenWithCounts(child, result, false));
    return result;
  };

  const craftingComponents = getCraftingTree(selectedItem);
  const recipeTree = selectedItem ? buildRecipeTree(selectedItem) : null;
  const flattenedRecipe = recipeTree ? flattenWithCounts(recipeTree, new Map(), true) : new Map();
  const allRecipeItems = Array.from(flattenedRecipe.values());
  
  const totalCost = allRecipeItems.reduce((sum, { item, count }) => sum + (item.price_total || 0) * count, 0);
  
  const itemCounts: Record<number, number> = {};
  flattenedRecipe.forEach(({ item, count }) => {
    itemCounts[item.id] = count;
  });

  const usedInItems = useMemo(() => {
    if (!selectedItem) return [];
    
    return allItems.filter(item => {
      if (!item.recipe || !Array.isArray(item.recipe)) return false;
      
      return item.recipe.some((recipeItem: ItemRecipe | number) => {
        const recipeId = typeof recipeItem === 'object' ? recipeItem.id : recipeItem;
        return recipeId === selectedItem.id;
      });
    });
  }, [allItems, selectedItem]);

  return {
    craftingComponents,
    recipeTree,
    allRecipeItems,
    totalCost,
    itemCounts,
    usedInItems,
  };
};
