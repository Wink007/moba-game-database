import React from 'react';
import { useTranslation } from 'react-i18next';
import { ACTIVITY_LEVELS, LEVEL_THRESHOLDS } from '../constants';
import type { ActivityLevelProps } from '../types';
import styles from '../styles.module.scss';

export const ActivityLevel: React.FC<ActivityLevelProps> = ({ score }) => {
  const { t } = useTranslation();

  const currentLevelIdx = LEVEL_THRESHOLDS.reduce((best, threshold, i) => score >= threshold ? i : best, 0);
  const levelIdx = Math.min(currentLevelIdx, ACTIVITY_LEVELS.length - 1);
  const isMaxLevel = levelIdx >= ACTIVITY_LEVELS.length - 1;
  const nextThreshold = isMaxLevel ? LEVEL_THRESHOLDS[levelIdx] : LEVEL_THRESHOLDS[levelIdx + 1];
  const prevThreshold = LEVEL_THRESHOLDS[levelIdx];
  const levelProgress = isMaxLevel ? 100 : Math.round(((score - prevThreshold) / (nextThreshold - prevThreshold)) * 100);

  return (
    <div className={styles.levelBlock}>
      <div className={styles.levelHeader}>
        <div className={styles.levelInfo}>
          <span className={styles.levelNum}>Lv.{levelIdx + 1}</span>
          <span className={styles.levelTitle}>{t(`profile.${ACTIVITY_LEVELS[levelIdx]}`)}</span>
        </div>
        <div className={styles.levelScore}>
          <span>{score}</span>
          {!isMaxLevel && <span className={styles.levelScoreNext}>/ {nextThreshold} {t('profile.xp')}</span>}
        </div>
      </div>
      <div className={styles.levelBarTrack}>
        <div className={styles.levelBarFill} style={{ width: `${levelProgress}%` }} />
      </div>
      {!isMaxLevel && (
        <div className={styles.levelNextRow}>
          <span>{t('profile.nextLevel')}: </span>
          <span className={styles.levelNextTitle}>{t(`profile.${ACTIVITY_LEVELS[levelIdx + 1]}`)}</span>
        </div>
      )}
    </div>
  );
};
