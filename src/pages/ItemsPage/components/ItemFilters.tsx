import React from 'react';
import { useTranslation } from 'react-i18next';
import parentStyles from '../styles.module.scss';
import { ItemFiltersProps } from './interface';

export const ItemFilters: React.FC<ItemFiltersProps> = ({
  tiers,
  categories,
  selectedTier,
  selectedCategory,
  searchQuery,
  filteredCount,
  onTierChange,
  onCategoryChange,
  onSearchChange,
  isOpen,
}) => {
  const { t } = useTranslation();
  
  const translateCategory = (category: string): string => {
    const categoryKey = category.toLowerCase();
    const translationKey = `items.categories.${categoryKey}`;
    const translated = t(translationKey);
    return translated !== translationKey ? translated : category;
  };
  
  return (
    <aside className={`${parentStyles.sidebar} ${isOpen ? parentStyles.open : ''}`}>
      <div className={parentStyles.filtersWrapper}>
        <div className={parentStyles.filterGroup}>
          <h4>{t('items.tier')}</h4>
          <div className={parentStyles.tierButtons}>
            <button
              className={`${parentStyles.tierButton} ${selectedTier === null ? parentStyles.active : ''}`}
              onClick={() => onTierChange(null)}
            >
              {t('items.all')}
            </button>
            {tiers.map(tier => (
              <button
                key={tier}
                className={`${parentStyles.tierButton} ${selectedTier === tier ? parentStyles.active : ''}`}
                onClick={() => onTierChange(tier)}
              >
                T{tier}
              </button>
            ))}
          </div>
        </div>

        <div className={parentStyles.filterGroup}>
          <h4>{t('items.filters.category')}</h4>
          <div className={parentStyles.categoryButtons}>
            <button
              className={`${parentStyles.categoryButton} ${selectedCategory === null ? parentStyles.active : ''}`}
              onClick={() => onCategoryChange(null)}
            >
              {t('items.all')}
            </button>
            {categories.map(category => (
              <button
                key={category}
                className={`${parentStyles.categoryButton} ${selectedCategory === category ? parentStyles.active : ''}`}
                onClick={() => onCategoryChange(category)}
              >
                {translateCategory(category)}
              </button>
            ))}
          </div>
        </div>

        <div className={parentStyles.filterGroup}>
          <h4>{t('items.search', { count: filteredCount })}</h4>
          <input
            type="text"
            placeholder={t('items.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={parentStyles.searchInput}
          />
        </div>
      </div>
    </aside>
  );
};
