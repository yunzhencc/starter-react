import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { resetPreferences, updatePreferences } from '@yunzhen/preferences';
import { unlockScreen } from '@yunzhen/stores';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AdminLayout } from './admin-layout';

vi.mock('@tanstack/react-router', () => ({ useNavigate: () => vi.fn() }));
vi.mock('@yunzhen/layouts', () => ({ BasicLayout: ({ headerActions }: { headerActions?: React.ReactNode }) => <>{headerActions}</> }));
vi.mock('@yunzhen/layouts/widgets', () => ({
  LockScreen: () => null,
  LockScreenModal: ({ open }: { open: boolean }) => open ? <div>锁屏弹窗</div> : null,
  ThemeToggle: () => <span>主题</span>,
}));
vi.mock('antd', () => ({ App: { useApp: () => ({ modal: { confirm: vi.fn() } }) } }));
vi.mock('@/features/auth/session', () => ({ logout: vi.fn() }));
vi.mock('./route-icon', () => ({ RouteIcon: () => null }));
vi.mock('./user-dropdown', () => ({ UserDropdown: () => <span>头像</span> }));

afterEach(() => {
  cleanup();
  localStorage.clear();
  resetPreferences();
  unlockScreen();
});

describe('admin layout lock screen shortcut', () => {
  it('keeps fullscreen before the lock screen and user menu', () => {
    updatePreferences({ widget: { lockScreen: true, lockScreenButtonPosition: 'header' } });
    const { container } = render(<AdminLayout />);

    expect(Array.from(container.children).map(element => element.getAttribute('aria-label') ?? element.textContent ?? '')).toEqual(['主题', '全屏', 'ui.lockScreen.title', '头像']);
  });

  it('does not open the lock screen dialog when the widget is disabled', () => {
    updatePreferences({ widget: { lockScreen: false } });
    render(<AdminLayout />);

    fireEvent.keyDown(window, { altKey: true, code: 'KeyL' });

    expect(screen.queryByText('锁屏弹窗')).toBeNull();
  });
});
