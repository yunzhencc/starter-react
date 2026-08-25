import type { ReactNode } from 'react';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { Pane, SplitPane } from 'react-split-pane';
import './admin-layout-ui.css';

export interface AdminLayoutUiProps {
  content: ReactNode;
  header: ReactNode;
  maximized?: boolean;
  onSidebarResize?: (width: number) => void;
  onSidebarResizeEnd?: (width: number) => void;
  onToggleSidebar: () => void;
  sidebar: ReactNode;
  sidebarCollapsed?: boolean;
  sidebarHidden: boolean;
  sidebarMaxSize?: number;
  sidebarMinSize?: number;
  sidebarResizable: boolean;
  sidebarSize: number;
  tabbar: ReactNode;
}

export function AdminLayoutUi({
  content,
  header,
  maximized = false,
  onSidebarResize,
  onSidebarResizeEnd,
  onToggleSidebar,
  sidebar,
  sidebarCollapsed = false,
  sidebarHidden,
  sidebarMaxSize,
  sidebarMinSize,
  sidebarResizable,
  sidebarSize,
  tabbar,
}: AdminLayoutUiProps) {
  const className = [
    'admin-layout',
    sidebarCollapsed && !sidebarHidden ? 'admin-layout--collapsed' : '',
    sidebarHidden ? 'admin-layout--sidebar-hidden' : '',
    maximized ? 'admin-layout--maximized' : '',
  ].filter(Boolean).join(' ');

  return (
    <SplitPane
      className={className}
      direction="horizontal"
      dividerClassName="admin-sidebar-resizer"
      dividerSize={sidebarResizable ? 1 : 0}
      resizable={sidebarResizable}
      onResize={sizes => onSidebarResize?.(sizes[0] ?? sidebarSize)}
      onResizeEnd={sizes => onSidebarResizeEnd?.(sizes[0] ?? sidebarSize)}
    >
      <Pane className="admin-sidebar-pane" maxSize={sidebarMaxSize} minSize={sidebarMinSize} size={sidebarSize}>
        <aside className="admin-sidebar">{sidebar}</aside>
      </Pane>
      <Pane className="admin-main-pane">
        <main className="admin-main">
          <header className="admin-header">
            <div className="header-leading">
              <button
                aria-label={sidebarHidden ? '显示菜单' : '隐藏菜单'}
                className="header-menu-toggle"
                title={sidebarHidden ? '显示菜单' : '隐藏菜单'}
                type="button"
                onClick={onToggleSidebar}
              >
                {sidebarHidden ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              </button>
              {header}
            </div>
          </header>
          {tabbar}
          {content}
        </main>
      </Pane>
    </SplitPane>
  );
}
