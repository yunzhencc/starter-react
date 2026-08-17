import { describe, expect, it } from 'vitest';
import { getLoginRedirect, getSafeRedirect } from './redirect';

describe('auth redirects', () => {
  it('preserves local paths and query strings', () => {
    expect(getLoginRedirect('/examples/slate', '?mode=edit')).toBe('/examples/slate?mode=edit');
    expect(getSafeRedirect('/examples/slate?mode=edit')).toBe('/examples/slate?mode=edit');
  });

  it('uses the dashboard for missing or external return locations', () => {
    expect(getSafeRedirect(undefined)).toBe('/dashboard');
    expect(getSafeRedirect('https://attacker.test')).toBe('/dashboard');
    expect(getSafeRedirect('//attacker.test')).toBe('/dashboard');
  });
});
