import { createMemoryHistory, createRootRoute, createRouter, RouterProvider } from '@tanstack/react-router';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { AuthPageLayout } from './auth-page-layout';
import { setAuthPageLayout } from './preferences';

class ResizeObserverStub {
  disconnect() {}
  observe() {}
  unobserve() {}
}

Object.defineProperty(globalThis, 'ResizeObserver', { value: ResizeObserverStub });
Object.defineProperty(window, 'scrollTo', { value: () => {} });

afterEach(() => {
  cleanup();
  localStorage.clear();
});

async function renderLayout(layout: 'panel-left' | 'panel-center' | 'panel-right') {
  setAuthPageLayout(layout);
  const rootRoute = createRootRoute({
    component: () => (
      <AuthPageLayout appName="React Starter" logo="/logo.svg">
        <div>Login form</div>
      </AuthPageLayout>
    ),
  });
  const router = createRouter({
    history: createMemoryHistory({ initialEntries: ['/'] }),
    routeTree: rootRoute,
  });
  const result = render(<RouterProvider router={router} />);
  await within(result.container).findByText('Login form');
  return result;
}

describe('auth page layout', () => {
  it('renders the selected side or center layout', async () => {
    const left = await renderLayout('panel-left');
    expect(left.container.querySelector('[data-layout]')?.getAttribute('data-layout')).toBe('panel-left');
    left.unmount();

    const right = await renderLayout('panel-right');
    expect(right.container.querySelector('[data-layout]')?.getAttribute('data-layout')).toBe('panel-right');
    right.unmount();

    const center = await renderLayout('panel-center');
    expect(center.container.querySelector('[data-layout]')?.getAttribute('data-layout')).toBe('panel-center');
  });

  it('only renders the hero for side layouts', async () => {
    const left = await renderLayout('panel-left');
    expect(left.container.querySelector('.auth-page-layout__hero')).not.toBeNull();
    left.unmount();

    const right = await renderLayout('panel-right');
    expect(right.container.querySelector('.auth-page-layout__hero')).not.toBeNull();
    right.unmount();

    const center = await renderLayout('panel-center');
    expect(center.container.querySelector('.auth-page-layout__hero')).toBeNull();
  });

  it('uses the original CareerCompass characters as the default hero effect', async () => {
    const { container } = await renderLayout('panel-right');
    const markup = container.innerHTML;

    expect(markup).toContain('auth-page-layout__toolbar');
    expect(markup).toContain('auth-page-layout__hero-background');
    expect(markup).toContain('auth-page-layout__hero-content');
    expect(markup).toContain('auth-page-layout__careercompass-characters');
    expect(markup).not.toContain('auth-page-layout__slogan');
    expect(markup).toContain('auth-page-layout__brand');
    expect(markup).toContain('auth-page-layout__content');
    expect(markup).not.toContain('class="auth-page-layout__copy"');
  });

  it('applies the layout chosen from its toolbar', async () => {
    const { container } = await renderLayout('panel-right');

    fireEvent.click(within(container).getByLabelText('登录页布局'));
    fireEvent.click(screen.getByText('表单居左'));

    expect(container.querySelector('[data-layout="panel-left"]')).not.toBeNull();
    expect(localStorage.getItem('starter-react:auth-page-layout')).toBe('panel-left');
  });

  it('uses Vben-ordered layout options with a matching trigger icon', async () => {
    const { container } = await renderLayout('panel-right');

    const toggle = container.querySelector<HTMLButtonElement>('[aria-label="登录页布局"]');
    expect(toggle).not.toBeNull();
    if (!toggle) {
      return;
    }
    expect(toggle.getAttribute('data-layout')).toBe('panel-right');
    fireEvent.click(toggle);

    const dropdowns = document.querySelectorAll('.auth-page-layout-toggle__dropdown');
    const options = [...(dropdowns.item(dropdowns.length - 1)?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])];
    expect(options.map(option => option.textContent)).toEqual(['表单居左', '表单居中', '表单居右']);
    expect(options.every(option => option.querySelector('svg'))).toBe(true);
    expect(container.querySelector('.auth-page-layout__toolbar')).not.toBeNull();
  });
});
