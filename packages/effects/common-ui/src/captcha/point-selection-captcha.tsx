import type { CaptchaPoint, PointSelectionCaptchaCardProps, PointSelectionCaptchaProps } from './types';
import { RefreshCw } from 'lucide-react';
import { useState } from 'react';

function asNumber(value: number | string) {
  return typeof value === 'number' ? value : Number.parseFloat(value) || 0;
}

export function PointSelectionCaptchaCard({ captchaImage, children, height = '220px', paddingX = '12px', paddingY = '16px', title = '请按图依次点击', width = '300px' }: PointSelectionCaptchaCardProps & { children?: React.ReactNode }) {
  const horizontalPadding = asNumber(paddingX);
  return (
    <section className="yz-captcha-card" style={{ padding: `${asNumber(paddingY)}px ${horizontalPadding}px`, width: asNumber(width) + horizontalPadding * 2 }}>
      <div className="yz-captcha-card__header">
        <strong>{title}</strong>
        {children}
      </div>
      <img alt="验证码图片" className="yz-captcha-card__image" height={asNumber(height)} src={captchaImage} width={asNumber(width)} />
    </section>
  );
}

export function PointSelectionCaptcha({ captchaImage, height = '220px', hintImage, hintText, onClick, onConfirm, onRefresh, paddingX = '12px', paddingY = '16px', showConfirm = false, title = '请按图依次点击', width = '300px' }: PointSelectionCaptchaProps) {
  const [points, setPoints] = useState<CaptchaPoint[]>([]);
  const clear = () => setPoints([]);
  const pointOffset = 11;
  const horizontalPadding = asNumber(paddingX);

  return (
    <section className="yz-captcha-card" style={{ padding: `${asNumber(paddingY)}px ${horizontalPadding}px`, width: asNumber(width) + horizontalPadding * 2 }}>
      <div className="yz-captcha-card__header">
        <strong>{title}</strong>
        <span>
          <button
            aria-label="刷新验证码"
            className="yz-captcha-card__icon-button"
            onClick={() => {
              clear();
              onRefresh?.();
            }}
            type="button"
          >
            <RefreshCw size={18} />
          </button>
          {showConfirm && <button aria-label="确认验证码" className="yz-captcha-card__confirm" onClick={() => onConfirm?.(points, clear)} type="button">确认</button>}
        </span>
      </div>
      <div className="yz-captcha-card__canvas" style={{ height: asNumber(height), width: asNumber(width) }}>
        <img
          alt="验证码图片"
          className="yz-captcha-card__image"
          onClick={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            const point = { i: points.length, t: Date.now(), x: Math.ceil(event.clientX - rect.left), y: Math.ceil(event.clientY - rect.top) };
            setPoints(current => [...current, point]);
            onClick?.(point);
          }}
          src={captchaImage}
        />
        {points.map((point, index) => <span aria-label={String(index + 1)} className="yz-captcha-card__point" key={point.t} role="button" style={{ left: point.x - pointOffset, top: point.y - pointOffset }}>{index + 1}</span>)}
      </div>
      {hintImage
        ? <img alt="验证码提示" className="yz-captcha-card__hint" src={hintImage} />
        : hintText && (
          <div className="yz-captcha-card__hint">
            请依次点击【
            {hintText}
            】
          </div>
        )}
    </section>
  );
}
