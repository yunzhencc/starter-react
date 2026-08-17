import type { Ref } from 'react';
import type { CaptchaHandle, SliderMoveData, SliderTranslateCaptchaProps } from './types';
import { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { isWithinTolerance } from './math';
import { SliderCaptcha } from './slider-captcha';

const PI = Math.PI;

export function SliderTranslateCaptcha({
  canvasHeight = 280,
  canvasWidth = 420,
  circleRadius = 10,
  defaultTip = '拖动滑块完成拼图',
  diffDistance = 3,
  onSuccess,
  squareLength = 42,
  src = '',
  ref,
}: SliderTranslateCaptchaProps & { ref?: Ref<CaptchaHandle> }) {
  const pieceCanvasRef = useRef<HTMLCanvasElement>(null);
  const puzzleCanvasRef = useRef<HTMLCanvasElement>(null);
  const sliderRef = useRef<CaptchaHandle>(null);
  const moveXRef = useRef(0);
  const startTimeRef = useRef(0);
  const [dragging, setDragging] = useState(false);
  const [isPassing, setIsPassing] = useState(false);
  const [moveX, setMoveX] = useState(0);
  const pieceRef = useRef({ x: 0, y: 0 });
  const [showTip, setShowTip] = useState(false);
  const [elapsedTime, setElapsedTime] = useState('0.0');

  function randomNumber(start: number, end: number) {
    return Math.round(Math.random() * (end - start) + start);
  }

  const drawPiece = useCallback((context: CanvasRenderingContext2D, x: number, y: number, operation: 'clip' | 'fill') => {
    context.beginPath();
    context.moveTo(x, y);
    context.arc(x + squareLength / 2, y - circleRadius + 2, circleRadius, 0.72 * PI, 2.26 * PI);
    context.lineTo(x + squareLength, y);
    context.arc(x + squareLength + circleRadius - 2, y + squareLength / 2, circleRadius, 1.21 * PI, 2.78 * PI);
    context.lineTo(x + squareLength, y + squareLength);
    context.lineTo(x, y + squareLength);
    context.arc(x + circleRadius - 2, y + squareLength / 2, circleRadius + 0.4, 2.76 * PI, 1.24 * PI, true);
    context.lineTo(x, y);
    context.lineWidth = 2;
    context.fillStyle = 'rgba(255, 255, 255, 0.7)';
    context.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    context.stroke();
    if (operation === 'clip')
      context.clip();
    else context.fill();
    context.globalCompositeOperation = 'destination-over';
  }, [circleRadius, squareLength]);

  const initialize = useCallback(() => {
    const puzzleCanvas = puzzleCanvasRef.current;
    const pieceCanvas = pieceCanvasRef.current;
    if (!puzzleCanvas || !pieceCanvas)
      return;
    const puzzleContext = puzzleCanvas.getContext('2d', { willReadFrequently: true });
    const pieceContext = pieceCanvas.getContext('2d', { willReadFrequently: true });
    if (!puzzleContext || !pieceContext)
      return;
    const x = randomNumber(squareLength + 2 * circleRadius, canvasWidth - (squareLength + 2 * circleRadius));
    const y = randomNumber(3 * circleRadius, canvasHeight - (squareLength + 2 * circleRadius));
    pieceRef.current = { x, y };
    const image = new Image();
    image.crossOrigin = 'Anonymous';
    image.onload = () => {
      puzzleContext.clearRect(0, 0, canvasWidth, canvasHeight);
      pieceContext.clearRect(0, 0, canvasWidth, canvasHeight);
      drawPiece(puzzleContext, x, y, 'fill');
      drawPiece(pieceContext, x, y, 'clip');
      puzzleContext.drawImage(image, 0, 0, canvasWidth, canvasHeight);
      pieceContext.drawImage(image, 0, 0, canvasWidth, canvasHeight);
      const pieceLength = squareLength + 2 * circleRadius + 3;
      const imageData = pieceContext.getImageData(x, y - 2 * circleRadius - 1, pieceLength, pieceLength);
      pieceCanvas.width = pieceLength;
      pieceContext.putImageData(imageData, 0, y - 2 * circleRadius - 1);
    };
    image.src = src;
  }, [canvasHeight, canvasWidth, circleRadius, drawPiece, squareLength, src]);

  function resume() {
    setDragging(false);
    setIsPassing(false);
    setMoveX(0);
    moveXRef.current = 0;
    setShowTip(false);
    setElapsedTime('0.0');
    sliderRef.current?.resume();
    initialize();
  }

  useImperativeHandle(ref, () => ({ resume }));
  useEffect(() => {
    initialize();
  }, [initialize]);

  function handleMove({ moveX: nextMoveX }: SliderMoveData) {
    moveXRef.current = nextMoveX;
    setDragging(true);
    setMoveX(nextMoveX);
  }

  function handleEnd() {
    setDragging(false);
    setShowTip(true);
    if (!isWithinTolerance(pieceRef.current.x, moveXRef.current, diffDistance - Number.EPSILON)) {
      setMoveX(0);
      moveXRef.current = 0;
      sliderRef.current?.resume();
      return;
    }
    setIsPassing(true);
    const time = ((Date.now() - startTimeRef.current) / 1000).toFixed(1);
    setElapsedTime(time);
    onSuccess?.({ isPassing: true, time });
  }

  return (
    <div className="yz-captcha-image">
      <div className="yz-captcha-image__puzzle">
        <canvas height={canvasHeight} onClick={resume} ref={puzzleCanvasRef} width={canvasWidth} />
        <canvas className="yz-captcha-image__piece" height={canvasHeight} onClick={resume} ref={pieceCanvasRef} style={{ left: moveX }} width={canvasWidth} />
        <div className="yz-captcha-image__tips">
          {showTip && <div className={isPassing ? 'yz-captcha-image__tip--success' : 'yz-captcha-image__tip--error'}>{isPassing ? `验证通过，用时 ${elapsedTime} 秒` : '校验失败，请重试'}</div>}
          {!dragging && <div>{defaultTip}</div>}
        </div>
      </div>
      <SliderCaptcha checked={isPassing} isSlot onEnd={handleEnd} onMove={handleMove} onStart={() => { startTimeRef.current = Date.now(); }} ref={sliderRef} />
    </div>
  );
}
