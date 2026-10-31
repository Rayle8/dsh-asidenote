# 旁边记 · AsideNote

让想法留在对话旁边

[English](README.en.md) | 中文

> 中文名 **旁边记**，英文名 **AsideNote**；包、插件 id 与仓库均为 `dsh-aside-note`。

轻量记录 · 按需打开 · 用完收起

旁边记是面向 DeepSeek Harness（DSH）的轻量会话便笺。临时的想法、稍后的待办，随手留在对话旁；需要时一键带回，用完收起，继续眼前的事。

## 界面与入口

![旁边记右侧面板](./docs/assets/preview-right.png)

暗色主题下外观保持一致，颜色全部取自 DSH 主题令牌：

![旁边记右侧面板（暗色）](./docs/assets/preview-right-dark.png)

会话顶部右侧的「旁边记」按钮，带未完成数量：

<img src="./docs/assets/preview-badge.png" width="460" alt="顶部右侧旁边记按钮">

暗色主题下的同一按钮：

<img src="./docs/assets/preview-badge-dark.png" width="460" alt="顶部右侧旁边记按钮（暗色）">

点击入口后在右侧打开固定面板。

## 快速安装

旁边记以 npm 包 `dsh-aside-note` 装进 DSH profile。两种方式选一个：把提示词交给 agent，或自己执行一条命令。

### 通过 agent 安装

把下面这段发给你的 agent：

```text
帮我安装 DSH 插件 AsideNote（旁边记），在终端执行：npx -y dsh-aside-note install
装好后不用重启 DSH，会话右上角即可看到「旁边记」入口；如果没出现，
让我到「插件」页刷新，再把它手动关闭并开启一次。
如果提示找不到 DSH 或找不到 profile，转告我先安装并启动 DeepSeek Harness 再重试；
不要改仓库、不要手动拼装依赖、不要重启 DSH。
```

### 通过命令行安装

```bash
npx dsh-aside-note install
```

脚本会从 npm 临时拉取本包，找到 DSH profile（存在 `DSH_PROFILE_DIR` 时用它，否则默认 `~/.dsh/profiles/desktop`），先把 `package.json` 和 `pnpm-lock.yaml` 备份到 `.local-backup/`，再写入依赖、把 `dsh-aside-note` 追加进 `dsh.profile.bundles`，然后用 **DeepSeek Harness 自带的 node 与 pnpm** 执行 `pnpm install`（找不到运行时才回退到 PATH 上的 pnpm，可用 `DSH_RUNTIME_DIR` 指定），最后校验装出来的 `client/client.js`。用宿主自己的工具链是为了让 profile 的 pnpm store 与宿主保持一致——换成另一个主版本的 pnpm 写入，宿主下次安装会报 `ERR_PNPM_UNEXPECTED_STORE`。

```bash
npx dsh-aside-note install --profile work    # 指定 profile
npx dsh-aside-note install --dry-run         # 只打印计划，不改任何文件
npx dsh-aside-note install --version 1.0.0   # 固定版本，而不是 ^1.0.0
```

重复执行是幂等的。装完不需要重启 DSH：profile 会在约 1 秒内重新组合，安装后会话右上角即可看到「旁边记」入口。如果入口没有出现，到侧边栏「插件」页刷新，把它关闭再开启一次，运行中的 Host 会重新组合，入口随即可见。

卸载：从 `dsh.profile.bundles` 移除 `dsh-aside-note`，在 profile 目录执行 `pnpm remove dsh-aside-note`，无需重启；右上角入口随之消失，若「插件」页里仍列着它，刷新该页即可。

## 为什么做旁边记

和 AI 一起做事时，总会冒出一些暂时顾不上的小事：这个细节等会儿改，那段结果还要核对，还有一个思路想留着继续讨论。

先发进对话，容易打断当前任务；记到别处，回来又得重新找。旁边记就在会话旁边，让你先把事情记下，继续手头的工作。

不必为几件小事建立一套管理方法。想到就记，需要就看，做完就放下。它只在你需要时打开，用完收起，尽量少打扰当前的工作。

## 从随手记，到继续做

### 想到就记，继续手头的事

点击会话顶部右侧的「旁边记」按钮，打开右侧面板，记录待办、补充想法或需要回看的细节。入口显示未完成数量，做完一条，勾掉一条。

### 留在当前会话，下次接着做

