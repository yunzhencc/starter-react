import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { loadLocaleMessages, setupI18n } from '@yunzhen/locales';
import { getAccessMenus } from '@yunzhen/stores';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App, { router } from './App';

vi.mock('@yunzhen/layouts', async () => {
  const { Outlet } = await import('@tanstack/react-router');
  return {
    BasicLayout: ({ brand, headerActions }: { brand: React.ReactNode; headerActions?: React.ReactNode }) => (
      <>
        {brand}
        {headerActions}
        <Outlet />
      </>
    ),
  };
});

beforeEach(async () => {
  window.history.pushState({}, '', '/locales');
  vi.stubGlobal('scrollTo', vi.fn());
  vi.stubGlobal('ResizeObserver', class {
    disconnect() {}
    observe() {}
  });
  HTMLElement.prototype.scrollIntoView = vi.fn();
  await setupI18n();
  await loadLocaleMessages('zh-CN');
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('playground locales example', () => {
  it('renders a shared message and switches it to English', async () => {
    await router.navigate({ to: '/locales' });
    render(<App />);

    expect(await screen.findByRole('button', { name: 'Playground' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '锁定屏幕' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: '返回' })).toBeTruthy();
    expect(getAccessMenus()).toEqual([{ affix: true, path: '/locales', title: '国际化' }]);

    fireEvent.click(screen.getByRole('button', { name: 'English' }));

    expect(await screen.findByRole('heading', { name: 'Back' })).toBeTruthy();
  });
});
