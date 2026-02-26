import { useEffect } from 'react';
import { useAdStore } from '../store/adStore';

/**
 * Автоматично ховає нативний банер AdMob поки `isOpen === true`.
 * Використовуй в будь-якому компоненті з модалкою/дропдауном/шторкою.
 *
 * @example
 * useAdBannerPause(isDropdownOpen);
 */
export function useAdBannerPause(isOpen: boolean) {
  const pauseBanner  = useAdStore(s => s.pauseBanner);
  const resumeBanner = useAdStore(s => s.resumeBanner);

  useEffect(() => {
    if (isOpen) {
      pauseBanner();
    } else {
      resumeBanner();
    }
    // Cleanup: якщо компонент анмаунтується поки open — знімаємо паузу
    return () => {
      if (isOpen) resumeBanner();
    };
  }, [isOpen, pauseBanner, resumeBanner]);
}
