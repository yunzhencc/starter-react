# Common UI Captcha Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Vben-parity React captcha components in `@yunzhen/common-ui` and replace the admin login page's inline range verifier.

**Architecture:** Create an effects package at `packages/effects/common-ui`, separate from the existing `packages/ui` primitive library as Vben separates its `effects/common-ui` package from core UI. The package owns captcha state, canvas geometry, pointer interaction, callbacks, and reset refs; it deliberately does not own API calls or server-side validation. The login page holds only the resulting verified boolean.

**Tech Stack:** React 19, TypeScript 6, Vitest 4, Testing Library, JSDOM, Canvas 2D API, existing workspace CSS variables and Lucide icons.

## Global Constraints

- Keep Vben's four public captcha concepts, defaults, geometry, pass thresholds, success timing, and `resume()` reset behavior.
- Use React props/callbacks and refs in place of Vue props/events/`v-model`; do not copy Vue-specific APIs into React.
- Do not add a runtime dependency; add only `jsdom` as a root test dependency because this workspace currently has no DOM test environment.
- `@yunzhen/common-ui` may depend on existing `shadcn-ui`, but must not contain token/session/API logic.
- Keep keyboard focus and button labels accessible; pointer drag remains the interaction required by Vben.

---

## File structure

| File | Responsibility |
| --- | --- |
| `packages/effects/common-ui/package.json` | Workspace package manifest and `@yunzhen/common-ui/captcha` export. |
| `packages/effects/common-ui/tsconfig.json` | Strict React typecheck boundary. |
| `packages/effects/common-ui/src/captcha/types.ts` | Public React props, result, point, and ref contracts. |
| `packages/effects/common-ui/src/captcha/math.ts` | Framework-independent slider, rotation, and puzzle calculations. |
| `packages/effects/common-ui/src/captcha/slider-captcha.tsx` | Vben's shared drag bar and reset behavior. |
| `packages/effects/common-ui/src/captcha/slider-rotate-captcha.tsx` | Image rotation challenge backed by `SliderCaptcha`. |
| `packages/effects/common-ui/src/captcha/slider-translate-captcha.tsx` | Canvas puzzle challenge backed by `SliderCaptcha`. |
| `packages/effects/common-ui/src/captcha/point-selection-captcha.tsx` | Card and click-point captcha. |
| `packages/effects/common-ui/src/captcha/captcha.css` | Vben-equivalent geometry, states, and text treatment. |
| `packages/effects/common-ui/src/captcha/index.ts` | Captcha public exports. |
| `packages/effects/common-ui/src/index.ts` | Package root export. |
| `packages/effects/common-ui/src/captcha/*.test.tsx` | DOM interaction tests for each captcha family. |
| `apps/admin/src/pages/_auth/login.tsx` | Consume `SliderCaptcha` instead of the inline range input. |
| `apps/admin/src/pages/_auth/login.css` | Remove the retired inline verifier rules. |
| `apps/admin/src/features/auth/login-form.test.tsx` | Assert the login form consumes the shared verifier. |
| `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml` | Add the DOM test runner and discover the nested effects package. |

## Public interfaces

```ts
export interface CaptchaVerifyPassingData {
  isPassing: true;
  time: string;
}

export interface CaptchaHandle {
  resume: () => void;
}

export interface SliderMoveData {
  moveDistance: number;
  moveX: number;
}

export interface SliderCaptchaProps {
  checked?: boolean;
  defaultChecked?: boolean;
  isSlot?: boolean;
  text?: string;
  successText?: string;
  onStart?: () => void;
  onMove?: (data: SliderMoveData) => void;
  onEnd?: () => void;
  onSuccess?: (data: CaptchaVerifyPassingData) => void;
}

export interface PointSelectionCaptchaProps {
  captchaImage: string;
  hintImage?: string;
  hintText?: string;
  showConfirm?: boolean;
  onClick?: (point: CaptchaPoint) => void;
  onRefresh?: () => void;
  onConfirm?: (points: CaptchaPoint[], clear: () => void) => void;
}
```

### Task 1: Package setup and shared captcha math

**Files:**
- Create: `packages/effects/common-ui/package.json`
- Create: `packages/effects/common-ui/tsconfig.json`
- Create: `packages/effects/common-ui/src/captcha/math.ts`
- Create: `packages/effects/common-ui/src/captcha/math.test.ts`
- Create: `packages/effects/common-ui/src/captcha/types.ts`
- Create: `packages/effects/common-ui/src/captcha/index.ts`
- Create: `packages/effects/common-ui/src/index.ts`
- Modify: `pnpm-workspace.yaml`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

