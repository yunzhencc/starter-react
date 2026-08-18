import { Button } from '@yunzhen/shadcn-ui/components/button';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const nextTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
  const label = nextTheme === 'light' ? '切换至浅色主题' : '切换至深色主题';

  return (
    <Button
      size="icon"
      className="cursor-pointer"
      variant="ghost"
      aria-label={label}
      onClick={() => setTheme(nextTheme)}
    >
      {resolvedTheme === 'dark' ? <Sun /> : <Moon /> }
    </Button>
  );
}
