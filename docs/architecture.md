# AsideNote 架构

面向维护者的结构说明。界面约束见 [面板 UI 规则](./panel-ui-rules.md)，截图流程见 [截图 SOP](./screenshot-sop.md)。

## 1. 形态与运行时契约

AsideNote 是**纯客户端插件**：宿主半侧 `index.js` 是 8 行 no-op，只为了让 `cordis.patch.yml` 能插入一行；真正的实现全部在浏览器半侧。

- `package.json` 的 `dsh.bundle.patch` 指向 `cordis.patch.yml`，`dsh.client` 声明 `./client` 与需要预注入的宿主模块。
- 壳把 `./client`（即 `client/client.js`）当 classic script 加载：`window.__ModuleLoader__.load({ id, factory })`。`factory(require)` 里的 `require` 绑定到冻结的模块表，只认 `react`、`react/jsx-runtime`、`react-dom`、`react-dom/client`、`@deepseek-ai/dsh-client-ui-primitives`；其余依赖全部内联。
- 样式是 `import css from './styles/panel.css?inline'`，由入口在 `apply()` 里插入**一张** `<style data-dsh-plugin="dsh-asidenote">`，dispose 时移除。面板与输入框 dock 不在同一棵 React 树里，所以不能做面板级 `<style>`。
- 只依赖两个服务：`slots`（`conversation.composer.dock` 捕获当前会话、`shell.overlay` 承载全局 Toast）与 `locale`（注册字典、绑定 `t`）。
- 顶部入口是注入宿主 header 的原生 DOM 按钮，不是 React portal——宿主重渲染会回收 portal。

## 2. 目录

```text
src/client/
├─ index.ts              # apply(ctx)：样式、locale、slot 注册、入口、Toast 座位
├─ constants.ts          # 包身份、存储键、上限、平台相关常量
├─ dsh.d.ts              # 宿主 ctx / locale / slots 的最小 ambient 类型
├─ i18n/                 # zh.ts（键的唯一来源）、en.ts、index.ts（fill / makeSay）
├─ domain/               # id、clipboard、forward（写回输入框）、items（归一化/排序/时间）
├─ storage/              # codec、events（同标签页总线）、session、drafts、forwarded、
│                        # prefs、migrate（1.x → v2）
├─ ui/                   # 面板外壳与纯展示组件、hooks、primitives、定位
└─ styles/panel.css      # 全局 .dsh-an-* 规则与 --an-* 尺度
client/client.js         # tsdown 产物，入库，CI 校验与源码一致
index.js                 # 宿主半侧 no-op
cordis.patch.yml         # profile 组合里的一行
tests/                   # contract.test.mjs（契约）+ bundle.test.mjs（jsdom 集成）
tools/screenshots/       # 截图流水线（见 screenshot-sop.md）
docs/assets/             # README 截图（preview-* 与 features/）
```

## 3. 模块职责

| 层 | 模块 | 职责 |
| --- | --- | --- |
| 入口 | `index.ts` | `migrateLegacyStorage()` → 注入样式 → 注册字典 → 座位入口/Toast/slot |
| 身份 | `constants.ts` | 包与插件的 id、`dsh-an-*` 相关的键与上限；改存储键必须同时改这里和 `migrate.ts` |
| 文案 | `i18n/` | `zh.ts` 定义键集合与 `MessageKey`；`en.ts` 用 `Record<MessageKey, string>`，缺键编译失败 |
| 领域 | `domain/items.ts` | `normalizeItems`（防御性清洗、去重、上限）、排序、相对时间文案 |
| 领域 | `domain/forward.ts` | 把便笺写回 Lexical contenteditable 或 textarea，保留光标与换行语义 |
| 存储 | `storage/session.ts` | 会话便笺读写；写失败返回 `false`，由调用方保留 UI 原状并报 Toast |
| 存储 | `storage/prefs.ts` | 面板宽高、发送快捷键、前缀、分区状态 |
| 存储 | `storage/migrate.ts` | 首次加载把 1.x 键原样复制到 v2，旧键只读保留 |
| UI 组件 | `ui/MemoPopover.ts` | 面板编排：组合 hook 与展示组件，portal 到 body |
| UI 组件 | `PanelHead` / `SettingsPanel` / `ComposerForm` / `NoteList` / `ClearConfirm` / `TodoRow` / `EmptyState` | 纯展示，数据与回调由面板传入 |
| UI hooks | `useSessionMemoStore` / `usePanelGeometry` / `useSections` / `useForwardMarks` / `usePanelSettings` / `useComposerDraft` / `useNoteActions` / `useClearConfirm` / `useListEdge` / `useOutsideDismiss` | 把状态与副作用从 JSX 里分离；每个 hook 只做一件事 |
| UI 基础设施 | `primitives` / `position` / `toastSeat` / `headerEntry` | 共享图标与 Tooltip、浮层定位与吸顶、跨面板 Toast、宿主 header 入口 |

