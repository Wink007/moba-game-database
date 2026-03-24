import React from 'react';
import { useTranslation } from 'react-i18next';
import type { ProfileBannerProps } from '../types';
import styles from '../styles.module.scss';

export const ProfileBanner: React.FC<ProfileBannerProps> = ({ user, isOwnProfile, onEditBanner }) => {
  const { t } = useTranslation();
  const bannerImg = user.banner_painting || user.banner_image;

  if (bannerImg) {
    return (
      <div className={styles.banner}>
        <img
          src={bannerImg}
          alt={user.banner_hero_name || ''}
          className={styles.bannerImg}
          loading="lazy"
          decoding="async"
        />
        <div className={styles.bannerOverlay} />
        {isOwnProfile && (
          <button className={styles.bannerEditBtn} onClick={onEditBanner}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 000-1.42l-2.34-2.33a1.003 1.003 0 00-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.83z" />
            </svg>
            {t('profile.bannerChange')}
          </button>
        )}
      </div>
    );
  }

  return <div className={styles.bannerNoBanner} />;
};
