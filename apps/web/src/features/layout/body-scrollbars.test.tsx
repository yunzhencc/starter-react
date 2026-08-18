import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BodyScrollbars } from './body-scrollbars';

const { destroy, initialize } = vi.hoisted(() => {
  const destroy = vi.fn();
  return {
    destroy,
    initialize: vi.fn(() => ({ destroy })),
  };
});
const theme = vi.hoisted(() => ({ resolvedTheme: 'light' }));

vi.mock('overlayscrollbars', () => ({ OverlayScrollbars: initialize }));
vi.mock('next-themes', () => ({ useTheme: () => theme }));

describe('body scrollbars', () => {
  afterEach(() => {
    destroy.mockClear();
    initialize.mockClear();
    theme.resolvedTheme = 'light';
  });

  it('updates the body scrollbar theme when the resolved theme changes', () => {
    const { rerender, unmount } = render(<BodyScrollbars />);

    expect(initialize).toHaveBeenCalledWith(document.body, {
      scrollbars: { autoHide: 'scroll', clickScroll: true, theme: 'os-theme-dark' },
    });

    theme.resolvedTheme = 'dark';
    rerender(<BodyScrollbars />);

    expect(destroy).toHaveBeenCalledOnce();
    expect(initialize).toHaveBeenLastCalledWith(document.body, {
      scrollbars: { autoHide: 'scroll', clickScroll: true, theme: 'os-theme-light' },
    });

    unmount();

    expect(destroy).toHaveBeenCalledTimes(2);
  });
});
