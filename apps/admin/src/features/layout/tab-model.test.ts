import { describe, expect, it } from 'vitest';
import { createTabState, getTabKey } from './tab-model';

describe('tab model', () => {
  it('uses pageKey before full path and path for a tab key', () => {
    expect(getTabKey({ fullPath: '/examples/slate?mode=edit', path: '/examples/slate' })).toBe(
      '/examples/slate?mode=edit',
    );
    expect(getTabKey({ fullPath: '/examples/slate?pageKey=copy%201', path: '/examples/slate', search: { pageKey: 'copy%201' } })).toBe('copy 1');
    expect(getTabKey({ fullPath: '/examples/slate?mode=edit', fullPathKey: false, path: '/examples/slate' })).toBe(
      '/examples/slate',
    );
  });

  it('clears a stored icon when the current route has none', () => {
    const tabs = createTabState();
    tabs.open({ icon: 'document', path: '/examples/slate', title: 'Slate 编辑器' });
    tabs.open({ path: '/examples/slate', title: 'Slate 编辑器' });

    expect(tabs.items[0]?.icon).toBeUndefined();
  });

  it('keeps affixed tabs, de-duplicates routes, and activates the next available tab when closing', () => {
    const tabs = createTabState();
    tabs.open({ path: '/dashboard', title: '分析页', affix: true });
    tabs.open({ path: '/examples/slate', title: 'Slate' });
    tabs.open({ fullPath: '/examples/slate?mode=edit', path: '/examples/slate', title: 'Slate' });
    tabs.open({ path: '/examples/slate', title: 'Slate 已更新' });

    expect(tabs.items.map(tab => tab.key)).toEqual([
      '/dashboard',
      '/examples/slate',
      '/examples/slate?mode=edit',
    ]);
    expect(tabs.close('/dashboard')).toBeUndefined();
    expect(tabs.close('/examples/slate')).toBe('/examples/slate?mode=edit');
    expect(tabs.items.map(tab => tab.key)).toEqual(['/dashboard', '/examples/slate?mode=edit']);
  });

  it('preserves affixed tabs when closing in bulk and moves a newly pinned tab before regular tabs', () => {
    const tabs = createTabState();
    tabs.open({ path: '/dashboard', title: '分析页', affix: true });
    tabs.open({ path: '/examples/slate', title: 'Slate' });
    tabs.open({ path: '/examples/lexical', title: 'Lexical' });

    tabs.pin('/examples/lexical');
    tabs.closeOthers('/examples/slate');

    expect(tabs.items.map(tab => tab.key)).toEqual(['/dashboard', '/examples/lexical', '/examples/slate']);
    expect(tabs.items.find(tab => tab.key === '/examples/lexical')?.affix).toBe(true);

    tabs.closeRight('/dashboard');
    expect(tabs.items.map(tab => tab.key)).toEqual(['/dashboard', '/examples/lexical']);

    tabs.unpin('/examples/lexical');
    expect(tabs.closeAll()).toBe('/dashboard');
    expect(tabs.items.map(tab => tab.key)).toEqual(['/dashboard']);
  });

  it('only reorders regular tabs', () => {
    const tabs = createTabState();
    tabs.open({ path: '/dashboard', title: '分析页', affix: true });
    tabs.open({ path: '/examples/slate', title: 'Slate' });
    tabs.open({ path: '/examples/lexical', title: 'Lexical' });

    tabs.reorder('/examples/lexical', '/examples/slate');

    expect(tabs.items.map(tab => tab.key)).toEqual([
      '/dashboard',
      '/examples/lexical',
      '/examples/slate',
    ]);
  });

  it('accepts motion reorder results without moving affixed tabs', () => {
    const tabs = createTabState();
    tabs.open({ path: '/dashboard', title: '分析页', affix: true });
    tabs.open({ path: '/examples/slate', title: 'Slate' });
    tabs.open({ path: '/examples/lexical', title: 'Lexical' });

    tabs.reorderByKeys(['/examples/lexical', '/dashboard', '/examples/slate']);

    expect(tabs.items.map(tab => tab.key)).toEqual([
      '/dashboard',
      '/examples/lexical',
      '/examples/slate',
    ]);
  });

  it('restores persisted tabs and visit history', () => {
    const tabs = createTabState();
    tabs.open({ path: '/dashboard', title: '分析页', affix: true });
    tabs.open({ path: '/examples/slate', title: 'Slate' });

    const restored = createTabState(tabs.snapshot());

    expect(restored.activeKey).toBe('/examples/slate');
    expect(restored.history).toEqual(['/dashboard', '/examples/slate']);
    expect(restored.items.map(tab => tab.key)).toEqual(['/dashboard', '/examples/slate']);
  });

  it('keeps affixed tabs when closing tabs to the left', () => {
    const tabs = createTabState();
    tabs.open({ path: '/dashboard', title: '分析页', affix: true });
    tabs.open({ path: '/examples/slate', title: 'Slate' });
    tabs.open({ path: '/examples/lexical', title: 'Lexical' });

    tabs.closeLeft('/examples/lexical');

    expect(tabs.items.map(tab => tab.key)).toEqual([
      '/dashboard',
      '/examples/lexical',
    ]);
  });
});
