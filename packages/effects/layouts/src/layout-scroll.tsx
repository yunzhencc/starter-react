import type { PropsWithChildren } from 'react';
import { useIsDark } from '@yunzhen/preferences';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';

export function LayoutScrollArea({ children }: PropsWithChildren) {
  const isDark = useIsDark();

  return (
    <OverlayScrollbarsComponent
      className="admin-content"
      defer
      element="section"
      id="__vben_layout_scroll"
      options={{
        scrollbars: {
          autoHide: 'scroll',
          clickScroll: true,
          theme: isDark ? 'os-theme-light' : 'os-theme-dark',
        },
      }}
    >
      {children}
    </OverlayScrollbarsComponent>
  );
}
