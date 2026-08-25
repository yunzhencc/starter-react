import type { LayoutMenuItem } from './layout-route';
import { useSyncExternalStore } from 'react';

const listeners = new Set<() => void>();
const lockScreenStorageKey = 'starter-react:lock-screen';
let accessMenus: LayoutMenuItem[] = [];
let lockScreenState = readLockScreenState();

export interface LockScreenState {
  isLocked: boolean;
  password?: string;
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

function persistLockScreenState() {
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

function notify() {
  for (const listener of listeners) {
    listener();
  }
}

export function getAccessMenus() {
  return accessMenus;
}

export function setAccessMenus(menus: LayoutMenuItem[]) {
  accessMenus = menus;
  notify();
}

export function resetAccessMenus() {
  accessMenus = [];
  notify();
}

export function getLockScreenState() {
  return lockScreenState;
}

export function lockScreen(password: string) {
  lockScreenState = { isLocked: true, password };
  persistLockScreenState();
  notify();
}

export function unlockScreen() {
  lockScreenState = { isLocked: false };
  persistLockScreenState();
  notify();
}

export function useAccessMenus() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getAccessMenus,
    getAccessMenus,
  );
}

export function useLockScreen() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getLockScreenState,
    getLockScreenState,
  );
}
