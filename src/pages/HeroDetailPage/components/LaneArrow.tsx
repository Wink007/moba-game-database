import React from 'react';
import { LANE_ARROWS, LANE_POSITIONS, ArrowConfig } from './laneConstants';
import { LaneArrowProps } from './interfaces';
import styles from '../styles.module.scss';

export { LANE_POSITIONS };

const SingleArrow: React.FC<{ cfg: ArrowConfig; isMobile: boolean }> = ({ cfg, isMobile }) => {
  const left = isMobile && cfg.max != null ? cfg.max : cfg.ax;
  const top  = isMobile && cfg.may != null ? cfg.may : cfg.ay;

  return (
    <div
      className={styles.laneArrow}
      style={{
        left: `${left}%`,
        top: `${top}%`,
        transform: `rotate(${cfg.rotation}deg)`,
        '--arrow-glow': cfg.glow,
      } as React.CSSProperties}
    >
      {isMobile ? (
        <svg viewBox="0 0 96 28" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.laneArrowSvg}>
          <path d="M4,4 L16,14 L4,24"   stroke={cfg.color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className={styles.laneArrowC1}/>
          <path d="M36,4 L48,14 L36,24" stroke={cfg.color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className={styles.laneArrowC2}/>
          <path d="M68,4 L80,14 L68,24" stroke={cfg.color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className={styles.laneArrowC3}/>
        </svg>
      ) : (
        <svg viewBox="0 0 152 28" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.laneArrowSvg}>
          <path d="M4,4 L16,14 L4,24"      stroke={cfg.color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className={styles.laneArrowC1}/>
          <path d="M36,4 L48,14 L36,24"    stroke={cfg.color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className={styles.laneArrowC2}/>
          <path d="M68,4 L80,14 L68,24"    stroke={cfg.color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className={styles.laneArrowC3}/>
          <path d="M100,4 L112,14 L100,24" stroke={cfg.color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className={styles.laneArrowC4}/>
          <path d="M132,4 L144,14 L132,24" stroke={cfg.color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className={styles.laneArrowC5}/>
        </svg>
      )}
    </div>
  );
};

export const LaneArrow: React.FC<LaneArrowProps> = ({ lane, isMobile = false }) => {
  const arrows = LANE_ARROWS[lane];
  if (!arrows) return null;

  return (
    <>
      {arrows.map((cfg, i) => (
        <SingleArrow key={i} cfg={cfg} isMobile={isMobile} />
      ))}
    </>
  );
};
