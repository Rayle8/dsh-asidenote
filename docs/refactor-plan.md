# AsideNote 重构方案

> 状态：执行中　|　目标版本：v2.0.0　|　参考实现：[dsh-context](https://github.com/bowenliang123/dsh-context)、[dsh-market](https://github.com/dsh-market/dsh-market)

## 进度（2026-10-31）

| 阶段 | 状态 | 提交 |
|---|---|---|
| P0 冻结与兜底 | 完成 | tag `pre-refactor-1.9.7`；合并分支清理；`docs/archive/notes-trash-ux-checklist.md` |
| P1 工具链骨架 | 完成 | `41ddc0d`（tsdown + tsc + oxlint + 产物一致性门 + 真机前 jsdom 冒烟） |
| P2 拆模块 | 完成（不再细拆） | `96e4414` 常量/i18n/CSS；`0a1821b` storage/domain/hook；`8e0bc4c` 行/空态/定位/图标；组件与 8 个 hook 拆完（几何/分区/转发/设置/草稿/行操作/清除确认/列表边缘），Toast 座位与顶部入口也独立成模块。入口 2,507 → 203 行 |
| P3 改名 + 迁移 | 完成 | `198d673`（AsideNote，`dsh.aside-notes.*.v2`，旧键只读保留） |
| P4 资产与文档 | 待办 | 依赖 README 与截图定稿；目录移动会改动两版 README 的图片链接 |
| P5 发布 | 待办 | CI 已更新，真机冒烟已通过；待打 `v2.0.0` tag 并发布 |

决定：`ui/TodoRow.ts` 264 行保持现状，不再细拆（单组件内聚，收益低于风险）。

剩余：契约测试迁 Vitest + jsdom（可选，现有 43 个测试已全绿）；P4 资产与 README 收尾；打 `v2.0.0` tag 并发布。

## 0. 结论

现在的问题不是"文件放乱了"，而是**三件事绑在一个 2507 行的文件里**：产品文案、存储协议、React 界面。它们各自的变化频率和风险完全不同，却只能整体 review、整体回归。

重构的终点（与两个成熟插件的做法一致）：

- **TypeScript 源码 + tsdown 构建**，浏览器产物仍是**单个 `client/client.js`**（closure factory），由 DSH 以 `dsh.client` 直接加载；产物入库，CI 校验"产物与源码一致"。
- **`src/client/` 按 concern 拆分**：i18n / storage / domain / ui / styles，单文件上限约 150 行。
- **Vitest + jsdom** 按行为测试，替换现在 332 条正则断言。
- **改名一次到位**：包名、插件 id、CSS 前缀、storage key 全部 `session-note`，并带旧数据迁移。
- **目录收敛**：根目录只剩工程文件，截图进 `docs/assets/`，历史 UI 复查归档 `docs/archive/`。

预计 **6～7 人日**（熟悉的人一次做完），另加 `feat/notes-trash-ux` 的手工移植 1～2 人日。

---

## 1. 现状体检

| # | 问题 | 证据 | 影响 |
|---|---|---|---|
| 1 | 单文件巨石 | `client.js` 2,507 行 / 121 KB；`MemoPopover` 一个函数 838 行（L1392–2229） | 任何改动都要通读；合并冲突面大 |
| 2 | 无类型、无 lint、无构建 | CI 只有 `node --check` + 契约测试 | 拼写、参数顺序、未使用变量全靠人眼 |
| 3 | 文案双份且被测试锁死 | `DICT`（66 键 × 2 语言）+ `locale/{zh,en}.json`（66 键 × 2）**完全相同**；契约测试比对二者 | 改一句文案要改 4 处；测试把重复当正确 |
| 4 | CSS 存在 JS 字符串数组里 | 197 个数组元素、74 个类选择器、237 处 `dsh-wt-` 引用 | 无法用 stylelint/编辑器格式化；引号转义易错 |
| 5 | 测试测的是文本不是行为 | `tests/contract.test.mjs` 768 行 / 42 个 test / **332 条 assert**，绝大多数是 `assert.match(client, /.../)` | 重排代码即红；无法证明交互正确；59 次提交都在修它 |
| 6 | 命名三层漂移 | 产品 AsideNote；包 `dsh-workspace-todos`；id/NS `workspace-todos`；CSS `dsh-wt-*`；storage `dsh.session-memos.v1`；描述以 "Notes:" 开头；keywords 仍是 todo | 新人无法从名字判断是什么；市场条目与文档口径不一 |
| 7 | 版本号双写 | `PLUGIN_VERSION` 与 `package.json` 各一份，靠测试对齐 | 每次发版两处改 |
| 8 | 资产全部入库且散落 | 32 张 PNG ≈ 3.8 MB：根目录 6 张（668 KB）+ `docs/features/` 10 张（1.1 MB）+ `docs/ui-check/` 16 张（2.0 MB） | 根目录视觉噪音；`preview.png`/`preview-dark.png` 已无文档引用却仍在 `files` 里发布 |
| 9 | 文档指向仓库外 | `docs/ui-design-check.md` L3 链接 `../../deepseek-harness/...` | 对读者是死链 |
| 10 | 发布无里程碑 | 仓库 0 个 tag，144 次提交只靠 CHANGELOG | 无法从版本回查代码 |
| 11 | 未收尾的工作 | `feat/notes-trash-ux` 未合并（+962/−266，其中 `client.js` 666 行）；另一 worktree `dsh-workspace-todos-autoupdate` 有 **109 行未提交**改动、0 个领先提交 | 重构后 rebase 等于重写；未提交代码随时丢 |
| 12 | 分支残留 | 3 个 `backup/*` + 已合并的 `experiment/opaque-panel` | 分支列表噪音 |

补充：`.idea/` 已被忽略，`node_modules` 干净，`package.json#files` 与磁盘一致——这几项不用动。

---

## 2. 目标工程形态

### 2.1 目录

```text
dsh-asidenote/
├─ package.json                 # name dsh-asidenote，exports ./client → client/client.js
├─ tsdown.config.ts             # 两份构建：host(ESM) + client(CJS closure factory)
├─ tsconfig.json                # src
├─ tsconfig.tests.json          # tests
├─ oxlintrc.json  (或 .oxlintrc.json)
├─ vitest.config.ts             # jsdom + coverage
├─ cordis.patch.yml             # id: dsh-asidenote
├─ index.js                     # host half（保留 8 行 no-op，不引入 host 构建）
├─ icon.svg
├─ README.md · README.en.md · CHANGELOG.md · LICENSE
├─ client/
│  └─ client.js                 # 构建产物，入库；CI 校验与 src/client 一致
├─ src/
│  └─ client/
│     ├─ index.ts               # apply(ctx)：样式、locale、slots、header entry
│     ├─ constants.ts           # id / NS / key / 上限 / 尺寸
│     ├─ types.ts               # Note、SessionRecord、DraftStore…
│     ├─ dsh.d.ts               # 宿主 ctx/locale/slots 的最小 ambient 类型
│     ├─ i18n/
│     │  ├─ index.ts            # makeSay、register
│     │  ├─ zh.ts               # 文案唯一来源
│     │  └─ en.ts               # Record<MessageKey, string>，缺键即编译失败
│     ├─ storage/
│     │  ├─ keys.ts             # v2 key 表 + v1 key 表（只读）
│     │  ├─ codec.ts            # readJson/writeJson/可用性探测
│     │  ├─ notes.ts            # 会话便笺读写
│     │  ├─ drafts.ts           # 新增/编辑草稿
│     │  ├─ forwarded.ts        # 转发标记
│     │  ├─ prefs.ts            # 宽高/快捷键/前缀/分区状态
│     │  └─ migrate.ts          # v1 → v2 一次性迁移
│     ├─ domain/
│     │  ├─ items.ts            # normalize / 排序 / 时间文案
│     │  ├─ forward.ts          # 写回 composer（contenteditable 桥接）
│     │  └─ clipboard.ts        # 复制与降级
│     ├─ ui/
│     │  ├─ Panel.tsx           # 外壳：头、分区、滚动、定位
│     │  ├─ Composer.tsx        # 新增框（自增高、快捷键）
│     │  ├─ TodoRow.tsx         # 单行 + 就地编辑 + 动作
│     │  ├─ Settings.tsx        # 设置卡片
│     │  ├─ ClearConfirm.tsx    # 清除已完成二次确认
│     │  ├─ EmptyState.tsx
│     │  ├─ HeaderEntry.ts      # 宿主 DOM 里的入口按钮（非 React）
│     │  ├─ ToastHost.tsx       # shell.overlay 座位
│     │  ├─ Glyph.tsx           # 图标
│     │  ├─ position.ts         # 浮层定位/贴边
│     │  ├─ usePanelResize.ts   # 宽高拖拽
│     │  └─ useAutoGrow.ts
│     └─ styles/
│        ├─ tokens.css          # 只映射 DSH 语义别名
│        ├─ panel.css
│        ├─ list.css
│        └─ settings.css
├─ tests/
│  ├─ setup.ts
│  ├─ storage/*.spec.ts
│  ├─ domain/*.spec.ts
│  ├─ ui/*.spec.tsx
│  └─ packaging.spec.ts
├─ scripts/
│  ├─ preflight.mjs             # 产物头部/体积/禁用依赖校验
│  └─ smoke.md                  # 真机冒烟清单
├─ docs/
│  ├─ assets/                   # README 用图（明暗成对）
│  │  ├─ panel-light.png · panel-dark.png
│  │  ├─ settings-*.png · actions-*.png · clear-*.png · empty-*.png
│  │  └─ badge-*.png · panel-closeup-*.png
│  ├─ archive/
│  │  └─ ui-audit-2025/         # ui-design-check.md + 16 张 ui-check 截图
│  └─ refactor-plan.md          # 本文件，执行完移入 archive 或删除
└─ .github/workflows/ci.yml
```

### 2.2 模块与现状行号映射

| 新模块 | 来源（当前行） | 目标行数 |
|---|---|---|
| `constants.ts` | L25–86 | ~60 |
| `i18n/{zh,en}.ts` | `DICT` L88–226 | 2 × ~70 |
| `styles/*.css` | `CSS` L227–425 | 4 个文件 |
| `domain/clipboard.ts` | L445–470 | ~30 |
| `domain/forward.ts` | L471–534 | ~65 |
| `storage/*` | L535–920（33 个函数） | 6 个文件，各 &lt; 120 |
| `ui/useAsideNotes.ts` | L923–970 | ~50 |
| `domain/items.ts` | L971–1018、L1033–1044 | ~60 |
| `ui/Glyph.tsx`、图标 | L1045–1066 | ~25 |
| `ui/TodoRow.tsx` | L1068–1322（255 行） | ~150 + 子组件 |
| `ui/EmptyState.tsx` | L1323–1337 | ~15 |
| `ui/position.ts` | L1338–1391（含 `syncStickyHeads` L1019） | ~60 |
| `ui/{Panel,Composer,Settings,ClearConfirm}.tsx`、`usePanelResize` | `MemoPopover` L1392–2229（838 行） | 6 个文件，各 ≤ 180 |
| `i18n/index.ts` | `makeSay` L2230–2247 | ~20 |
| `index.ts` + `HeaderEntry.ts` + `ToastHost` | `apply` L2248–2507 | 3 个文件，各 ≤ 120 |

拆分原则：**纯逻辑（storage/domain）不 import React**，这样 Vitest 用 node 环境就能测；UI 只负责渲染与事件。

---

## 3. 工具链（对齐参考实现）

### 3.1 依赖

```jsonc
// devDependencies（版本在 P1 钉死，避免漂移）
"tsdown": "^0.22",              // rolldown 打包，输出 closure factory
"lightningcss": "^1.33",        // CSS 压缩（tsdown 插件内调用）
"typescript": "~5.7",           // 参考仓库用 7.x；若 Node 22 + tsc 7 稳定则跟随
"vitest": "^4", "@vitest/coverage-v8": "^4",
"jsdom": "^29", "@testing-library/react": "^16",
"@types/react": "~18.3", "@types/react-dom": "~18.3",
"react": "^18.3", "react-dom": "^18.3",   // 测试用；运行时来自 loader
"oxlint": "^1.85"
```

`engines.node` 建议从 `>=20` 提到 `^22.19 || >=24`（tsdown/vitest 新版的底线），CI matrix 同步改为 22/24。

**不建议**第一阶段就引入 `@deepseek-ai/dsh-client-*` 类型包：宿主版本与 npm 版本一旦对不上，`tsc` 会报一堆无关错误。先用 `src/client/dsh.d.ts` 写最小 ambient 类型（`ctx.get`、`ctx.effect`、`ctx.slots.inject/register`、`locale.bind/register`），P5 再评估是否换成官方类型。

### 3.2 构建

`tsdown.config.ts` 两个 entry：

```ts
// host：保持现状的 no-op，直接留在根 index.js，不构建
// client：唯一产物 client/client.js
{
  entry: { client: 'src/client/index.ts' },
  outDir: 'client',
  format: 'cjs',
  platform: 'browser',
  target: 'es2022',
  dts: false,
  sourcemap: false,
  minify: false,                 // 产物入库，保持可读、可 review、可逐行 merge
  external: [
    'react', 'react/jsx-runtime', 'react-dom', 'react-dom/client',
    '@deepseek-ai/dsh-client-ui-primitives',
  ],
  noExternal: spec => /* 其余全部内联 */,
  define: { __SN_VERSION__: JSON.stringify(pkg.version) },   // 取代 PLUGIN_VERSION
  outputOptions: {
    entryFileNames: 'client.js',
    banner: `window.__ModuleLoader__.load({ id: "dsh-asidenote", factory: (require) => {`,
    intro: 'var module = { exports: {} }; var exports = module.exports;',
    footer: 'return module.exports; } });',
  },
  plugins: [cssInlinePlugin /* 见下 */],
}
```

要点：

- **闭包工厂**的 banner/intro/footer 必须与当前 `client.js` 的手写外壳一致，否则 loader 不认。
- **CSS 走 `?inline` 通道**：`import css from './styles/index.css?inline'`，插件用 lightningcss 压成字符串，`apply()` 里插一个 `<style data-dsh-plugin="dsh-asidenote">`，dispose 时移除。沿用当前"一张表覆盖面板 + 输入框 dock"的语义，避免 FOUC。不要用 `.module.css`——我们的类名是全局语义名 `dsh-an-*`，不需要 hash。
- **external 清单**要与代码里真实的 `require()` 对齐。当前代码只 require 4 个模块（react、react-dom、react-dom/client、ui-primitives），但 `package.json#dsh.client.inject` 声明了 6 个、且**漏了 ui-primitives**。P1 要查清 `inject` 的语义（"必须加载的宿主模块"还是"提供 slot 的插件"）再收敛，不要直接删。

### 3.3 质量门

```jsonc
"scripts": {
  "build": "tsdown",
  "typecheck": "tsc -p tsconfig.json --noEmit && tsc -p tsconfig.tests.json --noEmit",
  "lint": "oxlint src tests scripts",
  "test": "vitest run",
  "check": "npm run build && git diff --exit-code client/ && npm run lint && npm run typecheck && npm run test && node scripts/preflight.mjs",
  "prepack": "npm run build && node scripts/preflight.mjs"
}
```

CI（`.github/workflows/ci.yml`）按顺序：install → build → **`git diff --exit-code client/`**（产物必须与源码同步，报错文案要直接说"跑 `npm run build` 并提交"）→ lint → typecheck → test。参考仓库在撞了 4 次之后专门加了这个门，我们一次加上。

`scripts/preflight.mjs` 校验：产物存在、首行 banner id 正确、没有禁止的 `require('@deepseek-ai/...')`、体积 &lt; 400 KB、`__SN_VERSION__` 已替换。

---

## 4. 改名与数据迁移（破坏性，一次性）

### 4.1 命名映射

| 位置 | 现在 | 目标 |
|---|---|---|
| `package.json#name` | `dsh-workspace-todos` | `dsh-asidenote` |
| patch id / name | `workspace-todos` / `dsh-workspace-todos` | `dsh-asidenote` / `dsh-asidenote` |
| loader id | `dsh-workspace-todos` | `dsh-asidenote` |
| locale NS | `workspace-todos` | `dsh-asidenote` |
| panel / slot id | `workspace-todos` | `session-note` |
| CSS 前缀 | `dsh-wt-*`、`--dsh-wt-*` | `dsh-an-*`、`--dsh-an-*` |
| style/data 属性 | `data-dsh-plugin="workspace-todos"`、`dataset.dshMemoPopoverRoot` | `data-dsh-plugin="dsh-asidenote"`、`data-dshAsideNoteRoot` |
| 便笺存储 | `dsh.session-memos.v1` | `dsh.aside-notes.v2` |
| 草稿 | `dsh.memo.drafts.v1` | `dsh.aside-notes.drafts.v2` |
| 转发标记 | `dsh.memo.forwarded.v1` | `dsh.aside-notes.forwarded.v2` |
| 分区状态 | `dsh.memo.sections.v1` | `dsh.aside-notes.sections.v2` |
| 宽 / 高 | `dsh.memo.panel-width.v1` / `-height.v1` | `dsh.aside-notes.panel-width.v2` / `-height.v2` |
| 发送快捷键 | `dsh.memo.send-shortcut.v1` | `dsh.aside-notes.send-shortcut.v2` |
| 转发前缀 | `dsh.memo.forward-prefix.v1` | `dsh.aside-notes.forward-prefix.v2` |
| 仓库 / 链接 | `Rayle8/dsh-workspace-todos` | 暂不改（发布名 `dsh-asidenote`，仓库沿用旧名，链接继续有效） |
| 版本 | 1.9.7 | 2.0.0 |

CSS 前缀的替换是一次 `sed -i '' 's/dsh-wt-/dsh-an-/g'`，但**存储 key 不能 sed**——要在 `storage/migrate.ts` 里显式建 v1→v2 映射表，因为结构也可能演化。

### 4.2 迁移策略

```ts
// storage/migrate.ts
const MIGRATED = 'dsh.aside-notes.migrated.v2'

const V1_KEYS = {
  notes:     'dsh.session-memos.v1',
  drafts:    'dsh.memo.drafts.v1',
  forwarded: 'dsh.memo.forwarded.v1',
  sections:  'dsh.memo.sections.v1',
  width:     'dsh.memo.panel-width.v1',
  height:    'dsh.memo.panel-height.v1',
  shortcut:  'dsh.memo.send-shortcut.v1',
  prefix:    'dsh.memo.forward-prefix.v1',
} as const

export function migrateLegacyStorage(store: Storage = localStorage): void {
  if (store.getItem(MIGRATED) !== null) return
  try {
    for (const [field, oldKey] of Object.entries(V1_KEYS)) {
      const raw = store.getItem(oldKey)
      if (raw === null) continue
      if (!validate(field, raw)) continue        // 坏数据跳过，不阻塞其它字段
      store.setItem(NEW_KEYS[field], raw)        // 原样搬，不改结构
    }
    store.setItem(MIGRATED, new Date().toISOString())
    // v1 键保留不删：2.0 期间允许回退；2.1 再清理
  } catch { /* 配额或隐私模式：静默降级，UI 已有 storage.failed 提示 */ }
}
```

- 在 `apply()` 里、任何 store 读取之前调用一次；幂等，两个标签页同时跑也不会互相破坏。
- README「数据保存在哪里」补一段升级说明：旧便笺会自动迁移，旧插件需手动卸载。
- `storage/*.spec.ts` 覆盖：空、正常、坏 JSON、半损坏、配额抛错、标记已存在时不重复写。

### 4.3 最大的风险：新旧插件并存

id 从 `workspace-todos` 变成 `dsh-asidenote` 后，市场里的旧条目和新条目是**两个插件**：同时安装会出现两个入口按钮，分别读写不同 key。

处理：

1. 发布 2.0.0 时，在旧 npm 包上 `npm deprecate`，README 首屏加"从 1.x 升级"段落，明确写"先在 DSH 里卸载旧插件"。
2. 迁移代码只搬数据不删旧键，用户误装两个也不会丢数据（只是重复展示）。
3. 若你希望**零并存风险**，唯一办法是保留 id `workspace-todos` 只改包名/CSS/文案——但那与"全部改名"的决定冲突。已按你的选择执行全量改名，此处只作为回退预案记录。

---

## 5. i18n 单一来源

现在 66 个键在 `DICT` 和 `locale/*.json` 各一份，测试还专门断言两份相等。参考实现的约定是：**`locale/*.json` 只放元数据，运行文案在代码里**。

```json
// locale/zh.json
{ "meta": { "title": "会话便笺", "description": "给每个 AI 会话留一张待办清单。" } }
```

```ts
// src/client/i18n/zh.ts
export const zh = {
  'nav.label': '便笺',
  'popover.count': '{open} 未完成 · {total} 条',
  // …
} as const
export type MessageKey = keyof typeof zh

// src/client/i18n/en.ts
export const en: Record<MessageKey, string> = { /* 缺键 = tsc 报错 */ }
```

收益：改文案只改一处；`say('typo')` 编译期失败；`locale/*.json` 回到 DSH 期望的 meta 形态。占位符一致性（`{n}`、`{mod}`）用一个 spec 校验：两侧提取到的占位符集合必须相等。

> P1 先确认 DSH 是否会自动读取 `locale/*.json` 的 66 个键（若会，则不能直接删，需保留完整 JSON 并由构建从 TS 生成）。确认方式：在真机里只注册 `DICT`、把 JSON 换成 meta，观察文案是否仍正确。这是一个 10 分钟的 spike。

---

## 6. 测试替换

现有 332 条断言几乎都是"文件里是否有这段字符串"，重构后必然全红。按下面的矩阵重建：

| 层 | 文件 | 覆盖点 | 环境 |
|---|---|---|---|
| storage | `tests/storage/notes.spec.ts`、`drafts.spec.ts`、`forwarded.spec.ts`、`prefs.spec.ts`、`migrate.spec.ts` | 读写、坏 JSON、配额、v1→v2 迁移、幂等 | node（fake Storage） |
| domain | `tests/domain/items.spec.ts`、`time.spec.ts`、`forward.spec.ts` | 归一化、上限 300、排序、时间文案、转发文本与前缀规则 | node |
| i18n | `tests/i18n.spec.ts` | 两种语言键集合一致、占位符一致、无空值 | node |
| UI | `tests/ui/panel.spec.tsx`、`row.spec.tsx`、`settings.spec.tsx`、`composer.spec.tsx` | 开合、添加/编辑/删除、清除二次确认、快捷键、焦点恢复 | jsdom + testing-library |
| 宿主 DOM | `tests/ui/header-entry.spec.ts` | 注入 `_headerUtilities`、计数、tooltip、aria、清理 | jsdom |
| 打包 | `tests/packaging.spec.ts` | manifest、exports、files、patch、locale meta、无 `dsh-wt-` 残留、无 v1 key 写入 | node |
| 真机 | `scripts/smoke.md` | 明暗主题、中英切换、缩放、转发、刷新持久化、卸载清理 | 人工，每阶段一次 |

覆盖率门槛：第一版 **lines/statements ≥ 85%**，`storage/` 与 `domain/` 要求 100%。不直接照搬参考仓库的"全仓 100% 每文件"——UI 组件的 100% 会逼出一堆为覆盖而写的测试。

`packaging.spec.ts` 取代的是原契约测试里真正有价值的少数断言（manifest 形状、patch 行、id 一致性），而不是那 300 条 UI 字符串。

---

## 7. 分阶段路线图

### P0 · 冻结与兜底（0.5 天）

- `git tag pre-refactor-1.9.7` 打在 `main` 当前提交（现在仓库一个 tag 都没有）。
- 把 `dsh-workspace-todos-autoupdate` worktree 里那 109 行改动**提交到 `feat/auto-update-check`**（只提交不合并）——重构期间不会有人碰它，但至少不会丢。
- 从 `feat/notes-trash-ux` 提取一份功能清单（回收站交互、按钮语义、文案键）写进 `docs/archive/notes-trash-ux-checklist.md`，作为 P6 手工移植的依据。
- 其余 `backup/*`、`experiment/opaque-panel`（已合并）可删；`feat/auto-update-check` 与 `feat/notes-trash-ux` 保留。

**退出条件**：`git status` 干净，未提交代码有归属。

### P1 · 工具链骨架（1 天）

- 加 `package.json` devDeps、`tsconfig*`、`oxlintrc`、`vitest.config.ts`、`tsdown.config.ts`。
- 写 `src/client/index.ts`：把现有 `client.js` 里 `factory` 的**函数体原样搬进来**，补上 `export function apply(ctx)`，删掉 `window.__ModuleLoader__.load` 外壳（外壳改由 tsdown banner/footer 生成）；再加 `dsh.d.ts` 的最小 ambient 类型。
- 同步把 `tests/contract.test.mjs` 的读取目标从根 `client.js` 改为 `src/client/index.ts`（**只改路径与 exports 断言**），让 CI 在 P1 保持绿；这套测试在 P2 整体删除替换。
- 真机验证：面板、入口、Toast、主题、i18n 全部与 1.9.7 一致（**行为零变化**是本阶段的唯一目标）。
- 加 CI 的产物一致性门 + preflight。

**退出条件**：`npm run build` 后 `git diff client/` 为空；真机冒烟通过；`npm run check` 绿。

### P2 · 拆模块（2.5–3 天）

顺序（每步单独提交，行为不变）：

1. `constants.ts`、`i18n/`、`styles/`（把 CSS 数组拆成 4 个 `.css` 文件，`?inline` 导入）。
2. `storage/`（24 个函数 → 4 个 store + `codec.ts`），同时写 storage specs。
3. `domain/`（items、clipboard、forward），写 domain specs。
4. `ui/`：先把 `TodoRow`、`Settings`、`ClearConfirm`、`Composer` 从 `MemoPopover` 里剥出来；`MemoPopover` 缩成 `Panel.tsx` + `usePanelResize`。
5. `apply` 拆成 `index.ts`、`HeaderEntry.ts`、`ToastHost.tsx`。
6. 删除 `tests/contract.test.mjs`，替换为第 6 节的 spec 集。

**退出条件**：`src/client` 下最大文件 ≤ 200 行、无文件同时包含 storage 与 React；覆盖率达标；真机冒烟通过。

### P3 · 改名 + 迁移（1–1.5 天）

1. 按 4.1 表全量替换（包名、id、NS、CSS 前缀、data 属性、文档、README 安装段）。
2. 新增 `storage/migrate.ts` + specs；在 `apply()` 首次读取前调用。
3. `package.json` 升 `2.0.0`；`__SN_VERSION__` 注入，删掉 `PLUGIN_VERSION` 常量。
4. GitHub 仓库改名为 `dsh-asidenote`（旧链接自动 301），更新 `repository/homepage/bugs`、README 徽章与安装命令。
5. 旧包 `npm deprecate dsh-workspace-todos@1.9.7 "Renamed to dsh-asidenote"`（发布后做）。

**退出条件**：全仓 `grep -r "dsh-wt-\|workspace-todos"` 只剩迁移映射表和 CHANGELOG 历史；迁移在真机上把旧便笺搬过来。

### P4 · 目录与资产整理（0.5 天）

- `docs/features/` → `docs/assets/`；根目录 6 张 `preview*.png` 一并移入，按 `panel-light/dark`、`badge-light/dark`、`panel-closeup-light/dark` 重命名。
- `preview.png`、`preview-dark.png` 当前无文档引用：要么在 README 里用上（close-up 段），要么不进 `package.json#files`。不要既发布又没人看。
- `docs/ui-check/` + `ui-design-check.md` → `docs/archive/ui-audit-2025/`；修正仓库外链接（改为绝对 URL 或删掉）。
- 根目录目标：≤ 14 个条目（现在是 24）。
- `package.json#files` 同步更新；`README` 两版所有图片链接同步。

**退出条件**：根目录无 PNG；README 中所有相对链接可在仓库内解析；`du -sh docs` 下降且图片零丢失。

### P5 · 质量门与 2.0.0 发布（0.5–1 天）

- CI 全绿（build/lint/typecheck/test/preflight）。
- CHANGELOG：`Unreleased` 里那段"opaque panel 实验"归入 2.0.0；另起一节写**破坏性变更 + 迁移说明**。
- 打 tag `v2.0.0`（从此每个版本一个 tag），发布 npm。
- README 增"从 1.x 升级"小节。

### P6 · 后续（不在本次重构内）

`feat/notes-trash-ux` 按 P0 的清单在 `src/client/ui` 上重做（预计 1–2 天），自动更新特性同理。**不要尝试 `git rebase`**——666 行改动落在已被拆散的 `MemoPopover` 上，冲突解决成本高于重做。

---

## 8. 风险与对策

| 风险 | 概率/影响 | 对策 |
|---|---|---|
| loader 不接受新构建外壳 | 低/高 | P1 第一件事就是构建最小 bundle 在真机加载；banner 逐字符对齐现状 |
| CSS 拆文件后注入顺序/时机变化导致闪烁 | 中/中 | 仍只插一张 style 表，在 `apply()` 同步插入；真机明暗各跑一遍 |
| 存储迁移丢数据 | 低/高 | 只读旧键、原样搬、坏字段跳过、保底不删旧键；迁移 spec 覆盖 6 种异常 |
| 新旧插件并存重复显示 | 高/低 | README 升级说明 + 旧包 deprecate；数据层不冲突 |
| 产物入库带来合并冲突 | 中/低 | 不压缩、不加 sourcemap（dsh-market 实测逐行 merge 无冲突）；CI 提示明确 |
| Node 20 跑不动新工具链 | 中/中 | engines 提到 22，CI matrix 22/24；README 写清构建要求 |
| DSH 类型包版本不匹配 | 中/中 | 先用本地 ambient 类型，不引官方包 |
| 重构期间 `main` 不可发布 | 中/中 | 每阶段独立分支、可回退；P0 打 tag |
| trash UX 移植成本被低估 | 高/中 | 现在就抽功能清单；接受"重做"而不是"rebase" |

---

## 9. 明确不做的事

- **不引入 React 之外的状态库**（zustand/redux）：现在 838 行里的状态都是局部 UI 状态，拆完自然清楚；加库只会多一层。
- **不做 host 端功能**：host 仍是 no-op，8 行 `index.js` 保留，不为了"对称"造一个 TS host 构建。
- **不追求 100% 每文件覆盖率**：UI 组件的最后 10% 会写出没有价值的测试。
- **不在本次改交互**：P2 是纯搬迁，任何"顺手优化"推到重构之后。
- **不把截图放进 npm 包**（除市场需要的封面）：`files` 只保留 `icon.svg` + 必要图片，`docs/` 不入包。

---

## 10. 验收标准（Definition of Done）

1. `src/client` 单文件 ≤ 200 行，`MemoPopover` 不存在，最大模块是 `ui/Panel.tsx`（≤ 180 行）。
2. 全仓无 `dsh-wt-`、无 `PLUGIN_VERSION`、无重复文案表；`grep` 只命中迁移映射与 CHANGELOG。
3. `npm run check` 在 Node 22 与 24 上绿；覆盖率达标；CI 拦得住"改了源码没重建产物"。
4. 真机冒烟清单全过：明/暗、中/英、宽/高拖拽、转发、草稿恢复、刷新持久化、多标签同步、卸载后无残留 DOM/style。
5. 1.9.7 用户的便笺在 2.0 首次打开时自动出现（迁移成功）。
6. 根目录 ≤ 14 项，PNG 全在 `docs/assets` 或 `docs/archive`，README 链接零死链。
7. `v2.0.0` tag 指向发布提交。

---

## 11. 今天就能做的 15 分钟动作

```bash
git tag pre-refactor-1.9.7
git -C ../dsh-workspace-todos-autoupdate add -A && \
  git -C ../dsh-workspace-todos-autoupdate commit -m "wip: auto-update check (parking before the 2.0 refactor)"
git branch -d backup/main-local-before-1.9.7 backup/main-local-before-remote-merge experiment/opaque-panel
git log --oneline feat/notes-trash-ux ^main   # 抽功能清单用
```

然后从 P1 开始；或先只做 P0 + P4（低风险、当天可见收益），把代码重构留到下一个完整时间块。
