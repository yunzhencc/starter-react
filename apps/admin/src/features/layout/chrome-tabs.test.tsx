import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ChromeTabs } from './chrome-tabs';

describe('chrome tabs', () => {
  it('renders Vben chrome tab layers and affix controls', () => {
    const markup = renderToStaticMarkup(
      <ChromeTabs
        activeKey="/about"
        onActivate={() => undefined}
        onClose={() => undefined}
        onContextMenu={() => undefined}
        onReorder={() => undefined}
        onUnpin={() => undefined}
        tabs={[
          { affix: true, key: '/dashboard', path: '/dashboard', title: '分析页' },
          { key: '/about', path: '/about', title: '关于' },
        ]}
      />,
    );

    expect(markup).toContain('class="vben-tabs-content tabs-chrome"');
    expect(markup).toContain('data-tab-item="true"');
    expect(markup).toContain('tabs-chrome__background-content');
    expect(markup).toContain('tabs-chrome__background-before');
    expect(markup).toContain('tabs-chrome__background-after');
    expect(markup).toContain('is-active');
    expect(markup).toContain('aria-label="取消固定 分析页"');
    expect(markup).toContain('aria-label="关闭 关于"');
  });
});
