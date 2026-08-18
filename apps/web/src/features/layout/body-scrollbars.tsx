import { useTheme } from 'next-themes';
import { OverlayScrollbars } from 'overlayscrollbars';
import { useEffect } from 'react';

export function BodyScrollbars() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const instance = OverlayScrollbars(document.body, {
      cancel: { body: null },
      scrollbars: {
        autoHide: 'scroll',
        clickScroll: true,
        theme: resolvedTheme === 'dark' ? 'os-theme-light' : 'os-theme-dark',
      },
    });

    return () => instance.destroy();
  }, [resolvedTheme]);

  return null;
}
