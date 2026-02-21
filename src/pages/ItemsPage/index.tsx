import { useParams, useSearchParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useItemsQuery } from '../../queries/useItemsQuery';
import { useItemCategories } from './hooks/useItemCategories';
import { useItemFilters } from './hooks/useItemFilters';
import { useItemRecipe } from './hooks/useItemRecipe';
import { ItemFilters } from './components/ItemFilters';
import { ItemGrid } from './components/ItemGrid';
import { ItemDetails } from './components/ItemDetails';
import { Item } from '../../types/item';
import { useSEO } from '../../hooks/useSEO';
import { Loader } from '../../components/Loader';
import styles from './styles.module.scss';

function ItemsPage() {
  const { gameId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  useSEO({ title: 'Items', description: 'Browse all Mobile Legends items — equipment, roaming, jungling and more.' });
  const { data: items = [], isLoading } = useItemsQuery(Number(gameId));
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Auto-select item from ?item= query param
  useEffect(() => {
    const itemId = searchParams.get('item');
    if (itemId && items.length > 0) {
      const item = items.find((i: Item) => i.id === Number(itemId));
      if (item) {
        setSelectedItem(item);
        setIsDetailsOpen(true);
        searchParams.delete('item');
        setSearchParams(searchParams, { replace: true });
      }
    }
  }, [items, searchParams, setSearchParams]);

  useEffect(() => {
    if (isDetailsOpen && window.innerWidth <= 1024) {
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isDetailsOpen]);

  const { tiers, categories } = useItemCategories(items);
  const { filteredItems } = useItemFilters({ items, selectedTier, selectedCategory, searchQuery });
  const { craftingComponents, usedInItems } = useItemRecipe(selectedItem, items);

  const getCraftingTree = (item: Item | null): Item[] => {
    if (!item || !item.recipe) return [];
    
    if (Array.isArray(item.recipe)) {
      return item.recipe
        .map((recipeItem: any) => {
          const recipeId = typeof recipeItem === 'object' ? recipeItem.id : recipeItem;
          return items.find((i: Item) => i.id === recipeId);
        })
        .filter((i: Item | undefined): i is Item => i !== undefined);
    }
    
    return [];
  };

  const handleItemClick = (item: Item) => {
    setSelectedItem(item);
    setIsDetailsOpen(true);
  };

  if (isLoading) {
    return <div className={styles.loading}><Loader /></div>;
  }

  return (
    <div className={styles.itemsPage}>
      {(isFilterOpen || isDetailsOpen) && (
        <div 
          className={styles.overlay} 
          onClick={() => {
            setIsFilterOpen(false);
            setIsDetailsOpen(false);
          }} 
        />
      )}

      <ItemFilters
        tiers={tiers}
        categories={categories}
        selectedTier={selectedTier}
        selectedCategory={selectedCategory}
        searchQuery={searchQuery}
        filteredCount={filteredItems.length}
        onTierChange={setSelectedTier}
        onCategoryChange={setSelectedCategory}
        onSearchChange={setSearchQuery}
        isOpen={isFilterOpen}
      />

      <div className={styles.contentWrapper}>
        <ItemGrid
          items={filteredItems}
          selectedItemId={selectedItem?.id}
          onItemClick={handleItemClick}
        />

        <ItemDetails
          selectedItem={selectedItem}
          craftingComponents={craftingComponents}
          usedInItems={usedInItems}
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          onItemClick={handleItemClick}
          getCraftingTree={getCraftingTree}
        />
      </div>
    </div>
  );
}

export default ItemsPage;
