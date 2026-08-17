import { describe, expect, it } from 'vitest';
import { getSidebarWidth } from './sidebar-width';

describe('sidebar width', () => {
  it('uses the default when no valid persisted width exists', () => {
    expect(getSidebarWidth(null)).toBe(224);
    expect(getSidebarWidth('invalid')).toBe(224);
  });

  it('keeps persisted widths within the draggable range', () => {
    expect(getSidebarWidth('280')).toBe(280);
    expect(getSidebarWidth('120')).toBe(160);
    expect(getSidebarWidth('480')).toBe(360);
  });
});
