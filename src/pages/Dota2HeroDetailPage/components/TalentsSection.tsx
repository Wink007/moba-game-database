import React from 'react';
import type { TalentsSectionProps } from './interface';
import styles from '../styles.module.scss';

export const TalentsSection: React.FC<TalentsSectionProps> = ({ talents }) => {
  const grouped = talents.items.reduce<Record<number, string[]>>((acc, t) => {
    if (!acc[t.level]) acc[t.level] = [];
    acc[t.level].push(t.name);
    return acc;
  }, {});

  const levels = Object.keys(grouped).map(Number).sort((a, b) => b - a);

  return (
    <div className={styles.talentsGrid}>
      {levels.map((level) => (
        <div key={level} className={styles.talentRow}>
          <div className={styles.talentLevel}>{level}</div>
          {grouped[level].map((name, i) => (
            <div key={i} className={`${styles.talentItem} ${i === 0 ? styles.talentLeft : styles.talentRight}`}>
              {name}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
