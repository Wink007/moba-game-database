import React from 'react';
import { useTranslation } from 'react-i18next';
import { FilterSection, FilterGroup } from '../../../components/FilterSection';
import { getDota2RoleOptions, getDota2AttrOptions, getDota2ComplexityOptions, getDota2SortOptions } from '../constants';
import type { HeroFiltersProps } from '../types';
import styles from '../../HeroesPage/styles.module.scss';
import filterStyles from './HeroFilters.module.scss';

const GridIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
  </svg>
);

const ListIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
    <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
    <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
);

export const Dota2HeroFilters: React.FC<HeroFiltersProps> = React.memo(({
  searchQuery, onSearchChange,
  selectedRole, selectedAttr, selectedComplexity, sortBy,
  onRoleChange, onAttrChange, onComplexityChange, onSortChange,
  onClearAll, totalCount, displayedCount, viewMode, onViewModeChange,
}) => {
  const { t } = useTranslation();
  const hasActiveFilters =
    selectedRole !== 'all' || selectedAttr !== 'all' ||
    selectedComplexity !== 'all' || sortBy !== 'name' || !!searchQuery;

  const filterGroups: FilterGroup[] = [
    {
      label: t('heroes.filters.role'),
      emoji: '🎭',
      options: getDota2RoleOptions(t),
      selectedValue: selectedRole,
      onChange: onRoleChange,
    },
    {
      label: 'Attribute',
      emoji: '⚡',
      options: getDota2AttrOptions(),
      selectedValue: selectedAttr,
      onChange: onAttrChange,
    },
    {
      label: t('heroes.filters.complexity'),
      emoji: '🎯',
      options: getDota2ComplexityOptions(),
      selectedValue: selectedComplexity,
      onChange: onComplexityChange,
    },
    {
      label: t('heroes.filters.sortBy'),
      emoji: '📊',
      options: getDota2SortOptions(t),
      selectedValue: sortBy,
      onChange: onSortChange,
    },
  ];

  return (
    <div className={styles.header}>
      <div className={styles.titleSection}>
        <div className={styles.titleText}>
          <h1 className={styles.title}>{t('heroes.title')}</h1>
          <span className={styles.heroCount}>
            {totalCount > 0 ? `${displayedCount} / ${totalCount}` : ''}
          </span>
        </div>
        <div className={filterStyles.controls}>
          <div className={filterStyles.searchWrapper}>
            <input
              type="search"
              className={filterStyles.searchInput}
              placeholder={t('heroes.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <div className={filterStyles.viewToggle}>
            <button
              className={`${filterStyles.viewBtn} ${viewMode === 'grid' ? filterStyles.viewBtnActive : ''}`}
              onClick={() => onViewModeChange('grid')}
              title="Grid"
            >
              <GridIcon />
            </button>
            <button
              className={`${filterStyles.viewBtn} ${viewMode === 'list' ? filterStyles.viewBtnActive : ''}`}
              onClick={() => onViewModeChange('list')}
              title="List"
            >
              <ListIcon />
            </button>
          </div>
          {hasActiveFilters && (
            <button className={styles.clearFiltersButton} onClick={onClearAll}>
              {t('heroes.filters.clearAll')}
            </button>
          )}
        </div>
      </div>

      <FilterSection filterGroups={filterGroups} collapsible defaultExpanded={false} />
    </div>
  );
});
