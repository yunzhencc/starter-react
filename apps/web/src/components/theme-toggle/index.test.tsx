import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ThemeToggle } from './index';

const theme = vi.hoisted(() => ({
  resolvedTheme: 'dark',
  setTheme: vi.fn(),
}));

vi.mock('next-themes', () => ({ useTheme: () => theme }));

afterEach(() => {
  theme.resolvedTheme = 'dark';
  theme.setTheme.mockClear();
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
});
