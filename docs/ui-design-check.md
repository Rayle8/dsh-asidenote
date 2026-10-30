# 便笺 UI / 交互规范复查

复查基准：[`dsh-ui-ux-design-standard.md`](../../deepseek-harness/dsh-ui-ux-design-standard.md)（下称"规范"）。
复查对象：`client.js` 里当前真正挂载的界面——会话顶部的便笺入口按钮、右侧便笺浮窗，以及浮窗内的录入、勾选、就地编辑、设置、空态与拖拽把手。

## 0. 方法

1. **真实令牌**：把 DSH 客户端的 `design-platform.css`、`gradient-shadow-text.css`、`focus.css`、`scrollbar.css`、`corner-shape.css`、`base.css` 原样注入预览页，插件的 `--dsw-*` 变量因此与产品内完全一致。
2. **真实样式表**：预览页直接使用 `client.js` 中 `CSS` 数组拼出的字符串，不是重写的一份 CSS。
3. **真实 DOM**：按 `MemoPopover` / `TodoRow` 的 JSX 结构手写等价标记，图标取 `ui-primitives` 的同一批 SVG 路径。
4. **量而不是看**：无头 Chromium（CDP）读 `getComputedStyle`，统计实际生效的字号、字重、圆角、描边宽度、材质与滚动条；用 `CSS.forcePseudoState` 强制 `:hover` / `:focus-visible` 后截图。
5. **明暗各跑一遍**：暗色由 `body[data-ds-dark-theme]` 复现，同一套规则无需第二份样式。

## 1. 结论

规范里有 15 处与当前实现直接冲突，全部已改；另有 7 项属于产品/设计决策或主题层的既有取舍，列在第 6 节。

| # | 规范条款 | 复查前 | 处理 |
| --- | --- | --- | --- |
| 1 | §1 先复用再新建；§8 只用 `--dsw-alias-*` | 自建 11 级灰阶 `--wt-n-50…950`，与 `--dsw-alias-*` 平行 | 删除灰阶，改用语义别名（`label-*`、`interactive-bg-hover/active`、`border-l1…l4`、`settings-card-*`） |
| 2 | §1 字号取自主题变量，13px 是行/详情尺寸 | 自造 10 / 12.5 / 15.5 / 19.5 / 24.5 五级阶梯 | 收敛为 12 / 13 / 14 三档（标题 14、行与按钮 13、说明 12，行高统一 20） |
| 3 | §1 字重上限 500 | 10 处 `font-weight:600` | 全部降为 500，层级靠字号与墨色 |
| 4 | §7 按角色选圆角 | 只有 8 / 12 / 999 三档，浮窗与卡片同为 12 | 浮窗 `--dsw-radius-panel`(28)、分组与字段 `--dsw-radius-lg`(16)、紧凑控件 `--dsw-radius-sm`(8)、胶囊 999 并补 `corner-shape:round` |
| 5 | §8 扁平边框 0.5px | 11 处 `1px solid` 中性描边 | 改为 0.5px 发丝线；虚线保持 1px，spinner 环保持 1.5px |
| 6 | §8 浮层 `border:0` + elevation，不与描边叠加 | 面板同时有 1px 边框与 `--dsw-elevation-soft` | `border:0` + `--dsw-elevation-panel`（0.5px 描边在阴影第一层），并采用菜单材质 `--dsw-specific-menu` + `--dsw-menu-backdrop-filter` |
| 7 | §5 滚动条用共享样式，不能贴边 | 组件私有 `::-webkit-scrollbar` 与 `scrollbar-width/color`（还会让共享 hover 皮肤失效） | 全部删除，靠主题共享 skin，面板内只重绑 `--dsh-scrollbar-*` 到 l2 |
| 8 | §6.6 hover 只在支持 hover 的设备启用 | 所有 `:hover` 裸写；触摸端点按后残留高亮 | 全部收进 `@media (hover:hover)`；`.dsh-wt-actions` 默认常显，仅 hover 设备才隐藏 |
| 9 | §3 瞬时结果用全局 Toast | 复制/转发成功用就地图标变色 + 1.2s 计时 | 新增 `shell.overlay` Toast 宿主（`ui-primitives` 的 `Toast`），复制/转发/删除/清除/四类失败都报结果 |
| 10 | §3 失败操作保留原数据 | `commit()` 乐观更新：写失败仍删掉行，只留脚注 | 写失败不更新状态、不清草稿、不动转发标记，用 Toast 报 `保存失败，内容没有改动` |
| 11 | §2/§6.5 图标按钮配共享 Tooltip | 原生 `title` 属性 | 四个行内操作 + 设置/关闭改用 `ui-primitives` 的 `Tooltip`（portal、移动端不弹） |
| 12 | §11 文案走本地化字典 | `locale/*.json` 只有 `nav.label`；两处中文 `aria-label`/`title` 与转发前缀硬编码在 JS 里 | 字典补到 62 键、`locale/zh.json`/`en.json` 与内置字典逐键一致（测试守护），硬编码文案全部入字典 |
| 13 | §6.8 移动端不主动弹键盘 | 打开面板即 `focus()` 录入框 | 仅在 `(hover:hover) and (pointer:fine)` 设备上自动聚焦 |
| 14 | §12 插件图标画布 36×36 | `icon.svg` 为 16×16 | 改为 36 画布、同一套路径居中缩放，仍为自包含 SVG |
| 15 | §1 一页内不同字号要少 | 面板内 5 档 | 面板内仅 12 / 13 / 14 三档（实测集合） |

