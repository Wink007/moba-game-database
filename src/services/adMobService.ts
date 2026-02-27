import { Capacitor } from '@capacitor/core';
import {
  AdMob,
  BannerAdOptions,
  BannerAdSize,
  BannerAdPosition,
  BannerAdPluginEvents,
  AdOptions,
  RewardAdPluginEvents,
} from '@capacitor-community/admob';

// ─── Ad Unit IDs ─────────────────────────────────────────────────────────────
// TODO: замінити на реальні після реєстрації в AdMob Console
const IS_TESTING = true;

export const AD_UNITS = {
  banner:      'ca-app-pub-3940256099942544/6300978111',   // Google тест
  rewarded:    'ca-app-pub-3940256099942544/5224354917',   // Google тест
  interstitial:'ca-app-pub-3940256099942544/1033173712',   // Google тест
};

let _initialized = false;
let _bannerVisible = false;
let _sizeListener: { remove: () => void } | null = null;

// Встановлює CSS змінну для динамічного відступу від банера
function setBannerHeightVar(height: number) {
  document.documentElement.style.setProperty('--ad-banner-height', `${height}px`);
}

export function clearBannerHeightVar() {
  document.documentElement.style.setProperty('--ad-banner-height', '0px');
}

// ─── Init ─────────────────────────────────────────────────────────────────────
export async function initAdMob(): Promise<void> {
  if (!Capacitor.isNativePlatform() || _initialized) return;
  try {
    await AdMob.initialize();
    _initialized = true;
  } catch (e) {
    console.warn('[AdMob] init error:', e);
  }
}

// ─── Banner ───────────────────────────────────────────────────────────────────
export async function showBanner(): Promise<void> {
  if (!Capacitor.isNativePlatform() || _bannerVisible) return;
  try {
    // Слухаємо реальний розмір банера і встановлюємо CSS змінну
    _sizeListener?.remove();
    _sizeListener = await AdMob.addListener(
      BannerAdPluginEvents.SizeChanged,
      (info: { width: number; height: number }) => {
        setBannerHeightVar(info.height);
      }
    );

    const options: BannerAdOptions = {
      adId: AD_UNITS.banner,
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.TOP_CENTER,
      margin: 0,
      isTesting: IS_TESTING,
    };
    await AdMob.showBanner(options);
    _bannerVisible = true;
  } catch (e) {
    console.warn('[AdMob] showBanner error:', e);
    clearBannerHeightVar();
  }
}

export async function hideBanner(): Promise<void> {
  if (!Capacitor.isNativePlatform() || !_bannerVisible) return;
  try {
    await AdMob.hideBanner();
    _bannerVisible = false;
    clearBannerHeightVar();
  } catch (e) {
    console.warn('[AdMob] hideBanner error:', e);
  }
}

export async function removeBanner(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    _sizeListener?.remove();
    _sizeListener = null;
    await AdMob.removeBanner();
    _bannerVisible = false;
    clearBannerHeightVar();
  } catch (e) {
    console.warn('[AdMob] removeBanner error:', e);
  }
}

// ─── Rewarded Ad ──────────────────────────────────────────────────────────────
/**
 * Показує rewarded відео.
 * @returns true якщо користувач отримав нагороду (досивився до кінця)
 */
export async function showRewardedAd(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;

  return new Promise(async (resolve) => {
    let rewarded = false;

    const onRewarded = await AdMob.addListener(
      RewardAdPluginEvents.Rewarded,
      () => { rewarded = true; }
    );
    const onDismissed = await AdMob.addListener(
      RewardAdPluginEvents.Dismissed,
      () => {
        onRewarded.remove();
        onDismissed.remove();
        resolve(rewarded);
      }
    );

    try {
      const options: AdOptions = {
        adId: AD_UNITS.rewarded,
        isTesting: IS_TESTING,
      };
      await AdMob.prepareRewardVideoAd(options);
      await AdMob.showRewardVideoAd();
    } catch (e) {
      console.warn('[AdMob] rewardedAd error:', e);
      onRewarded.remove();
      onDismissed.remove();
      resolve(false);
    }
  });
}
