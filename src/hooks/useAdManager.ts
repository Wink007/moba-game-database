import { useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { useAdStore, selectAdsEnabled } from '../store/adStore';
import { initAdMob, showBanner, hideBanner, clearBannerHeightVar } from '../services/adMobService';

/**
 * Ініціалізує AdMob і управляє видимістю банера.
 * Автоматично ховає банер коли відкритий будь-який оверлей (bannerPauseCount > 0).
 */
export function useAdManager() {
  const adFreeUntil      = useAdStore(s => s.adFreeUntil);
  const isPaidNoAds      = useAdStore(s => s.isPaidNoAds);
  const adsEnabled       = useAdStore(selectAdsEnabled);
  const bannerPauseCount = useAdStore(s => s.bannerPauseCount);
  const initializedRef   = useRef(false);

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

  // Показуємо/ховаємо банер залежно від стану
  useEffect(() => {
    if (!Capacitor.isNativePlatform() || !initializedRef.current) return;

    const shouldShow = adsEnabled && bannerPauseCount === 0;
    if (shouldShow) {
      showBanner();
    } else {
      hideBanner();
      if (!adsEnabled) clearBannerHeightVar();
    }
  }, [adsEnabled, adFreeUntil, isPaidNoAds, bannerPauseCount]);
}
