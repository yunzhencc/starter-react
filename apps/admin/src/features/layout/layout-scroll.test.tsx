import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { LayoutScrollArea } from './layout-scroll';

describe('layout scroll area', () => {
  it('owns the Vben-compatible layout scroll target', () => {
    const markup = renderToStaticMarkup(
      <LayoutScrollArea>
        <div>page</div>
      </LayoutScrollArea>,
    );

    expect(markup).toContain('id="__vben_layout_scroll"');
    expect(markup).toContain('class="admin-content"');
    expect(markup).toContain('data-overlayscrollbars-contents=""');
  });
});
