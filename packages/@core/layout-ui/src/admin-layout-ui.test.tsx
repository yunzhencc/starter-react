import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AdminLayoutUi } from './admin-layout-ui';

vi.mock('react-split-pane', () => ({
  Pane: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  SplitPane: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
}));

describe('@yunzhen/layout-ui AdminLayoutUi', () => {
  it('renders supplied layout regions and delegates sidebar visibility', () => {
    const onToggleSidebar = vi.fn();

    render(
      <AdminLayoutUi
        content={<h1>Content</h1>}
        header={<span>Header</span>}
        sidebar={<span>Sidebar</span>}
        sidebarHidden={false}
        sidebarResizable={false}
        sidebarSize={240}
        tabbar={<span>Tabbar</span>}
        onToggleSidebar={onToggleSidebar}
      />,
    );

    expect(screen.getByText('Sidebar')).toBeTruthy();
    expect(screen.getByText('Header')).toBeTruthy();
    expect(screen.getByText('Tabbar')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Content' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: '隐藏菜单' }));
    expect(onToggleSidebar).toHaveBeenCalledOnce();
  });
});
