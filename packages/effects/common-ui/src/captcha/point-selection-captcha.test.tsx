// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PointSelectionCaptcha } from './point-selection-captcha';

afterEach(cleanup);

describe('pointSelectionCaptcha', () => {
  it('collects numbered image-relative points and confirms with a clear function', () => {
    const onConfirm = vi.fn();
    render(<PointSelectionCaptcha captchaImage="/captcha.jpg" hintText="云真" showConfirm onConfirm={onConfirm} />);

    fireEvent.click(screen.getByAltText('验证码图片'), { clientX: 24, clientY: 36 });
    expect(screen.getByRole('button', { name: '1' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '确认验证码' }));

    expect(onConfirm).toHaveBeenCalledWith([expect.objectContaining({ i: 0, x: 24, y: 36 })], expect.any(Function));
  });

  it('clears points before calling refresh', () => {
    const onRefresh = vi.fn();
    render(<PointSelectionCaptcha captchaImage="/captcha.jpg" hintText="云真" onRefresh={onRefresh} />);

    fireEvent.click(screen.getByAltText('验证码图片'), { clientX: 24, clientY: 36 });
    fireEvent.click(screen.getByRole('button', { name: '刷新验证码' }));

    expect(screen.queryByRole('button', { name: '1' })).toBeNull();
    expect(onRefresh).toHaveBeenCalledOnce();
  });
});
