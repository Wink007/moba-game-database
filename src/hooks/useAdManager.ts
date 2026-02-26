import { useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { useAdStore, selectAdsEnabled } from '../store/adStore';
import { initAdMob, showBanner, hideBanner } from '../services/adMobService';

/**
 * Ініціалізує AdMob і управляє видимістю банера.
 * Розміщувати один раз на рівні App.tsx (або нижче).
 */
export function useAdManager() {
  const adFreeUntil   = useAdStore(s => s.adFreeUntil);
  const isPaidNoAds   = useAdStore(s => s.isPaidNoAds);
  const adsEnabled    = useAdStore(selectAdsEnabled);
  const initializedRef = useRef(false);

  // Перша ініціалізація
  useEffect(() => {
    if (!Capacitor.isNativePlatform() || initializedRef.current) return;
    initializedRef.current = true;

    (async () => {
      await initAdMob();
      if (selectAdsEnabled(useAdStore.getState())) {
        await showBanner();
      }
    })();
  }, []);

  // Реагуємо на зміну стану реклами
  useEffect(() => {
    if (!Capacitor.isNativePlatform() || !initializedRef.current) return;

    if (adsEnabled) {
      showBanner();
    } else {
      hideBanner();
    }
  }, [adsEnabled, adFreeUntil, isPaidNoAds]);
}
