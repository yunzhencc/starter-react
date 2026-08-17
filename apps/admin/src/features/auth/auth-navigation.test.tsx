// @vitest-environment jsdom
import { createMemoryHistory, createRootRoute, createRoute, createRouter, Outlet, RouterProvider } from '@tanstack/react-router';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LoginForm } from '../../pages/_auth/login';

Object.defineProperty(window, 'matchMedia', {
  value: () => ({ addEventListener: () => {}, addListener: () => {}, matches: false, media: '', removeEventListener: () => {}, removeListener: () => {} }),
});
Object.defineProperty(window, 'scrollTo', { value: () => {} });

describe('authentication navigation', () => {
  it('switches to registration through the client router', async () => {
    const rootRoute = createRootRoute({ component: Outlet });
    const loginRoute = createRoute({
      component: () => <LoginForm onSuccess={() => undefined} />,
      getParentRoute: () => rootRoute,
      path: '/login',
    });
    const registerRoute = createRoute({
      component: () => <div>注册页</div>,
      getParentRoute: () => rootRoute,
      path: '/register',
    });
    const router = createRouter({
      history: createMemoryHistory({ initialEntries: ['/login'] }),
      routeTree: rootRoute.addChildren([loginRoute, registerRoute]),
    });

    render(<RouterProvider router={router} />);
    fireEvent.click(await screen.findByRole('link', { name: '注册' }));

    await waitFor(() => expect(router.state.location.pathname).toBe('/register'));
  });
});
