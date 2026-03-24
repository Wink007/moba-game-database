import React from 'react';
import { useTranslation } from 'react-i18next';
import type { DangerZoneProps } from '../types';
import styles from '../styles.module.scss';

export const DangerZone: React.FC<DangerZoneProps> = ({
  deleteConfirm,
  deleting,
  onSetDeleteConfirm,
  onDeleteAccount,
}) => {
  const { t } = useTranslation();

  return (
    <div className={styles.dangerZone}>
      {!deleteConfirm ? (
        <button className={styles.deleteAccountBtn} onClick={() => onSetDeleteConfirm(true)}>
          {t('profile.deleteAccount')}
        </button>
      ) : (
        <div className={styles.deleteConfirm}>
          <p>{t('profile.deleteConfirmText')}</p>
          <div className={styles.deleteConfirmBtns}>
            <button className={styles.deleteConfirmYes} disabled={deleting} onClick={onDeleteAccount}>
              {deleting ? '...' : t('profile.deleteConfirmYes')}
            </button>
            <button className={styles.deleteConfirmNo} onClick={() => onSetDeleteConfirm(false)}>
              {t('profile.deleteConfirmNo')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
