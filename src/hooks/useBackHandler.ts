import { useLayoutEffect, useCallback } from 'react';
import { pushBackHandler, popBackHandler } from '../utils/backHandlerStack';

/**
 * Реєструє close-функцію в глобальному back-handler стеку поки isOpen=true.
 * При закритті overlay хук автоматично видаляє обробник.
 * useLayoutEffect забезпечує синхронне оновлення стеку до paint —
 * виключає race condition коли юзер тисне back між paint і async cleanup.
 */
export function useBackHandler(isOpen: boolean, close: () => void): void {
  // Зберігаємо стабільну референцію щоб push/pop завжди мачились
  const stableClose = useCallback(close, []); // eslint-disable-line react-hooks/exhaustive-deps

  useLayoutEffect(() => {
    if (!isOpen) return;
    pushBackHandler(stableClose);
    return () => popBackHandler(stableClose);
  }, [isOpen, stableClose]);
}
