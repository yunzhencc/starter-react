import type { PropsWithChildren } from 'react';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';

const layoutScrollbarsOptions = {
  scrollbars: {
    autoHide: 'scroll' as const,
    clickScroll: true,
  },
};

export function LayoutScrollArea({ children }: PropsWithChildren) {
  return (
    <OverlayScrollbarsComponent
      className="admin-content"
      defer
      element="section"
      id="__vben_layout_scroll"
      options={layoutScrollbarsOptions}
    >
      {children}
    </OverlayScrollbarsComponent>
  );
}
