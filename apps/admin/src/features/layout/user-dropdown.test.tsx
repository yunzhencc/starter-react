import { fireEvent, render, screen } from '@testing-library/react';
import { loadLocaleMessages, setupI18n } from '@yunzhen/locales';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { UserDropdown } from './user-dropdown';

describe('user dropdown', () => {
  beforeAll(async () => {
    await setupI18n({ defaultLocale: 'zh-CN' });
  });

  beforeEach(async () => {
    await loadLocaleMessages('zh-CN');
    vi.stubGlobal('ResizeObserver', class {
      disconnect() {}
      observe() {}
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('exposes the configured lock screen entry', () => {
    const onLockScreen = vi.fn();

    render(<UserDropdown showLockScreen onLockScreen={onLockScreen} onLogout={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: '用户菜单' }));
    fireEvent.click(screen.getByRole('button', { name: '锁定屏幕' }));

    expect(onLockScreen).toHaveBeenCalledOnce();
  });
});
