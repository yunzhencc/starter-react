import { describe, expect, it } from 'vitest';
import { createTabState } from './tab-model';

describe('@yunzhen/layouts tab model', () => {
  it('keeps the affixed route when closing all tabs', () => {
    const tabs = createTabState();
    tabs.open({ affix: true, path: '/home', title: 'Home' });
    tabs.open({ path: '/editor', title: 'Editor' });

    tabs.closeAll();

    expect(tabs.items).toEqual([
      expect.objectContaining({ affix: true, path: '/home' }),
    ]);
  });
});
