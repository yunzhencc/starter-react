import { Outlet } from '@tanstack/react-router';
import { ThemeToggle } from '../features/theme/theme-toggle';
import './auth.css';

function AuthLayout() {
  return (
    <main className="auth-page-layout">
      <section className="auth-page-layout__hero" aria-labelledby="auth-page-title">
        <a className="auth-page-layout__brand" href="/">
          <img alt="React Starter" src="/logo.svg" />
          <span>React Starter</span>
        </a>
        <div className="auth-page-layout__copy">
          <p>React admin starter</p>
          <h1 id="auth-page-title">开箱即用的中后台管理系统</h1>
          <span>基于 React、TypeScript 和 Vite 构建</span>
        </div>
        <div aria-hidden="true" className="auth-page-layout__art" />
      </section>
      <div className="auth-page-layout__toolbar">
        <ThemeToggle />
      </div>
      <section className="auth-page-layout__form" aria-label="登录">
        <Outlet />
      </section>
    </main>
  );
}

export default AuthLayout;
