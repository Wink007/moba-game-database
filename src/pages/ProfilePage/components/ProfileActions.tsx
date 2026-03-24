import React from 'react';
import { useTranslation } from 'react-i18next';
import type { ProfileActionsProps } from '../types';
import styles from '../styles.module.scss';

export const ProfileActions: React.FC<ProfileActionsProps> = ({
  showCustomize,
  user,
  saving,
  onToggleCustomize,
  onOpenBannerPicker,
  onRemoveBanner,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <div className={styles.actionsRow}>
        <button className={styles.customizeBtn} onClick={onToggleCustomize}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 8a4 4 0 100 8 4 4 0 000-8zm0 6a2 2 0 110-4 2 2 0 010 4zM21.32 9.55l-1.16-.54a7.06 7.06 0 00-.54-1.3l.42-1.2a.5.5 0 00-.12-.52l-1.42-1.42a.5.5 0 00-.52-.12l-1.2.42a7.06 7.06 0 00-1.3-.54l-.54-1.16A.5.5 0 0014.5 3h-2a.5.5 0 00-.44.27l-.54 1.16c-.46.13-.89.31-1.3.54l-1.2-.42a.5.5 0 00-.52.12L7.08 6.09a.5.5 0 00-.12.52l.42 1.2c-.23.41-.41.84-.54 1.3l-1.16.54A.5.5 0 005.5 10v2a.5.5 0 00.18.44l1.16.54c.13.46.31.89.54 1.3l-.42 1.2a.5.5 0 00.12.52l1.42 1.42a.5.5 0 00.52.12l1.2-.42c.41.23.84.41 1.3.54l.54 1.16a.5.5 0 00.44.18h2a.5.5 0 00.44-.27l.54-1.16c.46-.13.89-.31 1.3-.54l1.2.42a.5.5 0 00.52-.12l1.42-1.42a.5.5 0 00.12-.52l-.42-1.2c.23-.41.41-.84.54-1.3l1.16-.54A.5.5 0 0018.5 13v-2a.5.5 0 00-.18-.45z" />
          </svg>
          {t('profile.customize')}
        </button>
      </div>

      {showCustomize && (
        <div className={styles.customizePanel}>
          <div className={styles.customizeRow}>
            <span className={styles.customizeLabel}>{t('profile.banner')}</span>
            <div className={styles.customizeActions}>
              <button className={styles.customizeActionBtn} onClick={onOpenBannerPicker}>
                {t('profile.bannerChange')}
              </button>
              {user.banner_hero_id && (
                <button className={styles.customizeRemoveBtn} onClick={onRemoveBanner} disabled={saving}>
                  {t('profile.bannerRemove')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
