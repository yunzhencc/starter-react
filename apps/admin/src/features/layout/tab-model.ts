export interface TabRoute {
  affix?: boolean;
  fullPath?: string;
  fullPathKey?: boolean;
  keepAlive?: boolean;
  path: string;
  search?: Record<string, string | string[] | undefined>;
  title: string;
}

export interface Tab extends TabRoute {
  key: string;
}

export interface TabStateSnapshot {
  activeKey: string;
  history: string[];
  items: Tab[];
}

export function getTabKey(route: Omit<TabRoute, 'title'>) {
  const pageKey = route.search?.pageKey;
  const rawKey = Array.isArray(pageKey)
    ? pageKey[0]
    : pageKey || (route.fullPathKey === false ? route.path : (route.fullPath ?? route.path));

  try {
    return decodeURIComponent(rawKey);
  }
  catch {
    return rawKey;
  }
}

export function createTabState(snapshot?: TabStateSnapshot) {
  function moveAffixedTabsFirst(items: Tab[]) {
    return [...items.filter(tab => tab.affix), ...items.filter(tab => !tab.affix)];
  }

  const state = {
    activeKey: snapshot?.activeKey ?? '',
    history: [...(snapshot?.history ?? [])],
    items: [...(snapshot?.items ?? [])],
    close(key: string) {
      const index = state.items.findIndex(tab => tab.key === key);
      const tab = state.items[index];
      if (!tab || tab.affix) {
        return undefined;
      }

      state.items.splice(index, 1);
      state.history = state.history.filter(item => item !== key);
      if (state.activeKey !== key) {
        return undefined;
      }

      const nextKey = state.history.findLast(item => state.items.some(tab => tab.key === item))
        ?? state.items[index]?.key
        ?? state.items[index - 1]?.key
        ?? state.items[0]?.key;
      state.activeKey = nextKey ?? '';
      return nextKey;
    },
    closeAll() {
      state.items = state.items.filter(tab => tab.affix);
      state.history = state.history.filter(key => state.items.some(tab => tab.key === key));
      state.activeKey = state.items[0]?.key ?? '';
      return state.activeKey || undefined;
    },
    closeLeft(key: string) {
      const index = state.items.findIndex(tab => tab.key === key);
      if (index === -1) {
        return;
      }
      const keys = new Set(state.items.slice(0, index).filter(tab => !tab.affix).map(tab => tab.key));
      state.items = state.items.filter(tab => !keys.has(tab.key));
      state.history = state.history.filter(item => !keys.has(item));
      if (!state.items.some(tab => tab.key === state.activeKey)) {
        state.activeKey = key;
      }
    },
    closeOthers(key: string) {
      state.items = state.items.filter(tab => tab.affix || tab.key === key);
      state.history = state.history.filter(item => state.items.some(tab => tab.key === item));
      if (!state.items.some(tab => tab.key === state.activeKey)) {
        state.activeKey = key;
      }
    },
    closeRight(key: string) {
      const index = state.items.findIndex(tab => tab.key === key);
      if (index === -1) {
        return;
      }
      const keys = new Set(state.items.slice(index + 1).filter(tab => !tab.affix).map(tab => tab.key));
      state.items = state.items.filter(tab => !keys.has(tab.key));
      state.history = state.history.filter(item => !keys.has(item));
      if (!state.items.some(tab => tab.key === state.activeKey)) {
        state.activeKey = key;
      }
    },
    open(route: TabRoute) {
      const key = getTabKey(route);
      const index = state.items.findIndex(tab => tab.key === key);
      const existing = state.items[index];
      const tab = { ...existing, ...route, affix: existing?.affix ?? route.affix, key };

      if (index === -1) {
        state.items.push(tab);
      }
      else {
        state.items[index] = tab;
      }
      state.activeKey = key;
      state.history = [...state.history.filter(item => item !== key), key];
      return tab;
    },
    pin(key: string) {
      const tab = state.items.find(item => item.key === key);
      if (!tab) {
        return;
      }
      tab.affix = true;
      state.items = moveAffixedTabsFirst(state.items);
    },
    reorder(key: string, targetKey: string) {
      const from = state.items.findIndex(tab => tab.key === key);
      const to = state.items.findIndex(tab => tab.key === targetKey);
      const tab = state.items[from];
      const target = state.items[to];
      if (from === -1 || to === -1 || tab?.affix || target?.affix) {
        return;
      }
      state.items.splice(from, 1);
      state.items.splice(to, 0, tab);
    },
    reorderByKeys(keys: string[]) {
      const byKey = new Map(state.items.map(tab => [tab.key, tab]));
      const affixed = state.items.filter(tab => tab.affix);
      const regular = keys
        .map(key => byKey.get(key))
        .filter((tab): tab is Tab => !!tab && !tab.affix);
      const missing = state.items.filter(tab => !tab.affix && !regular.includes(tab));
      state.items = [...affixed, ...regular, ...missing];
    },
    snapshot(): TabStateSnapshot {
      return {
        activeKey: state.activeKey,
        history: [...state.history],
        items: state.items.map(tab => ({ ...tab })),
      };
    },
    unpin(key: string) {
      const tab = state.items.find(item => item.key === key);
      if (!tab) {
        return;
      }
      tab.affix = false;
      state.items = moveAffixedTabsFirst(state.items);
    },
  };

  return state;
}
