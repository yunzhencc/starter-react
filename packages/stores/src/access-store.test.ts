import { afterEach, describe, expect, it } from 'vitest';
import { getAccessMenus, resetAccessMenus, setAccessMenus } from './access-store';

afterEach(resetAccessMenus);

describe('@yunzhen/stores access menus', () => {
  it('keeps menu registration outside a layout adapter', () => {
    setAccessMenus([{ affix: true, path: '/dashboard', title: '分析页' }]);

    expect(getAccessMenus()).toEqual([{ affix: true, path: '/dashboard', title: '分析页' }]);
  });
});
