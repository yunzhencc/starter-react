import type { ReactNode } from 'react';
import { theme as antdTheme, ConfigProvider } from 'antd';
import { ThemeProvider, useTheme } from 'next-themes';
import { toHsl } from './theme';

function readAntdTokens() {
  if (typeof document === 'undefined') {
    return {};
  }
  const styles = getComputedStyle(document.documentElement);
  const hsl = (name: string) => toHsl(styles.getPropertyValue(name));
  return {
    borderRadius: Number.parseFloat(styles.getPropertyValue('--radius')) * 16,
    colorBgBase: hsl('--background-deep'),
    colorBgContainer: hsl('--card'),
    colorBgElevated: hsl('--popover'),
    colorBorder: hsl('--border'),
    colorError: hsl('--destructive'),
    colorPrimary: hsl('--primary'),
    colorSuccess: hsl('--success'),
    colorText: hsl('--foreground'),
    colorTextSecondary: hsl('--muted-foreground'),
    colorWarning: hsl('--warning'),
  };
}

function AntdThemeProvider({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const tokens = readAntdTokens();

  const config = {
    algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    components: {
      Menu: {
        collapsedIconSize: 14,
        itemMarginInline: 8,
      },
    },
    token: tokens,
  };

  return <ConfigProvider theme={config}>{children}</ConfigProvider>;
}

export function AppThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableColorScheme
      enableSystem
      storageKey="starter-react:theme"
      themes={['light', 'dark']}
    >
      <AntdThemeProvider>{children}</AntdThemeProvider>
    </ThemeProvider>
  );
}
