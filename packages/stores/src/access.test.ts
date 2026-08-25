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

    expect(getLockScreenState()).toEqual({ isLocked: true, password: 'secret' });
    expect(window.localStorage.getItem('starter-react:lock-screen')).toBe('{"isLocked":true,"password":"secret"}');

    unlockScreen();

    expect(getLockScreenState()).toEqual({ isLocked: false });
    expect(window.localStorage.getItem('starter-react:lock-screen')).toBeNull();
  });

  it('exposes the shared access state and actions to non-React consumers', () => {
    useAccessStore.getState().setAccessMenus([{ affix: true, path: '/playground', title: '演示' }]);
    useAccessStore.getState().lockScreen('secret');

    expect(useAccessStore.getState()).toMatchObject({
      accessMenus: [{ affix: true, path: '/playground', title: '演示' }],
      lockScreenState: { isLocked: true, password: 'secret' },
    });
  });
});
