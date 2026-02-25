import { useEffect } from 'react';

/**
 * Calls `handler` when the Escape key is pressed.
 * Only active when `active` is true (default).
 */
export const useEscapeKey = (handler: () => void, active = true) => {
  useEffect(() => {
    if (!active) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handler();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [handler, active]);
};
