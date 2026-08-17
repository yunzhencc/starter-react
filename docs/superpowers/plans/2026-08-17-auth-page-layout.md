# AuthPageLayout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Vben-shaped authentication layout modules with persisted left, center, and right login-panel selection.

**Architecture:** Keep application wiring in `apps/admin/src/layouts/auth.tsx`. Put the reusable authentication page structure and its storage boundary under `features/layout/authentication`, and keep the layout selector as an independent `features/layout/widgets` control, mirroring Vben's `authentication` and `widgets/layout-toggle` ownership. The existing login form remains an unchanged child of the page layout.

**Tech Stack:** React 19, TypeScript, Ant Design, Vitest, CSS.

## Global Constraints

- Do not introduce Vben, Vue, or a dependency.
- Keep authentication sessions, login form behavior, captcha, routes, and theme toggle unchanged.
- Store only the selected layout in `starter-react:auth-page-layout`.
- Valid values are exactly `panel-left`, `panel-center`, and `panel-right`; missing or malformed values use `panel-right`.
- At 840px and below, render one form column while retaining the chosen preference for larger screens.

---

### Task 1: Authentication layout preferences

**Files:**
- Create: `apps/admin/src/features/layout/authentication/preferences.ts`
- Create: `apps/admin/src/features/layout/authentication/preferences.test.ts`

**Interfaces:**
- Produces: `AuthPageLayoutType`, `getAuthPageLayout(): AuthPageLayoutType`, `setAuthPageLayout(layout: AuthPageLayoutType): void`.
- Consumed by: `AuthPageLayout` in Task 2.

- [x] **Step 1: Write the failing test**

```ts
// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { getAuthPageLayout, setAuthPageLayout } from './preferences';

afterEach(() => localStorage.clear());

describe('auth page layout preference', () => {
  it('uses panel-right until a valid layout is selected', () => {
    expect(getAuthPageLayout()).toBe('panel-right');
    setAuthPageLayout('panel-left');
    expect(getAuthPageLayout()).toBe('panel-left');
  });

  it('falls back to panel-right for malformed storage', () => {
    localStorage.setItem('starter-react:auth-page-layout', 'bottom');
    expect(getAuthPageLayout()).toBe('panel-right');
  });
});
```

The mutation this catches is accepting an invalid stored value or storing under the wrong key.

- [x] **Step 2: Run the test to verify it fails**

Run: `CI=true pnpm exec vitest run apps/admin/src/features/layout/authentication/preferences.test.ts`

Expected: FAIL because `./preferences` does not exist.

- [x] **Step 3: Write the minimal implementation**

```ts
export const authPageLayouts = ['panel-left', 'panel-center', 'panel-right'] as const;
export type AuthPageLayoutType = (typeof authPageLayouts)[number];

const storageKey = 'starter-react:auth-page-layout';
const defaultLayout: AuthPageLayoutType = 'panel-right';

export function getAuthPageLayout(): AuthPageLayoutType {
  if (typeof window === 'undefined')
    return defaultLayout;
  const layout = window.localStorage.getItem(storageKey);
  return authPageLayouts.includes(layout as AuthPageLayoutType)
    ? layout as AuthPageLayoutType
    : defaultLayout;
}

export function setAuthPageLayout(layout: AuthPageLayoutType) {
  window.localStorage.setItem(storageKey, layout);
}
```

- [x] **Step 4: Run the test to verify it passes**

Run: `CI=true pnpm exec vitest run apps/admin/src/features/layout/authentication/preferences.test.ts`

Expected: PASS with two tests.

### Task 2: Vben-shaped AuthPageLayout and layout switcher

**Files:**
- Create: `apps/admin/src/features/layout/authentication/auth-page-layout.tsx`
- Create: `apps/admin/src/features/layout/authentication/auth-page-layout.css`
- Create: `apps/admin/src/features/layout/authentication/auth-page-layout.test.tsx`
- Create: `apps/admin/src/features/layout/authentication/index.ts`
- Create: `apps/admin/src/features/layout/widgets/auth-page-layout-toggle.tsx`
- Modify: `apps/admin/src/layouts/auth.tsx:1-30`
- Delete: `apps/admin/src/layouts/auth.css`