约定：`domain/` 与 `storage/` 不 import React；需要 React 的状态放 `ui/use*.ts`。浏览器半侧不碰 Node 内置模块与 `process`（契约测试会拦）。

## 4. 数据模型

所有数据在**当前浏览器**的 `localStorage`，按会话 ID 隔离。

| 键 | 内容 |
| --- | --- |
| `dsh.aside-notes.v2` | `{ version: 1, sessions: { [sessionId]: { sessionId, updatedAt, items: Note[] } } }` |
| `dsh.aside-notes.drafts.v2` | `{ version: 1, sessions: { [sessionId]: { add, edits: { [itemId]: text } } } }` |
| `dsh.aside-notes.forwarded.v2` | `{ version: 1, sessions: { [sessionId]: { [itemId]: true } } }` |
| `dsh.aside-notes.sections.v2` | `{ open, done }` |
| `dsh.aside-notes.panel-width.v2` / `panel-height.v2` | 数字；高度 `0` 表示内容自适应 |
| `dsh.aside-notes.send-shortcut.v2` | `enter` 或 `ctrl-enter` |
| `dsh.aside-notes.forward-prefix.v2` | 最长 80 字符的转发前缀 |
| `dsh.aside-notes.migrated.v2` | 迁移完成的标记 |

`Note` 形如 `{ id, text, done, createdAt, updatedAt, completedAt? }`；`text` 上限 280，单会话上限 300 条。1.x 的 `dsh.session-memos.v1` 与 `dsh.memo.*.v1` 在首次加载时复制到 v2，旧键不删除，回退到 1.9.x 仍可读。

## 5. 构建与产物

- 源码是 TypeScript，`tsdown.config.ts` 用 rolldown 打包成**单个** CJS closure factory，`target: es2022`，不压缩、无 sourcemap，产物入库便于 review 与逐行合并。
- CSS 通过一个 `?inline` 虚拟模块进来（虚拟 id 用相对路径，避免把本机绝对路径写进产物注释）。
- 版本号在 `constants.ts`，契约测试保证与 `package.json` 一致。
- CI（Node 22 / 24）：`npm ci` → `npm run build` → `git diff --exit-code client/`（产物必须与源码一致）→ lint → typecheck → test。`typecheck` 同时覆盖 `tsdown.config.ts`。
- `npm run check` 本地串起 lint、typecheck、测试与构建；发布走 `npm publish`（`prepack` 会重建产物）。

## 6. 测试

| 文件 | 覆盖 |
| --- | --- |
| `tests/contract.test.mjs` | 清单与 patch 形状、工具链约定、样式令牌、无障碍与交互规则、字典完整性、迁移键 |
| `tests/bundle.test.mjs` | 在 jsdom 里执行**构建产物**：模块表、slot 注册、样式注入、入口注入、1.x 迁移，并驱动完整面板流程（添加、设置、完成、清除确认、编辑、缩放、删除、分区记忆） |

契约测试按模块读取源码（需要时读 bundle 或 CSS），断言的是约束而不是实现细节；集成测试提供行为兜底。

## 7. 扩展时先看这里

- 新增文案：只改 `src/client/i18n/{zh,en}.ts`，两边键与占位符必须一致；中文提示不加句号。
- 新增持久化字段：`constants.ts` 加键 → `storage/` 对应模块读写 → 需要兼容旧数据时在 `migrate.ts` 加映射 → 补契约/集成测试。
- 新增面板状态：优先放 `ui/use*.ts`；纯逻辑放 `domain/`，不要 import React。
- 改样式：只动 `src/client/styles/panel.css`，遵守 [面板 UI 规则](./panel-ui-rules.md)（语义别名、三档字号、0.5px 发丝线、hover 门控）。
- 不要手改 `client/client.js`：改源码后 `npm run build`，把它和源码一起提交。
