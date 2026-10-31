# Changelog

The 1.0.0–2.0.1 iterations were development builds of the same plugin; the 2.x line was withdrawn from npm and everything is consolidated here as release 0.9.10, the first public release under the `dsh-aside-note` name.

## next-released

<!-- app-update-notes:en:start -->
### Changed
- **Naming:** the Chinese product name is now **旁边记** (English: AsideNote) with the tagline “让想法留在对话旁边” / “Keep your ideas beside the conversation”. The panel title, empty state and composer placeholder carry the new name, and Settings › About shows the tagline.
- **Storage:** local storage keys now follow the package name: the notes key is `dsh.aside-note`, with `.drafts`, `.forwarded`, `.sections`, `.panel-width`, `.panel-height`, `.send-shortcut` and `.forward-prefix` beside it. The old `dsh.aside-notes.*.v2` keys and the 1.x `dsh.session-memos.v1` / `dsh.memo.*.v1` keys are not read or migrated; rename your data under `localStorage` after upgrading to keep it.

### Fixed
- **Update check:** a manual check no longer flashes the running version as a newly available release before settling on “up to date”.
<!-- app-update-notes:en:end -->

<!-- app-update-notes:zh:start -->
### 变更
- **命名：** 产品中文名定为**旁边记**（英文名沿用 AsideNote），slogan 为「让想法留在对话旁边」。浮窗标题、空状态与输入占位改用新名字，设置 › 关于展示 slogan。
- **存储：** 本地存储键统一到包名：便笺键为 `dsh.aside-note`，其余为 `.drafts`、`.forwarded`、`.sections`、`.panel-width`、`.panel-height`、`.send-shortcut` 与 `.forward-prefix`。旧的 `dsh.aside-notes.*.v2` 与 1.x 的 `dsh.session-memos.v1` / `dsh.memo.*.v1` 键不再读取，也不自动迁移；升级后如需保留数据，请在 `localStorage` 中手动改名。

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
