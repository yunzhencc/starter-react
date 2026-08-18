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

  it('keeps the avatar right edge aligned with Vben', () => {
    const styles = readFileSync(new URL('./admin-layout.css', import.meta.url), 'utf8');

    expect(styles).toMatch(/\.admin-header[^}]*padding: 0 0 0 8px/);
    expect(styles).toMatch(/\.user-dropdown__trigger[^}]*margin: 0 8px 0 4px/);
  });

  it('uses compact icon menu items for tab actions', () => {
    const layout = readFileSync(new URL('./admin-layout.tsx', import.meta.url), 'utf8');
    const styles = readFileSync(new URL('./admin-layout.css', import.meta.url), 'utf8');

    expect(layout).toContain('<CloseOutlined />');
    expect(layout).toContain('<DoubleLeftOutlined />');
    expect(layout).toContain('<DoubleRightOutlined />');
    expect(layout).toContain('<ColumnWidthOutlined />');
    expect(layout).toContain('<SwapOutlined />');
    expect(styles).toMatch(/\.tab-menu button[^}]*height: 32px[^}]*padding: 6px 24px 6px 8px/);
    expect(styles).toMatch(/\.tab-menu button[^}]*margin-bottom: 0/);
  });

  it('keeps the more-actions menu inside the viewport', () => {
    const layout = readFileSync(new URL('./admin-layout.tsx', import.meta.url), 'utf8');
    const styles = readFileSync(new URL('./admin-layout.css', import.meta.url), 'utf8');

    expect(layout).toContain('Math.max(4, Math.min(rect.left, window.innerWidth - 168))');
    expect(layout).toContain('Math.max(4, Math.min(rect.bottom + 4, window.innerHeight - 320))');
    expect(styles).toMatch(/\.tab-menu[^}]*max-width: calc\(100vw - 8px\)/);
  });

  it('closes tab actions when activating a tab', () => {
    const layout = readFileSync(new URL('./admin-layout.tsx', import.meta.url), 'utf8');

    expect(layout).toMatch(/onActivate=\{\(key\) => \{\s+setContextTab\(undefined\);/);
  });
});
