import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ThemeToggle } from './index';

interface AppearanceTransition {
  ready: Promise<void>;
}

interface DocumentWithViewTransition {
  startViewTransition?: (callback: () => void) => AppearanceTransition;
}

const theme = vi.hoisted(() => ({
  resolvedTheme: 'dark',
  setTheme: vi.fn(),
}));
const documentWithViewTransition = document as unknown as DocumentWithViewTransition;

vi.mock('next-themes', () => ({ useTheme: () => theme }));

afterEach(() => {
  cleanup();
  delete documentWithViewTransition.startViewTransition;
  delete (document.documentElement as unknown as { animate?: Element['animate'] }).animate;
  document.documentElement.classList.remove('dark', 'light');
  theme.resolvedTheme = 'dark';
  theme.setTheme.mockClear();
  vi.unstubAllGlobals();
});

describe('theme toggle', () => {
  it('switches from dark to light through the theme control', () => {
    render(<ThemeToggle />);

    fireEvent.click(screen.getByRole('button', { name: '切换至浅色主题' }));

    expect(theme.setTheme).toHaveBeenCalledWith('light');
  });

  it('switches from light to dark through the theme control', () => {
    theme.resolvedTheme = 'light';
    render(<ThemeToggle />);

    fireEvent.click(screen.getByRole('button', { name: '切换至深色主题' }));

    expect(theme.setTheme).toHaveBeenCalledWith('dark');
  });

  it('reveals the target theme from the clicked position when view transitions are supported', async () => {
    const animate = vi.fn(() => ({}));
    const startViewTransition = vi.fn((callback: () => void) => {
      callback();
      return { ready: Promise.resolve() };
    });
    documentWithViewTransition.startViewTransition = startViewTransition;
    Object.defineProperty(document.documentElement, 'animate', { configurable: true, value: animate });
    document.documentElement.classList.add('dark');
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })));

    render(<ThemeToggle />);

    fireEvent.click(screen.getByRole('button', { name: '切换至浅色主题' }), { clientX: 12, clientY: 24, detail: 1 });

    await Promise.resolve();

    expect(startViewTransition).toHaveBeenCalledOnce();
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(animate).toHaveBeenCalledWith(
      expect.objectContaining({ clipPath: expect.any(Array) }),
      expect.objectContaining({ duration: 500, pseudoElement: '::view-transition-old(root)' }),
    );
  });
});
