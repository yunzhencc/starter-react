import { describe, expect, it } from 'vitest';
import { callViewTransition, getResolvedTheme, getThemeTransitionAnimation, themeMenuModes } from './theme';

describe('theme mode', () => {
  it('uses Ant Design website ordering for the theme menu', () => {
    expect(themeMenuModes).toEqual(['system', 'light', 'dark']);
  });

  it('resolves the Vben automatic mode from the system preference', () => {
    expect(getResolvedTheme('light', true)).toBe('light');
    expect(getResolvedTheme('dark', false)).toBe('dark');
    expect(getResolvedTheme('system', true)).toBe('dark');
    expect(getResolvedTheme('system', false)).toBe('light');
  });

  it('keeps the document receiver when starting a view transition', () => {
    const documentRoot = {};
    const update = () => undefined;
    const transition = function (this: object, callback: () => void) {
      callback();
      return this;
    };

    expect(callViewTransition(documentRoot, transition, update)).toBe(documentRoot);
  });

  it('uses the outgoing theme to choose the visible transition snapshot', () => {
    const clipPath = ['circle(0px)', 'circle(100px)'];

    expect(getThemeTransitionAnimation(false, clipPath)).toEqual({
      clipPath,
      pseudoElement: '::view-transition-new(root)',
    });
    expect(getThemeTransitionAnimation(true, clipPath)).toEqual({
      clipPath: [...clipPath].reverse(),
      pseudoElement: '::view-transition-old(root)',
    });
  });
});
