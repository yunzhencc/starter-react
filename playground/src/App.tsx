import { createRootRoute, createRoute, createRouter, redirect, RouterProvider } from '@tanstack/react-router';
import { BasicLayout } from '@yunzhen/layouts';
import { LockScreen, LockScreenModal } from '@yunzhen/layouts/widgets';
import { loadLocaleMessages, useTranslation } from '@yunzhen/locales';
import { setAccessMenus, useLockScreen } from '@yunzhen/stores';
import { useEffect, useState } from 'react';

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

function PlaygroundLayout() {
  const { isLocked } = useLockScreen();
  const [lockScreenModalOpen, setLockScreenModalOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isLocked && event.altKey && event.code === 'KeyL' && !event.repeat) {
        event.preventDefault();
        setLockScreenModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLocked]);

  return (
    <>
      <BasicLayout
        brand={<button className="brand" type="button">Playground</button>}
        headerActions={<button aria-label="锁定屏幕" className="header-icon-button" title="锁定屏幕" type="button" onClick={() => setLockScreenModalOpen(true)}>锁屏</button>}
        lockScreen={<LockScreen avatar="/favicon.svg" avatarAlt="Playground" />}
      />
      <LockScreenModal avatar="/favicon.svg" avatarAlt="Playground" open={lockScreenModalOpen} onOpenChange={setLockScreenModalOpen} />
    </>
  );
}

const rootRoute = createRootRoute({
  component: PlaygroundLayout,
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
