import type { RouteIconName, TabRoute } from './tab-model';

export type AppRoute = TabRoute;

export type AppMenuItem = AppRoute | {
  children: AppRoute[];
  icon: RouteIconName;
  key: string;
  title: string;
};

export const appMenuItems: AppMenuItem[] = [
  {
    affix: true,
    icon: 'analytics',
    keepAlive: true,
    path: '/dashboard',
    title: '分析页',
  },
  {
    icon: 'document',
    key: 'examples',
    title: '演示',
    children: [
      {
        keepAlive: true,
        path: '/examples/slate',
        title: 'Slate 编辑器',
      },
      {
        keepAlive: true,
        path: '/examples/lexical',
        title: 'Lexical 编辑器',
      },
    ],
  },
];

export const appRoutes: AppRoute[] = appMenuItems.flatMap(item => 'children' in item ? item.children : [item]);

export function getAppRoute(pathname: string) {
  const path = pathname === '/' ? pathname : pathname.replace(/\/$/, '');
  return appRoutes.find(route => route.path === path);
}
