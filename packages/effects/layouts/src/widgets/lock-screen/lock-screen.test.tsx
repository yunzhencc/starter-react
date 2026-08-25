import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { loadLocaleMessages, setupI18n } from '@yunzhen/locales';
import { getLockScreenState, lockScreen, unlockScreen } from '@yunzhen/stores';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { LockScreen, LockScreenModal } from './lock-screen';

beforeAll(async () => {
  await setupI18n({ defaultLocale: 'zh-CN' });
});

beforeEach(async () => {
  await loadLocaleMessages('zh-CN');
});

afterEach(() => {
  cleanup();
  document.body.style.overflow = '';
  unlockScreen();
  vi.useRealTimers();
});

describe('@yunzhen/layouts lock screen widget', () => {
  it('uses the shared lock state to lock and unlock the layout', () => {
    const onOpenChange = () => {};
    render(<LockScreenModal avatar="/logo.svg" open text="Vben" onOpenChange={onOpenChange} />);

    expect(screen.getByText('Vben')).toBeTruthy();

    fireEvent.change(screen.getByPlaceholderText('请输入锁屏密码'), { target: { value: 'secret' } });
    fireEvent.click(screen.getByRole('button', { name: /锁\s*定/ }));

    expect(getLockScreenState()).toEqual({ isLockScreen: true, lockScreenPassword: 'secret' });

    cleanup();
    render(<LockScreen avatar="/logo.svg" />);
    fireEvent.click(screen.getByRole('button', { name: '点击解锁' }));
    fireEvent.change(screen.getByPlaceholderText('请输入锁屏密码'), { target: { value: 'secret' } });
    fireEvent.click(screen.getByRole('button', { name: /进\s*入\s*系\s*统/ }));

    expect(getLockScreenState()).toEqual({ isLockScreen: false, lockScreenPassword: undefined });
  });

  it('locks document scrolling while the screen is locked', async () => {
    document.body.style.overflow = 'auto';
    lockScreen('secret');
    render(<LockScreen avatar="/logo.svg" />);

    expect(document.body.style.overflow).toBe('hidden');

    unlockScreen();

    await waitFor(() => expect(document.body.style.overflow).toBe('auto'));
  });

  it('uses the active locale for lock screen text and date', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-24T13:45:00'));
    await loadLocaleMessages('en-US');
    lockScreen('secret');
    render(<LockScreen avatar="/logo.svg" />);

    expect(screen.getByRole('button', { name: 'Click to unlock' })).toBeTruthy();
    expect(screen.getByText('2026-08-24 Monday')).toBeTruthy();
  });
});
