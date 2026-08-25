import { cleanup, fireEvent, render, screen } from '@testing-library/react';
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
    cleanup();
    resetPreferences();
    Reflect.deleteProperty(document, 'startViewTransition');
    Reflect.deleteProperty(document.documentElement, 'animate');
    vi.unstubAllGlobals();
  });

  it('persists the selected light mode from the three-option menu', () => {
    render(<ThemeToggle />);

    fireEvent.click(screen.getByRole('button', { name: /Theme settings|主题设置/ }));
    fireEvent.click(screen.getByRole('menuitem', { name: /Light theme|浅色主题/ }));

    expect(getPreferences().theme.mode).toBe('light');
  });

  it('binds document when starting a view transition', () => {
    window.localStorage.clear();
    resetPreferences();
    vi.stubGlobal('matchMedia', () => ({ matches: false }));
    Object.defineProperty(document.documentElement, 'animate', {
      configurable: true,
      value: vi.fn(),
    });
    Object.defineProperty(document, 'startViewTransition', {
      configurable: true,
      value(this: Document, callback: () => void) {
        expect(this).toBe(document);
        callback();
        return { ready: Promise.resolve() };
      },
    });

    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole('button', { name: /Theme settings|主题设置/ }));
    fireEvent.click(screen.getByRole('menuitem', { name: /Light theme|浅色主题/ }));

    expect(getPreferences().theme.mode).toBe('light');
  });
});
