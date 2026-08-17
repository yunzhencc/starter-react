export type ThemeMode = 'dark' | 'light' | 'system';
export type ResolvedTheme = Exclude<ThemeMode, 'system'>;
export const themeMenuModes = ['system', 'light', 'dark'] as const;

export function getResolvedTheme(mode: ThemeMode, systemPrefersDark: boolean): ResolvedTheme {
  if (mode === 'system') {
    return systemPrefersDark ? 'dark' : 'light';
  }
  return mode;
}

export function getThemeTransitionAnimation(isDark: boolean, clipPath: string[]) {
  return {
    clipPath: isDark ? [...clipPath].reverse() : clipPath,
    pseudoElement: isDark ? '::view-transition-old(root)' : '::view-transition-new(root)',
  } as const;
}

export function toHsl(value: string) {
  return `hsl(${value.trim()})`;
}

export function callViewTransition<TDocument, TResult>(
  documentRoot: TDocument,
  startViewTransition: (this: TDocument, callback: () => void) => TResult,
  update: () => void,
) {
  return startViewTransition.call(documentRoot, update);
}
