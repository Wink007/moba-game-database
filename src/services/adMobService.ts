import { Capacitor } from '@capacitor/core';
import {
  AdMob,
  BannerAdOptions,
  BannerAdSize,
  BannerAdPosition,
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
    const options: BannerAdOptions = {
      adId: AD_UNITS.banner,
      adSize: BannerAdSize.BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
      isTesting: IS_TESTING,
    };
    await AdMob.showBanner(options);
    _bannerVisible = true;
  } catch (e) {
    console.warn('[AdMob] showBanner error:', e);
  }
}

export async function hideBanner(): Promise<void> {
  if (!Capacitor.isNativePlatform() || !_bannerVisible) return;
  try {
    await AdMob.hideBanner();
    _bannerVisible = false;
  } catch (e) {
    console.warn('[AdMob] hideBanner error:', e);
  }
}

export async function removeBanner(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await AdMob.removeBanner();
    _bannerVisible = false;
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
