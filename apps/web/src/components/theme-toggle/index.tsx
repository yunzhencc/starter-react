import type { MouseEvent } from 'react';
import { Button } from '@yunzhen/shadcn-ui/components/button';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

interface AppearanceTransition {
  ready: Promise<void>;
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const nextTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
  const label = nextTheme === 'light' ? '切换至浅色主题' : '切换至深色主题';

  function setThemeWithTransition(event: MouseEvent<HTMLButtonElement>) {
    const update = () => {
      setTheme(nextTheme);
      document.documentElement.classList.toggle('dark', nextTheme === 'dark');
      document.documentElement.classList.toggle('light', nextTheme === 'light');
    };
    const startViewTransition = (document as Document & {
      startViewTransition?: (callback: () => void) => AppearanceTransition;
    }).startViewTransition;

    if (!startViewTransition || event.detail === 0 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      update();
      return;
    }

    const { clientX: x, clientY: y } = event;
    const root = document.documentElement;
    const isDark = root.classList.contains('dark');
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const style = document.createElement('style');
    const colorScheme = root.style.getPropertyValue('color-scheme');
    const colorSchemePriority = root.style.getPropertyPriority('color-scheme');
    style.textContent = '* { transition: none !important; }';
    document.head.append(style);
    root.style.setProperty('color-scheme', nextTheme === 'dark' ? 'light' : 'dark', 'important');
    const transition = startViewTransition.call(document, update);

    void transition.ready.then(() => {
      const clipPath = [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`];
      root.style.setProperty('color-scheme', colorScheme, colorSchemePriority);
      const animation = root.animate(
        { clipPath: isDark ? [...clipPath].reverse() : clipPath },
        {
          duration: 500,
          easing: 'ease-in',
          pseudoElement: isDark ? '::view-transition-old(root)' : '::view-transition-new(root)',
        },
      );
      animation.onfinish = () => style.remove();
    }).catch(() => {
      root.style.setProperty('color-scheme', colorScheme, colorSchemePriority);
      style.remove();
    });
  }

  return (
    <Button
      size="icon"
      className="cursor-pointer"
      variant="ghost"
      aria-label={label}
      onClick={setThemeWithTransition}
    >
      {resolvedTheme === 'dark' ? <Sun /> : <Moon /> }
    </Button>
  );
}
