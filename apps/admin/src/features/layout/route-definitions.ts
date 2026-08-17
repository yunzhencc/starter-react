import type { TabRoute } from './tab-model';

export type AppRoute = TabRoute & {
  icon: 'analytics' | 'document';
};

export const appRoutes: AppRoute[] = [
  {
    affix: true,
    icon: 'analytics',
    keepAlive: true,
    path: '/dashboard',
    title: '分析页',
  },
  {
    icon: 'document',
    keepAlive: true,
    path: '/examples/slate',
    title: 'Slate 编辑器',
  },
  {
    icon: 'document',
    keepAlive: true,
    path: '/examples/lexical',
    title: 'Lexical 编辑器',
  },
];

export function getAppRoute(pathname: string) {
  const path = pathname === '/' ? pathname : pathname.replace(/\/$/, '');
  return appRoutes.find(route => route.path === path);
}
