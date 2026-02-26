import React from 'react';
import styles from '../styles.module.scss';

export const StatsHistorySkeleton: React.FC = () => (
  <>
    {/* Table skeleton */}
    <div className={styles.statsHistoryTable}>
      <div className={styles.statsHistoryTableHeader}>
        {(['28px', '48px', '48px', '48px'] as const).map((w, i) => (
          <span key={i} className={styles.shPill} style={{ width: w, height: 8 }} />
        ))}
      </div>
      {[0, 1, 2, 3, 4].map(i => (
        <div key={i} className={styles.statsHistoryTableRow}>
          {(['28px', '48px', '48px', '48px'] as const).map((w, j) => (
            <span key={j} className={styles.shPill} style={{ width: w, height: 9 }} />
          ))}
        </div>
      ))}
    </div>

    {/* Cards skeleton */}
    <div className={styles.shSkeletonGrid}>
      {[0, 1, 2].map(i => (
        <div key={i} className={styles.shSkeletonCard}>
          <div className={styles.shSkRow}>
            <span className={styles.shPill} style={{ width: 8, height: 8, borderRadius: '50%' }} />
            <span className={styles.shPill} style={{ width: 80, height: 9 }} />
          </div>
          <span className={styles.shPill} style={{ width: 90, height: 28, marginTop: 6 }} />
          <span className={styles.shPill} style={{ width: '100%', height: 48, marginTop: 12, borderRadius: 6 }} />
          <div className={styles.shSkRow} style={{ marginTop: 6, justifyContent: 'space-between' }}>
            {[0, 1, 2, 3, 4].map(j => (
              <span key={j} className={styles.shPill} style={{ width: 20, height: 8 }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  </>
);
