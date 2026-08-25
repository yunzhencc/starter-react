import type { ThemeMode } from '@yunzhen/preferences';
import type { MenuProps } from 'antd';
import type { KeyboardEvent, MouseEvent } from 'react';
import Icon, { MoonOutlined, SunOutlined, SyncOutlined } from '@ant-design/icons';
import { useTranslation } from '@yunzhen/locales';
import { updatePreferences, usePreferences } from '@yunzhen/preferences';
import { Badge, Button, Dropdown } from 'antd';
import './theme-toggle.css';

interface AppearanceTransition {
  ready: Promise<void>;
}

const themeModes = ['auto', 'light', 'dark'] as const satisfies ThemeMode[];

function ThemeIcon() {
  return (
    <Icon
      component={() => (
        <svg fill="currentColor" height="20" viewBox="0 0 24 24" width="20">
          <title>Theme icon</title>
          <g fillRule="evenodd">
            <g fillRule="nonzero">
              <path d="M7.02 3.635l12.518 12.518a1.863 1.863 0 010 2.635l-1.317 1.318a1.863 1.863 0 01-2.635 0L3.068 7.588A2.795 2.795 0 117.02 3.635zm2.09 14.428a.932.932 0 110 1.864.932.932 0 010-1.864zm-.043-9.747L7.75 9.635l9.154 9.153 1.318-1.317-9.154-9.155zM3.52 12.473c.514 0 .931.417.931.931v.932h.932a.932.932 0 110 1.864h-.932v.931a.932.932 0 01-1.863 0l-.001-.931h-.93a.932.932 0 110-1.864h.93v-.932c0-.514.418-.931.933-.931zm15.374-3.727a1.398 1.398 0 110 2.795 1.398 1.398 0 010-2.795zM4.385 4.953a.932.932 0 000 1.317l2.046 2.047L7.75 7 5.703 4.953a.932.932 0 00-1.318 0zM14.701.36a.932.932 0 01.931.932v.931h.932a.932.932 0 010 1.864h-.933l.001.932a.932.932 0 11-1.863 0l-.001-.932h-.93a.932.932 0 110-1.864h.93v-.931a.932.932 0 01.933-.932z" />
            </g>
          </g>
        </svg>
      )}
    />
  );
}

export function ThemeToggle() {
  const { t } = useTranslation();
  const { theme } = usePreferences();
  const badge = <Badge color="blue" style={{ marginTop: -1 }} />;

  function selectTheme(event: KeyboardEvent<HTMLElement> | MouseEvent<HTMLElement>, mode: ThemeMode) {
    if (theme.mode === mode) {
      return;
    }

    const update = () => updatePreferences({ theme: { mode } });
    const startViewTransition = (document as Document & {
      startViewTransition?: (callback: () => void) => AppearanceTransition;
    }).startViewTransition;
    if (mode === 'auto' || !startViewTransition || !('clientX' in event) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      update();
      return;
    }

    const x = event.clientX;
    const y = event.clientY;
    const isDark = document.documentElement.classList.contains('dark');
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const transition = startViewTransition.call(document, update);
    void transition.ready.then(() => {
      const clipPath = [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`];
      document.documentElement.animate(
        { clipPath: isDark ? [...clipPath].reverse() : clipPath },
        {
          duration: 500,
          easing: 'ease-in',
          pseudoElement: isDark ? '::view-transition-old(root)' : '::view-transition-new(root)',
        },
      );
    });
  }

  const menu: MenuProps = {
    items: themeModes.map(mode => ({
      extra: theme.mode === mode ? badge : null,
      icon: mode === 'auto' ? <SyncOutlined /> : mode === 'light' ? <SunOutlined /> : <MoonOutlined />,
      key: mode,
      label: mode === 'auto' ? t('ui.theme.followSystem') : mode === 'light' ? t('ui.theme.light') : t('ui.theme.dark'),
    })),
    onClick: ({ domEvent, key }) => selectTheme(domEvent, key as ThemeMode),
  };

  return (
    <Dropdown arrow={{ pointAtCenter: true }} menu={menu} placement="bottomRight" trigger={['click']}>
      <Button aria-label={t('ui.theme.label')} className="header-icon-button" icon={<ThemeIcon />} style={{ fontSize: 16 }} type="text" />
    </Dropdown>
  );
}
