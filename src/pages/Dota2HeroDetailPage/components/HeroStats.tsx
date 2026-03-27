import React from 'react';
import type { HeroStatsProps } from './interface';
import styles from '../styles.module.scss';

const ATTR_COLORS: Record<string, string> = {
  str: '#e74c3c',
  agi: '#2ecc71',
  int: '#3498db',
  universal: '#9b59b6',
};

const ATTR_LABELS: Record<string, string> = {
  str: 'Strength',
  agi: 'Agility',
  int: 'Intelligence',
  universal: 'Universal',
};

export const HeroStats: React.FC<HeroStatsProps> = ({ hero }) => {
  const s = hero.hero_stats;
  if (!s) return null;

  const attrColor = ATTR_COLORS[s.primary_attr] ?? '#888';

  return (
    <div className={styles.statsBlock}>
      {/* Primary attributes */}
      <div className={styles.attrRow}>
        <div className={`${styles.attrItem} ${s.primary_attr === 'str' ? styles.attrPrimary : ''}`}
          style={s.primary_attr === 'str' ? { '--attr-color': attrColor } as React.CSSProperties : undefined}>
          <span className={styles.attrIcon}>💪</span>
          <div className={styles.attrValues}>
            <span className={styles.attrLabel}>Strength</span>
            <span className={styles.attrBase}>{s.str_base ?? 0}</span>
            <span className={styles.attrGain}>+{s.str_gain ?? 0}/lvl</span>
          </div>
        </div>
        <div className={`${styles.attrItem} ${s.primary_attr === 'agi' ? styles.attrPrimary : ''}`}>
          <span className={styles.attrIcon}>⚡</span>
          <div className={styles.attrValues}>
            <span className={styles.attrLabel}>Agility</span>
            <span className={styles.attrBase}>{s.agi_base ?? 0}</span>
            <span className={styles.attrGain}>+{s.agi_gain ?? 0}/lvl</span>
          </div>
        </div>
        <div className={`${styles.attrItem} ${s.primary_attr === 'int' ? styles.attrPrimary : ''}`}>
          <span className={styles.attrIcon}>🔵</span>
          <div className={styles.attrValues}>
            <span className={styles.attrLabel}>Intelligence</span>
            <span className={styles.attrBase}>{s.int_base ?? 0}</span>
            <span className={styles.attrGain}>+{s.int_gain ?? 0}/lvl</span>
          </div>
        </div>
      </div>

      {/* Other stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statRow}>
          <span className={styles.statName}>Attack</span>
          <span className={styles.statValue}>{s.damage_min ?? 0}–{s.damage_max ?? 0}</span>
        </div>
        <div className={styles.statRow}>
          <span className={styles.statName}>Attack Type</span>
          <span className={styles.statValue}>{s.attack_type}</span>
        </div>
        <div className={styles.statRow}>
          <span className={styles.statName}>Attack Range</span>
          <span className={styles.statValue}>{s.attack_range ?? 0}</span>
        </div>
        <div className={styles.statRow}>
          <span className={styles.statName}>Attack Rate</span>
          <span className={styles.statValue}>{s.attack_rate ?? 0}s</span>
        </div>
        <div className={styles.statRow}>
          <span className={styles.statName}>Health</span>
          <span className={styles.statValue}>{s.max_health ?? 0} (+{s.health_regen?.toFixed(1) ?? 0})</span>
        </div>
        <div className={styles.statRow}>
          <span className={styles.statName}>Mana</span>
          <span className={styles.statValue}>{s.max_mana ?? 0} (+{s.mana_regen?.toFixed(1) ?? 0})</span>
        </div>
        <div className={styles.statRow}>
          <span className={styles.statName}>Armor</span>
          <span className={styles.statValue}>{s.armor ?? 0}</span>
        </div>
        <div className={styles.statRow}>
          <span className={styles.statName}>Magic Resist</span>
          <span className={styles.statValue}>{s.magic_resistance ?? 0}%</span>
        </div>
        <div className={styles.statRow}>
          <span className={styles.statName}>Move Speed</span>
          <span className={styles.statValue}>{s.movement_speed ?? 0}</span>
        </div>
        <div className={styles.statRow}>
          <span className={styles.statName}>Turn Rate</span>
          <span className={styles.statValue}>{s.turn_rate ?? 0}</span>
        </div>
        <div className={styles.statRow}>
          <span className={styles.statName}>Vision Day</span>
          <span className={styles.statValue}>{s.sight_range_day ?? 0}</span>
        </div>
        <div className={styles.statRow}>
          <span className={styles.statName}>Vision Night</span>
          <span className={styles.statValue}>{s.sight_range_night ?? 0}</span>
        </div>
      </div>
    </div>
  );
};
