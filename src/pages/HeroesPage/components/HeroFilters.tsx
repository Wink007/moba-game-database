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
  totalCount,
  displayedCount,
}) => {
  const { t } = useTranslation();
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
      </div>

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
