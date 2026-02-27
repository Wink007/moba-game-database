import React from 'react';
import { Capacitor } from '@capacitor/core';
import { useAdStore, selectAdsEnabled } from '../../store/adStore';

/**
 * Додає динамічний padding-bottom рівно на висоту нативного банера AdMob.
 * Висота береться з CSS змінної --ad-banner-height, яку встановлює adMobService
 * після отримання події SizeChanged від AdMob SDK.
 */
export const AdBannerSpacer: React.FC = () => {
  const adsEnabled = useAdStore(selectAdsEnabled);

  if (!Capacitor.isNativePlatform() || !adsEnabled) return null;

  return (
    <div
      style={{ height: 'var(--ad-banner-height, 56px)', flexShrink: 0 }}
      aria-hidden="true"
    />
  );
};

