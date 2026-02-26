import React from 'react';
import { Capacitor } from '@capacitor/core';
import { useAdStore, selectAdsEnabled } from '../../store/adStore';

/**
 * Додає padding-bottom коли нативний банер AdMob видимий,
 * щоб контент не ховався під банером (50dp = ~50px).
 */
export const AdBannerSpacer: React.FC = () => {
  const adsEnabled = useAdStore(selectAdsEnabled);

  if (!Capacitor.isNativePlatform() || !adsEnabled) return null;

  return <div style={{ height: 60, flexShrink: 0 }} aria-hidden="true" />;
};
