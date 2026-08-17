import { createRootRoute, Outlet, redirect, useLocation } from '@tanstack/react-router';
import { getLoginRedirect } from '@/features/auth/redirect';
import { getSession } from '@/features/auth/session';
import { AdminLayout } from '@/features/layout/admin-layout';
import { getAppRoute } from '@/features/layout/route-definitions';

export const Route = createRootRoute({
  beforeLoad: ({ location }) => {
    if (location.pathname === '/login' || location.pathname === '/register') {
      if (getSession()) {
        throw redirect({ replace: true, to: '/dashboard' });
      }
      return;
    }

    if (!getSession()) {
      const destination = getLoginRedirect(location.pathname, location.searchStr);
      throw redirect({ href: `/login?redirect=${encodeURIComponent(destination)}`, replace: true });
    }
  },
  component: RootComponent,
});

function RootComponent() {
  const location = useLocation();

  if (getAppRoute(location.pathname)) {
    return <AdminLayout />;
  }

  return (
    <Outlet />
  );
}
