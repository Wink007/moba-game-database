import React, { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Patch } from '../../../types';
import styles from './BalanceChart.module.scss';

interface Props {
  heroName: string;
  patches: Patch[];
  onPatchClick?: (version: string) => void;
}

const SCORE: Record<string, number> = { BUFF: 1, NERF: -1, ADJUST: 0, CHANGE: 0, REVAMP: 0, NEW: 1 };
const COLORS: Record<string, string> = {
  BUFF: 'var(--c-buff)', NERF: 'var(--c-nerf)', ADJUST: 'var(--c-neutral)', CHANGE: 'var(--c-neutral)', REVAMP: 'var(--c-revamp)', NEW: 'var(--c-buff)',
};

// Build smooth bezier path through points
function bezierPath(pts: { x: number; y: number }[]) {
  if (pts.length === 0) return '';
  if (pts.length === 1) return `M${pts[0].x},${pts[0].y}`;
  let d = `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const cpx = ((pts[i - 1].x + pts[i].x) / 2).toFixed(1);
    d += ` C${cpx},${pts[i-1].y.toFixed(1)} ${cpx},${pts[i].y.toFixed(1)} ${pts[i].x.toFixed(1)},${pts[i].y.toFixed(1)}`;
  }
  return d;
}

// Build triangulated "low-poly" fill by splitting area into triangles pointing up/down
function polyFill(pts: { x: number; y: number }[], zeroY: number): string[] {
  const paths: string[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1];
    const mid = { x: (a.x + b.x) / 2, y: Math.min(a.y, b.y) - 10 };
    // Triangle pointing up
    paths.push(`M${a.x.toFixed(1)},${a.y.toFixed(1)} L${mid.x.toFixed(1)},${mid.y.toFixed(1)} L${b.x.toFixed(1)},${b.y.toFixed(1)} Z`);
    // Quad to zero line
    paths.push(`M${a.x.toFixed(1)},${a.y.toFixed(1)} L${b.x.toFixed(1)},${b.y.toFixed(1)} L${b.x.toFixed(1)},${zeroY.toFixed(1)} L${a.x.toFixed(1)},${zeroY.toFixed(1)} Z`);
  }
  return paths;
}

export const BalanceChart: React.FC<Props> = ({ heroName, patches, onPatchClick }) => {
  const { t } = useTranslation();
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  const pts = useMemo(() => {
    const relevant = patches
      .filter(p => p.hero_adjustments?.[heroName] || p.hero_changes?.[heroName])
      .sort((a, b) => a.release_date.localeCompare(b.release_date));
    let cum = 0;
    return relevant.map(p => {
      const adj = p.hero_adjustments?.[heroName];
      const badge = adj?.badge ?? 'ADJUST';
      cum += SCORE[badge] ?? 0;
      return { version: p.version, date: p.release_date, badge, cum };
    });
  }, [patches, heroName]);

  const stats = useMemo(() => {
    const buffs = pts.filter(p => SCORE[p.badge] > 0).length;
    const nerfs = pts.filter(p => SCORE[p.badge] < 0).length;
    const net = buffs - nerfs;
    return { buffs, nerfs, net, last: pts[pts.length - 1] };
  }, [pts]);

  const W = 600, H = 190;
  const PL = 44, PR = 20, PT = 20, PB = 32;
  const cW = W - PL - PR, cH = H - PT - PB;

  const chart = useMemo(() => {
    if (pts.length < 2) return null;
    const minY = Math.min(...pts.map(p => p.cum), 0) - 1.5;
    const maxY = Math.max(...pts.map(p => p.cum), 0) + 1.5;
    const rY = maxY - minY || 3;
    const toX = (i: number) => PL + (i / (pts.length - 1)) * cW;
    const toY = (v: number) => PT + (1 - (v - minY) / rY) * cH;
    const zeroY = toY(0);
    const dotPts = pts.map((p, i) => ({ ...p, x: toX(i), y: toY(p.cum) }));
    const line = bezierPath(dotPts);
    const tris = polyFill(dotPts, zeroY);
    const firstX = toX(0), lastX = toX(pts.length - 1);
    const area = `${line} L${lastX.toFixed(1)},${zeroY.toFixed(1)} L${firstX.toFixed(1)},${zeroY.toFixed(1)} Z`;
    return { dotPts, line, area, tris, zeroY, toY, minY, maxY };
  }, [pts, cW, cH]);

  if (pts.length === 0) return null;

  const netPositive = stats.net >= 0;
  const mainColor = netPositive ? 'var(--c-buff)' : 'var(--c-nerf)';
  const lastBadge = stats.last?.badge ?? 'ADJUST';
  const lastColor = COLORS[lastBadge];

  return (
    <div className={styles.wrap}>
      {/* Header row: big net score left, patch count right */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.netScore} style={{ color: stats.net > 0 ? 'var(--c-buff)' : stats.net < 0 ? 'var(--c-nerf)' : 'var(--c-neutral)' }}>
            {stats.net > 0 ? '+' : ''}{stats.net}
          </span>
          <div className={styles.headerMeta}>
            <span className={styles.heroLabel}>{t('heroDetail.balanceScore')}</span>
            <div className={styles.pillsRow}>
              {stats.buffs > 0 && <span className={styles.pill} style={{ color: 'var(--c-buff)', borderColor: 'var(--c-buff-bdr)', background: 'var(--c-buff-bg)' }}>↑{stats.buffs} buff</span>}
              {stats.nerfs > 0 && <span className={styles.pill} style={{ color: 'var(--c-nerf)', borderColor: 'var(--c-nerf-bdr)', background: 'var(--c-nerf-bg)' }}>↓{stats.nerfs} nerf</span>}
            </div>
          </div>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.patchCount}>{pts.length}</span>
          <span className={styles.patchLabel}>{t('heroDetail.patchesCount')}</span>
          <span className={styles.lastBadge} style={{ color: lastColor, borderColor: `${lastColor}33`, background: `${lastColor}12` }}>{lastBadge}</span>
        </div>
      </div>

      {/* Chart */}
      {chart && (
        <div className={styles.chartBox}>
          <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className={styles.svg}
            onMouseLeave={() => setHover(null)}>
            <defs>
              <linearGradient id={`ag${heroName}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={mainColor} stopOpacity="0.55" />
                <stop offset="60%" stopColor={mainColor} stopOpacity="0.15" />
                <stop offset="100%" stopColor={mainColor} stopOpacity="0.02" />
              </linearGradient>
              <filter id={`lg${heroName}`} x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="5" result="b" />
                <feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <filter id={`dg${heroName}`} x="-150%" y="-150%" width="400%" height="400%">
                <feGaussianBlur stdDeviation="6" result="b" />
                <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>

            {/* Grid */}
            {Array.from({ length: 5 }, (_, k) => PT + k * (cH / 4)).map((y, k) => (
              <line key={k} x1={PL} y1={y} x2={W - PR} y2={y}
                stroke="var(--balance-grid, rgba(0,229,255,0.05))" strokeWidth="1" />
            ))}
            <line x1={PL} y1={chart.zeroY} x2={W - PR} y2={chart.zeroY}
              stroke="var(--balance-zero-line, rgba(0,229,255,0.18))" strokeWidth="1" strokeDasharray="4 6" />

            {/* Low-poly triangles */}
            {chart.tris.map((d, i) => (
              <path key={i} d={d}
                fill={mainColor}
                opacity={i % 2 === 0 ? 0.12 : 0.06}
                stroke={mainColor}
                strokeWidth="0.3"
                strokeOpacity="0.2"
              />
            ))}

            {/* Smooth area underneath */}
            <path d={chart.area} fill={`url(#ag${heroName})`} />

            {/* Glow line */}
            <path d={chart.line} fill="none" stroke={mainColor} strokeWidth="5"
              strokeLinecap="round" strokeLinejoin="round" opacity="0.3"
              filter={`url(#lg${heroName})`} />
            {/* Crisp line */}
            <path d={chart.line} fill="none" stroke={mainColor} strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray="5 3" opacity="0.9" />

            {/* Dots */}
            {chart.dotPts.map((dp, i) => {
              const col = COLORS[dp.badge] ?? '#94a3b8';
              const isLast = i === chart.dotPts.length - 1;
              const isHov = hover === i;
              return (
                <g key={dp.version} style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHover(i)}
                  onClick={() => onPatchClick?.(dp.version)}>
                  {/* Outer glow halo */}
                  <circle cx={dp.x} cy={dp.y} r={isHov || isLast ? 18 : 0}
                    fill={col} opacity="0.08" filter={`url(#dg${heroName})`} />
                  {isLast && (
                    <>
                      <circle cx={dp.x} cy={dp.y} r="6" fill={col} opacity="0">
                        <animate attributeName="r" values="5;18;5" dur="3s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.4;0;0.4" dur="3s" repeatCount="indefinite" />
                      </circle>
                    </>
                  )}
                  {/* Outer ring */}
                  <circle cx={dp.x} cy={dp.y} r={isLast ? 9 : 6}
                    fill={col} opacity="0.25" filter={`url(#dg${heroName})`} />
                  {/* Inner bright dot */}
                  <circle cx={dp.x} cy={dp.y} r={isLast ? 5 : 3.5}
                    fill={col} stroke="white" strokeWidth={isLast ? 1.5 : 1} opacity="0.95" />
                  {/* Hover value */}
                  {isHov && (
                    <g>
                      <rect x={dp.x - 20} y={dp.y - 26} width="40" height="16" rx="4"
                        fill="rgba(4,14,32,0.9)" stroke={col} strokeWidth="0.5" strokeOpacity="0.5" />
                      <text x={dp.x} y={dp.y - 14} textAnchor="middle"
                        fontSize="10" fill={col} fontWeight="700">
                        {dp.cum > 0 ? '+' : ''}{dp.cum}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* X labels */}
            {chart.dotPts.map((dp, i) => {
              const n = chart.dotPts.length;
              if (n > 7 && i !== 0 && i !== n - 1 && i % Math.ceil(n / 5) !== 0) return null;
              return (
                <text key={`x${i}`} x={dp.x} y={H - 6} textAnchor="middle"
                  fontSize="9" fill="var(--balance-axis-text, rgba(148,163,184,0.5))" fontWeight="500">
                  {dp.version.replace('-adv', '')}
                </text>
              );
            })}

            {/* Y labels */}
            {Array.from({ length: Math.round(chart.maxY - chart.minY) + 1 }, (_, k) => Math.round(chart.minY) + k)
              .filter(v => v % 1 === 0)
              .map(v => {
                const y = chart.toY(v);
                if (y < PT || y > H - PB) return null;
                return (
                  <text key={`y${v}`} x={PL - 8} y={y + 3.5}
                    textAnchor="end" fontSize="9"
                    fill={v === 0 ? 'var(--balance-zero-text, rgba(0,229,255,0.45))' : 'var(--balance-axis-text, rgba(148,163,184,0.3))'}
                    fontWeight={v === 0 ? '600' : '400'}>
                    {v > 0 ? `+${v}` : v}
                  </text>
                );
              })}
          </svg>
        </div>
      )}
    </div>
  );
};
