export const defaultSidebarWidth = 180;
export const minSidebarWidth = 60;
export const maxSidebarWidth = 320;

export function getSidebarWidth(value: string | null) {
  if (value === null) {
    return defaultSidebarWidth;
  }

  const width = Number(value);
  if (!Number.isFinite(width)) {
    return defaultSidebarWidth;
  }

  return Math.min(maxSidebarWidth, Math.max(minSidebarWidth, width));
}
