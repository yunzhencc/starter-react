import { readFileSync } from 'node:fs';
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
          { affix: true, icon: 'analytics', key: '/dashboard', path: '/dashboard', title: '分析页' },
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
    expect(markup).toContain('data-route-icon="analytics"');
    expect(markup).toContain('aria-label="取消固定 分析页"');
    expect(markup).toContain('aria-label="关闭 关于"');
  });

  it('uses Vben-aligned close control spacing', () => {
    const styles = readFileSync(new URL('./admin-layout.css', import.meta.url), 'utf8');

    expect(styles).toMatch(/\.tabs-chrome__extra[^}]*right: 14px/);
    expect(styles).toMatch(/\.tabs-chrome__extra svg[^}]*font-size: 10px/);
  });
});
