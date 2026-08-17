# Local Demo Login Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Vben-style local demo login, remembered sessions, protected routes, redirect return, and logout to `apps/admin`.

**Architecture:** Keep the synchronous browser-storage boundary in `features/auth`; do not add a store, backend, or dependency. The root file route owns the single guard, and the login route owns the form and same-origin return destination.

**Tech Stack:** React 19, TanStack React Router, Ant Design, Vitest, TypeScript, Vite.

## Global Constraints

- Only `vben / 123456` can log in; do not add a backend, registration, password recovery, dynamic permissions, or packages.
- Remembered sessions use `localStorage`; normal sessions use `sessionStorage`.
- Persist `accessToken` and username; malformed storage is unauthenticated.
- Unauthenticated app paths redirect to `/auth/login`; logout clears both storage locations.
- Do not stage the pre-existing top-status-indicator removal in feature commits.

---

### Task 1: Local authentication session

**Files:**
- Create: `apps/admin/src/features/auth/session.ts`
- Create: `apps/admin/src/features/auth/session.test.ts`

**Interfaces:**
- Produces `LoginCredentials`, `DemoSession`, `getSession(): DemoSession | undefined`, `login(credentials): DemoSession | undefined`, and `logout(): void`.
- Consumed by root route guard, login route, and `AdminLayout.logout`.

- [ ] **Step 1: Write the failing session test**

```ts
import { afterEach, describe, expect, it } from 'vitest';
import { getSession, login, logout } from './session';

afterEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});
describe('demo authentication', () => {
  it('stores valid credentials in the selected location', () => {
    expect(login({ username: 'vben', password: '123456', remember: true })?.accessToken).toBeTruthy();
    expect(getSession()?.username).toBe('vben');
    expect(sessionStorage.length).toBe(0);
  });
  it('rejects bad credentials and clears both locations on logout', () => {
    expect(login({ username: 'vben', password: 'wrong', remember: false })).toBeUndefined();
    login({ username: 'vben', password: '123456', remember: false });
    logout();
    expect(getSession()).toBeUndefined();
    expect(localStorage.length + sessionStorage.length).toBe(0);
  });
});
```

- [ ] **Step 2: Run the failing test**

Run: `CI=true pnpm exec vitest run apps/admin/src/features/auth/session.test.ts`

Expected: FAIL because `./session` does not exist.

- [ ] **Step 3: Implement the minimum storage boundary**

```ts
export interface LoginCredentials { username: string; password: string; remember: boolean }
export interface DemoSession { accessToken: string; username: 'vben' }
export function login({ username, password, remember }: LoginCredentials) {
  if (username !== 'vben' || password !== '123456')
    return undefined;
  const session = { accessToken: 'demo-vben-access-token', username: 'vben' } as const;
  logout();
  (remember ? localStorage : sessionStorage).setItem('starter-react:auth', JSON.stringify(session));
  return session;
}
```

Add `getSession` with `try/catch` JSON parsing and exact `accessToken`/`username` checks. Add `logout` to remove `starter-react:auth` from both storage objects.

- [ ] **Step 4: Verify and commit**

Run: `CI=true pnpm exec vitest run apps/admin/src/features/auth/session.test.ts`

Expected: PASS.

Run `git add apps/admin/src/features/auth/session.ts apps/admin/src/features/auth/session.test.ts` then `git commit -m "feat(admin): add local demo auth session"`.

### Task 2: Guard and safe return destination

**Files:**
- Create: `apps/admin/src/features/auth/redirect.ts`
- Create: `apps/admin/src/features/auth/redirect.test.ts`
- Modify: `apps/admin/src/pages/__root.tsx:1-18`

**Interfaces:**
- Consumes `getSession()` from `session.ts`.
- Produces `getSafeRedirect(value?: string): string` and `getLoginRedirect(pathname: string, search: string): string`.
- Used by login route and root `beforeLoad`.

- [ ] **Step 1: Write the failing redirect test**

```ts
import { describe, expect, it } from 'vitest';
import { getLoginRedirect, getSafeRedirect } from './redirect';

describe('auth redirects', () => {
  it('preserves local paths and queries', () => {
    expect(getLoginRedirect('/examples/slate', '?mode=edit')).toBe('/examples/slate?mode=edit');
    expect(getSafeRedirect('/examples/slate?mode=edit')).toBe('/examples/slate?mode=edit');
  });
  it('uses dashboard for missing and external values', () => {
    expect(getSafeRedirect(undefined)).toBe('/dashboard');
    expect(getSafeRedirect('https://attacker.test')).toBe('/dashboard');
    expect(getSafeRedirect('//attacker.test')).toBe('/dashboard');
  });
});
```

