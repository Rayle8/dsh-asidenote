# AsideNote 截图与预览图 SOP

本文件固定本插件的截图产出流程：从一套**隔离的 DSH 环境**里生成演示会话，拍下面板状态，再裁切成 README 用图。目标是任何人（或 agent）照此执行都能得到同一批图，且图中不出现任何其它工程的信息。

配套脚本在 [`tools/screenshots/`](../tools/screenshots/)：

| 文件 | 作用 |
| --- | --- |
| `run.sh` | 端到端编排：建 profile → 起服务 → 起 Chrome → 拍明暗 → 裁切 |
| `bootstrap.mjs` | 造演示会话：一条提问 + 固定四条便笺（含完成状态与时间） |
| `capture.mjs` | 逐个状态截图，输出原始 2x PNG 与每个面板的 `rect` |
| `crop.py` | 按 `rect` 外扩裁切、缩放，写 `docs/assets/features/` |
| `lib/cdp.mjs` | 极简 CDP 驱动（无第三方依赖） |

## 1. 产物

| 文件 | 内容 | 尺寸 |
| --- | --- | --- |
| `docs/assets/preview-right.png` / `-dark.png` | 整窗总览：顶部入口 + 右侧面板 | 1280×800 |
| `docs/assets/preview-badge.png` / `-dark.png` | 入口按钮特写，带未完成数 | 460×176 |
| `docs/assets/features/{panel,settings,actions,clear,empty}.png` | 功能图（明色） | 640 宽 |
| `docs/assets/features/{…}-dark.png` | 功能图（暗色） | 640 宽 |

> `run.sh` 只重写十张功能图；`preview-right*` 与 `preview-badge*` 需要时按第 6 节手工补拍。旧的 `preview.png` / `preview-dark.png`（面板特写商店素材）已下线，不再产出。

## 2. 前置条件

- macOS，已安装 DeepSeek Harness（默认路径见下）与 Google Chrome；
- Node 22+（与 `package.json#engines` 一致）；
- Python 3 + Pillow；
- 可选：`~/.dsh/.credentials.yaml`。**默认不复制**；只有设置 `COPY_CREDENTIALS=1` 时才会复制到临时 profile，用于让演示会话产生一段真实回复。缺失或未开启时面板照常可拍，只是回复为空。

可覆盖的环境变量：

```bash
DSH_CLI=/path/to/dsh        # 默认 /Applications/DeepSeek Harness.app/Contents/Resources/runtime/cli/bin/dsh
CHROME=/path/to/Chrome      # 默认 /Applications/Google Chrome.app/Contents/MacOS/Google Chrome
PORT=61399 CDP_PORT=9222    # 默认端口
WORK=/tmp/screenshots       # 默认 <repo>/.screenshots，结束时删除
KEEP=1                      # 保留 WORK 便于排查
COPY_CREDENTIALS=1          # 复制本机凭据到临时 profile（默认关闭）
```

## 3. 一键运行

建议在**独立 worktree** 里执行，避免与主工作树里正在进行的改动互相覆盖：

```bash
git worktree add ../dsh-aside-note-shots -b chore/shots
cd ../dsh-aside-note-shots
tools/screenshots/run.sh
npm test
```

`run.sh` 内部顺序：

1. 在 `$WORK` 下新建一个一次性 `DSH_HOME`，用发行版自带模板生成 `demo` profile；
2. 把当前仓库以 `link:` 装进该 profile，`--offline` 安装，store 指向 `$WORK/pnpm-store`（**不会**在仓库里留下 `.pnpm-store`）；
3. 写入 `ui-theme.preference=light` 与 `welcomeNoticeVersion`；仅在 `COPY_CREDENTIALS=1` 时复制凭据；
4. 起 `dsh --profile demo --no-open --port $PORT`，从日志里取 `token`（只保存在变量里，不打印）；
5. 起 headless Chrome（CDP），窗口 `1440×1043`、`deviceScaleFactor=2`（内容区正好 1440×900，输出 2880×1800）；
6. `bootstrap.mjs` 造会话与便笺，并把便笺时间回拨到固定年龄；
7. `capture.mjs` 拍明色 5 个状态；
8. 改 `preference: dark` 重启服务、重新取 token，拍暗色 5 个状态；
9. `crop.py` 裁切并写入 `docs/assets/features/`；
10. 退出时杀掉服务与 Chrome，删除 `$WORK`。

## 4. 截图状态矩阵

| 状态 | 触发方式 | 面板高度 |
| --- | --- | --- |
| `panel` | 打开面板，展开「未完成」「已完成」，列表滚到顶 | 550 |
| `settings` | 先折叠两个分区，再点标题右侧设置按钮 | 632 |
| `actions` | 鼠标移到第一条便笺上，显示复制/转发/编辑/删除 | 550 |
| `clear` | 点「清除已完成」，出现二次确认条 | 603 |
| `empty` | 临时清空当前会话的便笺并刷新，打开面板 | 381 |

