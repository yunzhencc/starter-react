# AGENTS.md

Starter React 是一个以 pnpm workspace 和 Turbo 管理的 React 19 管理后台模板。`apps/admin` 是可运行应用；共享 UI、验证码和演示组件位于 `packages/`。所有说明使用中文。

## 仓库布局

```text
apps/
  admin/                    React 管理后台应用、路由、认证与布局
packages/
  effects/common-ui/        共享验证码组件
  playground/               Slate、Lexical 等演示组件
  shadcn-ui/                本地 shadcn 风格基础组件
  utils/                    共享工具函数
docs/                       Rspress 文档与已确认的设计/实施计划
scripts/                    仓库维护脚本
```

认证页面的应用装配在 `apps/admin/src/layouts/auth.tsx`；认证会话、重定向和页面分别在 `features/auth/`、`pages/_auth/`。布局状态与组件归属在 `features/layout/`。

## 命令

```sh
pnpm install
pnpm start
pnpm test
pnpm test --run <测试文件>
pnpm --filter admin dev
pnpm --filter admin build
pnpm lint <目标路径>
pnpm clean
```

- 使用 pnpm；不要使用 npm 或 yarn 修改依赖锁文件。
- 修改依赖时使用 catalog，例如 `pnpm add <包> --save-catalog-name core`；先确认现有依赖不能解决问题。

## 验证

- 先运行与改动直接对应的测试；不要为普通局部改动默认跑完整套件。
- 修改 `apps/admin` 的类型、路由或构建接线时，运行 `pnpm --filter admin build`。
- UI 改动应验证真实交互和关键可见状态；截图回归先确认组件归属和实际渲染，再做最小修复。
- 每次提交前运行 `git diff --check`，并报告实际执行的命令与失败原因；不要把环境/权限失败说成测试通过。

## 代码约定

- 使用 ESM、TypeScript 严格模式和既有路径别名；不要用 `any` 绕过类型错误。
- 遵循 ESLint 配置：2 空格、单引号、分号。优先复用相邻组件、现有工具函数和已安装依赖。
- 保持模块职责清晰：应用接线留在 `apps/admin`，可复用实现放入对应 workspace；不要为单一调用方创建抽象层。
- 外部输入、浏览器存储、URL 参数和持久化数据是校验边界；同进程、已类型化调用之间避免重复运行时校验。
- 非平凡行为变更应添加或更新最小的聚焦测试。测试断言用户可观察行为，不测试实现细节。
- 认证 UI、路由可见性不等于后端授权；不要用前端显示逻辑代替服务端权限控制。
- 对照 Vben 的需求必须先检查官方当前实现，保持组件边界、默认值、交互时机和可见结构一致，而非只做近似样式。

## 机密、依赖与 Git

- 不提交密码、令牌、`.env`、私有 registry 凭据或真实测试数据。提交 `.npmrc` 等配置前先检查是否含凭据并仅报告脱敏结论。
- 保留用户已有的未提交改动；不要使用 `git reset --hard`、`git checkout --` 或删除未授权文件。
- 用户要求“提交全部代码”时，检查已暂存、未暂存和未跟踪文件后一次性提交完整范围；普通“提交代码”只提交当前任务相关文件。
- 提交前检查 `git status --short`、暂存区 `name-status` 与 `git diff --cached --check`；提交后再次检查状态。`lint-staged` 会修改并重新暂存文件。

## 编辑本文件

本文件只记录当前仓库可验证的约定与命令。修改工具链、目录归属、测试入口或提交流程时，同步更新相应条目；保持规则简短、具体、可执行。
