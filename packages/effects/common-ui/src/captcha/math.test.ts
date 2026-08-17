import { describe, expect, it } from 'vitest';
import { getSliderOffset, isWithinTolerance, toRotateDegree } from './math';

describe('vben captcha math', () => {
  it('uses the Vben slider offset and rotation scale', () => {
    expect(getSliderOffset(220, 40)).toBe(174);
    expect(toRotateDegree(100, 260, 300)).toBe(174);
  });

  it('passes only inside the configured tolerance', () => {
    expect(isWithinTolerance(100, 103, 3)).toBe(true);
    expect(isWithinTolerance(100, 104, 3)).toBe(false);
  });
});
