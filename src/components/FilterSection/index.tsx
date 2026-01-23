import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './styles.module.scss';

export interface FilterOption {
  value: string | number;
  label: string;
}

export interface FilterGroup {
  label: string;
  emoji?: string;
  options: FilterOption[];
  selectedValue: string | number;
  onChange: (value: string) => void;
}

interface FilterSectionProps {
  filterGroups: FilterGroup[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export const FilterSection: React.FC<FilterSectionProps> = ({ 
  filterGroups, 
  collapsible = false,
  defaultExpanded = true 
}) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (collapsible) {
    return (
      <div className={styles.filtersWrapper}>
        <button
          className={styles.filtersToggle}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span className={styles.filtersToggleText}>
            {t('heroes.filters.title')}
          </span>
          <span className={isExpanded ? `${styles.toggleIcon} ${styles.toggleIconExpanded}` : styles.toggleIcon}>
            <img src="/arrow-small.svg" alt="filter icon" />
          </span>
        </button>

        <div className={isExpanded ? `${styles.filtersContent} ${styles.filtersExpanded}` : styles.filtersContent}>
          <div className={styles.filters}>
            {filterGroups.map((group, index) => (
              <div key={index} className={styles.filterGroup}>
                <label className={styles.filterLabel}>
                  {group.emoji && <span>{group.emoji}</span>} {group.label}
                </label>
                <div className={styles.tabGroup}>
                  {group.options.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => group.onChange(String(option.value))}
                      className={String(group.selectedValue) === String(option.value) 
                        ? `${styles.tab} ${styles.tabActive}` 
                        : styles.tab}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.filters}>
      {filterGroups.map((group, index) => (
        <div key={index} className={styles.filterGroup}>
          <label className={styles.filterLabel}>
            {group.emoji && <span>{group.emoji}</span>} {group.label}
          </label>
          <div className={styles.tabGroup}>
            {group.options.map((option) => (
              <button
                key={option.value}
                onClick={() => group.onChange(String(option.value))}
                className={String(group.selectedValue) === String(option.value) 
                  ? `${styles.tab} ${styles.tabActive}` 
                  : styles.tab}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
