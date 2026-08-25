# Vben Theme Preferences Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将主题模式、持久化和浏览器副作用收敛到 `@yunzhen/preferences`，让 layouts widgets 提供三档主题切换控件。

**Architecture:** preferences 持有 `theme.mode` 和系统主题快照，负责持久化、根节点 class 和媒体查询监听。ThemeToggle 只更新 preferences；Admin、滚动区域和图表读取同一个 `useIsDark`。移除 `next-themes`。

**Tech Stack:** React 19、Zustand、Ant Design、Vitest、Testing Library、i18next。

**Spec:** `docs/superpowers/specs/2026-08-26-preferences-theme-design.md`

## Global Constraints

- 主题模式固定为 `'auto' | 'dark' | 'light'`，保留跟随系统、浅色、暗黑三项。
- 不新增依赖；从 Admin 与 layouts manifests 移除 `next-themes`，保留 Web 应用的现有依赖。
- preferences 是唯一主题写入口；widgets 和应用不得再导入 `next-themes`。
- SSR 不在本次范围内；浏览器 API 都以 `typeof window/document` 防护。

---

### Task 1: 在 preferences 建立主题状态与副作用

**Files:**
- Modify: `packages/preferences/src/layout-preferences.ts`
- Modify: `packages/preferences/src/index.ts`
- Modify: `packages/preferences/src/layout-preferences.test.ts`

**Interfaces:**
- Produces: `type ThemeMode = 'auto' | 'dark' | 'light'`。
- Produces: `getResolvedTheme(mode, systemPrefersDark)`, `initializeThemePreferences()`, `useIsDark()`。
- Produces: `LayoutPreferences['theme'] = { mode: ThemeMode }`，默认 `'dark'`。

- [ ] **Step 1: Write the failing test**

```ts
it('resolves automatic mode from the system preference', () => {
  expect(getResolvedTheme('auto', true)).toBe('dark');
  expect(getResolvedTheme('auto', false)).toBe('light');
});

it('applies the stored mode to the document root', () => {
  updatePreferences({ theme: { mode: 'light' } });
  initializeThemePreferences();
  expect(document.documentElement.classList.contains('light')).toBe(true);
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `CI=true pnpm test --run packages/preferences/src/layout-preferences.test.ts`

Expected: FAIL because the theme API is absent.

- [ ] **Step 3: Implement the minimal store extension**

```ts
export type ThemeMode = 'auto' | 'dark' | 'light';

export function getResolvedTheme(mode: ThemeMode, systemPrefersDark: boolean) {
  return mode === 'auto' ? (systemPrefersDark ? 'dark' : 'light') : mode;
}

export function useIsDark() {
  return usePreferencesStore(state => getResolvedTheme(
    state.preferences.theme.mode,
    state.systemPrefersDark,
  ) === 'dark');
}
```

Add `theme` to defaults, cloning, storage merge and patch merge. Store `systemPrefersDark` outside persisted preferences. The initializer applies `dark` and `light` classes plus `color-scheme`, then updates the snapshot on `prefers-color-scheme` changes.

- [ ] **Step 4: Run the test and verify GREEN**

Run: `CI=true pnpm test --run packages/preferences/src/layout-preferences.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

Run: `git add packages/preferences/src/layout-preferences.ts packages/preferences/src/index.ts packages/preferences/src/layout-preferences.test.ts`

Run: `git commit -m "feat(preferences): manage theme mode"`

### Task 2: 提供 layouts 主题切换 widget

**Files:**
- Create: `packages/effects/layouts/src/widgets/theme-toggle/theme-toggle.tsx`
- Create: `packages/effects/layouts/src/widgets/theme-toggle/theme-toggle.css`
- Create: `packages/effects/layouts/src/widgets/theme-toggle/theme-toggle.test.tsx`
- Modify: `packages/effects/layouts/src/widgets/index.ts`
- Modify: `packages/effects/layouts/src/layout-scroll.tsx`
- Modify: `packages/effects/layouts/src/basic-layout.test.tsx`
- Modify: `packages/locales/src/langs/zh-CN/ui.json`
- Modify: `packages/locales/src/langs/en-US/ui.json`

**Interfaces:**
- Consumes: `ThemeMode`, `updatePreferences`, `useIsDark`, `usePreferences` from `@yunzhen/preferences`。
- Produces: `ThemeToggle` from `@yunzhen/layouts/widgets`。

- [ ] **Step 1: Write failing widget and scroll tests**

```tsx
it('persists the selected theme mode from the menu', async () => {
  render(<ThemeToggle />);
  await userEvent.click(screen.getByRole('button', { name: /theme/i }));
  await userEvent.click(screen.getByRole('menuitem', { name: /light/i }));
  expect(getPreferences().theme.mode).toBe('light');
});
```

Set `theme.mode` to dark in the scroll test and assert `os-theme-light`.

- [ ] **Step 2: Run tests and verify RED**

Run: `CI=true pnpm test --run packages/effects/layouts/src/widgets/theme-toggle/theme-toggle.test.tsx packages/effects/layouts/src/basic-layout.test.tsx`

Expected: FAIL because the widget export is absent and scrolling reads `next-themes`.

- [ ] **Step 3: Implement the widget and migrate scroll state**

```tsx
function selectTheme(event: MouseEvent<HTMLElement>, mode: ThemeMode) {
  if (theme.mode === mode)
    return;
  updatePreferences({ theme: { mode } });
  // Preserve the View Transition only when it is available.
}
```

Declare `const { theme } = usePreferences()` in the widget. Move the current icon, dropdown and View Transition behavior into it. Use `ui.theme.label`, `ui.theme.followSystem`, `ui.theme.light` and `ui.theme.dark` translations. Export it, then replace `useTheme().resolvedTheme` in `LayoutScrollArea` with `useIsDark()`.

