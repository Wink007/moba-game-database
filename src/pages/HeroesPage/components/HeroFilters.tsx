import React from 'react';
import { useTranslation } from 'react-i18next';
import { FilterSection, FilterGroup } from '../../../components/FilterSection';
import { getRoleOptions, getLaneOptions, getComplexityOptions, getSortOptions, getDamageTypeOptions, getSpecialtyOptions } from '../constants';
import { HeroFiltersProps } from './interface';
import styles from './HeroFilters.module.scss';

export const HeroFilters: React.FC<HeroFiltersProps> = React.memo(({
  searchQuery,
  onSearchChange,
  selectedRole,
  selectedLane,
  selectedComplexity,
  selectedSpecialty,
  selectedDamageType,
  sortBy,
  onRoleChange,
  onLaneChange,
  onComplexityChange,
  onSpecialtyChange,
  onDamageTypeChange,
  onSortChange,
  onClearAll,
  totalCount,
  displayedCount,
  viewMode,
  onViewModeChange,
}) => {
  const { t } = useTranslation();
  const hasActiveFilters = selectedRole !== 'all' || selectedLane !== 'all' || selectedComplexity !== 'all' || selectedSpecialty !== 'all' || selectedDamageType !== 'all' || sortBy !== 'name' || !!searchQuery;
  const filterGroups: FilterGroup[] = [
    {
      label: t('heroes.filters.role'),
      emoji: '🎭',
      options: getRoleOptions(t),
      selectedValue: selectedRole,
      onChange: onRoleChange,
    },
    {
      label: t('heroes.filters.lane'),
      emoji: '🛣️',
      options: getLaneOptions(t),
      selectedValue: selectedLane,
      onChange: onLaneChange,
    },
    {
      label: t('heroes.filters.damageType'),
      emoji: '⚔️',
      options: getDamageTypeOptions(t),
      selectedValue: selectedDamageType,
      onChange: onDamageTypeChange,
    },
    {
      label: t('heroes.filters.specialty'),
      emoji: '✨',
      options: getSpecialtyOptions(t),
      selectedValue: selectedSpecialty,
      onChange: onSpecialtyChange,
    },
    {
      label: t('heroes.filters.complexity'),
      emoji: '⚡',
      options: getComplexityOptions(t),
      selectedValue: selectedComplexity,
      onChange: onComplexityChange,
    },
    {
      label: t('heroes.filters.sortBy'),
      emoji: '📊',
      options: getSortOptions(t),
      selectedValue: sortBy,
      onChange: onSortChange,
    },
  ];

  return (
    <div className={styles.header}>
      <div className={styles.titleSection}>
        <h1 className={styles.title}>{t('heroes.title')}</h1>
        <p className={styles.subtitle}>
          {t('heroes.browse')} • {t('heroes.showing', { displayed: displayedCount, total: totalCount })}
        </p>
        <div className={styles.viewToggle} role="group" aria-label="View mode">
          <button
            className={`${styles.viewToggleBtn} ${viewMode === 'grid' ? styles.viewToggleBtnActive : ''}`}
            onClick={() => onViewModeChange('grid')}
            aria-label="Grid view"
            aria-pressed={viewMode === 'grid'}
            title="Grid view"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <rect x="1" y="1" width="6" height="6" rx="1"/>
              <rect x="9" y="1" width="6" height="6" rx="1"/>
              <rect x="1" y="9" width="6" height="6" rx="1"/>
              <rect x="9" y="9" width="6" height="6" rx="1"/>
            </svg>
          </button>
          <button
            className={`${styles.viewToggleBtn} ${viewMode === 'list' ? styles.viewToggleBtnActive : ''}`}
            onClick={() => onViewModeChange('list')}
            aria-label="List view"
            aria-pressed={viewMode === 'list'}
            title="List view"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <rect x="1" y="2" width="14" height="2" rx="1"/>
              <rect x="1" y="7" width="14" height="2" rx="1"/>
              <rect x="1" y="12" width="14" height="2" rx="1"/>
            </svg>
          </button>
        </div>
      </div>

      {hasActiveFilters && (
        <button className={styles.clearAllBtn} onClick={onClearAll}>
          ✕ {t('heroes.filters.clearAll')}
        </button>
      )}

      <div className={styles.searchWrapper}>
        <input
          type="text"
          placeholder={t('heroes.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className={styles.searchInput}
        />
        {searchQuery && (
          <button onClick={() => onSearchChange('')} className={styles.clearButton}>
            ✕
          </button>
        )}
      </div>

      <FilterSection 
        filterGroups={filterGroups} 
        collapsible={true}
        defaultExpanded={false}
      />
    </div>
  );
});
