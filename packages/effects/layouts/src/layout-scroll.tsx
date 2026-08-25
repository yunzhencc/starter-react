import type { PropsWithChildren } from 'react';
import { useTheme } from 'next-themes';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';

export function LayoutScrollArea({ children }: PropsWithChildren) {
  const { resolvedTheme } = useTheme();

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
          theme: resolvedTheme === 'dark' ? 'os-theme-light' : 'os-theme-dark',
        },
      }}
    >
      {children}
    </OverlayScrollbarsComponent>
  );
}
