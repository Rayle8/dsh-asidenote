# Changelog

The 1.0.0–2.0.1 iterations were development builds of the same plugin; the 2.x line was withdrawn from npm before it became public and the changelog was consolidated at 0.9.10, the first public release under the `dsh-aside-note` name. The public line resumes here at 1.0.0, the first stable release.

## next-released

## 1.0.3

<!-- app-update-notes:en:start -->
### Fixed
- **Install:** the one-command installer runs `pnpm install` through the node and pnpm DeepSeek Harness ships (it falls back to the pnpm on PATH, and `DSH_RUNTIME_DIR` pins a runtime), so a profile is never written by another pnpm major — which surfaced as `ERR_PNPM_UNEXPECTED_STORE` on the host's next install. When pnpm asks to purge a store left by another major it re-runs once with `CI=true`.
<!-- app-update-notes:en:end -->

<!-- app-update-notes:zh:start -->
### 修复
- **安装：** 安装器改用 DeepSeek Harness 自带的 node 与 pnpm 执行 `pnpm install`（找不到运行时回退到 PATH 上的 pnpm，可用 `DSH_RUNTIME_DIR` 指定），避免 profile 被另一个主版本的 pnpm 写入、导致宿主下次安装报 `ERR_PNPM_UNEXPECTED_STORE`；pnpm 要求清空旧 store 时会自动用 `CI=true` 重跑一次。
<!-- app-update-notes:zh:end -->

## 1.0.2

<!-- app-update-notes:en:start -->
### Fixed
- **Update:** when the market is busy with another operation, “Update now” waits and retries before reporting it. If the market stays busy — or is not installed at all — the card now states the command (`npx -y dsh-aside-note install`, or the Plugins page) and offers **Copy update prompt**, instead of stopping at “another update is already running — try again shortly”.
<!-- app-update-notes:en:end -->

<!-- app-update-notes:zh:start -->
### 修复
- **更新：** 市场正在执行别的操作时，「立即更新」会先等待并重试；如果市场一直忙、或根本没有安装市场，卡片不再停在「市场正在执行另一个更新，请稍后再试」，而是直接给出命令（`npx -y dsh-aside-note install`，或到「插件」页更新），并提供「拷贝更新提示词」。
<!-- app-update-notes:zh:end -->

## 1.0.1

<!-- app-update-notes:en:start -->
### Changed
- **Install:** the installer now closes by telling the user that the 旁边记 entry sits at the top right of the conversation after install — no restart — and, when it is still missing, to refresh the Plugins page and toggle the plugin off and on once, which recomposes the running host.
- **README:** the install story is a single section now — **Quick install**, right above “Why AsideNote”, with **Install with an agent** and **Install from the command line** — replacing the separate npm, git-checkout and Release methods and the standalone install-prompt page; the link recipe a contributor needs moved to **Development**. The feature list is merged from 28 bullets into ten groups.
- **Screenshots:** the README images are re-shot from the 旁边记 build at 4× device scale — panel title, composer placeholder, empty state and Settings › About carry the new name and tagline, the feature shots are now 1080 px wide and the previews 1920 px, so they stay crisp when zoomed — the four preview images come from the same demo session as the feature shots, and the sidebar account menu is hidden so the shots carry no personal account.
<!-- app-update-notes:en:end -->

<!-- app-update-notes:zh:start -->
### 变更
- **安装：** 安装器结束时不再只说「无需重启」，而是明确告诉用户安装后会话右上角即可看到「旁边记」；入口没出现时，到「插件」页刷新并把插件关闭再开启一次，运行中的 Host 会随之重新组合。
- **README：** 安装说明集中为「快速安装」一节，放在「为什么做旁边记」之前，分「通过 agent 安装」与「通过命令行安装」；原先并列的 npm 依赖、git checkout、Release 包三种方式与独立的安装提示词页面一并移除，贡献者需要的 link 写法则移入「开发」。「功能」清单从 28 条合并为 10 条。
- **截图：** README 的图片按**旁边记**重新拍摄，并以 4 倍设备像素导出：浮窗标题、输入占位、空状态与设置 › 关于都已是新名字与 slogan；功能图加宽到 1080、整窗图到 1920，放大看依然清晰；四张预览图与功能图出自同一个演示会话，并隐藏侧栏账号菜单，不出现个人账号。
<!-- app-update-notes:zh:end -->

