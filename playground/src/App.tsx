import { createRootRoute, createRoute, createRouter, redirect, RouterProvider } from '@tanstack/react-router';
import { BasicLayout } from '@yunzhen/layouts';
import { loadLocaleMessages, useTranslation } from '@yunzhen/locales';
import { setAccessMenus } from '@yunzhen/stores';

const menuItems = [
  { affix: true, path: '/locales', title: '国际化' },
];

setAccessMenus(menuItems);

function LocalesExample() {
  const { t } = useTranslation();

  return (
    <main>
      <h1>{t('ui.back')}</h1>
      <button type="button" onClick={() => void loadLocaleMessages('zh-CN')}>简体中文</button>
      <button type="button" onClick={() => void loadLocaleMessages('en-US')}>English</button>
    </main>
  );
}

const rootRoute = createRootRoute({
  component: () => (
    <BasicLayout
      brand={<button className="brand" type="button">Playground</button>}
    />
  ),
});

const localesRoute = createRoute({
  component: LocalesExample,
  getParentRoute: () => rootRoute,
  path: 'locales',
});

const indexRoute = createRoute({
  beforeLoad: () => {
    throw redirect({ to: '/locales' });
  },
  getParentRoute: () => rootRoute,
  path: '/',
});

export const router = createRouter({ routeTree: rootRoute.addChildren([indexRoute, localesRoute]) });

function App() {
  return <RouterProvider router={router} />;
}

export default App;
