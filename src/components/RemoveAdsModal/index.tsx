import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAdStore, AD_FREE_HOURS, selectAdFreeMinutesLeft } from '../../store/adStore';
import { useBackHandler } from '../../hooks/useBackHandler';
import { showRewardedAd } from '../../services/adMobService';
import { Capacitor } from '@capacitor/core';
import styles from './styles.module.scss';

export const RemoveAdsModal: React.FC = () => {
  const { t } = useTranslation();
  const { isPaidNoAds, adFreeUntil, removeAdsModalOpen, closeRemoveAdsModal, setAdFreeFor } = useAdStore();
  const minutesLeft = useAdStore(selectAdFreeMinutesLeft);
  const [watchLoading, setWatchLoading] = useState(false);
  const [watchResult, setWatchResult] = useState<'success' | 'failed' | null>(null);
  useBackHandler(removeAdsModalOpen, closeRemoveAdsModal);

  if (!removeAdsModalOpen) return null;

  const handleWatchAd = async () => {
    if (!Capacitor.isNativePlatform()) {
      // На веб — вмикаємо одразу (для тесту)
      setAdFreeFor(AD_FREE_HOURS);
      setWatchResult('success');
      return;
    }
    setWatchLoading(true);
    setWatchResult(null);
    const earned = await showRewardedAd();
    setWatchLoading(false);
    if (earned) {
      setAdFreeFor(AD_FREE_HOURS);
      setWatchResult('success');
    } else {
      setWatchResult('failed');
    }
  };

  const handleBuy = () => {
    // TODO: інтегрувати Google Play Billing після реєстрації в Play Console
    // Після успішної оплати: useAdStore.getState().setPaidNoAds(true)
    alert('Оплата через Play Store буде доступна після публікації в Google Play.');
  };

  const adFreeUntilDate = adFreeUntil ? new Date(adFreeUntil) : null;

  return (
    <div className={styles.backdrop} onClick={closeRemoveAdsModal}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.close} onClick={closeRemoveAdsModal} aria-label="Close">✕</button>

        <div className={styles.header}>
          <span className={styles.icon}>🚫</span>
          <h2 className={styles.title}>{t('removeAds.title')}</h2>
          <p className={styles.subtitle}>{t('removeAds.subtitle')}</p>
        </div>

        {minutesLeft !== null && (
          <div className={styles.activeBanner}>
            ✅ {t('removeAds.activeFor', { minutes: minutesLeft })}
            {adFreeUntilDate && (
              <span> ({t('removeAds.until')} {adFreeUntilDate.toLocaleTimeString('uk', { hour: '2-digit', minute: '2-digit' })})</span>
            )}
          </div>
        )}
        {isPaidNoAds && (
          <div className={styles.activeBanner}>⭐ {t('removeAds.paidActive')}</div>
        )}

        <div className={styles.options}>
          <div className={styles.option}>
            <div className={styles.optionIcon}>📺</div>
            <div className={styles.optionInfo}>
              <div className={styles.optionTitle}>{t('removeAds.watchTitle')}</div>
              <div className={styles.optionDesc}>
                {t('removeAds.watchDesc', { hours: AD_FREE_HOURS })}
              </div>
            </div>
            <button
              className={`${styles.btn} ${styles.btnWatch}`}
              onClick={handleWatchAd}
              disabled={watchLoading || !!minutesLeft}
            >
              {watchLoading ? <span className={styles.spinner} /> : minutesLeft ? `${minutesLeft} ${t('removeAds.min')}` : t('removeAds.watch')}
            </button>
          </div>

          <div className={styles.divider}><span>{t('removeAds.or')}</span></div>

          <div className={styles.option}>
            <div className={styles.optionIcon}>⭐</div>
            <div className={styles.optionInfo}>
              <div className={styles.optionTitle}>{t('removeAds.buyTitle')}</div>
              <div className={styles.optionDesc}>{t('removeAds.buyDesc')}</div>
            </div>
            <button
              className={`${styles.btn} ${styles.btnBuy}`}
              onClick={handleBuy}
              disabled={isPaidNoAds}
            >
              {isPaidNoAds ? '✓' : t('removeAds.buy')}
            </button>
          </div>
        </div>

        {watchResult === 'success' && (
          <div className={`${styles.result} ${styles.resultSuccess}`}>
            ✅ {t('removeAds.successResult', { hours: AD_FREE_HOURS })}
          </div>
        )}
        {watchResult === 'failed' && (
          <div className={`${styles.result} ${styles.resultFailed}`}>
            ❌ {t('removeAds.failedResult')}
          </div>
        )}
      </div>
    </div>
  );
};
