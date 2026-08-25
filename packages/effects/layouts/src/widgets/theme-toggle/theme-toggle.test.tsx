import { fireEvent, render, screen } from '@testing-library/react';
import { setupI18n } from '@yunzhen/locales';
import { getPreferences, resetPreferences } from '@yunzhen/preferences';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeToggle } from './theme-toggle';

describe('themeToggle', () => {
  beforeEach(async () => {
    window.localStorage.removeItem('starter-react:locale');
    vi.stubGlobal('ResizeObserver', class {
      disconnect() {}
      observe() {}
      unobserve() {}
    });
    await setupI18n({ defaultLocale: 'zh-CN' });
  });

  afterEach(() => {
    resetPreferences();
    vi.unstubAllGlobals();
  });

  it('persists the selected light mode from the three-option menu', () => {
    render(<ThemeToggle />);

    fireEvent.click(screen.getByRole('button', { name: /Theme settings|主题设置/ }));
    fireEvent.click(screen.getByRole('menuitem', { name: /Light theme|浅色主题/ }));

    expect(getPreferences().theme.mode).toBe('light');
  });
});
