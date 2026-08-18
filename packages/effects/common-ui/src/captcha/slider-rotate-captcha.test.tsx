import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SliderRotateCaptcha } from './slider-rotate-captcha';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function drag(action: HTMLElement, clientX: number) {
  fireEvent.pointerDown(action, { clientX: 0 });
  fireEvent.pointerMove(window, { clientX });
  fireEvent.pointerUp(window, { clientX });
}

describe('sliderRotateCaptcha', () => {
  it('accepts a rotation inside Vben diffDegree', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const onSuccess = vi.fn();
    render(<SliderRotateCaptcha minDegree={120} maxDegree={300} onSuccess={onSuccess} src="/captcha.jpg" />);

    fireEvent.load(screen.getByAltText('旋转验证码'));
    drag(screen.getByRole('button', { name: '拖动滑块完成验证' }), 70);

    expect(onSuccess).toHaveBeenCalledWith(expect.objectContaining({ isPassing: true }));
  });

  it('restores the challenge when the rotation is outside diffDegree', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const onSuccess = vi.fn();
    render(<SliderRotateCaptcha minDegree={120} maxDegree={300} onSuccess={onSuccess} src="/captcha.jpg" />);

    fireEvent.load(screen.getByAltText('旋转验证码'));
    drag(screen.getByRole('button', { name: '拖动滑块完成验证' }), 5);

    expect(onSuccess).not.toHaveBeenCalled();
    expect(screen.getByText('校验失败，请重试')).toBeTruthy();
  });
});