便笺按会话独立保存。同一个工作区里，不同会话的事项各归各处，切换讨论也能保留各自的线索。

### 准备好了，一键带回对话

点击便笺上的转发按钮，内容就会以列表项追加到当前对话输入框。你可以继续补充、调整，再决定发送。前缀提示词支持自定义，且仅在输入框为空时添加；转发不会自动发送，也不会把便笺标记为完成。

### 日常使用的小细节，也准备好了

- **草稿自动保存**：临时关闭面板，再打开接着写。
- **完成后可回看**：未完成与已完成分区展示，保留创建与完成时间。
- **面板大小可调整**：宽高按需拖动，记住你的习惯。
- **融入 DSH 界面**：跟随明暗主题与中英文设置。
- **当前浏览器持久保存**：刷新页面、重启 DSH 后仍可继续查看；同一浏览器的多个标签页同步更新。

> 便笺保存在当前浏览器，不跨设备或浏览器同步；清理站点数据会清除记录。详见[数据保存在哪里](#数据保存在哪里)。

[查看安装方法](#快速安装) · [反馈问题或建议](https://github.com/Rayle8/dsh-aside-note/issues)

## 功能

- **会话级便笺**：数据按会话 ID 隔离，同一工作区的不同会话各自独立；同一浏览器的多个标签页同步更新。
- **入口与面板**：会话顶部右侧的图标按钮用角标显示未完成数；点击打开固定面板并与之对齐，DSH 右侧栏打开时自动左移，切换会话时收起。
- **条目操作**：添加、打勾完成、复制、双击或铅笔编辑、删除；「清除已完成」需要二次确认，已完成的条目可展开回看。
- **一键转发**：把便笺按 `- 内容` 追加到输入框，仅当输入框为空时写入可自定义的前缀，不自动发送；转发后按钮显示勾选，按会话记住，再点一次取消。
- **状态记忆**：新增与编辑的草稿按会话自动保存，关掉面板再打开会恢复；「未完成 / 已完成」的展开折叠状态也会记住。
- **面板尺寸**：拖左边缘调宽度、拖底部把手调高度，双击复位；宽高都保存在浏览器里。
- **列表分区**：「未完成」「已完成」各有吸顶标题与独立滚动，展开已完成不会压缩未完成；已完成显示创建与完成时间，并按完成时间倒序。
- **设置**：发送快捷键（Enter 或 ⌘/Ctrl+Enter）、转发前缀、关于（版本、检查更新、作者、源码），改动自动保存。
- **更新提示**：有新版本时设置按钮出现提示点，设置 › 关于 可查看更新说明并更新；详见[更新提示](#更新提示)。
- **界面融入**：颜色、圆角、阴影与滚动条全部复用 DSH 设计令牌，自动适配明暗主题与中英文；详见[设计规范](#设计规范)。

## 功能截图

五个主要状态的实拍，明暗同源（同一会话、同一批便笺，只切换主题）：

<table>
  <tr>
    <th width="130">功能</th>
    <th>明色</th>
    <th>暗色</th>
  </tr>
  <tr>
    <td>面板总览<br>未完成 / 已完成分区</td>
    <td><img src="./docs/assets/features/panel.png" width="300" alt="面板总览"></td>
    <td><img src="./docs/assets/features/panel-dark.png" width="300" alt="面板总览（暗色）"></td>
  </tr>
  <tr>
    <td>设置<br>发送快捷键、一键转发前缀、关于</td>
    <td><img src="./docs/assets/features/settings.png" width="300" alt="设置"></td>
    <td><img src="./docs/assets/features/settings-dark.png" width="300" alt="设置（暗色）"></td>
  </tr>
  <tr>
    <td>行操作<br>悬浮显示复制 / 转发 / 编辑 / 删除</td>
    <td><img src="./docs/assets/features/actions.png" width="300" alt="行操作"></td>
    <td><img src="./docs/assets/features/actions-dark.png" width="300" alt="行操作（暗色）"></td>
  </tr>
  <tr>
    <td>清除已完成<br>二次确认，避免误删</td>
    <td><img src="./docs/assets/features/clear.png" width="300" alt="清除已完成确认"></td>
    <td><img src="./docs/assets/features/clear-dark.png" width="300" alt="清除已完成确认（暗色）"></td>
  </tr>
  <tr>
    <td>空状态<br>还没有记录时的引导</td>
    <td><img src="./docs/assets/features/empty.png" width="300" alt="空状态"></td>
    <td><img src="./docs/assets/features/empty-dark.png" width="300" alt="空状态（暗色）"></td>
  </tr>
</table>

## 设计规范

面板与入口按钮的样式由 `src/client/styles/panel.css` 的令牌块统一驱动，改一处即可全站生效：

| 维度 | 令牌 | 取值 |
| --- | --- | --- |
| 颜色 | `--dsw-alias-*` | 直接复用 DSH 语义别名（墨色 / 悬停 / 描边 / 状态 / 设置卡），插件不再自建灰阶 |
| 字号 | `--an-fs-caption/row/title` | 12 / 13 / 14，行高统一 20 |
| 字重 | 400 / 500 | 上限 500，强调靠字号与墨色 |
| 间距 | `--an-space-1 … -6` | 4 / 8 / 12 / 16 / 24 / 32 |
| 圆角 | `--dsw-radius-sm/md/lg/panel` + 999 | 8（紧凑控件）/ 16（分组与字段）/ 28（浮动面板）/ 胶囊配 `corner-shape:round` |
| 阴影 | `--dsw-elevation-panel` | 浮层 `border:0`，0.5px 发丝描边画在阴影第一层 |
| 材质 | `--dsh-an-panelSurface`（`--dsw-alias-bg-layer-2`） | 实心面板表面，与吸顶块共用同一颜色 |
| 动效 | `--ds-transition-duration*`、`--ds-ease-in-out` | 100 / 200ms，只动 opacity 与 transform |
| 滚动条 | 主题共享 skin | 面板内只重绑 `--dsh-scrollbar-*` 到 l2，并为列表设置 9px 轨道 / 2px 内缩 |

反馈层同样复用产品能力：复制、转发、删除、清除完成与写失败都经 `shell.overlay` 的全局 Toast 报告，面板关闭后仍然可见；图标按钮用 `ui-primitives` 的 `Tooltip`。

## 使用

1. 点击会话顶部右侧的「旁边记」按钮，打开右侧面板；有未完成条目时，按钮角标显示数量。
2. 在面板里写一条具体的小事，按设置中的添加快捷键或点击「添加」。
3. 需要继续处理时，点击该条便笺的转发按钮，将内容追加到对话输入框，确认后自行发送。
4. 做完后点左侧圆圈打勾；点「已完成」展开回看。
5. 点面板外部或按 Esc 关闭。

## 数据保存在哪里

便笺保存在**当前浏览器**的 `localStorage` 中，键为 `dsh.aside-note`，结构为：

```json
{
  "version": 1,
  "sessions": {
    "session-…": {
      "sessionId": "session-…",
      "updatedAt": 0,
      "items": []
    }
  }
}
```

因此：

- 刷新页面、重启 DSH、切换会话都不会丢。
- 不会写入项目文件，也不会同步到其他机器或其他浏览器。
- 清理浏览器站点数据会清除便笺。
- 存储键不带版本后缀，并与包名 `dsh-aside-note` 对齐；不读取任何旧键，也不自动迁移。如果本地数据仍在旧的 `dsh.aside-notes.*.v2` 键下，把键名改为对应的 `dsh.aside-note.*` 后刷新页面即可继续使用。

## 更新提示

打开面板时，插件会静默检查一次 npm 上的最新版本（npmjs 不可用时回退到 npmmirror，再回退到 GitHub 的最新 Release）；结果缓存一小时。若最新版本更高，设置按钮右上角出现提示点，设置 › 关于 中出现更新卡片：

- **检查更新**：立即重新读取 registry，绕过这一小时的缓存；按钮下方会显示「正在检查」「已是最新」或失败状态。
- **更新内容默认展示**：有新版时直接在卡片里列出 GitHub Release 的更新说明，不需要再点开。说明由 Release 正文中 `app-update-notes:zh` / `app-update-notes:en` 标记之间的内容提供，统一压成纯文本渲染，不会执行或注入任何 HTML。
- **跨多个版本**：如果线上版本领先本地好几个版本，说明区会按版本从新到旧逐条列出这段区间内的 Release；最新版本默认展开，更早的版本各自折叠、点标题单独展开。草稿与预发布不参与，最多列出 6 个版本，更多时给出「更早的版本请见完整更新说明」链接。
- **完整更新说明**：链接位于「立即更新」右侧，点击在新标签页打开对应的 GitHub Release 页面。
- **立即更新**：检测到插件市场（dshmarket）时，通过它的公开更新 API 排队升级 dsh-aside-note，显示实时进度；完成后提供「刷新页面」或「重启 DSH」。市场正被别的操作占用时会先等待重试。
- **更新方式兜底**：市场不在、或等待后仍在忙时，卡片不再只说「请稍后再试」，而是直接给出命令 `npx -y dsh-aside-note install`（或到「插件」页更新），并提供「拷贝更新提示词」——一键复制可直接粘给 agent 的更新指令。

更新始终需要手动点击：面板只负责检查、说明和排队，自己不执行任何命令，也从不改动本地便笺。版本检查与说明读取只访问公开的版本号与 Release 正文，不上报任何数据。

发布说明由 `tools/release/notes.mjs` 从 `CHANGELOG.md` 生成：中英文两段，各自带 `app-update-notes` 标记，外加安装链接与 Full Changelog 链接；打 tag 时发布流程会用它创建 Release 并附上 tgz。详见 [发布与版本迭代](./docs/release.md)。

## 开发

浏览器半侧在 `src/client/`，由 tsdown 打包成单个 `client/client.js`：

```bash
npm install
npm run check     # lint + typecheck + 测试 + 构建
npm run build     # 只重新生成 client/client.js
```

本地调试时把仓库 link 进 DSH profile（`<path-to-repo>` 换成克隆目录），再在 profile 目录执行 `pnpm install`：

```json
{
  "dependencies": {
    "dsh-aside-note": "link:<path-to-repo>"
  },
  "dsh": {
    "profile": {
      "bundles": ["dsh-aside-note"]
    }
  }
}
```

新增插件行后，在侧边栏「插件」页把该组合包关闭再开启，运行中的 Host 会在线重新组合，无需重启。

入口是 `src/client/index.ts`，导出 `apply(ctx)`；tsdown 负责套上 DSH 的加载壳：

```js
window.__ModuleLoader__.load({ id: 'dsh-aside-note', factory: (require) => { … } })
```

产物单独提交：CI 会重建并对比 `client/`，不一致就失败，因此不要手改 `client/client.js`。

`index.js` 是空的 Host 半侧；`cordis.patch.yml` 负责把包插入 profile 的组合。界面依赖 `slots` 与 `locale` 两个服务：

- `conversation.composer.dock`：只用来捕获当前会话 ID，不渲染可见入口。
- 顶部右侧入口由 MutationObserver 注入宿主 header，因为宿主重渲染会回收 React portal。

面板用 `react-dom/client` 的独立 root 挂到 `document.body`，用 fixed 定位跟随入口；所有样式使用 DSH 的 `--dsw-alias-*` 主题变量，自动适配明暗主题。

修改源码后先 `npm run build`；开发模式下 DSH 会热替换新 bundle，否则刷新页面或重启 DSH。

截图与预览图的产出流程见 [截图与预览图 SOP](./docs/screenshot-sop.md)：在隔离 profile 里造演示会话，一条命令重拍明暗两套；凭据默认不复制。

代码结构、数据模型与构建约定见 [架构文档](./docs/architecture.md)。

分支模型、版本策略与发版步骤见 [发布与版本迭代](./docs/release.md)。

## 验证

已在独立的 DSH profile 中实际加载，并用无头 Chrome 走通：

- 会话顶部右侧出现「旁边记」按钮，角标显示未完成数；
- 点击按钮在右侧打开面板，面板右上角对齐入口；
- 添加后按钮角标与面板计数同步；
- 面板内可完成、编辑、复制、转发、删除、清除已完成；
- 刷新页面后记录仍在，并按会话隔离；
- 版本检查的 npmjs → npmmirror → GitHub Release 回退、1 小时缓存与版本比较由契约测试覆盖；发布说明的标记提取、中英文回退、上限与 Markdown 压平有独立测试；jsdom 集成测试会驱动面板显示更新卡片、展开说明并通过模拟市场完成一次更新。真实更新提示需先发布到 npm 或创建 GitHub Release。

`npm run check` 通过：lint、类型检查、构建与 66 个测试（含 jsdom 里驱动完整面板流程的集成测试）。
