import type { MouseEvent, SVGProps } from 'react';
import { DesktopOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons';
import { Popover } from 'antd';
import { useTheme } from 'next-themes';
import { callViewTransition, getResolvedTheme } from './theme';
import './theme-toggle.css';

type ThemeMode = 'dark' | 'light' | 'system';

interface AppearanceTransition {
  ready: Promise<void>;
  skipTransition: () => void;
}

function ThemeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" height="20" viewBox="0 0 24 24" width="20" {...props}>
      <mask id="theme-toggle-moon">
        <rect fill="white" height="100%" width="100%" />
        <circle cx="40" cy="8" fill="black" r="11" />
      </mask>
      <circle className="theme-toggle__sun" cx="12" cy="12" mask="url(#theme-toggle-moon)" r="11" />
      <g className="theme-toggle__sun-beams">
        <line x1="12" x2="12" y1="1" y2="3" />
        <line x1="12" x2="12" y1="21" y2="23" />
        <line x1="4.22" x2="5.64" y1="4.22" y2="5.64" />
        <line x1="18.36" x2="19.78" y1="18.36" y2="19.78" />
        <line x1="1" x2="3" y1="12" y2="12" />
        <line x1="21" x2="23" y1="12" y2="12" />
        <line x1="4.22" x2="5.64" y1="19.78" y2="18.36" />
        <line x1="18.36" x2="19.78" y1="5.64" y2="4.22" />
      </g>
    </svg>
  );
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme, theme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  function setThemeWithTransition(event: MouseEvent<HTMLElement>, nextTheme: ThemeMode) {
    const nextResolvedTheme = getResolvedTheme(
      nextTheme,
      window.matchMedia('(prefers-color-scheme: dark)').matches,
    );
    const update = () => {
      setTheme(nextTheme);
      document.documentElement.classList.toggle('dark', nextResolvedTheme === 'dark');
      document.documentElement.classList.toggle('light', nextResolvedTheme === 'light');
    };

    const startViewTransition = (document as Document & {
      startViewTransition?: (callback: () => void) => AppearanceTransition;
    }).startViewTransition;
    if (!startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      update();
      return;
    }

    const x = event.clientX;
    const y = event.clientY;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const transition = callViewTransition(document, startViewTransition, update);
    void transition.ready.then(() => {
      const clipPath = [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`];
      const animation = document.documentElement.animate(
        { clipPath: nextResolvedTheme === 'dark' ? clipPath : [...clipPath].reverse() },
        {
          duration: 450,
          easing: 'ease-in',
          pseudoElement: nextResolvedTheme === 'dark' ? '::view-transition-new(root)' : '::view-transition-old(root)',
        },
      );
      animation.onfinish = () => transition.skipTransition();
    });
  }

  const controls = (
    <div aria-label="主题模式" className="theme-mode-picker" role="group">
      <button aria-label="浅色模式" className={theme === 'light' ? 'is-active' : ''} type="button" onClick={event => setThemeWithTransition(event, 'light')}><SunOutlined /></button>
      <button aria-label="深色模式" className={theme === 'dark' ? 'is-active' : ''} type="button" onClick={event => setThemeWithTransition(event, 'dark')}><MoonOutlined /></button>
      <button aria-label="跟随系统" className={theme === 'system' ? 'is-active' : ''} type="button" onClick={event => setThemeWithTransition(event, 'system')}><DesktopOutlined /></button>
    </div>
  );

  return (
    <Popover arrow={false} content={controls} placement="bottomRight" trigger="hover">
      <button
        aria-label={isDark ? '切换至浅色模式' : '切换至深色模式'}
        className={`theme-toggle is-${isDark ? 'dark' : 'light'}`}
        type="button"
        onClick={event => setThemeWithTransition(event, isDark ? 'light' : 'dark')}
      >
        <ThemeIcon />
      </button>
    </Popover>
  );
}
