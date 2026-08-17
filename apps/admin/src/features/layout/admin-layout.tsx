import type { ElementType, MouseEvent } from 'react';
import type { Tab, TabStateSnapshot } from './tab-model';
import {
  AppstoreOutlined,
  AreaChartOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CompressOutlined,
  ExpandOutlined,
  FullscreenOutlined,
  LinkOutlined,
  LockOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MoreOutlined,
  PushpinOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { motion } from 'motion/react';
import { lazy, Suspense, useEffect, useLayoutEffect, useReducer, useRef, useState } from 'react';
import { logout as clearSession } from '@/features/auth/session';
import { ThemeToggle } from '@/features/theme/theme-toggle';
import { DashboardView } from '@/views/dashboard';
import { ChromeTabs } from './chrome-tabs';
import { LayoutScrollArea } from './layout-scroll';
import { getStoredLockScreen, LockScreen, persistLockScreen, SetLockScreenModal } from './lock-screen';
import { appRoutes, getAppRoute } from './route-definitions';
import { createTabState, getTabKey } from './tab-model';
import './admin-layout.css';

const SlateView = lazy(() => import('@yunzhen/playground/pages/slate/text-area'));
const LexicalView = lazy(() => import('@yunzhen/playground/pages/lexical/basic'));

const pageViews: Record<string, ElementType> = {
  '/dashboard': DashboardView,
  '/examples/lexical': LexicalView,
  '/examples/slate': SlateView,
};

const storageKey = 'starter-react:tabbar';

function getStoredTabs() {
  if (typeof window === 'undefined') {
    return createTabState();
  }

  try {
    const snapshot = JSON.parse(window.sessionStorage.getItem(storageKey) ?? 'null') as TabStateSnapshot | null;
    if (!snapshot) {
      return createTabState();
    }
    return createTabState({
      activeKey: snapshot.activeKey,
      history: snapshot.history.filter(key => typeof key === 'string'),
      items: snapshot.items.filter(tab => getAppRoute(tab.path)),
    });
  }
  catch {
    return createTabState();
  }
}

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const tabs = useRef(getStoredTabs()).current;
  const [revision, render] = useReducer(value => value + 1, 0);
  const [collapsed, setCollapsed] = useState(false);
  const [contextTab, setContextTab] = useState<string>();
  const [contextMenuPosition, setContextMenuPosition] = useState({ left: 0, top: 0 });
  const [maximized, setMaximized] = useState(false);
  const [lockScreen, setLockScreen] = useState(getStoredLockScreen);
  const [lockScreenModalOpen, setLockScreenModalOpen] = useState(false);
  const [refreshVersion, setRefreshVersion] = useState<Record<string, number>>({});
  const route = getAppRoute(location.pathname);
  const fullPath = route ? `${route.path}${location.searchStr}` : '';
  const currentKey = route
    ? getTabKey({ ...route, fullPath, search: Object.fromEntries(new URLSearchParams(location.searchStr)) })
    : '';
  const tabViewportRef = useRef<HTMLDivElement>(null);
  const [pageTransition, setPageTransition] = useState({ displayedKey: currentKey, leavingKey: '' });
  const [tabScroll, setTabScroll] = useState({ left: true, overflow: false, right: true });

  useEffect(() => {
    if (!route) {
      return;
    }
    tabs.open({
      ...route,
      fullPath,
      search: Object.fromEntries(new URLSearchParams(location.searchStr)),
    });
    render();
  }, [fullPath, location.searchStr, route, tabs]);

  useEffect(() => {
    window.sessionStorage.setItem(storageKey, JSON.stringify(tabs.snapshot()));
  }, [revision, tabs]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!lockScreen.isLocked && event.altKey && event.code === 'KeyL' && !event.repeat) {
        event.preventDefault();
        setLockScreenModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lockScreen.isLocked]);

  useEffect(() => {
    if (!contextTab) {
      return;
    }
    const closeMenu = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Element && target.closest('.tab-menu, [data-tab-item], .tab-tools')) {
        return;
      }
      setContextTab(undefined);
    };
    window.addEventListener('pointerdown', closeMenu);
    return () => window.removeEventListener('pointerdown', closeMenu);
  }, [contextTab]);

  useEffect(() => {
    if (!currentKey) {
      return;
    }
    setPageTransition((previous) => {
      if (previous.displayedKey === currentKey) {
        return previous;
      }
      return { displayedKey: currentKey, leavingKey: previous.displayedKey };
    });
    const timeout = window.setTimeout(() => {
      setPageTransition(previous => previous.displayedKey === currentKey
        ? { ...previous, leavingKey: '' }
        : previous);
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [currentKey]);

  useLayoutEffect(() => {
    const viewport = tabViewportRef.current;
    if (!viewport) {
      return;
    }
    const sync = () => {
      const overflow = viewport.scrollWidth > viewport.clientWidth;
      setTabScroll({
        left: viewport.scrollLeft <= 0,
        overflow,
        right: viewport.scrollLeft + viewport.clientWidth >= viewport.scrollWidth - 1,
      });
    };
    const observer = new ResizeObserver(sync);
    observer.observe(viewport);
    sync();
    requestAnimationFrame(() => {
      viewport.querySelector<HTMLElement>('.tabs-chrome__item.is-active')?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start',
      });
      sync();
    });
    return () => observer.disconnect();
  }, [currentKey, revision]);

  const visibleTabs = tabs.items;

  function goTo(tab: Tab) {
    void navigate({ to: (tab.fullPath ?? tab.path) as never });
  }

  function close(key: string) {
    const destination = tabs.close(key);
    setContextTab(undefined);
    render();
    if (destination) {
      void navigate({ to: destination as never });
    }
  }

  function closeWith(action: 'all' | 'left' | 'others' | 'right', key: string) {
    const previousActive = tabs.activeKey;
    if (action === 'all') {
      tabs.closeAll();
    }
    else if (action === 'left') {
      tabs.closeLeft(key);
    }
    else if (action === 'others') {
      tabs.closeOthers(key);
    }
    else {
      tabs.closeRight(key);
    }
    setContextTab(undefined);
    render();
    if (previousActive !== tabs.activeKey && tabs.activeKey) {
      void navigate({ to: tabs.activeKey as never });
    }
  }

  function togglePin(tab: Tab) {
    if (tab.affix) {
      tabs.unpin(tab.key);
    }
    else {
      tabs.pin(tab.key);
    }
    setContextTab(undefined);
    render();
  }

  function refresh(key: string) {
    setContextTab(undefined);
    setRefreshVersion(versions => ({ ...versions, [key]: (versions[key] ?? 0) + 1 }));
  }

  function openInNewWindow(tab: Tab) {
    window.open(tab.fullPath ?? tab.path, '_blank', 'noopener,noreferrer');
    setContextTab(undefined);
  }

  function openContextMenu(event: MouseEvent<HTMLElement>, tab: Tab) {
    event.preventDefault();
    setContextTab(tab.key);
    setContextMenuPosition({
      left: Math.min(event.clientX, window.innerWidth - 184),
      top: Math.min(event.clientY, window.innerHeight - 330),
    });
  }

  function openCurrentTabMenu(event: MouseEvent<HTMLButtonElement>) {
    const tab = visibleTabs.find(item => item.key === currentKey);
    if (!tab) {
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    setContextTab(tab.key);
    setContextMenuPosition({ left: rect.right - 176, top: rect.bottom + 4 });
  }

  function scrollTabs(direction: 'left' | 'right') {
    const viewport = tabViewportRef.current;
    if (!viewport) {
      return;
    }
    viewport.scrollBy({
      behavior: 'smooth',
      left: (viewport.clientWidth - 150) * (direction === 'left' ? -1 : 1),
    });
  }

  function lock(password: string) {
    const next = { isLocked: true, password };
    setLockScreen(next);
    persistLockScreen(next);
    setLockScreenModalOpen(false);
  }

  function unlock() {
    setLockScreen({ isLocked: false });
    persistLockScreen({ isLocked: false });
  }

  function logout() {
    clearSession();
    unlock();
    void navigate({ replace: true, to: '/login' });
  }

  return (
    <div className={`admin-layout ${collapsed ? 'admin-layout--collapsed' : ''} ${maximized ? 'admin-layout--maximized' : ''}`}>
      <aside className="admin-sidebar">
        <button className="brand" type="button" onClick={() => void navigate({ to: '/dashboard' })}>
          <span className="brand-mark"><img alt="" src="/logo.svg" /></span>
          <span className="brand-name">React Starter</span>
        </button>
        <nav aria-label="主菜单" className="admin-menu">
          {appRoutes.map((item) => {
            const active = location.pathname.startsWith(item.path);
            return (
              <button
                className={active ? 'admin-menu-item admin-menu-item--active' : 'admin-menu-item'}
                key={item.path}
                title={item.title}
                type="button"
                onClick={() => void navigate({ to: item.path as never })}
              >
                {item.icon === 'analytics' ? <AreaChartOutlined /> : <AppstoreOutlined />}
                <span>{item.title}</span>
              </button>
            );
          })}
        </nav>
        <button className="sidebar-collapse" type="button" onClick={() => setCollapsed(value => !value)}>
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          <span>收起菜单</span>
        </button>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div className="breadcrumb">
            工作台
            <span>/</span>
            {' '}
            {route?.title}
          </div>
          <div className="header-actions">
            <ThemeToggle />
            <button aria-label="锁定屏幕" className="header-icon-button" title="锁定屏幕" type="button" onClick={() => setLockScreenModalOpen(true)}>
              <LockOutlined />
            </button>
          </div>
        </header>

        <section className="tabbar" aria-label="已打开的页签">
          {tabScroll.overflow && (
            <button
              aria-label="向左滚动页签"
              className="tab-scroll-button tab-scroll-button--left"
              disabled={tabScroll.left}
              type="button"
              onClick={() => scrollTabs('left')}
            >
              <ArrowLeftOutlined />
            </button>
          )}
          <div
            className={`tab-list ${!tabScroll.left ? 'tab-list--shadow-left' : ''} ${!tabScroll.right ? 'tab-list--shadow-right' : ''}`}
            ref={tabViewportRef}
            onScroll={() => {
              const viewport = tabViewportRef.current;
              if (!viewport)
                return;
              setTabScroll({
                left: viewport.scrollLeft <= 0,
                overflow: viewport.scrollWidth > viewport.clientWidth,
                right: viewport.scrollLeft + viewport.clientWidth >= viewport.scrollWidth - 1,
              });
            }}
            onWheel={(event) => {
              event.preventDefault();
              event.currentTarget.scrollBy({ left: event.deltaY * 3 });
            }}
          >
            <ChromeTabs
              activeKey={currentKey}
              tabs={visibleTabs}
              onActivate={(key) => {
                const tab = visibleTabs.find(item => item.key === key);
                if (tab)
                  goTo(tab);
              }}
              onClose={close}
              onContextMenu={openContextMenu}
              onReorder={(keys) => {
                tabs.reorderByKeys(keys);
                render();
              }}
              onUnpin={togglePin}
            />
          </div>
          {tabScroll.overflow && (
            <button
              aria-label="向右滚动页签"
              className="tab-scroll-button tab-scroll-button--right"
              disabled={tabScroll.right}
              type="button"
              onClick={() => scrollTabs('right')}
            >
              <ArrowRightOutlined />
            </button>
          )}
          <div className="tab-tools">
            <button aria-label="更多页签操作" type="button" onClick={openCurrentTabMenu}><MoreOutlined /></button>
            <button aria-label="刷新当前页面" type="button" onClick={() => currentKey && refresh(currentKey)}><ReloadOutlined /></button>
            <button aria-label="切换内容最大化" type="button" onClick={() => setMaximized(value => !value)}>
              {maximized ? <CompressOutlined /> : <ExpandOutlined />}
            </button>
          </div>
        </section>

        {contextTab && (() => {
          const tab = visibleTabs.find(item => item.key === contextTab);
          if (!tab) {
            return null;
          }
          return (
            <div className="tab-menu" role="menu" style={contextMenuPosition}>
              <button disabled={tab.affix || visibleTabs.length < 2} role="menuitem" type="button" onClick={() => close(tab.key)}><span>关闭</span></button>
              <button role="menuitem" type="button" onClick={() => togglePin(tab)}>
                <PushpinOutlined />
                <span>{tab.affix ? '取消固定' : '固定'}</span>
              </button>
              <button
                role="menuitem"
                type="button"
                onClick={() => {
                  if (!maximized)
                    goTo(tab);
                  setMaximized(value => !value);
                  setContextTab(undefined);
                }}
              >
                <FullscreenOutlined />
                <span>{maximized ? '还原最大化' : '最大化'}</span>
              </button>
              <button role="menuitem" type="button" onClick={() => refresh(tab.key)}>
                <ReloadOutlined />
                <span>重新加载</span>
              </button>
              <button role="menuitem" type="button" onClick={() => openInNewWindow(tab)}>
                <LinkOutlined />
                <span>在新窗口打开</span>
              </button>
              <div role="separator" />
              <button disabled={!visibleTabs.slice(0, visibleTabs.indexOf(tab)).some(item => !item.affix)} role="menuitem" type="button" onClick={() => closeWith('left', tab.key)}><span>关闭左侧标签页</span></button>
              <button disabled={!visibleTabs.slice(visibleTabs.indexOf(tab) + 1).some(item => !item.affix)} role="menuitem" type="button" onClick={() => closeWith('right', tab.key)}><span>关闭右侧标签页</span></button>
              <div role="separator" />
              <button disabled={!visibleTabs.some(item => !item.affix && item.key !== tab.key)} role="menuitem" type="button" onClick={() => closeWith('others', tab.key)}><span>关闭其它标签页</span></button>
              <button disabled={!visibleTabs.some(item => !item.affix)} role="menuitem" type="button" onClick={() => closeWith('all', tab.key)}><span>关闭全部标签页</span></button>
            </div>
          );
        })()}

        <LayoutScrollArea>
          {visibleTabs.map((tab) => {
            const View = pageViews[tab.path];
            if (!View) {
              return null;
            }
            const visible = tab.key === pageTransition.displayedKey;
            const leaving = tab.key === pageTransition.leavingKey;
            const mode = visible || leaving ? 'visible' : 'hidden';
            return tab.keepAlive
              ? (
                  <motion.div
                    animate={leaving ? { opacity: 0, x: 30 } : visible ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
                    className={`page-route ${leaving ? 'page-route--leaving' : ''}`}
                    initial={{ opacity: 0, x: -30 }}
                    key={tab.key}
                    style={{ display: mode === 'hidden' ? 'none' : undefined }}
                    transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                  >
                    <Suspense fallback={<div className="page-loading">正在加载页面…</div>}>
                      <View key={`${tab.key}:${refreshVersion[tab.key] ?? 0}`} />
                    </Suspense>
                  </motion.div>
                )
              : visible ? <View key={`${tab.key}:${refreshVersion[tab.key] ?? 0}`} /> : null;
          })}
        </LayoutScrollArea>
      </main>
      <SetLockScreenModal
        open={lockScreenModalOpen}
        onCancel={() => setLockScreenModalOpen(false)}
        onConfirm={lock}
      />
      {lockScreen.isLocked && <LockScreen password={lockScreen.password ?? ''} onLogout={logout} onUnlock={unlock} />}
    </div>
  );
}
