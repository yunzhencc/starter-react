import type { LayoutMenuItem } from './layout-route';
import { useSyncExternalStore } from 'react';

const listeners = new Set<() => void>();
let accessMenus: LayoutMenuItem[] = [];

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