明暗两轮必须**用同一批便笺、同一组时间**，否则两张图并排会露馅。`bootstrap.mjs` 里的 `NOTES` 是唯一数据源，改内容只改这一处。

## 5. 构图规则（别跳过）

1. **隔离背景**：截图前把 `document.body` 里除 `.dsh-an-popover` 以外的子节点全部 `visibility:hidden`，再把 `body` 背景刷成中性画布——明色 `#F2F3F5`、暗色 `#0D0D0F`。这样面板的真实阴影和发丝线才不会被对话文字污染。
2. **外扩裁切**：面板 `border:0`，0.5px 描边与阴影画在矩形**外面**。必须按 `rect` 向外扩 **26 CSS px** 再裁，否则白面板贴在白底上会「没有边」。
3. **统一宽度**：功能图缩放到 640 宽。
4. **去焦点环**：截图前 `document.activeElement?.blur()`，否则录入框会带蓝色 focus 边框。
5. **真实 UI**：只换背景与裁切，不改面板样式、不加边框、不做高斯模糊。

## 6. 整窗图与入口特写（手工补拍）

`run.sh` 只产出面板类图。需要 `preview-right*.png` / `preview-badge*.png` 时：

1. 用同一套环境（`KEEP=1` 可复用 `$WORK`），在 Chrome 里打开演示会话；
2. 明色：打开面板，`Page.captureScreenshot` 整页（2880×1800），缩放到 1280×800 → `docs/assets/preview-right.png`；
3. 暗色：重启服务为 `dark`，重复第 2 步 → `docs/assets/preview-right-dark.png`；
4. 入口特写：关掉面板，裁头部右侧约 `x=2650..2880, y=0..88`（2x 像素），放大 2 倍 → `docs/assets/preview-badge.png`；暗色同理。

## 7. 内容规则

- 便笺文案只写与本插件相关的小事（发布说明、暗色对比度、390px 视口、空状态文案）；
- 演示会话的提问要**明确不调用工具**，否则会触发审批/沙箱错误，出现在截图里；
- 便笺时间用相对年龄（46 分钟 / 12 分钟 / 1 天）回拨，不要出现「刚刚」；
- 图中不得出现其它工程的工作区名、会话标题、文件路径、对话正文。

## 8. 验收清单

- [ ] 明暗两张并排时，除颜色外完全一致（文案、计数、时间、滚动位置）；
- [ ] 面板四条边都能看出边界：有阴影、有 0.5px 发丝线，背景是中性画布；
- [ ] 录入框没有蓝色焦点环；
- [ ] 五张功能图的面板宽度一致、留白一致；
- [ ] 图里没有任何其它项目的信息（逐张过一遍）；
- [ ] `npm test` 通过（`feature screenshots ship in both themes` 会校验 10 张功能图与两份 README 的引用）；
- [ ] `git status` 里没有 `.screenshots/`、`.pnpm-store/`、凭据文件。

## 9. 收尾

1. 需要时同步 README 的「功能截图」表格（图片路径不变则无需改动）；
2. 在 `CHANGELOG.md` 当前版本小节记一条；
3. `npm test`；
4. 提交并推送。

## 10. 故障排查

| 现象 | 原因 / 处理 |
| --- | --- |
| `dsh web authentication required` | 没带 `token`。`run.sh` 会从 `server.log` 里取，手工调试时从启动日志复制 `?token=…` |
| 页面出现 `Failed to load plugins` | 偶发的 client bundle 加载失败；`capture.mjs` 的 `waitApp()` 会检测并重载，最多 5 次 |
| 面板没出现 | 当前会话不是演示会话。`run.sh` 用新 profile，刷新后会自动恢复到最近会话；手工调试时确认 `dsh.sessions.current` |
| 悬停不出现行操作 | 必须用 CDP `Input.dispatchMouseEvent` 真实移动鼠标；`element.hover()` 不触发 `:hover` |
| 便笺时间显示「刚刚」 | `bootstrap.mjs` 的回拨发生在写 localStorage 之后没有刷新；`capture.mjs` 开头会 reload，手工操作时要手动刷新 |
| 端口占用 | `PORT` / `CDP_PORT` 换一个；`run.sh` 退出时会按端口清理残留进程 |
| Chrome 起不来（`GPU process isn't usable` / sandbox） | 需要 `--no-sandbox`；DSH 文件沙箱下还要 `--user-data-dir` 指向可写目录 |
| 面板边缘看不清 | 裁切没有外扩，或背景不是中性画布；回到第 5 节 |

## 11. 安全

- 凭据复制是**可选**的：只有 `COPY_CREDENTIALS=1` 才会把 `~/.dsh/.credentials.yaml` 复制到 `$WORK/dshhome/`，该临时目录在 `run.sh` 退出时删除；不要把凭据拷进仓库或提交。
- 启动日志里的 `token` 只存在临时目录与进程环境变量中，脚本不打印、不写入产物。
- 截图只落在 `docs/assets/features/` 与 `docs/assets/preview-*.png`；`$WORK`、`.screenshots/` 与 `.pnpm-store/` 不进入版本库（`.gitignore` 已覆盖）。
