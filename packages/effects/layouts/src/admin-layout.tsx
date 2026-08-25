import type { LayoutMenuItem, LayoutRoute, Tab, TabStateSnapshot } from '@yunzhen/stores';
import type { MenuProps } from 'antd';
import type { MouseEvent, ReactNode } from 'react';
import {
  AppstoreOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CloseOutlined,
  ColumnWidthOutlined,
  CompressOutlined,
  DoubleLeftOutlined,
  DoubleRightOutlined,
  ExpandOutlined,
  ExportOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PushpinOutlined,
  ReloadOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import { AdminLayoutFrame, LayoutPane } from '@yunzhen/layout-ui';
import { updatePreferences, usePreferences } from '@yunzhen/preferences';
import { Menu } from 'antd';
import { motion } from 'motion/react';
import { useEffect, useLayoutEffect, useReducer, useRef, useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import { ChromeTabs } from './chrome-tabs';
import { LayoutScrollArea } from './layout-scroll';
import { getSidebarWidth, maxSidebarWidth, minSidebarWidth } from './sidebar-width';
import { createTabState, getTabKey } from './tab-model';
import './admin-layout.css';

interface AdminLayoutProps {
  activePath: string;
  activeSearch?: string;
  brand: ReactNode;
  headerActions?: ReactNode;
  menuItems: LayoutMenuItem[];
  onNavigate: (path: string) => void;
  renderPage: (route: Tab, refreshVersion: number) => ReactNode;
}

function isMenuGroup(item: LayoutMenuItem): item is Extract<LayoutMenuItem, { children: LayoutRoute[] }> {
  return 'children' in item;
}

function getRoutes(menuItems: LayoutMenuItem[]) {
  return menuItems.flatMap(item => isMenuGroup(item) ? item.children : [item]);
}

function getStoredTabs(storageKey: string, routes: LayoutRoute[]) {
  if (typeof window === 'undefined')
    return createTabState();

  try {
    const snapshot = JSON.parse(window.sessionStorage.getItem(storageKey) ?? 'null') as TabStateSnapshot | null;
    return snapshot
      ? createTabState({
          activeKey: snapshot.activeKey,
          history: snapshot.history.filter(key => typeof key === 'string'),
          items: snapshot.items.filter(tab => routes.some(route => route.path === tab.path)),
        })
      : createTabState();
  }
  catch {
    return createTabState();
  }
}

export function AdminLayout({
  activePath,
  activeSearch = '',
  brand,
  headerActions,
  menuItems,
  onNavigate,
  renderPage,
}: AdminLayoutProps) {
  const routes = getRoutes(menuItems);
  const route = routes.find(item => item.path === (activePath === '/' ? activePath : activePath.replace(/\/$/, '')));
  const fullPath = route ? `${route.path}${activeSearch}` : '';
  const currentKey = route
    ? getTabKey({ ...route, fullPath, search: Object.fromEntries(new URLSearchParams(activeSearch)) })
    : '';
  const tabs = useRef(getStoredTabs('yunzhen:tabbar', routes)).current;
  const preferences = usePreferences();
  const [revision, render] = useReducer(value => value + 1, 0);
  const { collapsed, hidden: sidebarHidden, width: sidebarWidth } = preferences.sidebar;
  const [contextTab, setContextTab] = useState<string>();
  const [contextMenuPosition, setContextMenuPosition] = useState({ left: 0, top: 0 });
  const [fullscreen, setFullscreen] = useState(() => typeof document !== 'undefined' && !!document.fullscreenElement);
  const [maximized, setMaximized] = useState(false);
  const [refreshVersion, setRefreshVersion] = useState<Record<string, number>>({});
  const [pageTransition, setPageTransition] = useState<{ displayedKey: string; leavingKey: string }>({ displayedKey: currentKey, leavingKey: '' });
  const [tabScroll, setTabScroll] = useState({ left: true, overflow: false, right: true });
  const tabViewportRef = useRef<HTMLDivElement>(null);
  const compactSidebar = useMediaQuery({ maxWidth: 900 });
  const sidebarSize = maximized || sidebarHidden ? 0 : collapsed ? 60 : compactSidebar ? 64 : sidebarWidth;
  const sidebarResizable = !compactSidebar && !maximized && !sidebarHidden;
  const antMenuItems: MenuProps['items'] = menuItems.map(item => isMenuGroup(item)
    ? { children: item.children.map(child => ({ icon: child.icon, key: child.path, label: child.title })), icon: item.icon, key: item.key, label: item.title }
    : { icon: item.icon, key: item.path, label: item.title });

  useEffect(() => {
    if (!route)
      return;
    tabs.open({ ...route, fullPath, search: Object.fromEntries(new URLSearchParams(activeSearch)) });
    render();
  }, [activeSearch, fullPath, route, tabs]);

  useEffect(() => {
    window.sessionStorage.setItem('yunzhen:tabbar', JSON.stringify(tabs.snapshot()));
  }, [revision, tabs]);

  useEffect(() => {
    const syncFullscreen = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', syncFullscreen);
    return () => document.removeEventListener('fullscreenchange', syncFullscreen);
  }, []);

  useEffect(() => {
    if (!contextTab)
      return;
    const closeMenu = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Element && target.closest('.tab-menu, [data-tab-item], .tab-tools'))
        return;
      setContextTab(undefined);
    };
    window.addEventListener('pointerdown', closeMenu);
    return () => window.removeEventListener('pointerdown', closeMenu);
  }, [contextTab]);

  useEffect(() => {
    if (!currentKey)
      return;
    setPageTransition(previous => previous.displayedKey === currentKey ? previous : { displayedKey: currentKey, leavingKey: previous.displayedKey });
    const timeout = window.setTimeout(() => setPageTransition(previous => previous.displayedKey === currentKey ? { ...previous, leavingKey: '' } : previous), 300);
    return () => window.clearTimeout(timeout);
  }, [currentKey]);

  useLayoutEffect(() => {
    const viewport = tabViewportRef.current;
    if (!viewport)
      return;
    const sync = () => setTabScroll({
      left: viewport.scrollLeft <= 0,
      overflow: viewport.scrollWidth > viewport.clientWidth,
      right: viewport.scrollLeft + viewport.clientWidth >= viewport.scrollWidth - 1,
    });
    const observer = new ResizeObserver(sync);
    observer.observe(viewport);
    sync();
    requestAnimationFrame(() => {
      viewport.querySelector<HTMLElement>('.tabs-chrome__item.is-active')?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
      sync();
    });
    return () => observer.disconnect();
  }, [currentKey, revision]);

  const visibleTabs = tabs.items;
  const goTo = (tab: Tab) => onNavigate(tab.fullPath ?? tab.path);
  const close = (key: string) => {
    const destination = tabs.close(key);
    setContextTab(undefined);
    render();
    if (destination)
      onNavigate(destination);
  };
  const closeWith = (action: 'all' | 'left' | 'others' | 'right', key: string) => {
    const previousActive = tabs.activeKey;
    if (action === 'all')
      tabs.closeAll();
    else if (action === 'left')
      tabs.closeLeft(key);
    else if (action === 'others')
      tabs.closeOthers(key);
    else tabs.closeRight(key);
    setContextTab(undefined);
    render();
    if (previousActive !== tabs.activeKey && tabs.activeKey)
      onNavigate(tabs.activeKey);
  };
  const togglePin = (tab: Tab) => {
    if (tab.affix)
      tabs.unpin(tab.key);
    else tabs.pin(tab.key);
    setContextTab(undefined);
    render();
  };
  const refresh = (key: string) => {
    setContextTab(undefined);
    setRefreshVersion(versions => ({ ...versions, [key]: (versions[key] ?? 0) + 1 }));
  };
  const openInNewWindow = (tab: Tab) => {
    window.open(tab.fullPath ?? tab.path, '_blank', 'noopener,noreferrer');
    setContextTab(undefined);
  };
  const openContextMenu = (event: MouseEvent<HTMLElement>, tab: Tab) => {
    event.preventDefault();
    setContextTab(tab.key);
    setContextMenuPosition({ left: Math.min(event.clientX, window.innerWidth - 184), top: Math.min(event.clientY, window.innerHeight - 330) });
  };
  const openCurrentTabMenu = (event: MouseEvent<HTMLButtonElement>) => {
    const tab = visibleTabs.find(item => item.key === currentKey);
    if (!tab)
      return;
    const rect = event.currentTarget.getBoundingClientRect();
    setContextTab(tab.key);
    setContextMenuPosition({
      left: Math.max(4, Math.min(rect.left, window.innerWidth - 168)),
      top: Math.max(4, Math.min(rect.bottom + 4, window.innerHeight - 320)),
    });
  };
  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement)
        await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    }
    catch {
      // The browser may deny fullscreen when it is unavailable.
    }
  };

  return (
    <AdminLayoutFrame
      className={`admin-layout ${collapsed && !sidebarHidden ? 'admin-layout--collapsed' : ''} ${sidebarHidden ? 'admin-layout--sidebar-hidden' : ''} ${maximized ? 'admin-layout--maximized' : ''}`}
      sidebarResizable={sidebarResizable}
      onResize={(size) => {
        const width = getSidebarWidth(String(size));
        updatePreferences({ sidebar: { width } });
        if (width > minSidebarWidth)
          updatePreferences({ sidebar: { collapsed: false } });
      }}
      onResizeEnd={(size) => {
        const width = getSidebarWidth(String(size));
        updatePreferences({ sidebar: { collapsed: width <= minSidebarWidth, width } });
      }}
    >
      <LayoutPane className="admin-sidebar-pane" maxSize={maximized || compactSidebar || sidebarHidden ? sidebarSize : maxSidebarWidth} minSize={maximized || compactSidebar || sidebarHidden ? sidebarSize : minSidebarWidth} size={sidebarSize}>
        <aside className="admin-sidebar">
          {brand}
          <Menu aria-label="主菜单" className="admin-menu" defaultOpenKeys={menuItems.filter(isMenuGroup).filter(item => item.children.some(child => child.path === route?.path)).map(item => item.key)} inlineCollapsed={collapsed} inlineIndent={12} items={antMenuItems} mode="inline" selectedKeys={route ? [route.path] : []} onClick={({ key }) => onNavigate(key)} />
        </aside>
      </LayoutPane>
      <LayoutPane className="admin-main-pane">
        <main className="admin-main">
          <header className="admin-header">
            <div className="header-leading">
              <button aria-label={sidebarHidden ? '显示菜单' : '隐藏菜单'} className="header-menu-toggle" title={sidebarHidden ? '显示菜单' : '隐藏菜单'} type="button" onClick={() => updatePreferences({ sidebar: { hidden: !sidebarHidden } })}>{sidebarHidden ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}</button>
              <div className="breadcrumb">
                工作台
                <span>/</span>
                {' '}
                {route?.title}
              </div>
            </div>
            <div className="header-actions">
              {headerActions}
              <button aria-label={fullscreen ? '退出全屏' : '全屏'} className="header-icon-button" title={fullscreen ? '退出全屏' : '全屏'} type="button" onClick={() => void toggleFullscreen()}>{fullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}</button>
            </div>
          </header>
          <section className="tabbar" aria-label="已打开的页签">
            {tabScroll.overflow && <button aria-label="向左滚动页签" className="tab-scroll-button tab-scroll-button--left" disabled={tabScroll.left} type="button" onClick={() => tabViewportRef.current?.scrollBy({ behavior: 'smooth', left: -(tabViewportRef.current.clientWidth - 150) })}><ArrowLeftOutlined /></button>}
            <div
              className={`tab-list ${!tabScroll.left ? 'tab-list--shadow-left' : ''} ${!tabScroll.right ? 'tab-list--shadow-right' : ''}`}
              ref={tabViewportRef}
              onScroll={() => {
                const viewport = tabViewportRef.current;
                if (!viewport)
                  return;
                setTabScroll({ left: viewport.scrollLeft <= 0, overflow: viewport.scrollWidth > viewport.clientWidth, right: viewport.scrollLeft + viewport.clientWidth >= viewport.scrollWidth - 1 });
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
                  setContextTab(undefined);
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
            {tabScroll.overflow && <button aria-label="向右滚动页签" className="tab-scroll-button tab-scroll-button--right" disabled={tabScroll.right} type="button" onClick={() => tabViewportRef.current?.scrollBy({ behavior: 'smooth', left: tabViewportRef.current.clientWidth - 150 })}><ArrowRightOutlined /></button>}
            <div className="tab-tools">
              <button aria-label="更多页签操作" type="button" onClick={openCurrentTabMenu}><AppstoreOutlined /></button>
              <button aria-label="刷新当前页面" type="button" onClick={() => currentKey && refresh(currentKey)}><ReloadOutlined /></button>
              <button aria-label="切换内容最大化" type="button" onClick={() => setMaximized(value => !value)}>{maximized ? <CompressOutlined /> : <ExpandOutlined />}</button>
            </div>
          </section>
          {contextTab && (() => {
            const tab = visibleTabs.find(item => item.key === contextTab);
            if (!tab)
              return null;
            return (
              <div className="tab-menu" role="menu" style={contextMenuPosition}>
                <button disabled={tab.affix || visibleTabs.length < 2} role="menuitem" type="button" onClick={() => close(tab.key)}>
                  <CloseOutlined />
                  <span>关闭</span>
                </button>
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
                  <ExportOutlined />
                  <span>在新窗口打开</span>
                </button>
                <div role="separator" />
                <button disabled={!visibleTabs.slice(0, visibleTabs.indexOf(tab)).some(item => !item.affix)} role="menuitem" type="button" onClick={() => closeWith('left', tab.key)}>
                  <DoubleLeftOutlined />
                  <span>关闭左侧标签页</span>
                </button>
                <button disabled={!visibleTabs.slice(visibleTabs.indexOf(tab) + 1).some(item => !item.affix)} role="menuitem" type="button" onClick={() => closeWith('right', tab.key)}>
                  <DoubleRightOutlined />
                  <span>关闭右侧标签页</span>
                </button>
                <button disabled={!visibleTabs.some(item => !item.affix && item.key !== tab.key)} role="menuitem" type="button" onClick={() => closeWith('others', tab.key)}>
                  <ColumnWidthOutlined />
                  <span>关闭其它标签页</span>
                </button>
                <button disabled={!visibleTabs.some(item => !item.affix)} role="menuitem" type="button" onClick={() => closeWith('all', tab.key)}>
                  <SwapOutlined />
                  <span>关闭全部标签页</span>
                </button>
              </div>
            );
          })()}
          <LayoutScrollArea>
            {visibleTabs.map((tab) => {
              const visible = tab.key === pageTransition.displayedKey;
              const leaving = tab.key === pageTransition.leavingKey;
              return tab.keepAlive
                ? <motion.div animate={leaving ? { opacity: 0, x: 30 } : visible ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }} className={`page-route ${leaving ? 'page-route--leaving' : ''}`} initial={{ opacity: 0, x: -30 }} key={tab.key} style={{ display: visible || leaving ? undefined : 'none' }} transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}>{renderPage(tab, refreshVersion[tab.key] ?? 0)}</motion.div>
                : visible ? <div className="page-route" key={tab.key}>{renderPage(tab, refreshVersion[tab.key] ?? 0)}</div> : null;
            })}
          </LayoutScrollArea>
        </main>
      </LayoutPane>
    </AdminLayoutFrame>
  );
}
