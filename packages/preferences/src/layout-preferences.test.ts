import { afterEach, describe, expect, it } from 'vitest';
import { getPreferences, resetPreferences, updatePreferences, usePreferencesStore } from './layout-preferences';

afterEach(() => {
  window.localStorage.clear();
  resetPreferences();
});

describe('@yunzhen/preferences', () => {
  it('merges layout preference updates and persists them', () => {
    updatePreferences({ sidebar: { collapsed: true, width: 280 } });

    expect(getPreferences().sidebar).toEqual({ collapsed: true, hidden: false, width: 280 });

    resetPreferences();
    expect(getPreferences().sidebar).toEqual({ collapsed: true, hidden: false, width: 280 });
  });

  it('exposes layout preferences and actions to non-React consumers', () => {
    usePreferencesStore.getState().updatePreferences({ sidebar: { hidden: true } });

    expect(usePreferencesStore.getState().preferences.sidebar).toEqual({ collapsed: false, hidden: true, width: 240 });
  });

  it('configures the lock screen widget and its shortcut', () => {
    updatePreferences({
      shortcutKeys: { globalLockScreen: false },
      widget: { lockScreen: false, lockScreenButtonPosition: 'user-dropdown' },
    });

    expect(getPreferences()).toMatchObject({
      shortcutKeys: { enable: true, globalLockScreen: false },
      widget: { lockScreen: false, lockScreenButtonPosition: 'user-dropdown' },
    });
  });
});
