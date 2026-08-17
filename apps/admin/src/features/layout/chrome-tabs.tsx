import type { MouseEvent } from 'react';
import type { Tab } from './tab-model';
import { CloseOutlined, PushpinFilled } from '@ant-design/icons';
import { AnimatePresence, Reorder } from 'motion/react';

interface ChromeTabsProps {
  activeKey: string;
  onActivate: (key: string) => void;
  onClose: (key: string) => void;
  onContextMenu: (event: MouseEvent<HTMLElement>, tab: Tab) => void;
  onReorder: (keys: string[]) => void;
  onUnpin: (tab: Tab) => void;
  tabs: Tab[];
}

export function ChromeTabs({
  activeKey,
  onActivate,
  onClose,
  onContextMenu,
  onReorder,
  onUnpin,
  tabs,
}: ChromeTabsProps) {
  return (
    <Reorder.Group
      as="div"
      axis="x"
      className="vben-tabs-content tabs-chrome"
      values={tabs}
      onReorder={items => onReorder(items.map(item => item.key))}
    >
      <AnimatePresence initial={false}>
        {tabs.map((tab, index) => {
          const active = tab.key === activeKey;
          const closable = !tab.affix && tabs.length > 1;
          const pinnable = !!tab.affix && tabs.length > 1;
          return (
            <Reorder.Item
              animate={{ opacity: 1, x: 0 }}
              className={`${active ? 'is-active ' : ''}${tab.affix ? 'affix-tab ' : ''}draggable tabs-chrome__item`}
              data-active-tab={activeKey}
              data-index={index}
              data-tab-item="true"
              drag={!tab.affix}
              exit={{ opacity: 0, x: -15 }}
              initial={{ opacity: 0, x: -15 }}
              key={tab.key}
              layout="position"
              transition={{
                default: { duration: 0.25, ease: [0.25, 0.8, 0.5, 1] },
                layout: { duration: 0.3 },
              }}
              value={tab}
              onClick={() => onActivate(tab.key)}
              onContextMenu={event => onContextMenu(event, tab)}
              onMouseDown={(event) => {
                if (event.button === 1 && closable) {
                  event.preventDefault();
                  event.stopPropagation();
                  onClose(tab.key);
                }
              }}
            >
              <div className="tabs-chrome__inner">
                {index > 0 && !active && <div className="tabs-chrome__divider" />}
                <div className="tabs-chrome__background" aria-hidden="true">
                  <div className="tabs-chrome__background-content" />
                  <svg className="tabs-chrome__background-before" height="7" width="7" viewBox="0 0 7 7"><path d="M 0 7 A 7 7 0 0 0 7 0 L 7 7 Z" /></svg>
                  <svg className="tabs-chrome__background-after" height="7" width="7" viewBox="0 0 7 7"><path d="M 0 0 A 7 7 0 0 0 7 7 L 0 7 Z" /></svg>
                </div>
                <button className="tabs-chrome__target" type="button">
                  {tab.affix && <PushpinFilled />}
                  <span>{tab.title}</span>
                </button>
                {(closable || pinnable) && (
                  <button
                    aria-label={closable ? `关闭 ${tab.title}` : `取消固定 ${tab.title}`}
                    className="tabs-chrome__extra"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      if (closable) {
                        onClose(tab.key);
                      }
                      else {
                        onUnpin(tab);
                      }
                    }}
                  >
                    {closable ? <CloseOutlined /> : <PushpinFilled />}
                  </button>
                )}
              </div>
            </Reorder.Item>
          );
        })}
      </AnimatePresence>
    </Reorder.Group>
  );
}
