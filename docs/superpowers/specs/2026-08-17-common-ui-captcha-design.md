# Common UI Captcha Design

## Goal

Add `@yunzhen/common-ui` at `packages/effects/common-ui` and reproduce the four captcha interactions in Vben's `@vben/common-ui` for this React workspace.

## Package boundary

`@yunzhen/common-ui` is an effects package. It composes existing primitives from `packages/ui`; it does not own authentication APIs, session state, or server-side captcha validation.

The package publicly exports:

- `SliderCaptcha`
- `SliderRotateCaptcha`
- `SliderTranslateCaptcha`
- `PointSelectionCaptcha`
- `PointSelectionCaptchaCard`
- Captcha prop and result types

## Component behavior

### SliderCaptcha

Renders Vben's 40px drag track: action handle, success fill, default and success labels. Pointer drag to the right edge succeeds by default. It reports start, move, end, and success with elapsed seconds. Consumers can use a ref `resume()` method to reset the handle and fill.

`isSlot` changes the control into the shared drag source used by the rotate and translate variants: it reports movement and leaves pass/fail decisions to the parent.

### SliderRotateCaptcha

Displays a square image clipped to a circle, randomly rotates it between `minDegree` and `maxDegree`, then maps slider movement to the rotation value. It succeeds when the remaining angular error is below `diffDegree`; otherwise it restores the random rotation and shows the failure state. Clicking the image or `resume()` creates a new challenge.

### SliderTranslateCaptcha

Draws Vben's puzzle silhouette on two canvases using the same geometry. A random puzzle location becomes the movable image piece. It succeeds only when slider displacement is within `diffDistance` of the generated x coordinate; otherwise the piece returns to the origin. Clicking the canvas or `resume()` regenerates the puzzle.

### PointSelectionCaptcha

Displays a captcha image in the Vben card layout. Image clicks add 1-indexed point markers with x/y coordinates and timestamps. Refresh clears points and calls `onRefresh`; optional confirmation calls `onConfirm(points, clear)`. It accepts either a hint image or hint text.

## React API mapping

React callbacks replace Vue events and controlled state replaces `v-model`:

- `onStart`, `onMove`, `onEnd`, `onSuccess`
- `checked` and `defaultChecked` on the slider variants
- refs expose `resume()`
- `onClick`, `onRefresh`, `onConfirm` on point selection

Vben defaults and challenge calculations remain the source of truth. This mapping is required only because the target runtime is React, not Vue.

## Login integration

`apps/admin/src/pages/_auth/login.tsx` will render `SliderCaptcha`. Login remains blocked until its success callback sets local verification state. The existing inline range markup and slider-specific CSS are removed.

## Verification

Vitest tests will first cover:

1. drag success and ref reset for `SliderCaptcha`;
2. rotate success/failure threshold behavior;
3. translate tolerance behavior with a deterministic random location;
4. point coordinate collection, refresh, and confirm;
5. the login form requiring captcha success before authentication.

Canvas image decoding is a browser concern, so the tests will exercise the challenge math and callback behavior with a minimal canvas context rather than asserting pixels.
