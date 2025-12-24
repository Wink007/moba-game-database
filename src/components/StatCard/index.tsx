import React from 'react';
import styles from './styles.module.scss';

interface StatItem {
  label: string;
  value: string | number;
}

interface StatCardProps {
  title: string;
  stats: StatItem[];
}

export const StatCard: React.FC<StatCardProps> = ({ title, stats }) => {
  return (
    <div className={styles.statCard}>
      <div className={styles.statCardTitle}>{title}</div>
      <div className={styles.statsList}>
        {stats.map((stat, index) => (
          <div key={index} className={styles.statItem}>
            <div className={styles.statInfo}>
              <div className={styles.statLabel}>{stat.label}</div>
              <div className={styles.statValue}>{stat.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
