import { Outlet } from '@tanstack/react-router';
import { AuthPageLayout } from '@/features/layout/authentication';

function AuthLayout() {
  return (
    <AuthPageLayout
      appName="React Starter"
      logo="/logo.svg"
    >
      <Outlet />
    </AuthPageLayout>
  );
}

export default AuthLayout;
