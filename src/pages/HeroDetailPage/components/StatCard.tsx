import React from 'react';
import styles from '../styles.module.scss';
import { Sparkline } from './Sparkline';
import { StatCardProps } from './interfaces';

export const StatCard: React.FC<StatCardProps> = ({
  label, value, trend, values, color, periods,
}) => {
  const trendUp   = trend !== null && trend > 0;
  const trendDown = trend !== null && trend < 0;

  return (
    <div className={styles.shStatCard}>
      <div className={styles.shStatCardHeader}>
        <span className={styles.shStatDot} style={{ background: color }} />
        <span className={styles.shStatLabel}>{label}</span>
        {trend !== null && (
          <span
            className={`${styles.shTrend} ${
              trendUp ? styles.shTrendUp : trendDown ? styles.shTrendDown : styles.shTrendFlat
            }`}
          >
            {trendUp ? '▲' : trendDown ? '▼' : '—'} {Math.abs(trend).toFixed(1)}%
          </span>
        )}
      </div>
      <div className={styles.shStatValue} style={{ color }}>
        {value !== null ? `${value.toFixed(2)}%` : '—'}
      </div>
      <div className={styles.shSparklineWrap}>
        <Sparkline values={values} color={color} />
      </div>
      <div className={styles.shPeriodLabels}>
        {periods.map(p => <span key={p}>{p}d</span>)}
      </div>
    </div>
  );
};
