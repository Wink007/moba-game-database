import React from 'react';
import { useTranslation } from 'react-i18next';
import type { NicknameFormProps } from '../types';
import styles from '../styles.module.scss';

export const NicknameForm: React.FC<NicknameFormProps> = ({
  value,
  error,
  saving,
  onChange,
  onSave,
  onCancel,
}) => {
  const { t } = useTranslation();

  return (
    <div className={styles.nicknameForm}>
      <input
        className={styles.nicknameInput}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={t('profile.nicknamePlaceholder')}
        maxLength={20}
        autoFocus
        onKeyDown={e => {
          if (e.key === 'Enter') onSave();
          if (e.key === 'Escape') onCancel();
        }}
      />
      <button className={styles.nicknameSaveBtn} onClick={onSave} disabled={saving}>
        {t('profile.nicknameSave')}
      </button>
      <button className={styles.nicknameCancelBtn} onClick={onCancel}>
        {t('profile.nicknameCancel')}
      </button>
      {error && <span className={styles.nicknameError}>{error}</span>}
    </div>
  );
};
