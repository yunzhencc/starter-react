export type ThemeMode = 'dark' | 'light' | 'system';
export type ResolvedTheme = Exclude<ThemeMode, 'system'>;

export function getResolvedTheme(mode: ThemeMode, systemPrefersDark: boolean): ResolvedTheme {
  if (mode === 'system') {
    return systemPrefersDark ? 'dark' : 'light';
  }
  return mode;
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
