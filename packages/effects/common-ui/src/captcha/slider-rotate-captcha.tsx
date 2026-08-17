import type { Ref } from 'react';
import type { CaptchaHandle, SliderMoveData, SliderRotateCaptchaProps } from './types';
import { useImperativeHandle, useRef, useState } from 'react';
import { isWithinTolerance, toRotateDegree } from './math';
import { SliderCaptcha } from './slider-captcha';

export function SliderRotateCaptcha({
  defaultTip = '请将图片旋转至正确角度',
  diffDegree = 20,
  imageSize = 260,
  imageWrapperStyle,
  maxDegree = 300,
  minDegree = 120,
  onSuccess,
  src = '',
  ref,
}: SliderRotateCaptchaProps & { ref?: Ref<CaptchaHandle> }) {
  const sliderRef = useRef<CaptchaHandle>(null);
  const moveXRef = useRef(0);
  const startTimeRef = useRef(0);
  const [currentRotate, setCurrentRotate] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [elapsedTime, setElapsedTime] = useState('0.0');
  const [isPassing, setIsPassing] = useState(false);
  const [randomRotate, setRandomRotate] = useState(0);
  const [showTip, setShowTip] = useState(false);

  function createChallenge() {
    setCurrentRotate(0);
    setIsPassing(false);
    setShowTip(false);
    setElapsedTime('0.0');
    setRandomRotate(Math.floor(minDegree + Math.random() * (maxDegree - minDegree)));
    sliderRef.current?.resume();
  }

  function resume() {
    createChallenge();
  }

  useImperativeHandle(ref, () => ({ resume }));

  function handleMove({ moveX }: SliderMoveData) {
    moveXRef.current = moveX;
    setDragging(true);
    setCurrentRotate(toRotateDegree(moveX, imageSize, maxDegree));
  }

  function handleEnd() {
    setDragging(false);
    const passing = isWithinTolerance(randomRotate, currentRotate, diffDegree - Number.EPSILON);
    setShowTip(true);
    if (!passing) {
      setCurrentRotate(0);
      sliderRef.current?.resume();
      return;
    }

    setIsPassing(true);
    const time = ((Date.now() - startTimeRef.current) / 1000).toFixed(1);
    setElapsedTime(time);
    onSuccess?.({
      isPassing: true,
      time,
    });
  }

  return (
    <div className="yz-captcha-image">
      <div className="yz-captcha-image__rotate" style={{ height: imageSize, width: imageSize, ...imageWrapperStyle }}>
        <img
          alt="旋转验证码"
          onClick={resume}
          onLoad={createChallenge}
          src={src}
          style={{ transform: `rotateZ(${randomRotate - currentRotate}deg)` }}
        />
        <div className="yz-captcha-image__tips">
          {showTip && <div className={isPassing ? 'yz-captcha-image__tip--success' : 'yz-captcha-image__tip--error'}>{isPassing ? `验证通过，用时 ${elapsedTime} 秒` : '校验失败，请重试'}</div>}
          {!dragging && <div>{defaultTip}</div>}
        </div>
      </div>
      <SliderCaptcha
        checked={isPassing}
        isSlot
        onEnd={handleEnd}
        onMove={handleMove}
        onStart={() => { startTimeRef.current = Date.now(); }}
        ref={sliderRef}
      />
    </div>
  );
}
