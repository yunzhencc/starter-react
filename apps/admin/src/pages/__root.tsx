import { createRootRoute, Outlet, useLocation } from '@tanstack/react-router';
import { AdminLayout } from '@/features/layout/admin-layout';
import { getAppRoute } from '@/features/layout/route-definitions';

export const Route = createRootRoute({
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