**Consumes:** Workspace TypeScript configuration, Vitest, and `packages/ui` primitives.

**Produces:** Importable `@yunzhen/common-ui/captcha`; `getSliderOffset`, `toRotateDegree`, `isWithinTolerance`, `createPuzzlePosition`, and public types for all later components.

- [ ] **Step 1: Add the workspace package manifest and test environment setup**

Create the package with React peer dependencies, a workspace dependency on `shadcn-ui`, and explicit `./captcha` export. Extend `pnpm-workspace.yaml` with `packages/*/*` so `packages/effects/common-ui` is discovered. Add `jsdom` under the root `test` catalog and root dev dependencies using `pnpm add -Dw jsdom@catalog:test`.

- [ ] **Step 2: Write the failing math test**

```ts
import { describe, expect, it } from 'vitest';
import { getSliderOffset, isWithinTolerance, toRotateDegree } from './math';

describe('Vben captcha math', () => {
  it('uses the Vben slider offset and rotation scale', () => {
    expect(getSliderOffset(220, 40)).toBe(174);
    expect(toRotateDegree(100, 260, 300)).toBe(174);
  });

  it('passes only inside the configured tolerance', () => {
    expect(isWithinTolerance(100, 103, 3)).toBe(true);
    expect(isWithinTolerance(100, 104, 3)).toBe(false);
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `pnpm exec vitest run packages/effects/common-ui/src/captcha/math.test.ts`

Expected: FAIL because `./math` does not exist.

- [ ] **Step 4: Implement the smallest shared calculation layer**

```ts
export function getSliderOffset(width: number, actionWidth: number) {
  return width - actionWidth - 6;
}

export function toRotateDegree(moveX: number, imageSize: number, maxDegree: number) {
  return Math.ceil((moveX / imageSize) * 1.5 * maxDegree);
}

export function isWithinTolerance(target: number, actual: number, tolerance: number) {
  return Math.abs(target - actual) <= tolerance;
}
```

Define all exported type names from the Public interfaces section and re-export them from both entry points.

- [ ] **Step 5: Run the math test to verify it passes**

Run: `pnpm exec vitest run packages/effects/common-ui/src/captcha/math.test.ts`

Expected: PASS with two tests.

- [ ] **Step 6: Commit the independently usable package foundation**

```bash
git add package.json pnpm-workspace.yaml pnpm-lock.yaml packages/effects/common-ui
git commit -m "feat(common-ui): add captcha package foundation"
```

### Task 2: Shared slider captcha

**Files:**
- Create: `packages/effects/common-ui/src/captcha/slider-captcha.tsx`
- Create: `packages/effects/common-ui/src/captcha/slider-captcha.test.tsx`
- Create: `packages/effects/common-ui/src/captcha/captcha.css`
- Modify: `packages/effects/common-ui/src/captcha/index.ts`

**Consumes:** `getSliderOffset`, `CaptchaHandle`, `SliderCaptchaProps`, and existing CSS variables.

**Produces:** `SliderCaptcha` with Vben's 40px bar, end-to-end success, `isSlot` movement callbacks, and `resume()` ref.

- [ ] **Step 1: Write the failing slider interaction tests**

```tsx
import type { CaptchaHandle } from './slider-captcha';
import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { expect, it, vi } from 'vitest';
import { SliderCaptcha } from './slider-captcha';

it('reports elapsed success after dragging to the Vben end offset', () => {
  const onSuccess = vi.fn();
  render(<SliderCaptcha onSuccess={onSuccess} />);
  const action = screen.getByRole('button', { name: '拖动滑块完成验证' });
  fireEvent.pointerDown(action, { clientX: 0 });
  fireEvent.pointerMove(window, { clientX: 400 });
  fireEvent.pointerUp(window, { clientX: 400 });
  expect(onSuccess).toHaveBeenCalledWith(expect.objectContaining({ isPassing: true }));
});