此外删除了三处与规范冲突的实现：为吸顶标题在浮层材质上叠的第二层填充（会产生一条比面板更亮的横带）、复制成功的就地勾选态、以及"整页便笺"这套已下线的第二实现（`Panel` / `PanelBody` / `MemoEntry` 及其 18 个样式类）。

### 与 main 的合流

本次复查的分支落后 `main`（已发到 1.8.1）。为了让上面板时既不丢功能、也不退回旧样式，把 main 在此期间的**功能**增量并了进来，样式仍以本分支为准：

| main 的功能 | 落位 |
| --- | --- |
| 已完成便笺显示创建 + 完成时间，并按完成时间倒序 | `completedStamp` / `compareDoneItems` / `metaLabel`，列表用 `sort(compareDoneItems)` |
| 关于区显示作者与项目地址 | `PLUGIN_AUTHOR` / `PLUGIN_REPO_*` + `.dsh-wt-settingProject` |
| 存储说明改为"仅保存在本地" | `popover.storage` / `storage.failed` |
| 前缀输入框字号与标签一致 | 行的字号变量本来就是 13px，无需再改 |

main 的滚动区边缘羽化与"滚动条贴面板边"两项**没有**并入：本分支已改用主题共享滚动条皮肤，且不再做吸顶标题，这两处实现随之失效。

时间行在窄面板里会被操作按钮挤窄，因此截断时用 `title` 提供完整文案（正文段落不截断）。

### 1.1 追加微调：把视觉层级真正拉开

上一轮把颜色与尺度收敛到令牌后，面板仍有三个层级问题：面板标题、计数文案和分区标题都挤在相近的字号与行位里，两个计数徽标都是灰描边，录入区与便笺卡片都贴在近白的菜单材质上。本轮只调整权重、行位与表面层级，不引入新色板、不新增字号。

| 位置 | 上一轮 | 本轮 |
| --- | --- | --- |
| 面板头 | 标题 14/500；计数 12/次级另起一行，行高 20 | 标题与计数同一行；标题仍是唯一 14/500，计数 12/400 次级、行高 16，设置与关闭收进右侧动作组 |
| 分区标题 | 13/500 主墨色，和面板标题接近 | 12/500 次级墨色，让位给标题与便笺正文 |
| 计数徽标 | 18px 胶囊、`border-l2` 描边、12/次级墨色 | 未完成 0 不再渲染；>0 用 `interactive-bg-hover-solid` 底 + `border-l3` + 主墨色；已完成用 `state-success-tertiary` 底 + `state-success-primary` 描边 + 主墨色 |
| 录入区 / 卡片 | 录入区 `bg-layer-1` + `border-l4`；卡片透明底 + `border-l2` | 两者统一 `settings-card-fill` + `settings-card-stroke`，先读成“卡”，再读卡里的字 |
| 浮层描边 | elevation 第一层绑 `border-l1`（4%） | 绑 `border-l2`（10%），白底上仍能看见面板边界 |

实测（明 / 暗）：面板头 14/500 标题 + 12/400 计数（同一行），分区标题 12/20/500、`label-secondary`；徽标 18×18、12/500；已完成徽标文字对比度 17.3:1 / 11.5:1，未完成徽标 17.0:1 / 11.6:1。字号仍只有 12 / 13 / 14 三档，字重仍 ≤500，所有颜色仍取自 `--dsw-alias-*`。

| 微调前（明） | 微调后（明） | 微调后（暗） |
| --- | --- | --- |
| ![微调前](./ui-check/hierarchy-before-light.png) | ![微调后](./ui-check/hierarchy-after-light.png) | ![微调后·暗](./ui-check/hierarchy-after-dark.png) |

