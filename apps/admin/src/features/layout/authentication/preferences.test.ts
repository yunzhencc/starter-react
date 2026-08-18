import { afterEach, describe, expect, it } from 'vitest';
import { getAuthPageLayout, setAuthPageLayout } from './preferences';

afterEach(() => localStorage.clear());

describe('auth page layout preference', () => {
  it('uses panel-right until a valid layout is selected', () => {
    expect(getAuthPageLayout()).toBe('panel-right');

    setAuthPageLayout('panel-left');

    expect(getAuthPageLayout()).toBe('panel-left');
  });

  it('falls back to panel-right for malformed storage', () => {
    localStorage.setItem('starter-react:auth-page-layout', 'bottom');

    expect(getAuthPageLayout()).toBe('panel-right');
  });
});
