import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { useAdStore, selectAdsEnabled } from '../store/adStore';
import { showInterstitialAd } from '../services/adMobService';

const SHOW_EVERY_N = 3; // показувати кожен N-й перехід

export function useInterstitialAd() {
  const location = useLocation();
  const navCountRef = useRef(0);
  const isMountRef = useRef(true);
  const adsEnabled = useAdStore(selectAdsEnabled);

  useEffect(() => {
    // Skip counting the initial mount — only real navigations count
    if (isMountRef.current) {
      isMountRef.current = false;
      return;
    }
    if (!Capacitor.isNativePlatform() || !adsEnabled) return;

    navCountRef.current += 1;

    if (navCountRef.current % SHOW_EVERY_N === 0) {
      showInterstitialAd();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);
}
