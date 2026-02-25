import React from 'react';
import styles from '../../styles.module.scss';

export const BuildSkeleton: React.FC<{ count: number }> = React.memo(({ count }) => (
  <>
    {[...Array(count)].map((_, idx) => (
      <div key={idx} className={styles.pbSkeletonCard}>
        <div className={styles.pbSkeletonHeader}>
          <div className={styles.pbSkeletonRank} />
        </div>
        <div className={styles.pbSkeletonItemsRow}>
          {[...Array(6)].map((_, i) => (
            <React.Fragment key={i}>
              {i > 0 && <div className={styles.pbSkeletonArrow} />}
              <div className={styles.pbSkeletonItem}>
                <div className={styles.pbSkeletonItemIcon} />
                <div className={styles.pbSkeletonItemLabel} />
              </div>
            </React.Fragment>
          ))}
        </div>
        <div className={styles.pbSkeletonSetupRow}>
          <div className={styles.pbSkeletonSetupItem}>
            <div className={styles.pbSkeletonSetupIcon} />
            <div className={styles.pbSkeletonSetupLabel} />
          </div>
          <div className={styles.pbSkeletonSetupItem}>
            <div className={styles.pbSkeletonSetupIcon} />
            <div className={styles.pbSkeletonSetupLabel} />
          </div>
        </div>
      </div>
    ))}
  </>
));
