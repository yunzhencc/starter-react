// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
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

  afterEach(() => vi.unstubAllGlobals());

  it('shows only the retained Vben profile actions', () => {
    render(<UserDropdown />);
    fireEvent.click(screen.getByRole('button', { name: '用户菜单' }));

    const profileAction = screen.getByRole('button', { name: '个人中心' });
    expect(profileAction).toBeTruthy();
    expect(screen.getByRole('link', { name: 'GitHub' }).getAttribute('href')).toBe('https://github.com/vbenjs/vue-vben-admin');
    expect(screen.queryByText('文档')).toBeNull();
    expect(screen.queryByText('问题 & 帮助')).toBeNull();

    fireEvent.click(profileAction);
    expect(window.location.pathname).toBe('/');
  });
});
