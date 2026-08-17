# AuthPageLayout 设计

## 目标

为 `apps/admin` 提供与 Vben 同职责边界的登录页布局能力：认证布局组件负责左、中、右三种面板；布局切换器作为独立 widget 更新持久化偏好；应用层只传入品牌文案与登录表单内容。

不引入 Vben、Vue 或新的依赖，也不改认证、路由、验证码及主题功能。

## 目录

```text
apps/admin/src/features/layout/
  authentication/
    auth-page-layout.tsx
    auth-page-layout.css
    preferences.ts
    index.ts
  widgets/
    auth-page-layout-toggle.tsx
apps/admin/src/layouts/auth.tsx
```

这对应 Vben 的 `layouts/src/authentication` 与 `layouts/src/widgets/layout-toggle`：前者拥有认证页面结构，后者只负责选择布局。项目既有 `features/layout` 是等价的本地归属，因此不新建跨应用 package。

## 接口与状态

`preferences.ts` 导出 `AuthPageLayoutType`：`'panel-left' | 'panel-center' | 'panel-right'`，以及读取、写入该值的最小函数。它使用 `starter-react:auth-page-layout`，非法或不存在的值回退为 `panel-right`。

`AuthPageLayout` 接收现有登录页所需的应用名、logo、标题、描述与 `children`。它初始化布局偏好，渲染工具栏、认证面板与非居中状态的 Hero 区域；布局切换后立即更新状态和存储。

`AuthPageLayoutToggle` 使用已有 Ant Design 下拉单选菜单，展示左、中、右三个可访问的选项。它不直接读取或写入浏览器存储，而通过 `AuthPageLayout` 传入的当前值和变更回调工作。

`apps/admin/src/layouts/auth.tsx` 改为应用层装配：将品牌文案和 `Outlet` 传入 `AuthPageLayout`。登录表单、认证会话和路由守卫保持原文件与 API。

## 布局规则

- `panel-right`：Hero 在左，表单在右，保持当前默认外观。
- `panel-left`：表单在左，Hero 在右。
- `panel-center`：表单在页面中央，Hero 不渲染，使用当前背景色与轻量装饰。
- 最大宽度 840px 以下：统一单列表单；工具栏可切换且偏好保留，但不强行制造无意义的左右差异。

## 验证

先为偏好模块编写测试：默认值、合法值读写、非法存储回退。再为 `AuthPageLayout` 的静态渲染编写测试，确认每个布局输出正确的 `data-layout` 与对应 Hero/表单结构。最后运行认证表单既有测试与 `pnpm --filter admin build`。