## 1.0.0

<!-- app-update-notes:en:start -->
### Changed
- **Naming:** the Chinese product name is now **旁边记** (English: AsideNote) with the tagline “让想法留在对话旁边” / “Keep your ideas beside the conversation”. The panel title, empty state and composer placeholder carry the new name, and Settings › About shows the tagline.
- **Storage:** local storage keys now follow the package name: the notes key is `dsh.aside-note`, with `.drafts`, `.forwarded`, `.sections`, `.panel-width`, `.panel-height`, `.send-shortcut` and `.forward-prefix` beside it. The old `dsh.aside-notes.*.v2` keys and the 1.x `dsh.session-memos.v1` / `dsh.memo.*.v1` keys are not read or migrated; rename your data under `localStorage` after upgrading to keep it.
- **Install:** the installer defaults to `^1.0.0` now, so a fresh `npx dsh-aside-note install` follows the stable 1.x line instead of pinning the profile to 0.9.x.

### Fixed
- **Update check:** a manual check no longer flashes the running version as a newly available release before settling on “up to date”.
<!-- app-update-notes:en:end -->

<!-- app-update-notes:zh:start -->
### 变更
- **命名：** 产品中文名定为**旁边记**（英文名沿用 AsideNote），slogan 为「让想法留在对话旁边」。浮窗标题、空状态与输入占位改用新名字，设置 › 关于展示 slogan。
- **存储：** 本地存储键统一到包名：便笺键为 `dsh.aside-note`，其余为 `.drafts`、`.forwarded`、`.sections`、`.panel-width`、`.panel-height`、`.send-shortcut` 与 `.forward-prefix`。旧的 `dsh.aside-notes.*.v2` 与 1.x 的 `dsh.session-memos.v1` / `dsh.memo.*.v1` 键不再读取，也不自动迁移；升级后如需保留数据，请在 `localStorage` 中手动改名。
- **安装：** 安装器默认范围改为 `^1.0.0`，`npx dsh-aside-note install` 会接入稳定的 1.x 线，而不是把 profile 固定在 0.9.x。

### 修复
- **检查更新：** 手动检查不会再先把当前版本短暂显示为新版本，再回到「已是最新版本」。
<!-- app-update-notes:zh:end -->

## 0.9.10

<!-- app-update-notes:en:start -->
### Changed
- **Identity:** the npm package, plugin id and repository are now `dsh-aside-note`; install with `npx dsh-aside-note install`. Storage keys (`dsh.aside-notes.*.v2`) and CSS prefixes are unchanged, so existing notes and settings carry over.
- **First public release:** 0.9.9 was withdrawn before it became public; this version starts the name cleanly.
<!-- app-update-notes:en:end -->

<!-- app-update-notes:zh:start -->
### 变更
- **命名：** npm 包名、插件 id 与仓库统一为 `dsh-aside-note`；安装命令为 `npx dsh-aside-note install`。存储键（`dsh.aside-notes.*.v2`）与 CSS 前缀保持不变，已有便笺和设置直接沿用。
- **首个公开版本：** 0.9.9 在公开前已撤回，本版本以新名字重新开始。
<!-- app-update-notes:zh:end -->

## 0.9.9

