import React from 'react';
import { TalentsSectionProps } from './interface';
import { TalentCard } from './TalentCard';
import styles from './TalentsSection.module.scss';

export const TalentsSection: React.FC<TalentsSectionProps> = ({ title, talents, tier }) => {
  const count = talents.length;

  return (
    <div className={styles.tierSection}>
      <div className={styles.tierHeader}>
        <h3 className={styles.tierTitle}>{title}</h3>
        <span className={styles.tierCount}>{count}</span>
      </div>
      <div className={styles.talentsGrid}>
        {talents.map((talent) => (
          <TalentCard key={talent.id} talent={talent} />
        ))}
      </div>
    </div>
  );
};
