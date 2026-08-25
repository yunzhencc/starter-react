import type { ReactNode } from 'react';
import { Outlet, useLocation, useNavigate } from '@tanstack/react-router';
import { useAccessMenus, useAccessStore } from '@yunzhen/stores';
import { AdminLayout } from './admin-layout';
import { getTabKey } from './tab-model';

export interface BasicLayoutProps {
  brand: ReactNode;
  headerActions?: ReactNode;
  lockScreen?: ReactNode;
}

export function BasicLayout({ brand, headerActions, lockScreen }: BasicLayoutProps) {
  const location = useLocation();
  const menuItems = useAccessMenus();
  const isLockScreen = useAccessStore(state => state.isLockScreen);
  const navigate = useNavigate();
  const currentPath = location.pathname === '/' ? '/' : location.pathname.replace(/\/$/, '');
  const currentKey = getTabKey({
    fullPath: `${currentPath}${location.searchStr}`,
    path: currentPath,
    search: Object.fromEntries(new URLSearchParams(location.searchStr)),
  });

  return (
    <AdminLayout
      activePath={location.pathname}
      activeSearch={location.searchStr}
      brand={brand}
      headerActions={headerActions}
      lockScreen={isLockScreen ? lockScreen : undefined}
      menuItems={menuItems}
      renderPage={(tab, refreshVersion) => tab.key === currentKey ? <Outlet key={refreshVersion} /> : null}
      onNavigate={path => void navigate({ to: path as never })}
    />
  );
}
