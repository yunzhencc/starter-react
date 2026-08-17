import type { PropsWithChildren } from 'react';
import { useTheme } from 'next-themes';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';

function layoutScrollbarsOptions(isDark: boolean) {
  return {
    scrollbars: {
      autoHide: 'scroll' as const,
      clickScroll: true,
      theme: isDark ? 'os-theme-light' : 'os-theme-dark',
    },
  };
}

export function LayoutScrollArea({ children }: PropsWithChildren) {
  const { resolvedTheme } = useTheme();

  return (
    <OverlayScrollbarsComponent
      className="admin-content"
      defer
      element="section"
      id="__vben_layout_scroll"
      options={layoutScrollbarsOptions(resolvedTheme === 'dark')}
    >
      {children}
    </OverlayScrollbarsComponent>
  );
}
