import { Outlet } from '@tanstack/react-router';
import { AuthPageLayout } from '@/features/layout/authentication';

function AuthLayout() {
  return (
    <AuthPageLayout
      appName="React Starter"
      logo="/logo.svg"
      pageDescription="基于 React、TypeScript 和 Vite 构建"
      pageTitle="开箱即用的中后台管理系统"
    >
      <Outlet />
    </AuthPageLayout>
  );
}

export default AuthLayout;
