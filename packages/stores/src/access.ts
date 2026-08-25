import type { LayoutMenuItem } from './layout-route';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const lockScreenStorageKey = 'starter-react:lock-screen';

export interface LockScreenState {
  isLockScreen: boolean;
  lockScreenPassword: string | undefined;
}

interface AccessStore {
  /**
   * 是否锁屏状态
   */
  isLockScreen: boolean;
  /**
   * 锁屏密码
   */
  lockScreenPassword: string | undefined;
  accessMenus: LayoutMenuItem[];
  lockScreen: (password: string) => void;
  resetAccessMenus: () => void;
  setAccessMenus: (menus: LayoutMenuItem[]) => void;
  unlockScreen: () => void;
}

export const useAccessStore = create<AccessStore>()(
  persist(
    set => ({
      accessMenus: [],
      isLockScreen: false,
      lockScreen: password => set({ isLockScreen: true, lockScreenPassword: password }),
      lockScreenPassword: undefined,
      resetAccessMenus: () => set({ accessMenus: [] }),
      setAccessMenus: accessMenus => set({ accessMenus }),
      unlockScreen: () => set({ isLockScreen: false, lockScreenPassword: undefined }),
    }),
    {
      name: lockScreenStorageKey,
      partialize: ({ isLockScreen, lockScreenPassword }) => ({ isLockScreen, lockScreenPassword }),
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

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
