import { Capacitor } from '@capacitor/core';
import {
  AdMob,
  BannerAdOptions,
  BannerAdSize,
  BannerAdPosition,
  BannerAdPluginEvents,
  AdOptions,
  RewardAdPluginEvents,
  InterstitialAdPluginEvents,
  AdMobError,
  AdmobConsentStatus,
} from '@capacitor-community/admob';

// ─── Ad Unit IDs ─────────────────────────────────────────────────────────────
const IS_TESTING = false;

export const AD_UNITS = {
  banner:      'ca-app-pub-7397554602421221/8695244242',
  rewarded:    'ca-app-pub-7397554602421221/4120135024',
  interstitial:'ca-app-pub-7397554602421221/8084036004',
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

// ─── UMP Consent + Init ───────────────────────────────────────────────────────
// Runs UMP consent flow for EEA/regulated users before initializing AdMob.
// For non-EEA users consent is NOT_REQUIRED and ads start immediately.
// If user declines personalized ads, Google shows non-personalized ads instead
// (canRequestAds stays true) — revenue is reduced but not zero.
export async function requestConsentAndInit(): Promise<void> {
  if (!Capacitor.isNativePlatform() || _initialized) return;
  try {
    let consentInfo = await AdMob.requestConsentInfo();

    if (
      consentInfo.status === AdmobConsentStatus.REQUIRED &&
      consentInfo.isConsentFormAvailable
    ) {
      consentInfo = await AdMob.showConsentForm();
    }

    if (consentInfo.canRequestAds) {
      await initAdMob();
    }
  } catch (e) {
    console.warn('[AdMob] consent flow error:', e);
    // Fall back to normal init so non-EEA users are unaffected by network errors
    await initAdMob();
  }
}

// ─── Banner ───────────────────────────────────────────────────────────────────
export async function showBanner(): Promise<void> {
  if (!Capacitor.isNativePlatform() || !_initialized || _bannerVisible) return;
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

// ─── Interstitial Ad ─────────────────────────────────────────────────────────
/**
 * Показує interstitial рекламу.
 * @returns true якщо реклама показалась успішно
 */
export async function showInterstitialAd(): Promise<boolean> {
  if (!Capacitor.isNativePlatform() || !_initialized) return false;

  return new Promise(async (resolve) => {
    const cleanup = (result: boolean) => {
      onDismissed.remove();
      onFailed.remove();
      resolve(result);
    };

    const onDismissed = await AdMob.addListener(
      InterstitialAdPluginEvents.Dismissed,
      () => cleanup(true)
    );
    const onFailed = await AdMob.addListener(
      InterstitialAdPluginEvents.FailedToLoad,
      (e: AdMobError) => {
        console.warn('[AdMob] interstitial FailedToLoad:', e);
        cleanup(false);
      }
    );

    try {
      const options: AdOptions = {
        adId: AD_UNITS.interstitial,
        isTesting: IS_TESTING,
      };
      await AdMob.prepareInterstitial(options);
      await AdMob.showInterstitial();
    } catch (e) {
      console.warn('[AdMob] interstitialAd error:', e);
      cleanup(false);
    }
  });
}

// ─── Rewarded Ad ──────────────────────────────────────────────────────────────
/**
 * Показує rewarded відео.
 * @returns true якщо користувач отримав нагороду (досивився до кінця)
 */
export async function showRewardedAd(): Promise<boolean> {
  if (!Capacitor.isNativePlatform() || !_initialized) return false;

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
