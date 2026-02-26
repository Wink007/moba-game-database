import React from 'react';
import { SparklineProps } from './interfaces';

export const Sparkline: React.FC<SparklineProps> = ({ values, color }) => {
  if (values.length < 2) return null;

  const W = 200;
  const H = 48;
  const PAD = 4;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 0.1;

  const pts = values.map((v, i) => {
    const x = PAD + (i / (values.length - 1)) * (W - PAD * 2);
    const y = H - PAD - ((v - min) / range) * (H - PAD * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  const lastX = PAD + ((values.length - 1) / (values.length - 1)) * (W - PAD * 2);
  const lastY = H - PAD - ((values[values.length - 1] - min) / range) * (H - PAD * 2);
  const gradId = `sg-${color.replace('#', '')}`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      style={{ width: '100%', height: H, display: 'block', overflow: 'visible' }}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`${PAD},${H} ${pts} ${lastX.toFixed(1)},${H}`}
        fill={`url(#${gradId})`}
      />
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={lastX} cy={lastY} r="3" fill={color} />
    </svg>
  );
};
