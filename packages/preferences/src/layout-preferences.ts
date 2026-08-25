import { useSyncExternalStore } from 'react';

export interface LayoutPreferences {
  sidebar: {
    collapsed: boolean;
    hidden: boolean;
    width: number;
  };
}

export type LayoutPreferencesPatch = {
  [K in keyof LayoutPreferences]?: Partial<LayoutPreferences[K]>;
};

const storageKey = 'yunzhen:preferences';
const defaultPreferences: LayoutPreferences = {
  sidebar: {
    collapsed: false,
    hidden: false,
    width: 240,
  },
};
const listeners = new Set<() => void>();
let currentPreferences: LayoutPreferences | undefined;

function cloneDefaults(): LayoutPreferences {
  return { sidebar: { ...defaultPreferences.sidebar } };
}

function loadPreferences(): LayoutPreferences {
  if (currentPreferences) {
    return currentPreferences;
  }

  try {
    const stored = window.localStorage.getItem(storageKey);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<LayoutPreferences>;
      currentPreferences = {
        sidebar: { ...defaultPreferences.sidebar, ...parsed.sidebar },
      };
      return currentPreferences;
    }
  }
  catch {
    // Browser storage may be unavailable or malformed.
  }

  currentPreferences = cloneDefaults();
  return currentPreferences;
}

function notify() {
  for (const listener of listeners) {
    listener();
  }
}

export function getPreferences(): LayoutPreferences {
  return loadPreferences();
}

export function updatePreferences(patch: LayoutPreferencesPatch) {
  const current = loadPreferences();
  currentPreferences = {
    sidebar: { ...current.sidebar, ...patch.sidebar },
  };

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(currentPreferences));
  }
  catch {
    // Persistence is optional; the in-memory preference still applies.
  }

  notify();
}

export function resetPreferences() {
  currentPreferences = undefined;
  notify();
}

export function usePreferences() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getPreferences,
    cloneDefaults,
  );
}
