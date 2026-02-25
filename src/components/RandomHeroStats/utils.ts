import type { ChartDataPoint } from './types';

// Динамічний діапазон з padding для кращої видимості
export const getRange = (data: ChartDataPoint[]) => {
  const values = data.map(d => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  const padding = range > 0 ? range * 0.5 : max * 0.2;
  
  return {
    min: Math.max(0, min - padding),
    max: max + padding
  };
};
