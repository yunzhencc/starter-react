import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { lockScreen, resetAccessMenus, setAccessMenus, unlockScreen } from '@yunzhen/stores';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BasicLayout } from './basic-layout';

const navigate = vi.fn();

vi.mock('@tanstack/react-router', () => ({
  Outlet: () => <h1>Route content</h1>,
  useLocation: () => ({ pathname: '/dashboard', searchStr: '' }),
  useNavigate: () => navigate,
}));

vi.mock('react-split-pane', () => ({
  Pane: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  SplitPane: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
}));

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', class {
    disconnect() {}
    observe() {}
  });
  HTMLElement.prototype.scrollIntoView = vi.fn();
  setAccessMenus([{ affix: true, path: '/dashboard', title: '分析页' }]);
});

afterEach(() => {
  cleanup();
  navigate.mockReset();
  resetAccessMenus();
  unlockScreen();
  vi.unstubAllGlobals();
});

describe('@yunzhen/layouts BasicLayout', () => {
  it('reads registered menus and routes without host navigation props', async () => {
    render(<BasicLayout brand={<span>Starter</span>} />);

    expect(await screen.findByRole('heading', { name: 'Route content' })).toBeTruthy();
    fireEvent.click(screen.getByRole('menuitem', { name: '分析页' }));
    expect(navigate).toHaveBeenCalledWith({ to: '/dashboard' });
  });

  it('renders the host lock screen only while shared state is locked', async () => {
    render(<BasicLayout brand={<span>Starter</span>} lockScreen={<div>锁定覆盖层</div>} />);

    expect(screen.queryByText('锁定覆盖层')).toBeNull();
    lockScreen('secret');
    expect(await screen.findByText('锁定覆盖层')).toBeTruthy();
  });
});
