import { describe, expect, it } from 'vitest';
import { getAppRoute } from './route-definitions';

describe('app route definitions', () => {
  it('normalizes the dashboard path and exposes Vben-style tab metadata', () => {
    expect(getAppRoute('/dashboard/')).toMatchObject({
      affix: true,
      keepAlive: true,
      path: '/dashboard',
      title: '分析页',
    });
  });

  it('excludes authentication routes from the application shell', () => {
    expect(getAppRoute('/login')).toBeUndefined();
  });
});
