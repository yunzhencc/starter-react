import type { CSSProperties } from 'react';

export interface CaptchaHandle {
  resume: () => void;
}

export interface CaptchaPoint {
  i: number;
  t: number;
  x: number;
  y: number;
}

export interface CaptchaVerifyPassingData {
  isPassing: true;
  time: string;
}

export interface SliderMoveData {
  moveDistance: number;
  moveX: number;
}

export interface SliderCaptchaProps {
  actionStyle?: CSSProperties;
  barStyle?: CSSProperties;
  checked?: boolean;
  className?: string;
  contentStyle?: CSSProperties;
  defaultChecked?: boolean;
  isSlot?: boolean;
  onEnd?: () => void;
  onMove?: (data: SliderMoveData) => void;
  onStart?: () => void;
  onSuccess?: (data: CaptchaVerifyPassingData) => void;
  successText?: string;
  text?: string;
  wrapperStyle?: CSSProperties;
}

export interface SliderRotateCaptchaProps {
  defaultTip?: string;
  diffDegree?: number;
  imageSize?: number;
  imageWrapperStyle?: CSSProperties;
  maxDegree?: number;
  minDegree?: number;
  onSuccess?: (data: CaptchaVerifyPassingData) => void;
  src?: string;
}

export interface SliderTranslateCaptchaProps {
  canvasHeight?: number;
  canvasWidth?: number;
  circleRadius?: number;
  defaultTip?: string;
  diffDistance?: number;
  onSuccess?: (data: CaptchaVerifyPassingData) => void;
  squareLength?: number;
  src?: string;
}

export interface PointSelectionCaptchaCardProps {
  captchaImage: string;
  height?: number | string;
  paddingX?: number | string;
  paddingY?: number | string;
  title?: string;
  width?: number | string;
}

export interface PointSelectionCaptchaProps extends PointSelectionCaptchaCardProps {
  hintImage?: string;
  hintText?: string;
  onClick?: (point: CaptchaPoint) => void;
  onConfirm?: (points: CaptchaPoint[], clear: () => void) => void;
  onRefresh?: () => void;
  showConfirm?: boolean;
}
