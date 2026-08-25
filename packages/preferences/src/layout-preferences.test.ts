import { afterEach, describe, expect, it } from 'vitest';
import { getPreferences, resetPreferences, updatePreferences } from './layout-preferences';

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
});
