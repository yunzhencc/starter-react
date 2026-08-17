import { describe, expect, it } from 'vitest';
import { appMenuItems, getAppRoute } from './route-definitions';

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

  it('groups editor routes below the demo menu', () => {
    expect(appMenuItems).toContainEqual({
      children: [
        expect.objectContaining({ path: '/examples/slate' }),
        expect.objectContaining({ path: '/examples/lexical' }),
      ],
      icon: 'document',
      key: 'examples',
      title: '演示',
    });
  });
});