- [ ] **Step 2: Run the failing test**

Run: `CI=true pnpm exec vitest run apps/admin/src/features/auth/redirect.test.ts`

Expected: FAIL because `./redirect` does not exist.

- [ ] **Step 3: Implement helpers and the only guard**

```ts
export function getSafeRedirect(value?: string) {
  return value?.startsWith('/') && !value.startsWith('//') ? value : '/dashboard';
}
export function getLoginRedirect(pathname: string, search: string) {
  return getSafeRedirect(`${pathname}${search}`);
}
```

Add root `beforeLoad` in `__root.tsx`: signed-out `/auth/` remains available; signed-in `/auth/` redirects to `/dashboard`; all other signed-out paths throw TanStack `redirect` to `/auth/login` using the return value of `getLoginRedirect(location.pathname, location.searchStr)`. Keep `RootComponent` only as the current layout selector.

- [ ] **Step 4: Verify and commit**

Run: `CI=true pnpm exec vitest run apps/admin/src/features/auth/redirect.test.ts && CI=true pnpm --filter admin build`

Expected: PASS; generated route types accept login `search.redirect`.

Run `git add apps/admin/src/features/auth/redirect.ts apps/admin/src/features/auth/redirect.test.ts apps/admin/src/pages/__root.tsx apps/admin/src/routeTree.gen.ts` then `git commit -m "feat(admin): guard local demo routes"`.

### Task 3: Login screen and logout integration

**Files:**
- Modify: `apps/admin/src/pages/_auth/login.tsx:1-9`
- Create: `apps/admin/src/pages/_auth/login.css`
- Create: `apps/admin/src/pages/_auth/login.test.tsx`
- Modify: `apps/admin/src/features/layout/admin-layout.tsx:19-29,270-273`

**Interfaces:**
- Consumes `login`, `getSession`, `logout`, and `getSafeRedirect`.
- Produces exported `LoginForm({ onSuccess, redirect })` with username, password, remember-me, loading, and credential error handling.

- [ ] **Step 1: Write the failing login markup test**

```tsx
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { LoginForm } from './login';

describe('local demo login form', () => {
  it('shows Vben credentials and remembers by default', () => {
    const markup = renderToStaticMarkup(<LoginForm onSuccess={() => undefined} redirect="/dashboard" />);
    expect(markup).toContain('vben / 123456');
    expect(markup).toContain('记住我');
  });
});
```

- [ ] **Step 2: Run the failing test**

Run: `CI=true pnpm exec vitest run apps/admin/src/pages/_auth/login.test.tsx`

Expected: FAIL because `LoginForm` is not exported.

- [ ] **Step 3: Implement the minimal login and logout flow**

Use Ant Design `Form`, `Input`, `Checkbox`, and `Button`; default `remember` to true; show `vben / 123456`; validate required fields; submit to `login`; on failure show `账号或密码错误`; on success use `navigate({ to: getSafeRedirect(redirect), replace: true })`. Validate optional `redirect` on the route. A `useEffect` sends already-authenticated visitors to the same safe destination. Add a centered, responsive card in `login.css` and no assets.

In `AdminLayout.logout`, call auth `logout()` before `unlock()` and navigate with `replace: true` to `/auth/login`.

- [ ] **Step 4: Verify full flow and commit**

Run: `CI=true pnpm exec vitest run apps/admin/src/features/auth/session.test.ts apps/admin/src/features/auth/redirect.test.ts apps/admin/src/pages/_auth/login.test.tsx && CI=true pnpm --filter admin build && git diff --check`

Expected: all focused tests and build PASS.

Manual check with `pnpm --filter admin dev`: signed-out `/dashboard` goes to login with return URL; bad credentials fail locally; `vben / 123456` returns to requested page; refresh remains logged in when remembered; logout removes access.

Run `git add apps/admin/src/pages/_auth/login.tsx apps/admin/src/pages/_auth/login.css apps/admin/src/pages/_auth/login.test.tsx apps/admin/src/features/layout/admin-layout.tsx apps/admin/src/routeTree.gen.ts` then `git commit -m "feat(admin): add local demo login flow"`.
