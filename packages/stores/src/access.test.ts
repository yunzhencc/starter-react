import { afterEach, describe, expect, it } from 'vitest';
import {
  getAccessMenus,
  getLockScreenState,
  lockScreen,
  resetAccessMenus,
  setAccessMenus,
  unlockScreen,
  useAccessStore,
} from './access';

afterEach(() => {
  resetAccessMenus();
  unlockScreen();
});

describe('@yunzhen/stores access menus', () => {
  it('keeps menu registration outside a layout adapter', () => {
    setAccessMenus([{ affix: true, path: '/dashboard', title: '分析页' }]);

    expect(getAccessMenus()).toEqual([{ affix: true, path: '/dashboard', title: '分析页' }]);
  });

  it('persists and clears the shared lock screen state', () => {
    lockScreen('secret');

    expect(getLockScreenState()).toEqual({ isLockScreen: true, lockScreenPassword: 'secret' });
    expect(JSON.parse(window.localStorage.getItem('starter-react:lock-screen') ?? '')).toEqual({
      state: { isLockScreen: true, lockScreenPassword: 'secret' },
      version: 0,
    });

    unlockScreen();

    expect(getLockScreenState()).toEqual({ isLockScreen: false, lockScreenPassword: undefined });
    expect(JSON.parse(window.localStorage.getItem('starter-react:lock-screen') ?? '')).toEqual({
      state: { isLockScreen: false },
      version: 0,
    });
  });

  it('exposes the shared access state and actions to non-React consumers', () => {
    useAccessStore.getState().setAccessMenus([{ affix: true, path: '/playground', title: '演示' }]);
    useAccessStore.getState().lockScreen('secret');

    expect(useAccessStore.getState()).toMatchObject({
      accessMenus: [{ affix: true, path: '/playground', title: '演示' }],
      isLockScreen: true,
      lockScreenPassword: 'secret',
    });
  });
});