空态里未完成计数为 0，徽标直接不渲染，标题行不再背一个没有信息量的“0”：

![空态](./ui-check/hierarchy-after-empty-light.png)

## 2. 实测数据

无头 Chromium 读取的计算值（明色；暗色同一套规则）：

| 项 | 实测 |
| --- | --- |
| 浮窗 | `border:0`、`border-radius:28px`、`background:rgba(248,249,250,.58)`、阴影 = `0 0 0 .5px border-l2` + 两层柔光、`padding:16px`、`gap:12px` |
| 面板头 / 分区标题 | 标题 14/500 + 计数 12/400 同一行；分区标题 12/500、`label-secondary` |
| 标题 / 行文本 / 说明 | 14px/20px/500 · 13px/20px/400 · 12px/20px/400 |
| 字号集合（面板内） | `{12px, 13px, 14px}` |
| 字重集合 | `{400, 500}` |
| 圆角集合 | `{0px, 8px, 16px, 28px, 999px}`（0 = 卡片内满宽子行，由父级裁剪） |
| 录入区 / 添加按钮 | 0.5px 描边、R16、`padding:12px` · H28、R8、12px/500、`button-primary-fill` |
| 图标按钮 | 24×24、R8、`label-secondary` |
| 勾选圈 | 14×14、0.5px、R999、命中区 24px |
| 行分隔线 | 0.5px |
| 列表滚动 | `overflow-y:auto`、共享皮肤、滚动条距面板边缘 16px 内缩 |

明暗对比度（相对浮层合成后的底色 `#f7f8f9` / `#2a2b2e`）：

| 文本 | 明 | 暗 |
| --- | --- | --- |
| 正文 / 标题 `label-primary` | 17.7:1 | 13.6:1 |
| 说明 / 时间 / 计数 `label-secondary` | 5.4:1 | 9.4:1 |
| 占位提示（同 secondary） | 5.4:1 | 9.4:1 |
| 勾选圈描边 `label-tertiary`（非文本） | 3.5:1 | 6.7:1 |

`label-tertiary` 不再承担文字：明色下它只有 3.5:1，规范 §1 明确要求"暗淡色调用在文字上前必须双主题核实"，因此文字统一走 `secondary`，tertiary 只留给描边、圆点等非文本细节。

## 3. 交互

- **入口**：会话顶部 28×28 按钮，未完成数为胶囊徽标；打开时 `data-active`，再次点击或点外部/Esc 关闭，关闭后焦点回到入口按钮。
- **反馈**：复制、转发、删除、清除完成 → 顶部全局 Toast（成功带勾选图标；失败带警告图标），浮窗关闭后仍然可见；失败时不改动任何数据。
- **六个状态**：默认 / 悬停 / 按下（`interactive-bg-active` + 轻微缩放）/ 键盘聚焦（主题 2px 环）/ 禁用 / 加载（按钮内 12px 环，`aria-busy`）。
- **浮层安全**：`position:fixed` + portal 到 body，宽高按视口夹取（≤480px 时 12px 边距，`maxHeight` 不低于 160px），只在下方确实放不下时才翻到锚点上方；顶边不低于 `--dsh-frame-overlay-top`，macOS 标题栏与 Windows 标题条都不会压住面板，且没有改动该全局变量；外侧 pointerdown 与 Esc 都能关闭。
- **响应式**：390×844 下浮窗 366px、四边 12px、标题与操作都不截断（见截图）；触摸设备操作按钮常显，不依赖悬停。

## 4. 截图

