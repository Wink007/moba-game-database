import type { ChartDataPoint } from './types';
import styles from './styles.module.scss';

interface ChartProps {
  data: ChartDataPoint[];
  min: number;
  max: number;
  currentValue: number;
  trend: number;
  title: string;
  color: string;
  gradientId: string; // kept for API compat
}

export const Chart = ({ data, min, max, currentValue, trend, title, color }: ChartProps) => {
  const isGreen = color === 'green';
  const range = max - min || 1;

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <h4 className={styles.chartTitle}>
          {title} <span className={styles.chartValue}>{currentValue.toFixed(2)}%</span>
        </h4>
        <div className={styles.chartTrend}>
          <span className={trend >= 0 ? styles.trendUp : styles.trendDown}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(2)}%
          </span>
          <span className={styles.chartSubtitle}>vs 3 days ago</span>
        </div>
      </div>

      <div className={styles.barChartArea}>
        <div className={styles.barChartGrid}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={styles.barChartGridLine} />
          ))}
        </div>

        <div className={styles.barChartBars}>
          {data.map((point, i) => {
            const pct = ((point.value - min) / range) * 100;
            const clampedPct = Math.max(4, Math.min(100, pct));
            return (
              <div key={i} className={styles.barChartCol}>
                <div className={styles.barChartTooltip}>
                  {point.value.toFixed(2)}%
                </div>
                <div
                  className={`${styles.barChartBar} ${isGreen ? styles.barGreen : styles.barRed}`}
                  style={{
                    '--bar-pct': `${clampedPct}%`,
                    '--bar-i': i,
                  } as React.CSSProperties}
                />
                <span className={styles.barChartLabel}>{point.patch}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
