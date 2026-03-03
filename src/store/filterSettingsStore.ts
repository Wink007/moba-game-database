import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const DEFAULT_DAYS = 7;
export const DEFAULT_RANK = 'mythic';

interface FilterSettingsState {
  defaultDays: number;
  defaultRank: string;
  setDefaultDays: (days: number) => void;
  setDefaultRank: (rank: string) => void;
}

export const useFilterSettingsStore = create<FilterSettingsState>()(
  persist(
    (set) => ({
      defaultDays: DEFAULT_DAYS,
      defaultRank: DEFAULT_RANK,
      setDefaultDays: (days) => set({ defaultDays: days }),
      setDefaultRank: (rank) => set({ defaultRank: rank }),
    }),
    { name: 'filter-settings-storage' }
  )
);
