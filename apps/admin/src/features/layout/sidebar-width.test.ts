import { describe, expect, it } from 'vitest';
import { getSidebarWidth } from './sidebar-width';

describe('sidebar width', () => {
  it('uses the default when no valid persisted width exists', () => {
    expect(getSidebarWidth(null)).toBe(180);
    expect(getSidebarWidth('invalid')).toBe(180);
  });

  it('keeps persisted widths within the draggable range', () => {
    expect(getSidebarWidth('280')).toBe(280);
    expect(getSidebarWidth('40')).toBe(60);
    expect(getSidebarWidth('400')).toBe(320);
  });
});
