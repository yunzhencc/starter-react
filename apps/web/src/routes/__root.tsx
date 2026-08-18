import { TanStackDevtools } from '@tanstack/react-devtools';
import { createRootRoute, HeadContent, Scripts } from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { ThemeProvider } from 'next-themes';
import { BodyScrollbars } from '@/features/layout/body-scrollbars';
import appCss from '@/styles/app.css?url';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'TanStack Start Starter',
      },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
    ],
  }),
  notFoundComponent: () => (
    <main>
      <h1>Page not found</h1>
    </main>
  ),
  shellComponent: RootDocument,
});

// eslint-disable-next-line react-refresh/only-export-components
function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html data-overlayscrollbars-initialize lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body data-overlayscrollbars-initialize suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableColorScheme
          enableSystem
          storageKey="starter-react:theme"
          themes={['light', 'dark']}
        >
          <BodyScrollbars />
          {children}
          <TanStackDevtools
            config={{
              position: 'bottom-right',
            }}
            plugins={[
              {
                name: 'Tanstack Router',
                render: <TanStackRouterDevtoolsPanel />,
              },
            ]}
          />
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}
