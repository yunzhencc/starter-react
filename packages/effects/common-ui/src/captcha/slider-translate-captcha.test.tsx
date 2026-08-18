import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SliderTranslateCaptcha } from './slider-translate-captcha';

const context = {
  arc: vi.fn(),
  beginPath: vi.fn(),
  clearRect: vi.fn(),
  clip: vi.fn(),
  drawImage: vi.fn(),
  fill: vi.fn(),
  getImageData: vi.fn(() => ({})),
  lineTo: vi.fn(),
  moveTo: vi.fn(),
  putImageData: vi.fn(),
  stroke: vi.fn(),
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('sliderTranslateCaptcha', () => {
  it('passes when the slider lands within Vben diffDistance', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as never);
    const onSuccess = vi.fn();
    render(<SliderTranslateCaptcha onSuccess={onSuccess} src="/captcha.jpg" />);

    const action = screen.getByRole('button', { name: '拖动滑块完成验证' });
    fireEvent.pointerDown(action, { clientX: 0 });
    fireEvent.pointerMove(window, { clientX: 62 });
    fireEvent.pointerUp(window, { clientX: 62 });

    expect(onSuccess).toHaveBeenCalledWith(expect.objectContaining({ isPassing: true }));
  });
});
