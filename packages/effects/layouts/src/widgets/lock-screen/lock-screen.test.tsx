import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { getLockScreenState, unlockScreen } from '@yunzhen/stores';
import { afterEach, describe, expect, it } from 'vitest';
import { LockScreen, LockScreenModal } from './lock-screen';

afterEach(() => {
  cleanup();
  unlockScreen();
});

describe('@yunzhen/layouts lock screen widget', () => {
  it('uses the shared lock state to lock and unlock the layout', () => {
    const onOpenChange = () => {};
    render(<LockScreenModal avatar="/logo.svg" open onOpenChange={onOpenChange} />);

    fireEvent.change(screen.getByPlaceholderText('请输入锁屏密码'), { target: { value: 'secret' } });
    fireEvent.click(screen.getByRole('button', { name: /锁\s*定/ }));

    expect(getLockScreenState()).toEqual({ isLocked: true, password: 'secret' });

    cleanup();
    render(<LockScreen avatar="/logo.svg" />);
    fireEvent.click(screen.getByRole('button', { name: '点击解锁' }));
    fireEvent.change(screen.getByPlaceholderText('请输入锁屏密码'), { target: { value: 'secret' } });
    fireEvent.click(screen.getByRole('button', { name: /进\s*入\s*系\s*统/ }));

    expect(getLockScreenState()).toEqual({ isLocked: false });
  });
});
