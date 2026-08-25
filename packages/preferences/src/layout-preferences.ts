import { create } from 'zustand';

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
  widget: {
    lockScreen: true,
    lockScreenButtonPosition: 'header',
  },
};

function cloneDefaults(): LayoutPreferences {
  return {
    sidebar: { ...defaultPreferences.sidebar },
    shortcutKeys: { ...defaultPreferences.shortcutKeys },
    widget: { ...defaultPreferences.widget },
  };
}

function readPreferences(): LayoutPreferences {
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<LayoutPreferences>;
      return {
        sidebar: { ...defaultPreferences.sidebar, ...parsed.sidebar },
        shortcutKeys: { ...defaultPreferences.shortcutKeys, ...parsed.shortcutKeys },
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
  resetPreferences: () => set({ preferences: readPreferences() }),
  updatePreferences: (patch) => {
    const current = get().preferences;
    const preferences = {
      sidebar: { ...current.sidebar, ...patch.sidebar },
      shortcutKeys: { ...current.shortcutKeys, ...patch.shortcutKeys },
      widget: { ...current.widget, ...patch.widget },
    };
    persistPreferences(preferences);
    set({ preferences });
  },
}));

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
