import type { LayoutMenuItem } from './layout-route';
import { create } from 'zustand';

const lockScreenStorageKey = 'starter-react:lock-screen';

export interface LockScreenState {
  isLocked: boolean;
  password?: string;
}

interface AccessStoreState {
  accessMenus: LayoutMenuItem[];
  lockScreen: (password: string) => void;
  lockScreenState: LockScreenState;
  resetAccessMenus: () => void;
  setAccessMenus: (menus: LayoutMenuItem[]) => void;
  unlockScreen: () => void;
}

function readLockScreenState(): LockScreenState {
  if (typeof window === 'undefined') {
    return { isLocked: false };
  }

  try {
    const state = JSON.parse(window.localStorage.getItem(lockScreenStorageKey) ?? 'null') as LockScreenState | null;
    return state?.isLocked && state.password ? state : { isLocked: false };
  }
  catch {
    return { isLocked: false };
  }
}

function persistLockScreenState(lockScreenState: LockScreenState) {
  if (typeof window === 'undefined') {
    return;
  }

  if (lockScreenState.isLocked && lockScreenState.password) {
    window.localStorage.setItem(lockScreenStorageKey, JSON.stringify(lockScreenState));
  }
  else {
    window.localStorage.removeItem(lockScreenStorageKey);
  }
}

export const useAccessStore = create<AccessStoreState>(set => ({
  accessMenus: [],
  lockScreen: (password) => {
    const lockScreenState = { isLocked: true, password };
    persistLockScreenState(lockScreenState);
    set({ lockScreenState });
  },
  lockScreenState: readLockScreenState(),
  resetAccessMenus: () => set({ accessMenus: [] }),
  setAccessMenus: accessMenus => set({ accessMenus }),
  unlockScreen: () => {
    const lockScreenState = { isLocked: false };
    persistLockScreenState(lockScreenState);
    set({ lockScreenState });
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
  return useAccessStore.getState().lockScreenState;
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

export function useLockScreen() {
  return useAccessStore(state => state.lockScreenState);
}
