import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminLayout } from './admin-layout';

vi.mock('react-split-pane', () => ({
  Pane: ({ children }: { children?: React.ReactNode }) => children,
  SplitPane: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
}));

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', class {
    disconnect() {}
    observe() {}
  });
  HTMLElement.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
  cleanup();
  window.sessionStorage.clear();
  vi.unstubAllGlobals();
});

describe('@yunzhen/layouts AdminLayout', () => {
  it('renders the host page and delegates menu navigation', async () => {
    const onNavigate = vi.fn();

    render(
      <AdminLayout
        activePath="/home"
        brand={<span>Playground</span>}
        menuItems={[
          { affix: true, path: '/home', title: 'Home' },
          { path: '/editor', title: 'Editor' },
        ]}
        renderPage={route => <h1>{route.title}</h1>}
        onNavigate={onNavigate}
      />,
    );

    expect(await screen.findByRole('heading', { name: 'Home' })).toBeTruthy();
    fireEvent.click(screen.getByText('Editor'));
    expect(onNavigate).toHaveBeenCalledWith('/editor');
  });

  it('does not render serialized tab icons from session storage', async () => {
    window.sessionStorage.setItem('yunzhen:tabbar', JSON.stringify({
      activeKey: '/home',
      history: ['/home'],
      items: [{ icon: { _owner: null, _store: {}, key: null, props: {} }, key: '/home', path: '/home', title: 'Home' }],
    }));

    render(
      <AdminLayout
        activePath="/home"
        brand={<span>Playground</span>}
        menuItems={[{ affix: true, path: '/home', title: 'Home' }]}
        renderPage={route => <h1>{route.title}</h1>}
        onNavigate={vi.fn()}
      />,
    );

    expect(await screen.findByRole('button', { name: 'Home' })).toBeTruthy();
  });
});
