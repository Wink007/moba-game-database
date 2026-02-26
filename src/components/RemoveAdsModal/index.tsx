import React, { useState } from 'react';
import { useAdStore, AD_FREE_HOURS, selectAdFreeMinutesLeft } from '../../store/adStore';
import { showRewardedAd } from '../../services/adMobService';
import { useAdBannerPause } from '../../hooks/useAdBannerPause';
import { Capacitor } from '@capacitor/core';
import styles from './styles.module.scss';

export const RemoveAdsModal: React.FC = () => {
  const { isPaidNoAds, adFreeUntil, removeAdsModalOpen, closeRemoveAdsModal, setAdFreeFor } = useAdStore();
  const minutesLeft = useAdStore(selectAdFreeMinutesLeft);
  const [watchLoading, setWatchLoading] = useState(false);
  const [watchResult, setWatchResult] = useState<'success' | 'failed' | null>(null);

  // Ховаємо банер поки модалка відкрита
  useAdBannerPause(removeAdsModalOpen);

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
          <h2 className={styles.title}>Прибрати рекламу</h2>
          <p className={styles.subtitle}>Оберіть зручний спосіб</p>
        </div>

        {minutesLeft !== null && (
          <div className={styles.activeBanner}>
            ✅ Реклама вимкнена ще на <strong>{minutesLeft} хв</strong>
            {adFreeUntilDate && (
              <span> (до {adFreeUntilDate.toLocaleTimeString('uk', { hour: '2-digit', minute: '2-digit' })})</span>
            )}
          </div>
        )}
        {isPaidNoAds && (
          <div className={styles.activeBanner}>⭐ У вас назавжди вимкнена реклама</div>
        )}

        <div className={styles.options}>
          <div className={styles.option}>
            <div className={styles.optionIcon}>📺</div>
            <div className={styles.optionInfo}>
              <div className={styles.optionTitle}>Подивитись рекламу</div>
              <div className={styles.optionDesc}>
                Вимкне рекламу на <strong>{AD_FREE_HOURS} години</strong>
              </div>
            </div>
            <button
              className={`${styles.btn} ${styles.btnWatch}`}
              onClick={handleWatchAd}
              disabled={watchLoading || !!minutesLeft}
            >
              {watchLoading ? <span className={styles.spinner} /> : minutesLeft ? `${minutesLeft} хв` : 'Дивитись'}
            </button>
          </div>

          <div className={styles.divider}><span>або</span></div>

          <div className={styles.option}>
            <div className={styles.optionIcon}>⭐</div>
            <div className={styles.optionInfo}>
              <div className={styles.optionTitle}>Прибрати назавжди</div>
              <div className={styles.optionDesc}>Одноразова покупка — реклами більше не буде</div>
            </div>
            <button
              className={`${styles.btn} ${styles.btnBuy}`}
              onClick={handleBuy}
              disabled={isPaidNoAds}
            >
              {isPaidNoAds ? '✓' : 'Придбати'}
            </button>
          </div>
        </div>

        {watchResult === 'success' && (
          <div className={`${styles.result} ${styles.resultSuccess}`}>
            ✅ Реклама вимкнена на {AD_FREE_HOURS} год!
          </div>
        )}
        {watchResult === 'failed' && (
          <div className={`${styles.result} ${styles.resultFailed}`}>
            ❌ Відео не завершено. Спробуйте ще раз.
          </div>
        )}
      </div>
    </div>
  );
};