本节是上一轮复查的基线截图；视觉层级微调后的对照见 [§1.1](#11-追加微调把视觉层级真正拉开)。

| 明 | 暗 |
| --- | --- |
| ![默认面板](./ui-check/panel-light.png) | ![默认面板·暗](./ui-check/panel-dark.png) |
| ![设置](./ui-check/settings-light.png) | ![设置·暗](./ui-check/settings-dark.png) |
| ![空态](./ui-check/empty-light.png) | ![空态·暗](./ui-check/empty-dark.png) |

| 状态 | |
| --- | --- |
| 行悬停（明） | ![行悬停](./ui-check/hover-row-light.png) |
| 行悬停（暗） | ![行悬停·暗](./ui-check/hover-row-dark.png) |
| 主按钮悬停 | ![按钮悬停](./ui-check/hover-add-light.png) |
| 图标按钮键盘聚焦 | ![聚焦](./ui-check/focus-light.png) |
| 390px 窄视口 | ![窄视口](./ui-check/narrow-390.png) |
| 列表滚动（共享滚动条） | ![滚动](./ui-check/scroll-light.png) |

## 5. 让规范可执行

`tests/contract.test.mjs` 从 11 条扩到 23 条，全部在 `npm test` 里跑。新增的守护项：

| 测试 | 守住什么 |
| --- | --- |
| `colours come from theme aliases…` | 规则里不许出现 `#hex` / `rgb()` / `--wt-n-*`；只允许 `--dsw-*` / `--ds-*` / `--wt-*` 前缀的变量 |
| `type scale…` | 字号只能取 3 个令牌，字重 ≤500 |
| `spacing snaps…` | 间距仍是 4px 刻度（光学微调走 `calc()`） |
| `radii use the shared scale…` | 圆角只能取 `--dsw-radius-*` 或 999，且胶囊必须配 `corner-shape:round` |
| `hairlines stay at 0.5px…` | 中性描边 0.5px；只有虚线 1px、spinner 1.5px |
| `the floating panel is borderless and elevated…` | 浮窗 `border:0` + `elevation-panel`，且任何规则不得同时叠中性描边和 elevation |
| `scrollbars keep the shared theme skin` | 禁止组件私有滚动条与 `scrollbar-width/color` |
| `hover styling is gated…` | `:hover` 只能出现在 `@media (hover:hover)`；触摸端操作常显 |
| `no product copy is hardcoded…` | JS 里除字典外不得出现中文文案 |
| `chinese hints drop the trailing full stop` | 中文提示不以"。"结尾 |
| `transient outcomes go to the frame-wide toast seat` | 必须有 `shell.overlay` Toast，且不得再出现就地成功态 |
| `a failed write keeps the row…` | 写失败不更新状态、报失败 |
| `icon-only controls use the shared tooltip` | 四个行内操作走 `Tooltip`，不再叠加原生 `title` |
| `the retired page entry is gone…` | 已下线的整页实现不得回流 |
| `locale files carry the whole dictionary` | `locale/*.json` 与内置字典逐键一致 |
| `the panel never raises the soft keyboard…` | 自动聚焦必须以 `(hover:hover) and (pointer:fine)` 为前提 |

## 6. 仍需评审 / 未覆盖

1. **入口按钮仍是原生 `title`**。它由插件注入宿主 header 的 DOM（React portal 会被宿主重渲染回收），共享 `Tooltip` 无法包裹；行内操作与设置/关闭已全部走 `Tooltip`。若要求入口也统一，需要宿主为 header utilities 提供官方插槽。
2. **右侧浮窗不是右侧栏插槽**。规范 §2 要求"新内容必须在现有侧栏里注册 slot，禁止做独立侧栏"。当前是锚定在 header 的浮窗（`placement:'right'`），语义上更接近 popover；若产品希望它成为常驻侧栏，应改注册到 `rightbar`，属于产品决策，未在本次改动。
3. **链接与错误文本的明色对比度**。`--dsw-alias-link` 在明色浮层上 3.97:1、`--dsw-alias-state-error-primary` 4.22:1，低于 4.5:1；这两个都是主题令牌，规范 §8 要求直接用它们，因此保持不动，建议在主题层统一提升。
4. **吸顶分区标题保持原样式**。远端 1.9.5 恢复了吸顶；本次仅在标题真正 pinned（`data-stuck`）时用两层 `--dsw-alias-menu-group-header-fill` 叠成不透明纯色填充，标题字号、字重、间距不变，不做圆角、不加底层、不使用半透明；未吸顶保持透明。标题下方用 5 段 4px 的阶梯模糊（20→2px）渐变过渡到正文，让实色边缘柔和消失；阶梯分条是因为 Chromium 在 mask 下会丢弃 backdrop-filter。
5. **未在真实 GUI 回归**。本仓库是插件包，当前 profile 指向另一工作树；本次用同一份样式 + 同一套主题令牌 + 等价 DOM 验证明暗两套主题。合并后建议在真实会话里点一遍六个状态与 Toast。
6. **预览图已重拍**。根目录 `preview*.png` 已在一套独立的 DSH GUI 会话里按当前样式重拍（1440×900@2x，明色与暗色各一组，同一会话同一批便笺），并清除了旧图里其他工程的会话名与工作区名；`preview-history.png`（输入框底部入口）随该入口下线一并删除。
7. **图标仍需设计师确认**。`icon.svg` 只是把既有路径换成 36 画布，规范 §12 要求新图标上线前拿到设计师批准。
