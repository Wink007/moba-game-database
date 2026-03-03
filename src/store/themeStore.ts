import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'dark' | 'light' | 'system';

function getSystemTheme(): 'dark' | 'light' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme) {
  const resolved = theme === 'system' ? getSystemTheme() : theme;
  document.documentElement.setAttribute('data-theme', resolved);
}

interface ThemeStore {
  theme: Theme;
  resolved: 'dark' | 'light';
  setTheme: (theme: Theme) => void;
  toggle: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'system',
      resolved: getSystemTheme(),

      setTheme: (theme) => {
        const resolved = theme === 'system' ? getSystemTheme() : theme;
        applyTheme(theme);
        set({ theme, resolved });
      },

      toggle: () => {
        const next = get().resolved === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        set({ theme: next, resolved: next });
      },
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyTheme(state.theme);
          // Listen for system preference changes
          window
            .matchMedia('(prefers-color-scheme: dark)')
            .addEventListener('change', (e) => {
              const current = useThemeStore.getState().theme;
              if (current === 'system') {
                const resolved = e.matches ? 'dark' : 'light';
                document.documentElement.setAttribute('data-theme', resolved);
                useThemeStore.setState({ resolved });
              }
            });
        }
      },
    }
  )
);

// Immediately apply theme on module load (before React renders)
// to avoid flash of wrong theme
(function initTheme() {
  try {
    const raw = localStorage.getItem('theme-storage');
    if (raw) {
      const parsed = JSON.parse(raw) as { state?: { theme?: Theme } };
      const saved = parsed?.state?.theme;
      if (saved) {
        applyTheme(saved);
        return;
      }
    }
  } catch { /* ignore */ }
  // fallback: system
  applyTheme('system');
})();
