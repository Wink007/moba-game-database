import { Capacitor } from '@capacitor/core';
import { InAppReview } from '@capacitor-community/in-app-review';

const STORAGE_KEY = 'inAppReview_lastRequested';
const MIN_DAYS_BETWEEN = 30; // Google enforces its own limits on top of this

/**
 * Request in-app review dialog.
 * - Android only (no-op on web/iOS)
 * - Throttled: at most once every 30 days (Google may suppress more frequently)
 * - Should be called after a meaningful positive action (e.g. viewing 5+ heroes)
 */
export async function requestInAppReview(): Promise<void> {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') return;

  try {
    const lastStr = localStorage.getItem(STORAGE_KEY);
    if (lastStr) {
      const daysSince = (Date.now() - Number(lastStr)) / (1000 * 60 * 60 * 24);
      if (daysSince < MIN_DAYS_BETWEEN) return;
    }

    await InAppReview.requestReview();
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
  } catch {
    // Silently ignore — review is non-critical
  }
}
