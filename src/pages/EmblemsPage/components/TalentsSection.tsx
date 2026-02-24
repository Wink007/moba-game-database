import React from 'react';
import { TalentsSectionProps } from './interface';
import { TalentCard } from './TalentCard';
import styles from './TalentsSection.module.scss';

const tierBadgeClass: Record<number, string> = {
  1: styles.tierBadge1,
  2: styles.tierBadge2,
  3: styles.tierBadge3,
};

const tierGridClass: Record<number, string> = {
  1: styles.tier1,
  2: styles.tier2,
  3: styles.tier3,
};

export const TalentsSection: React.FC<TalentsSectionProps> = ({ title, talents, tier }) => {
  const count = talents.length;

  return (
    <div className={styles.tierSection}>
      <div className={styles.tierHeader}>
        <span className={`${styles.tierBadge} ${tierBadgeClass[tier] || ''}`}>{tier}</span>
        <h3 className={styles.tierTitle}>{title}</h3>
        <span className={styles.tierCount}>{count}</span>
      </div>
      <div className={`${styles.talentsGrid} ${tierGridClass[tier] || ''}`}>
        {talents.map((talent) => (
          <TalentCard key={talent.id} talent={talent} />
        ))}
      </div>
    </div>
  );
};
