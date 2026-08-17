import type { Ref } from 'react';
import type { CaptchaHandle, SliderCaptchaProps } from './types';
import { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { getSliderOffset } from './math';
import './captcha.css';

const DEFAULT_WIDTH = 220;
const ACTION_WIDTH = 40;

export function SliderCaptcha({
  actionStyle,
  barStyle,
  checked,
  className,
  contentStyle,
  defaultChecked = false,
  isSlot = false,
  onEnd,
  onMove,
  onStart,
  onSuccess,
  successText = '验证通过',
  text = '拖动滑块完成验证',
  wrapperStyle,
  ref,
}: SliderCaptchaProps & { ref?: Ref<CaptchaHandle> }) {
  const actionRef = useRef<HTMLButtonElement>(null);
  const dragOriginRef = useRef(0);
  const endTimeRef = useRef(0);
  const isPassingRef = useRef(defaultChecked);
  const startTimeRef = useRef(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const [left, setLeft] = useState(0);
  const [barWidth, setBarWidth] = useState(0);

  const isPassing = checked ?? internalChecked;
  isPassingRef.current = isPassing;

  function getSizes() {
    const wrapperWidth = wrapperRef.current?.getBoundingClientRect().width || DEFAULT_WIDTH;
    const actionWidth = actionRef.current?.getBoundingClientRect().width || ACTION_WIDTH;
    return { actionWidth, wrapperWidth };
  }

  function resume() {
    isPassingRef.current = false;
    setDragging(false);
    setInternalChecked(false);
    setLeft(0);
    setBarWidth(0);
    dragOriginRef.current = 0;
    startTimeRef.current = 0;
    endTimeRef.current = 0;
  }

  useImperativeHandle(ref, () => ({ resume }));

  useEffect(() => {
    if (!dragging)
      return;

    function move(event: PointerEvent) {
      if (isPassingRef.current)
        return;
      const { actionWidth, wrapperWidth } = getSizes();
      const moveX = event.clientX - dragOriginRef.current;
      const offset = getSliderOffset(wrapperWidth, actionWidth);
      onMove?.({ moveDistance: dragOriginRef.current, moveX });

      if (moveX <= 0)
        return;
      if (moveX <= offset) {
        setLeft(moveX);
        setBarWidth(moveX + actionWidth / 2);
        return;
      }

      setLeft(wrapperWidth - actionWidth);
      setBarWidth(wrapperWidth - actionWidth / 2);
      if (!isSlot) {
        endTimeRef.current = Date.now();
        isPassingRef.current = true;
        setInternalChecked(true);
        setDragging(false);
        onSuccess?.({
          isPassing: true,
          time: ((endTimeRef.current - startTimeRef.current) / 1000).toFixed(1),
        });
      }
    }

    function end() {
      const { actionWidth, wrapperWidth } = getSizes();
      const moveX = left;
      onEnd?.();
      setDragging(false);

      if (!isPassingRef.current && !isSlot && moveX < getSliderOffset(wrapperWidth, actionWidth)) {
        resume();
      }
    }

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', end, { once: true });
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
    };
  }, [dragging, isSlot, left, onEnd, onMove, onSuccess]);

  return (
    <div
      className={['yz-captcha-slider', className].filter(Boolean).join(' ')}
      ref={wrapperRef}
      style={wrapperStyle}
    >
      <div
        className={['yz-captcha-slider__bar', barWidth === 0 && 'yz-captcha-slider__bar--resetting'].filter(Boolean).join(' ')}
        style={{ ...barStyle, width: barWidth }}
      />
      <div className="yz-captcha-slider__content" style={contentStyle}>
        {isPassing ? successText : text}
      </div>
      <button
        aria-label={text}
        className={['yz-captcha-slider__action', dragging && 'yz-captcha-slider__action--dragging'].filter(Boolean).join(' ')}
        onPointerDown={(event) => {
          if (isPassing)
            return;
          event.preventDefault();
          dragOriginRef.current = event.clientX - left;
          startTimeRef.current = Date.now();
          setDragging(true);
          onStart?.();
        }}
        ref={actionRef}
        style={{ ...actionStyle, transform: `translateX(${left}px)` }}
        type="button"
      >
        {isPassing ? '✓' : '»'}
      </button>
    </div>
  );
}
