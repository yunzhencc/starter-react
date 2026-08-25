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
});
