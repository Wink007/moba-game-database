import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const AD_FREE_HOURS = 1; // годин без реклами після перегляду відео

interface AdState {
  adFreeUntil: number | null; // timestamp (ms)
  isPaidNoAds: boolean;       // назавжди (оплата)
  removeAdsModalOpen: boolean;
  bannerPauseCount: number;   // лічильник відкритих оверлеїв

  setAdFreeFor: (hours: number) => void;
  setPaidNoAds: (value: boolean) => void;
  openRemoveAdsModal: () => void;
  closeRemoveAdsModal: () => void;
  pauseBanner: () => void;
  resumeBanner: () => void;
}

export const useAdStore = create<AdState>()(
  persist(
    (set) => ({
      adFreeUntil: null,
      isPaidNoAds: false,
      removeAdsModalOpen: false,
      bannerPauseCount: 0,

      setAdFreeFor: (hours: number) => {
        set({ adFreeUntil: Date.now() + hours * 60 * 60 * 1000 });
      },

      setPaidNoAds: (value: boolean) => {
        set({ isPaidNoAds: value });
      },

      openRemoveAdsModal: () => set({ removeAdsModalOpen: true }),
      closeRemoveAdsModal: () => set({ removeAdsModalOpen: false }),

      pauseBanner: () => set(s => ({ bannerPauseCount: s.bannerPauseCount + 1 })),
      resumeBanner: () => set(s => ({ bannerPauseCount: Math.max(0, s.bannerPauseCount - 1) })),
    }),
    { name: 'ad-storage', partialize: (s) => ({ adFreeUntil: s.adFreeUntil, isPaidNoAds: s.isPaidNoAds }) }
  )
);

/** Повертає true якщо рекламу треба показувати */
export function selectAdsEnabled(state: AdState): boolean {
  if (state.isPaidNoAds) return false;
  if (state.adFreeUntil && Date.now() < state.adFreeUntil) return false;
  return true;
}

/** Повертає скільки хвилин залишилось до кінця ad-free (або null) */
export function selectAdFreeMinutesLeft(state: AdState): number | null {
  if (state.isPaidNoAds) return null;
  if (state.adFreeUntil && Date.now() < state.adFreeUntil) {
    return Math.ceil((state.adFreeUntil - Date.now()) / 60000);
  }
  return null;
}