**Interfaces:**
- Consumes: Task 1 preference functions and `ThemeToggle`.
- Produces: `AuthPageLayout(props)` and `AuthPageLayoutToggle({ layout, onLayoutChange })`.
- `AuthPageLayout` props are `{ appName: string; logo: string; pageTitle: string; pageDescription: string; children: ReactNode }`.
- Consumed by: the authentication route layout in `apps/admin/src/layouts/auth.tsx`.

- [x] **Step 1: Write the failing layout test**

```tsx
// @vitest-environment jsdom
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';
import { AuthPageLayout } from './auth-page-layout';
import { setAuthPageLayout } from './preferences';

afterEach(() => localStorage.clear());

function renderLayout(layout: 'panel-left' | 'panel-center' | 'panel-right') {
  setAuthPageLayout(layout);
  return renderToStaticMarkup(
    <AuthPageLayout appName="React Starter" logo="/logo.svg" pageDescription="Description" pageTitle="Title">
      <div>Login form</div>
    </AuthPageLayout>,
  );
}

describe('AuthPageLayout', () => {
  it('renders the selected side or center layout', () => {
    expect(renderLayout('panel-left')).toContain('data-layout="panel-left"');
    expect(renderLayout('panel-right')).toContain('data-layout="panel-right"');
    expect(renderLayout('panel-center')).toContain('data-layout="panel-center"');
  });

  it('only renders the hero for side layouts', () => {
    expect(renderLayout('panel-left')).toContain('auth-page-layout__hero');
    expect(renderLayout('panel-right')).toContain('auth-page-layout__hero');
    expect(renderLayout('panel-center')).not.toContain('auth-page-layout__hero');
  });
});
```

The mutations this catches are ignoring the selected layout or rendering the Hero in Vben's centered panel mode.

- [x] **Step 2: Run the test to verify it fails**

Run: `CI=true pnpm exec vitest run apps/admin/src/features/layout/authentication/auth-page-layout.test.tsx`

Expected: FAIL because `./auth-page-layout` does not exist.

- [x] **Step 3: Implement the minimal modules**

Create `AuthPageLayout` with a `useState(getAuthPageLayout)` value. Pass that value and a handler which calls `setAuthPageLayout` to `AuthPageLayoutToggle`. Render Hero before the form for `panel-right`, form before Hero for `panel-left`, and only the centered form for `panel-center`. Put `data-layout` on the root and `data-side` on side panels.

Create `AuthPageLayoutToggle` as an Ant Design `Dropdown` with three radio-style `menu.items`, labels `表单居左`、`表单居中`、`表单居右`, and `onClick` calling `onLayoutChange(key as AuthPageLayoutType)`. Render it next to the existing `ThemeToggle` in the authentication toolbar.

Move the current `auth.css` styles into `auth-page-layout.css`. Replace fixed grid order with `[data-layout='panel-left']`, `[data-layout='panel-right']`, and `[data-layout='panel-center']` selectors; preserve existing colors, branding, and 840px breakpoint. For center mode, retain the base background and center the 400px login form. Export `AuthPageLayout` and preference types from `index.ts`.

Replace `layouts/auth.tsx` with this application-level assembly:

```tsx
import { Outlet } from '@tanstack/react-router';
import { AuthPageLayout } from '@/features/layout/authentication';

function AuthLayout() {
  return (
    <AuthPageLayout
      appName="React Starter"
      logo="/logo.svg"
      pageDescription="基于 React、TypeScript 和 Vite 构建"
      pageTitle="开箱即用的中后台管理系统"
    >
      <Outlet />
    </AuthPageLayout>
  );
}

export default AuthLayout;
```

- [x] **Step 4: Run layout and existing login tests**

Run: `CI=true pnpm exec vitest run apps/admin/src/features/layout/authentication/preferences.test.ts apps/admin/src/features/layout/authentication/auth-page-layout.test.tsx apps/admin/src/features/auth/login-form.test.tsx`

Expected: PASS with all focused tests.

### Task 3: Build-level verification

**Files:**
- Modify: none.

**Interfaces:**
- Verifies: route lazy-loading and the extracted module's production TypeScript/CSS integration.

- [x] **Step 1: Check the changed-file diff**

Run: `git diff --check && git status --short`

Expected: no whitespace errors; only the design, plan, and Task 1–2 files are changed.

- [x] **Step 2: Build the admin application**

Run: `CI=true pnpm --filter admin build`

Expected: exit code 0.
