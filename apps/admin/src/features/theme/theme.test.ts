import { describe, expect, it } from 'vitest';
import { callViewTransition, getResolvedTheme } from './theme';

describe('theme mode', () => {
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
});
