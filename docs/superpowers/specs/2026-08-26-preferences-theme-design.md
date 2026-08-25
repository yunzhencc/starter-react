# 主题偏好收敛设计

## 目标

将主题模式的状态与浏览器副作用收敛到 `@yunzhen/preferences`，将主题切换控件收敛到 `@yunzhen/layouts/widgets`。保留“跟随系统、浅色、暗黑”三种模式，并移除 `next-themes`。

## 边界

`@yunzhen/preferences` 新增 `theme.mode`（`'auto' | 'dark' | 'light'`）和派生的 `isDark`。它负责持久化主题模式、初始化及更新 `<html>` 的 `dark` / `light` class、设置 `color-scheme`，并在 `auto` 模式监听 `prefers-color-scheme` 变化。

布局包的 `ThemeToggle` 读取偏好并通过 `updatePreferences` 修改模式；切换时保留现有 View Transition 动画。控件和其样式、纯工具函数从 Admin feature 移至 `packages/effects/layouts/src/widgets/theme-toggle/`，并由 widgets 入口导出。文案使用 `@yunzhen/locales`。

`apps/admin` 只保留 Ant Design 主题算法和 token 的适配层。该层从 preferences 的 `isDark` 读取状态，不再提供或消费 `next-themes`。`LayoutScrollArea` 与仪表盘图表也改从 preferences 读取暗色状态。

## 数据流

```text
ThemeToggle
  -> updatePreferences({ theme: { mode } })
  -> Zustand preferences store + localStorage
  -> applyThemeMode: html class / color-scheme
  -> isDark selector
  -> Ant Design, OverlayScrollbars, charts
```

启动时由 Admin 在渲染前初始化主题副作用，确保持久化的主题模式先应用到根节点。SSR 不在本次范围内；后续若启用 SSR，应将主题模式写入 Cookie 并为该初始化逻辑提供服务端初始值。

## 验证

新增或调整聚焦测试，覆盖：三档模式的解析及系统主题变化、主题副作用的根节点 class、主题切换菜单更新 preferences、布局滚动条与 Admin 的主题适配读取同一个 `isDark`。完成后运行相关测试、类型检查、Admin 构建与 `git diff --check`。
