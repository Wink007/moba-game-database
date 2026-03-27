import React from 'react';
import type { TalentsSectionProps } from './interface';
import styles from '../styles.module.scss';

const TALENT_LEVELS = [10, 10, 15, 15, 20, 20, 25, 25];

export const TalentsSection: React.FC<TalentsSectionProps> = ({ talents }) => {
  const items = talents.items ?? [];

  // Assign levels by index position if null (Valve API omits them)
  const itemsWithLevels = items.map((t, i) => ({
    name: t.name,
    level: t.level ?? TALENT_LEVELS[i] ?? 10,
  }));

  const grouped = itemsWithLevels.reduce<Record<number, string[]>>((acc, t) => {
    if (!acc[t.level]) acc[t.level] = [];
    acc[t.level].push(t.name);
    return acc;
  }, {});

  const levels = Object.keys(grouped).map(Number).sort((a, b) => b - a);

  if (levels.length === 0) return null;

  return (
    <div className={styles.talentsGrid}>
      {levels.map((level) => (
        <div key={level} className={styles.talentRow}>
          <div className={`${styles.talentItem} ${styles.talentLeft}`}>
            {grouped[level][0] ?? ''}
          </div>
          <div className={styles.talentLevel}>{level}</div>
          <div className={`${styles.talentItem} ${styles.talentRight}`}>
            {grouped[level][1] ?? ''}
          </div>
        </div>
      ))}
    </div>
  );
};
