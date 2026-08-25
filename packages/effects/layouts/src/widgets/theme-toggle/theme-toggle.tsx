import type { ThemeMode } from '@yunzhen/preferences';
import type { MenuProps } from 'antd';
import type { KeyboardEvent, MouseEvent } from 'react';
import { BgColorsOutlined, MoonOutlined, SunOutlined, SyncOutlined } from '@ant-design/icons';
import { useTranslation } from '@yunzhen/locales';
import { updatePreferences, usePreferences } from '@yunzhen/preferences';
import { Badge, Button, Dropdown } from 'antd';
import './theme-toggle.css';

interface AppearanceTransition {
  ready: Promise<void>;
}

const themeModes = ['auto', 'light', 'dark'] as const satisfies ThemeMode[];

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
      <Button aria-label={t('ui.theme.label')} className="header-icon-button" icon={<BgColorsOutlined />} style={{ fontSize: 16 }} type="text" />
    </Dropdown>
  );
}
