export function getSliderOffset(wrapperWidth: number, actionWidth: number) {
  return wrapperWidth - actionWidth - 6;
}

export function isWithinTolerance(target: number, actual: number, tolerance: number) {
  return Math.abs(target - actual) <= tolerance;
}

export function toRotateDegree(moveX: number, imageSize: number, maxDegree: number) {
  return Math.ceil((moveX / imageSize) * 1.5 * maxDegree);
}