it('resets a successful slider through its ref', () => {
  const ref = createRef<CaptchaHandle>();
  render(<SliderCaptcha ref={ref} />);
  ref.current?.resume();
  expect(screen.getByText('拖动滑块完成验证')).toBeVisible();
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm exec vitest run packages/effects/common-ui/src/captcha/slider-captcha.test.tsx`

Expected: FAIL because `SliderCaptcha` is not exported.

- [ ] **Step 3: Implement the component**

Use `forwardRef`/`useImperativeHandle` for `resume()`. Record `Date.now()` on pointer down. Keep the Vben offset `wrapperWidth - actionWidth - 6`, set the handle and success fill from the pointer delta, and complete automatically at the end when `isSlot` is false. For `isSlot`, emit move/end callbacks without deciding pass/fail. Use pointer capture and window listeners so a drag ending outside the handle still resolves.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm exec vitest run packages/effects/common-ui/src/captcha/slider-captcha.test.tsx`

Expected: PASS with success and ref-reset tests.

- [ ] **Step 5: Commit the shared slider**

```bash
git add packages/effects/common-ui/src/captcha
git commit -m "feat(common-ui): add Vben slider captcha"
```

### Task 3: Rotation and translate puzzle captchas

**Files:**
- Create: `packages/effects/common-ui/src/captcha/slider-rotate-captcha.tsx`
- Create: `packages/effects/common-ui/src/captcha/slider-rotate-captcha.test.tsx`
- Create: `packages/effects/common-ui/src/captcha/slider-translate-captcha.tsx`
- Create: `packages/effects/common-ui/src/captcha/slider-translate-captcha.test.tsx`
- Modify: `packages/effects/common-ui/src/captcha/math.ts`
- Modify: `packages/effects/common-ui/src/captcha/index.ts`

**Consumes:** `SliderCaptcha`, `toRotateDegree`, `isWithinTolerance`, and public captcha result/ref types.

**Produces:** Vben-style rotate and translate puzzle challenges whose callbacks pass only when their configured tolerance is met.

- [ ] **Step 1: Write failing threshold tests**

```tsx
it('accepts a rotation inside diffDegree and resets an outside rotation', () => {
  const onSuccess = vi.fn();
  vi.spyOn(Math, 'random').mockReturnValue(0);
  render(<SliderRotateCaptcha diffDegree={20} maxDegree={300} minDegree={120} onSuccess={onSuccess} src="/captcha.jpg" />);
  // Trigger image load, then drive the shared slider to the matching degree.
  expect(onSuccess).toHaveBeenCalledWith(expect.objectContaining({ isPassing: true }));
});

it('uses Vben diffDistance for the puzzle piece', () => {
  expect(isWithinTolerance(100, 103, 3)).toBe(true);
  expect(isWithinTolerance(100, 104, 3)).toBe(false);
});
```

Stub `HTMLCanvasElement.prototype.getContext` and `Image` in the translate test with the exact 2D methods used by the component: `arc`, `beginPath`, `clearRect`, `clip`, `drawImage`, `fill`, `getImageData`, `lineTo`, `moveTo`, `putImageData`, and `stroke`.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm exec vitest run packages/effects/common-ui/src/captcha/slider-rotate-captcha.test.tsx packages/effects/common-ui/src/captcha/slider-translate-captcha.test.tsx`

Expected: FAIL because both components are missing.

- [ ] **Step 3: Implement Vben's rotate and puzzle calculations**

For rotation, generate `Math.floor(minDegree + Math.random() * (maxDegree - minDegree))`, calculate `Math.ceil((moveX / imageSize) * 1.5 * maxDegree)`, and compare the remaining error with `diffDegree` using Vben's strict less-than condition. For translation, retain Vben's square/circle puzzle path and random coordinate ranges, move the piece with shared slider x movement, and use the strict `diffDistance` check. Both components expose `resume()` and regenerate a challenge on image/canvas click.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm exec vitest run packages/effects/common-ui/src/captcha/slider-rotate-captcha.test.tsx packages/effects/common-ui/src/captcha/slider-translate-captcha.test.tsx`

Expected: PASS; failure paths visibly reset and no success callback fires.

- [ ] **Step 5: Commit the image challenges**

```bash
git add packages/effects/common-ui/src/captcha
git commit -m "feat(common-ui): add Vben image captchas"
```

### Task 4: Point-selection captcha

**Files:**
- Create: `packages/effects/common-ui/src/captcha/point-selection-captcha.tsx`
- Create: `packages/effects/common-ui/src/captcha/point-selection-captcha.test.tsx`
- Modify: `packages/effects/common-ui/src/captcha/index.ts`
- Modify: `packages/effects/common-ui/src/captcha/captcha.css`

**Consumes:** `CaptchaPoint`, point-selection prop types, existing UI `Button` and Lucide `RefreshCw`.

**Produces:** `PointSelectionCaptcha` and `PointSelectionCaptchaCard` with coordinate points, clear/refresh, and optional confirmation.

- [ ] **Step 1: Write the failing card tests**

```tsx
it('collects numbered image-relative points and confirms with a clear function', () => {
  const onConfirm = vi.fn();
  render(<PointSelectionCaptcha captchaImage="/captcha.jpg" hintText="云真" showConfirm onConfirm={onConfirm} />);
  fireEvent.click(screen.getByAltText('验证码图片'), { clientX: 24, clientY: 36 });
  expect(screen.getByRole('button', { name: '1' })).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: '确认验证码' }));
  expect(onConfirm).toHaveBeenCalledWith([expect.objectContaining({ i: 0, x: 24, y: 36 })], expect.any(Function));
});

it('clears points before calling refresh', () => {
  const onRefresh = vi.fn();
  render(<PointSelectionCaptcha captchaImage="/captcha.jpg" hintText="云真" onRefresh={onRefresh} />);
  fireEvent.click(screen.getByAltText('验证码图片'), { clientX: 24, clientY: 36 });
  fireEvent.click(screen.getByRole('button', { name: '刷新验证码' }));
  expect(screen.queryByRole('button', { name: '1' })).not.toBeInTheDocument();
  expect(onRefresh).toHaveBeenCalledOnce();
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm exec vitest run packages/effects/common-ui/src/captcha/point-selection-captcha.test.tsx`

Expected: FAIL because `PointSelectionCaptcha` is not exported.

- [ ] **Step 3: Implement the Vben card and point behavior**

Keep Vben's 300×220 default content dimensions, 12px/16px paddings, click-relative coordinates, 11px marker offset, 1-indexed labels, and hint-image-before-hint-text selection. The image's measured `getBoundingClientRect()` must be the coordinate origin; do not use page coordinates directly.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm exec vitest run packages/effects/common-ui/src/captcha/point-selection-captcha.test.tsx`

Expected: PASS with point, refresh, and confirm coverage.

- [ ] **Step 5: Commit point selection**

```bash
git add packages/effects/common-ui/src/captcha
git commit -m "feat(common-ui): add Vben point captcha"
```

### Task 5: Login integration and full verification

**Files:**
- Modify: `apps/admin/package.json`
- Modify: `apps/admin/src/pages/_auth/login.tsx`
- Modify: `apps/admin/src/pages/_auth/login.css`
- Modify: `apps/admin/src/features/auth/login-form.test.tsx`

**Consumes:** `SliderCaptcha` and its `onSuccess` callback from `@yunzhen/common-ui/captcha`.

**Produces:** The login page blocks submission until the shared Vben-style slider succeeds; no local native range verifier remains.

- [ ] **Step 1: Write the failing login markup test**

```tsx
it('uses the shared captcha rather than a native range input', () => {
  const markup = renderToStaticMarkup(<LoginForm onSuccess={() => undefined} />);
  expect(markup).toContain('拖动滑块完成验证');
  expect(markup).not.toContain('type="range"');
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run apps/admin/src/features/auth/login-form.test.tsx`

Expected: FAIL because the login form still renders `type="range"`.

- [ ] **Step 3: Replace only the local verifier**

Add `@yunzhen/common-ui` as an app workspace dependency, render `SliderCaptcha`, and set `captchaVerified` from `onSuccess`. Reset it when the selected demo account changes. Keep all account, password, remember-me, redirect, and session behavior unchanged. Delete only `.login-slider*` rules because the shared component ships its own styles.

- [ ] **Step 4: Run focused tests and build checks**

Run:

```bash
pnpm exec vitest run packages/effects/common-ui/src/captcha apps/admin/src/features/auth/login-form.test.tsx
pnpm --filter admin build
pnpm --filter shadcn-ui build
```

Expected: all focused tests PASS and both builds complete without TypeScript errors.

- [ ] **Step 5: Inspect the final diff and commit**

```bash
git diff --check
git status --short
git add apps/admin packages/effects/common-ui package.json pnpm-workspace.yaml pnpm-lock.yaml
git commit -m "feat(admin): use shared Vben captcha"
```

## Plan self-review

- Spec coverage: Tasks 2–4 implement every required Vben captcha; Task 5 replaces the inline login verifier; Task 1 enforces the intended effects-package boundary.
- Placeholder scan: no deferred requirements or unspecified error handling remain; canvas methods and commands are explicit.
- Type consistency: `CaptchaHandle`, `CaptchaVerifyPassingData`, `SliderMoveData`, and `SliderCaptcha` are defined before later tasks consume them.
