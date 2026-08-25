import type { LayoutMenuItem } from './layout-route';
import { create } from 'zustand';

const lockScreenStorageKey = 'starter-react:lock-screen';

export interface LockScreenState {
  isLockScreen: boolean;
  lockScreenPassword: string | undefined;
}

interface AccessStore {
  accessMenus: LayoutMenuItem[];
  /**
   * 是否锁屏状态
   */
  isLockScreen: boolean;
  /**
   * 锁屏密码
   */
  lockScreenPassword: string | undefined;
  lockScreen: (password: string) => void;
  resetAccessMenus: () => void;
  setAccessMenus: (menus: LayoutMenuItem[]) => void;
  unlockScreen: () => void;
}

function readLockScreenState(): LockScreenState {
  if (typeof window === 'undefined') {
    return { isLockScreen: false, lockScreenPassword: undefined };
  }

  try {
    const state = JSON.parse(window.localStorage.getItem(lockScreenStorageKey) ?? 'null') as LockScreenState | null;
    return state?.isLockScreen && state.lockScreenPassword
      ? state
      : { isLockScreen: false, lockScreenPassword: undefined };
  }
  catch {
    return { isLockScreen: false, lockScreenPassword: undefined };
  }
}

function persistLockScreenState(lockScreenState: LockScreenState) {
  if (typeof window === 'undefined') {
    return;
  }

  if (lockScreenState.isLockScreen && lockScreenState.lockScreenPassword) {
    window.localStorage.setItem(lockScreenStorageKey, JSON.stringify(lockScreenState));
  }
  else {
    window.localStorage.removeItem(lockScreenStorageKey);
  }
}

export const useAccessStore = create<AccessStore>(set => ({
  accessMenus: [],
  lockScreen: (password) => {
    const lockScreenState = { isLockScreen: true, lockScreenPassword: password };
    persistLockScreenState(lockScreenState);
    set(lockScreenState);
  },
  ...readLockScreenState(),
  resetAccessMenus: () => set({ accessMenus: [] }),
  setAccessMenus: accessMenus => set({ accessMenus }),
  unlockScreen: () => {
    const lockScreenState = { isLockScreen: false, lockScreenPassword: undefined };
    persistLockScreenState(lockScreenState);
    set(lockScreenState);
  },
}));

export function getAccessMenus() {
  return useAccessStore.getState().accessMenus;
}

export function setAccessMenus(menus: LayoutMenuItem[]) {
  useAccessStore.getState().setAccessMenus(menus);
}

export function resetAccessMenus() {
  useAccessStore.getState().resetAccessMenus();
}

export function getLockScreenState() {
  const { isLockScreen, lockScreenPassword } = useAccessStore.getState();
  return { isLockScreen, lockScreenPassword };
}

export function lockScreen(password: string) {
  useAccessStore.getState().lockScreen(password);
}

export function unlockScreen() {
  useAccessStore.getState().unlockScreen();
}

export function useAccessMenus() {
  return useAccessStore(state => state.accessMenus);
}