<!-- app-update-notes:en:start -->
### Added
- **Panel:** a top-right header entry with an open-count badge opens a floating, resizable right panel; Open and Completed keep their own sticky, collapsible sections, and the panel size, drafts and section state are restored per session.
- **Notes:** quick add, edit, complete, copy, forward to the composer, delete, and clear completed behind an inline confirmation; the composer and editor grow with wrapped text.
- **Settings:** a send/newline shortcut (⌘ or Ctrl aware), a one-click forward prefix, the version and author in About, and the full Chinese/English copy from one dictionary.
- **Update centre:** Settings › About checks npm (npmmirror, then the GitHub Release fallback), lists pending releases newest-first, and updates in place through the plugin market with a refresh hint.
- **Installer:** `npx dsh-aside-note install` (`scripts/install.mjs`, shipped as the package's `bin`) resolves the DSH profile (`DSH_PROFILE_DIR`, `--profile`, `--profile-dir`), backs up the manifest and lockfile, adds the dependency plus the `dsh.profile.bundles` entry, runs `pnpm install` and verifies the installed `client/client.js`; `--dry-run` and `--no-install` keep it reviewable and re-running is idempotent. `docs/install-prompt.md` carries a shareable agent prompt, and a page reload is enough after install or upgrade.
- **Release pipeline:** tag-driven publish workflow with a changelog gate, `npm run release`, and `tools/release/notes.mjs`, which composes the Release body (English + 中文, install links, Full Changelog) carrying the `app-update-notes` markers the panel reads.

### Changed
- **Design:** the panel is rebuilt on DSH semantic tokens — a 12/13/14 type scale at weight 500 or less, 0.5px hairlines, shared radii and elevation, the DSH scrollbar skin, and hover styles gated behind `@media (hover:hover)` — with feedback routed through `shell.overlay` toasts.
- **Build:** the client is split into modules and built with tsdown into the committed `client/client.js`; the message dictionary lives in `src/client/i18n`, and `locale/*.json` carries package metadata only.
- **Identity:** renamed 一点待办 → Memo → Notes → **AsideNote** (`dsh-aside-note`); storage moved to `dsh.aside-notes.*.v2` with a one-time copy of 1.x data, and the old keys are kept so a rollback still works.

### Fixed
- Build the CSS virtual module id with a forward slash, so a Windows build produces the same `client/client.js` bytes as Linux and the CI bundle check stays green.
<!-- app-update-notes:en:end -->

<!-- app-update-notes:zh:start -->
### 新增
- **面板：** 右上角标题栏入口带未完成计数角标，点开是可拖拽缩放的浮动右侧面板；「未完成」「已完成」各自保留可折叠的吸顶分组，面板尺寸、草稿和分组状态按会话恢复。
- **便笺：** 快速添加、编辑、完成、复制、转发到输入框、删除，以及带内联确认的清空已完成；输入框与编辑器会随换行自动增高。
- **设置：** 发送/换行快捷键（识别 ⌘ 与 Ctrl）、一键转发前缀、关于区的版本与作者，以及由同一份词典提供的中英文文案。
- **更新中心：** 设置 › 关于 会检查 npm（失败时回退 npmmirror，再到 GitHub Release），按版本从新到旧列出待更新说明，并通过插件市场就地更新、完成后提示刷新。
- **安装工具：** `npx dsh-aside-note install`（`scripts/install.mjs`，随包发布为 `bin`）会定位 DSH profile（支持 `DSH_PROFILE_DIR`、`--profile`、`--profile-dir`）、备份清单与 lockfile、写入依赖和 `dsh.profile.bundles` 条目、执行 `pnpm install` 并校验安装后的 `client/client.js`；`--dry-run` 与 `--no-install` 便于先审阅，重复执行是幂等的。`docs/install-prompt.md` 提供可直接交给 agent 的安装提示词；安装或升级后刷新页面即可，无需重启。
- **发布链路：** tag 触发的发布 workflow、changelog 校验、`npm run release`，以及 `tools/release/notes.mjs`——它生成带 `app-update-notes` 标记的中英文 Release 正文（含安装链接与 Full Changelog），供面板直接读取。

### 变更
- **设计：** 面板改用 DSH 语义 token 重建——12/13/14 字号、字重不超过 500、0.5px 描边、统一圆角与投影、DSH 滚动条皮肤，悬停样式只在支持悬停的设备生效，操作反馈统一走 `shell.overlay` toast。
- **构建：** 客户端拆分为模块，由 tsdown 构建成提交进仓库的 `client/client.js`；文案词典放在 `src/client/i18n`，`locale/*.json` 只保留包元数据。
- **命名：** 一点待办 → Memo → Notes → **AsideNote**（`dsh-aside-note`）；存储迁移到 `dsh.aside-notes.*.v2`，首次加载时复制 1.x 数据，旧键保留以便回退。

### 修复
- CSS 虚拟模块 id 统一用 `/` 分隔，Windows 构建产出的 `client/client.js` 与 Linux 逐字节一致，CI 的 bundle 校验不再失败。
<!-- app-update-notes:zh:end -->
