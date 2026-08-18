// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { UserDropdown } from './user-dropdown';

describe('user dropdown', () => {
  beforeEach(() => {
    vi.stubGlobal('ResizeObserver', class {
      disconnect() {}

      observe() {}

      unobserve() {}
    });
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('shows only the retained Vben profile actions', () => {
    render(<UserDropdown onLogout={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: '用户菜单' }));

    const profileAction = screen.getByRole('button', { name: '个人中心' });
    expect(profileAction).toBeTruthy();
    expect(screen.getByRole('link', { name: 'GitHub' }).getAttribute('href')).toBe('https://github.com/yunzhencc/starter-react');
    expect(screen.queryByText('文档')).toBeNull();
    expect(screen.queryByText('问题 & 帮助')).toBeNull();

    fireEvent.click(profileAction);
    expect(window.location.pathname).toBe('/');
  });

  it('invokes the supplied logout handler from the profile menu', () => {
    const onLogout = vi.fn();

    render(<UserDropdown onLogout={onLogout} />);
    fireEvent.click(screen.getByRole('button', { name: '用户菜单' }));
    fireEvent.click(screen.getByRole('button', { name: '退出登录' }));

    expect(onLogout).toHaveBeenCalledOnce();
  });
});
