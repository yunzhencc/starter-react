const defaultSidebarWidth = 224;
const minSidebarWidth = 160;
const maxSidebarWidth = 360;

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
