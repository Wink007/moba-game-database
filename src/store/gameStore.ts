import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GameStore {
  selectedGameId: number;
  setSelectedGameId: (id: number) => void;
  cachedVideoIntro: string | null;
  cachedPreview: string | null;
  cachedSubtitle: string | null;
  setCachedGame: (videoIntro: string | null, preview: string | null, subtitle: string | null) => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      selectedGameId: 2, // Default game ID
      setSelectedGameId: (id) => set({ selectedGameId: id }),
      cachedVideoIntro: null,
      cachedPreview: null,
      cachedSubtitle: null,
      setCachedGame: (videoIntro, preview, subtitle) => set({ cachedVideoIntro: videoIntro, cachedPreview: preview, cachedSubtitle: subtitle }),
    }),
    {
      name: 'game-storage', // localStorage key
    }
  )
);
