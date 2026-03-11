import { Capacitor } from '@capacitor/core';
import { AppUpdate, AppUpdateAvailability, FlexibleUpdateInstallStatus } from '@capawesome/capacitor-app-update';

/**
 * Перевіряє наявність оновлення в Google Play і запускає Flexible update flow.
 * Викликати один раз при старті додатку (тільки на Android).
 */
export async function checkAndStartFlexibleUpdate(): Promise<void> {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') return;

  try {
    const info = await AppUpdate.getAppUpdateInfo();

    if (info.updateAvailability !== AppUpdateAvailability.UPDATE_AVAILABLE) return;

    // Flexible update — не блокує додаток, завантажується у фоні
    await AppUpdate.startFlexibleUpdate();

    // Слухаємо статус завантаження
    await AppUpdate.addListener('onFlexibleUpdateStateChange', async (state) => {
      if (state.installStatus === FlexibleUpdateInstallStatus.DOWNLOADED) {
        // Оновлення завантажено — одразу встановлюємо (завершить рестартом)
        await AppUpdate.completeFlexibleUpdate();
      }
    });
  } catch {
    // Тихо ігноруємо — оновлення не критичне
  }
}
