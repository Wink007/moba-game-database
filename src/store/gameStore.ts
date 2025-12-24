import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GameStore {
  selectedGameId: number;
  setSelectedGameId: (id: number) => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      selectedGameId: 2, // Default game ID
      setSelectedGameId: (id) => set({ selectedGameId: id }),
    }),
    {
      name: 'game-storage', // localStorage key
    }
  )
);
