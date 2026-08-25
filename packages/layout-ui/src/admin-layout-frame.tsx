import type { ReactNode } from 'react';
import { Pane, SplitPane } from 'react-split-pane';

export interface AdminLayoutFrameProps {
  children: ReactNode;
  className: string;
  onResize: (width: number) => void;
  onResizeEnd: (width: number) => void;
  sidebarResizable: boolean;
}

export function AdminLayoutFrame({ children, className, onResize, onResizeEnd, sidebarResizable }: AdminLayoutFrameProps) {
  return (
    <SplitPane
      className={className}
      direction="horizontal"
      dividerClassName="admin-sidebar-resizer"
      dividerSize={sidebarResizable ? 1 : 0}
      resizable={sidebarResizable}
      onResize={sizes => onResize(sizes[0] ?? 0)}
      onResizeEnd={sizes => onResizeEnd(sizes[0] ?? 0)}
    >
      {children}
    </SplitPane>
  );
}

export const LayoutPane = Pane;
