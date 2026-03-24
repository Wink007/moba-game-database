import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { authFetch } from '../../../store/authStore';
import type { MlbbLinkFormProps } from '../types';
import styles from '../styles.module.scss';

export const MlbbLinkForm: React.FC<MlbbLinkFormProps> = ({ onLinked, onClose }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState<'form' | 'code'>('form');
  const [roleId, setRoleId] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [vc, setVc] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendCode = async () => {
    setError('');
    if (!roleId.trim() || !zoneId.trim()) { setError('Fill in both fields'); return; }
    setLoading(true);
    try {
      await authFetch('/users/mlbb/send-code', {
        method: 'POST',
        body: JSON.stringify({ roleId: roleId.trim(), zoneId: zoneId.trim() }),
      });
      setStep('code');
    } catch (err: any) {
      setError(err?.message || 'Failed to send code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError('');
    if (!vc.trim()) { setError('Enter the code'); return; }
    setLoading(true);
    try {
      const res = await authFetch('/users/mlbb/verify', {
        method: 'POST',
        body: JSON.stringify({ roleId: roleId.trim(), zoneId: zoneId.trim(), vc: vc.trim() }),
      });
      onLinked(res.mlbb_nickname || '');
    } catch (err: any) {
      setError(err?.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.mlbbForm}>
      {step === 'form' ? (
        <>
          <p className={styles.mlbbFormHint}>{t('profile.mlbbFormHintStep1')}</p>
          <img src="/login.png" alt="Where to find User ID and Server ID" className={styles.mlbbHintImg} />
          <div className={styles.mlbbFields}>
            <input
              className={styles.mlbbInput}
              placeholder={t('profile.mlbbUserIdPlaceholder')}
              value={roleId}
              onChange={e => setRoleId(e.target.value)}
            />
            <input
              className={styles.mlbbInput}
              placeholder={t('profile.mlbbServerIdPlaceholder')}
              value={zoneId}
              onChange={e => setZoneId(e.target.value)}
            />
          </div>
          {error && <p className={styles.mlbbError}>{error}</p>}
          <div className={styles.mlbbFormActions}>
            <button className={styles.mlbbSubmitBtn} onClick={handleSendCode} disabled={loading}>
              {loading ? '...' : t('profile.mlbbSendCode')}
            </button>
            <button className={styles.mlbbCancelBtn} onClick={onClose}>{t('profile.mlbbCancel')}</button>
          </div>
        </>
      ) : (
        <>
          <p className={styles.mlbbFormHint}>{t('profile.mlbbFormHintStep2')}</p>
          <input
            className={styles.mlbbInput}
            placeholder={t('profile.mlbbCodePlaceholder')}
            value={vc}
            onChange={e => setVc(e.target.value)}
            maxLength={10}
          />
          {error && <p className={styles.mlbbError}>{error}</p>}
          <div className={styles.mlbbFormActions}>
            <button className={styles.mlbbSubmitBtn} onClick={handleVerify} disabled={loading}>
              {loading ? '...' : t('profile.mlbbVerify')}
            </button>
            <button className={styles.mlbbCancelBtn} onClick={() => setStep('form')}>{t('profile.mlbbBack')}</button>
          </div>
        </>
      )}
    </div>
  );
};
