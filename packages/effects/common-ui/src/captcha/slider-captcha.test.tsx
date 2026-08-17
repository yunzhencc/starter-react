// @vitest-environment jsdom

import type { CaptchaHandle } from './types';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { act, createRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SliderCaptcha } from './slider-captcha';

function passCaptcha(action: HTMLElement) {
  fireEvent.pointerDown(action, { clientX: 0 });
  fireEvent.pointerMove(window, { clientX: 400 });
  fireEvent.pointerUp(window, { clientX: 400 });
}

afterEach(cleanup);

describe('sliderCaptcha', () => {
  it('reports elapsed success after reaching the Vben end offset', () => {
    const onSuccess = vi.fn();
    render(<SliderCaptcha onSuccess={onSuccess} />);

    passCaptcha(screen.getByRole('button', { name: '拖动滑块完成验证' }));

    expect(onSuccess).toHaveBeenCalledWith(expect.objectContaining({ isPassing: true }));
    expect(screen.getByText('验证通过')).toBeTruthy();
  });

  it('resets a successful slider through its ref', () => {
    const ref = createRef<CaptchaHandle>();
    const { container } = render(<SliderCaptcha ref={ref} />);

    passCaptcha(screen.getByRole('button', { name: '拖动滑块完成验证' }));
    act(() => ref.current?.resume());

    expect(screen.getByText('拖动滑块完成验证')).toBeTruthy();
    expect(container.querySelector('.yz-captcha-slider__bar')?.classList.contains('yz-captcha-slider__bar--resetting')).toBe(true);
  });

  it('leaves pass decisions to a composite captcha in slot mode', () => {
    const onMove = vi.fn();
    const onSuccess = vi.fn();
    render(<SliderCaptcha isSlot onMove={onMove} onSuccess={onSuccess} />);

    passCaptcha(screen.getByRole('button', { name: '拖动滑块完成验证' }));

    expect(onMove).toHaveBeenCalledWith(expect.objectContaining({ moveX: 400 }));
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
