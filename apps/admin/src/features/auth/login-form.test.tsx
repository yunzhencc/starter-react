import { createMemoryHistory, createRootRoute, createRoute, createRouter, Outlet, RouterProvider } from '@tanstack/react-router';
import { fireEvent, render, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LoginForm } from '../../pages/_auth/login';

Object.defineProperty(window, 'matchMedia', {
  value: () => ({ addEventListener: () => {}, addListener: () => {}, matches: false, media: '', removeEventListener: () => {}, removeListener: () => {} }),
});
Object.defineProperty(window, 'scrollTo', { value: () => {} });

describe('local demo login form', () => {
  it('renders the complete Vben login surface around the local demo captcha', async () => {
    const rootRoute = createRootRoute({ component: Outlet });
    const loginRoute = createRoute({
      component: () => <LoginForm onSuccess={() => undefined} />,
      getParentRoute: () => rootRoute,
      path: '/login',
    });
    const router = createRouter({
      history: createMemoryHistory({ initialEntries: ['/login'] }),
      routeTree: rootRoute.addChildren([loginRoute]),
    });
    const { container } = render(<RouterProvider router={router} />);
    await within(container).findByText('欢迎回来 👋🏻');
    const markup = container.innerHTML;

    expect(markup).toContain('欢迎回来 👋🏻');
    expect(markup).toContain('Super');
    expect(markup).toContain('拖动滑块完成验证');
    expect(markup).not.toContain('type="range"');
    expect(markup).toContain('记住我');
    expect(markup).toContain('忘记密码？');
    expect(markup).toContain('手机登录');
    expect(markup).toContain('二维码登录');
    expect(markup).toContain('其他登录方式');
    expect(markup).toContain('/images/auth/wechat.svg');
    expect(markup).toContain('/images/auth/qqchat.svg');
    expect(markup).toContain('/images/auth/github.svg');
    expect(markup).toContain('/images/auth/google.svg');
    expect(markup).toContain('还没有账号？');
    expect(markup).toContain('注册');
  });

  it('shows the captcha validation under the captcha item', async () => {
    const rootRoute = createRootRoute({ component: Outlet });
    const loginRoute = createRoute({
      component: () => <LoginForm onSuccess={() => undefined} />,
      getParentRoute: () => rootRoute,
      path: '/login',
    });
    const router = createRouter({
      history: createMemoryHistory({ initialEntries: ['/login'] }),
      routeTree: rootRoute.addChildren([loginRoute]),
    });
    const { container } = render(<RouterProvider router={router} />);

    await within(container).findByText('欢迎回来 👋🏻');
    fireEvent.click(container.querySelector('button[type="submit"]')!);

    expect((await within(container).findByText('请先完成滑块验证')).classList.contains('ant-form-item-explain-error')).toBe(true);
  });
});