- [ ] **Step 4: Run tests and verify GREEN**

Run: `CI=true pnpm test --run packages/effects/layouts/src/widgets/theme-toggle/theme-toggle.test.tsx packages/effects/layouts/src/basic-layout.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit**

Run: `git add packages/effects/layouts/src/widgets packages/effects/layouts/src/layout-scroll.tsx packages/effects/layouts/src/basic-layout.test.tsx packages/locales/src/langs/zh-CN/ui.json packages/locales/src/langs/en-US/ui.json`

Run: `git commit -m "feat(layouts): add shared theme toggle"`

### Task 3: 将 Admin 适配层改为 preferences

**Files:**
- Modify: `apps/admin/src/main.tsx`
- Modify: `apps/admin/src/features/theme/theme-provider.tsx`
- Delete: `apps/admin/src/features/theme/theme-toggle.tsx`
- Delete: `apps/admin/src/features/theme/theme-toggle.css`
- Delete: `apps/admin/src/features/theme/theme.ts`
- Delete: `apps/admin/src/features/theme/theme.test.ts`
- Modify: `apps/admin/src/features/layout/admin-layout.tsx`
- Modify: `apps/admin/src/features/layout/authentication/auth-page-layout.tsx`
- Modify: `apps/admin/src/features/layout/admin-layout.test.tsx`
- Modify: `apps/admin/src/views/dashboard-chart.tsx`
- Modify: `apps/admin/src/views/dashboard-chart.test.tsx`

**Interfaces:**
- Consumes: `initializeThemePreferences`, `useIsDark`; shared `ThemeToggle`.
- Produces: Admin Ant Design configuration driven only by preferences.

- [ ] **Step 1: Write failing Admin tests**

```tsx
it('uses the shared preference theme for ECharts', () => {
  updatePreferences({ theme: { mode: 'light' } });
  render(<DashboardChart label="趋势图" option={{}} />);
  act(() => resizeObserver.callback?.([
    { contentRect: { height: 300, width: 800 } } as ResizeObserverEntry,
  ], {} as ResizeObserver));
  expect(wrapper.props?.theme).toBeUndefined();
});
```

Update layout mocks to export `ThemeToggle` from `@yunzhen/layouts/widgets`.

- [ ] **Step 2: Run tests and verify RED**

Run: `CI=true pnpm test --run apps/admin/src/views/dashboard-chart.test.tsx apps/admin/src/features/layout/admin-layout.test.tsx apps/admin/src/features/layout/user-dropdown.test.tsx`

Expected: FAIL because Admin still imports `next-themes` and the old widget path.

- [ ] **Step 3: Implement the Admin migration**

```tsx
function AntdThemeProvider({ children }: { children: ReactNode }) {
  const isDark = useIsDark();
  return <ConfigProvider theme={{ algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm, token: readAntdTokens() }}>{children}</ConfigProvider>;
}
```

Call `initializeThemePreferences()` after i18n setup and before `createRoot`. Import shared `ThemeToggle` in both layout callers. Migrate the chart to `useIsDark()` and delete the obsolete Admin toggle, CSS and helper test.

- [ ] **Step 4: Run tests and verify GREEN**

Run: `CI=true pnpm test --run apps/admin/src/views/dashboard-chart.test.tsx apps/admin/src/features/layout/admin-layout.test.tsx apps/admin/src/features/layout/user-dropdown.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit**

Run: `git add apps/admin/src/main.tsx apps/admin/src/features/theme/theme-provider.tsx apps/admin/src/features/layout apps/admin/src/views/dashboard-chart.tsx apps/admin/src/views/dashboard-chart.test.tsx`

Run: `git rm apps/admin/src/features/theme/theme-toggle.tsx apps/admin/src/features/theme/theme-toggle.css apps/admin/src/features/theme/theme.ts apps/admin/src/features/theme/theme.test.ts`

Run: `git commit -m "refactor(admin): consume shared theme preferences"`

### Task 4: 删除 Admin 与 layouts 的 next-themes 并执行完整验证

**Files:**
- Modify: `apps/admin/package.json`
- Modify: `packages/effects/layouts/package.json`

**Interfaces:**
- Consumes: Tasks 1–3 have removed every production import of `next-themes`.
- Produces: Admin 与 layouts 不再声明或解析 `next-themes`；Web 继续独立使用该依赖。

- [ ] **Step 1: Verify no imports remain**

Run: `rg -n "next-themes" apps packages --glob '!node_modules'`

Expected: 只有 Web 与本次范围外文件保留该依赖。

- [ ] **Step 2: Remove manifests and refresh lockfile**

Delete the `next-themes` entry from Admin 与 layouts manifests. 不修改 Web manifest 或锁文件中的 Web 解析项。

- [ ] **Step 3: Run focused validation**

Run: `CI=true pnpm test --run packages/preferences/src/layout-preferences.test.ts packages/effects/layouts/src/widgets/theme-toggle/theme-toggle.test.tsx packages/effects/layouts/src/basic-layout.test.tsx apps/admin/src/views/dashboard-chart.test.tsx apps/admin/src/features/layout/admin-layout.test.tsx`

Run: `CI=true pnpm --filter @yunzhen/preferences typecheck`

Run: `CI=true pnpm --filter @yunzhen/layouts typecheck`

Run: `CI=true pnpm --filter @yunzhen/app-admin typecheck`

Run: `CI=true pnpm build:admin`

Run: `git diff --check`

Expected: every command exits 0.

- [ ] **Step 4: Commit**

Run: `git add apps/admin/package.json packages/effects/layouts/package.json`

Run: `git commit -m "chore: remove next themes"`
