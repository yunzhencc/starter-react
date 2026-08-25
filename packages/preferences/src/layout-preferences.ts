import { create } from 'zustand';

export type ThemeMode = 'auto' | 'dark' | 'light';

export interface LayoutPreferences {
  sidebar: {
    collapsed: boolean;
    hidden: boolean;
    width: number;
  };
  shortcutKeys: {
    enable: boolean;
    globalLockScreen: boolean;
  };
  theme: {
    mode: ThemeMode;
  };
  widget: {
    lockScreen: boolean;
    lockScreenButtonPosition: 'header' | 'none' | 'user-dropdown';
  };
}

export type LayoutPreferencesPatch = {
  [K in keyof LayoutPreferences]?: Partial<LayoutPreferences[K]>;
};

interface PreferencesStoreState {
  preferences: LayoutPreferences;
  resetPreferences: () => void;
  systemPrefersDark: boolean;
  setSystemPrefersDark: (systemPrefersDark: boolean) => void;
  updatePreferences: (patch: LayoutPreferencesPatch) => void;
}

const storageKey = 'yunzhen:preferences';
const defaultPreferences: LayoutPreferences = {
  sidebar: {
    collapsed: false,
    hidden: false,
    width: 240,
  },
  shortcutKeys: {
    enable: true,
    globalLockScreen: true,
  },
  theme: {
    mode: 'dark',
  },
  widget: {
    lockScreen: true,
    lockScreenButtonPosition: 'header',
  },
};

function cloneDefaults(): LayoutPreferences {
  return {
    sidebar: { ...defaultPreferences.sidebar },
    shortcutKeys: { ...defaultPreferences.shortcutKeys },
    theme: { ...defaultPreferences.theme },
    widget: { ...defaultPreferences.widget },
  };
}

export function getResolvedTheme(mode: ThemeMode, systemPrefersDark: boolean) {
  return mode === 'auto' ? (systemPrefersDark ? 'dark' : 'light') : mode;
}

function getSystemPrefersDark() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyTheme(preferences: LayoutPreferences, systemPrefersDark: boolean) {
  if (typeof document === 'undefined') {
    return;
  }

  const theme = getResolvedTheme(preferences.theme.mode, systemPrefersDark);
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.classList.toggle('light', theme === 'light');
  root.style.colorScheme = theme;
}

function readPreferences(): LayoutPreferences {
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<LayoutPreferences>;
      return {
        sidebar: { ...defaultPreferences.sidebar, ...parsed.sidebar },
        shortcutKeys: { ...defaultPreferences.shortcutKeys, ...parsed.shortcutKeys },
        theme: { ...defaultPreferences.theme, ...parsed.theme },
        widget: { ...defaultPreferences.widget, ...parsed.widget },
      };
    }
  }
  catch {
    // Browser storage may be unavailable or malformed.
  }

  return cloneDefaults();
}

function persistPreferences(preferences: LayoutPreferences) {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(preferences));
  }
  catch {
    // Persistence is optional; the in-memory preference still applies.
  }
}

export const usePreferencesStore = create<PreferencesStoreState>((set, get) => ({
  preferences: readPreferences(),
  resetPreferences: () => {
    const preferences = readPreferences();
    applyTheme(preferences, get().systemPrefersDark);
    set({ preferences });
  },
  setSystemPrefersDark: (systemPrefersDark) => {
    applyTheme(get().preferences, systemPrefersDark);
    set({ systemPrefersDark });
  },
  systemPrefersDark: getSystemPrefersDark(),
  updatePreferences: (patch) => {
    const current = get().preferences;
    const preferences = {
      sidebar: { ...current.sidebar, ...patch.sidebar },
      shortcutKeys: { ...current.shortcutKeys, ...patch.shortcutKeys },
      theme: { ...current.theme, ...patch.theme },
      widget: { ...current.widget, ...patch.widget },
    };
    persistPreferences(preferences);
    applyTheme(preferences, get().systemPrefersDark);
    set({ preferences });
  },
}));

let themeListenerInitialized = false;

export function initializeThemePreferences() {
  const state = usePreferencesStore.getState();
  state.setSystemPrefersDark(getSystemPrefersDark());

  if (themeListenerInitialized || typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return;
  }

  const query = window.matchMedia('(prefers-color-scheme: dark)');
  query.addEventListener('change', event => usePreferencesStore.getState().setSystemPrefersDark(event.matches));
  themeListenerInitialized = true;
}

export function getPreferences(): LayoutPreferences {
  return usePreferencesStore.getState().preferences;
}

export function updatePreferences(patch: LayoutPreferencesPatch) {
  usePreferencesStore.getState().updatePreferences(patch);
}

export function resetPreferences() {
  usePreferencesStore.getState().resetPreferences();
}

export function usePreferences() {
  return usePreferencesStore(state => state.preferences);
}

export function useIsDark() {
  return usePreferencesStore(state => getResolvedTheme(state.preferences.theme.mode, state.systemPrefersDark) === 'dark');
}
