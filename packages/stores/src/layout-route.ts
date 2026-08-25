import type { ReactNode } from 'react';

export interface LayoutRoute {
  affix?: boolean;
  fullPath?: string;
  fullPathKey?: boolean;
  icon?: ReactNode;
  keepAlive?: boolean;
  path: string;
  search?: Record<string, string | string[] | undefined>;
  title: string;
}

export type LayoutMenuItem = LayoutRoute | {
  children: LayoutRoute[];
  icon?: ReactNode;
  key: string;
  title: string;
};

export interface Tab extends LayoutRoute {
  key: string;
}

export interface TabStateSnapshot {
  activeKey: string;
  history: string[];
  items: Tab[];
}
