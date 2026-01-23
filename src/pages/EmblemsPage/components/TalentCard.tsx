import React from 'react';
import { TalentCardProps } from './interface';
import styles from './TalentCard.module.scss';

export const TalentCard: React.FC<TalentCardProps> = ({ talent }) => {
  return (
    <div className={styles.talentCard}>
      <div className={styles.talentHeader}>
        {talent.icon_url && (
          <img
            src={talent.icon_url}
            alt={talent.name}
            className={styles.talentIcon}
          />
        )}
        <h4 className={styles.talentName}>{talent.name}</h4>
      </div>
      <p className={styles.talentEffect}>{talent.effect}</p>
    </div>
  );
};
