import { Outlet } from '@tanstack/react-router';
import logo from '@/assets/logo.svg';
import { AuthPageLayout } from '@/features/layout/authentication';

function AuthLayout() {
  return (
    <AuthPageLayout
      appName="React Starter"
      logo={logo}
    >
      <Outlet />
    </AuthPageLayout>
  );
}

export default AuthLayout;
