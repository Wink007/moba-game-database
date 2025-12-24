import styles from '../styles.module.scss';

interface FilterOption {
  value: any;
  label: string;
}

interface FilterTabsProps {
  label: string;
  emoji: string;
  options: FilterOption[];
  selectedValue: any;
  onChange: (value: any) => void;
}

export const FilterTabs = ({ label, emoji, options, selectedValue, onChange }: FilterTabsProps) => (
  <div className={styles.filterGroup}>
    <label className={styles.filterLabel}>{emoji} {label}</label>
    <div className={styles.tabGroup}>
      {options.map((option) => (
        <button
          key={option.value}
          className={`${styles.tab} ${selectedValue === option.value ? styles.tabActive : ''}`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  </div>
);
