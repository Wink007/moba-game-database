import { useEffect, useCallback } from 'react';
import { pushBackHandler, popBackHandler } from '../utils/backHandlerStack';

/**
 * Реєструє close-функцію в глобальному back-handler стеку поки isOpen=true.
 * При закритті overlay хук автоматично видаляє обробник.
 */
export function useBackHandler(isOpen: boolean, close: () => void): void {
  // Зберігаємо стабільну референцію щоб push/pop завжди мачились
  const stableClose = useCallback(close, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isOpen) return;
    pushBackHandler(stableClose);
    return () => popBackHandler(stableClose);
  }, [isOpen, stableClose]);
}
