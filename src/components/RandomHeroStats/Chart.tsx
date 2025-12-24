import type { ChartDataPoint } from './types';
import { createPath, createAreaPath, getYAxisLabels, getDataPointPosition } from './utils';
import styles from './styles.module.scss';

interface ChartProps {
  data: ChartDataPoint[];
  min: number;
  max: number;
  currentValue: number;
  trend: number;
  title: string;
  color: string;
  gradientId: string;
}

export const Chart = ({ data, min, max, currentValue, trend, title, color, gradientId }: ChartProps) => {
  const strokeColor = color === 'green' ? '#22c55e' : '#ef4444';
  const fillColor = color === 'green' ? '#86efac' : '#fca5a5';
  const darkStroke = color === 'green' ? '#0f3d25' : '#4a1212';
  const gradientStops = color === 'green' 
    ? ['rgba(34, 197, 94, 0.2)', 'rgba(34, 197, 94, 0.05)', 'rgba(34, 197, 94, 0)']
    : ['rgba(239, 68, 68, 0.2)', 'rgba(239, 68, 68, 0.05)', 'rgba(239, 68, 68, 0)'];

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <h4 className={styles.chartTitle}>
          {title} <span className={styles.chartValue}>{(currentValue * 100).toFixed(1)}%</span>
        </h4>
        <div className={styles.chartTrend}>
          <span className={trend >= 0 ? styles.trendUp : styles.trendDown}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
          </span>
          <span className={styles.chartSubtitle}>vs 3 days ago</span>
        </div>
      </div>
      <svg viewBox="0 0 480 230" className={styles.chart}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={gradientStops[0]} />
            <stop offset="70%" stopColor={gradientStops[1]} />
            <stop offset="100%" stopColor={gradientStops[2]} />
          </linearGradient>
        </defs>
        
        {/* Grid lines */}
        {[0, 1, 2, 3, 4].map(i => (
          <line
            key={i}
            x1="60"
            y1={10 + (i * 38)}
            x2="470"
            y2={10 + (i * 38)}
            stroke="rgba(148, 163, 184, 0.1)"
            strokeWidth="1"
          />
        ))}
        
        {/* Y-axis labels */}
        {getYAxisLabels(min, max).map((value, i) => (
          <text
            key={i}
            x="5"
            y={10 + (i * 38) + 5}
            textAnchor="start"
            fill="#9ca3af"
            fontSize="11"
            fontFamily="system-ui"
          >
            {(value * 100).toFixed(2)}%
          </text>
        ))}
        
        {/* Area under line */}
        <path
          d={createAreaPath(data, min, max)}
          fill={`url(#${gradientId})`}
        />
        
        {/* Line */}
        <path
          d={createPath(data, min, max)}
          fill="none"
          stroke={strokeColor}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Data points */}
        {data.map((point, index) => {
          const { x, y } = getDataPointPosition(point.value, index, data.length, min, max);
          
          return (
            <g key={index}>
              <circle
                cx={x}
                cy={y}
                r="6"
                fill={strokeColor}
                stroke={darkStroke}
                strokeWidth="2"
                style={{ cursor: 'pointer' }}
              />
              <circle
                cx={x}
                cy={y}
                r="3"
                fill={fillColor}
                style={{ pointerEvents: 'none' }}
              />
              <title>{`${point.patch}: ${(point.value * 100).toFixed(2)}%`}</title>
            </g>
          );
        })}
        
        {/* X-axis labels */}
        {data.map((point, index) => {
          const xStep = 400 / (data.length - 1);
          return (
            <text
              key={index}
              x={60 + index * xStep}
              y="220"
              textAnchor="middle"
              fill="#9ca3af"
              fontSize="11"
              fontFamily="system-ui"
              fontWeight="500"
            >
              {point.patch}
            </text>
          );
        })}
      </svg>
    </div>
  );
};
