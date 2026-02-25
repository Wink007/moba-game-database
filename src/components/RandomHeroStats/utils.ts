import type { ChartDataPoint } from './types';

// Константи для графіків
export const CHART_CONFIG = {
  width: 470,
  height: 190,
  paddingLeft: 60,
  paddingRight: 10,
  paddingTop: 10,
  paddingBottom: 40,
};

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

// SVG координати для лінії графіка
export const createPath = (data: ChartDataPoint[], min: number, max: number): string => {
  const { width, height, paddingLeft, paddingRight, paddingTop, paddingBottom } = CHART_CONFIG;
  
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;
  const xStep = chartWidth / (data.length - 1);
  const yScale = chartHeight / (max - min);
  
  const points = data.map((point, index) => {
    const x = paddingLeft + index * xStep;
    const y = paddingTop + chartHeight - ((point.value - min) * yScale);
    return `${x},${y}`;
  });
  
  return `M ${points.join(' L ')}`;
};

// Створюємо area path з перпендикулярними лініями вниз
export const createAreaPath = (data: ChartDataPoint[], min: number, max: number): string => {
  const { width, height, paddingLeft, paddingRight, paddingTop, paddingBottom } = CHART_CONFIG;
  
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;
  const xStep = chartWidth / (data.length - 1);
  const yScale = chartHeight / (max - min);
  const baseY = paddingTop + chartHeight;
  
  const points = data.map((point, index) => {
    const x = paddingLeft + index * xStep;
    const y = paddingTop + chartHeight - ((point.value - min) * yScale);
    return { x, y };
  });
  
  let path = `M ${points[0].x},${baseY}`;
  path += ` L ${points[0].x},${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    path += ` L ${points[i].x},${points[i].y}`;
  }
  path += ` L ${points[points.length - 1].x},${baseY}`;
  path += ' Z';
  
  return path;
};

// Генеруємо Y-axis labels (від max до min)
export const getYAxisLabels = (min: number, max: number): number[] => {
  const step = (max - min) / 4;
  return [max, max - step, max - step * 2, max - step * 3, min];
};

// Розрахунок позиції точки на графіку
export const getDataPointPosition = (
  value: number,
  index: number,
  dataLength: number,
  min: number,
  max: number
) => {
  const { paddingTop, paddingBottom } = CHART_CONFIG;
  const xStep = 400 / (dataLength - 1);
  const chartHeight = 190 - paddingTop - paddingBottom;
  const yScale = chartHeight / (max - min);
  const x = 60 + index * xStep;
  const y = paddingTop + chartHeight - ((value - min) * yScale);
  
  return { x, y };
};
