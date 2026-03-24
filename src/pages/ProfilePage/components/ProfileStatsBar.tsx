import React from 'react';
import { useTranslation } from 'react-i18next';
import type { ProfileStatsBarProps } from '../types';
import styles from '../styles.module.scss';

export const ProfileStatsBar: React.FC<ProfileStatsBarProps> = ({
  buildsCount,
  favoritesCount,
  followersCount,
  followingCount,
  onOpenFollowers,
  onOpenFollowing,
}) => {
  const { t } = useTranslation();

  return (
    <div className={styles.statsBar}>
      <div className={styles.stat}>
        <span className={styles.statValue}>{buildsCount}</span>
        <span className={styles.statLabel}>{t('profile.builds')}</span>
      </div>
      <div className={styles.stat}>
        <span className={styles.statValue}>{favoritesCount}</span>
        <span className={styles.statLabel}>{t('profile.favorites')}</span>
      </div>
      <button className={`${styles.stat} ${styles.statBtn}`} onClick={onOpenFollowers}>
        <span className={styles.statValue}>{followersCount}</span>
        <span className={styles.statLabel}>{t('profile.followers')}</span>
      </button>
      <button className={`${styles.stat} ${styles.statBtn}`} onClick={onOpenFollowing}>
        <span className={styles.statValue}>{followingCount}</span>
        <span className={styles.statLabel}>{t('profile.following')}</span>
      </button>
    </div>
  );
};
