# AsideNote · 随记

轻量会话便笺

[English](README.en.md) | 中文

> 产品名是 **AsideNote**（随记），包与插件 id 为 `dsh-asidenote`；仓库仍沿用旧名 `dsh-workspace-todos`，链接继续有效。

**有事记一下，没事不打扰。**

轻量记录 · 按需打开 · 用完收起

AsideNote 是面向 DeepSeek Harness（DSH）的轻量会话便笺。临时的想法、稍后的待办，随手留在对话旁；需要时一键带回，用完收起，继续眼前的事。

## 界面与入口

![便笺右侧面板](./docs/assets/preview-right.png)

暗色主题下外观保持一致，颜色全部取自 DSH 主题令牌：

![便笺右侧面板（暗色）](./docs/assets/preview-right-dark.png)

会话顶部右侧的「便笺」按钮，带未完成数量：

![顶部右侧便笺按钮](./docs/assets/preview-badge.png)

暗色主题下的同一按钮：

![顶部右侧便笺按钮（暗色）](./docs/assets/preview-badge-dark.png)

点击入口后在右侧打开固定面板。

## 为什么做 AsideNote

和 AI 一起做事时，总会冒出一些暂时顾不上的小事：这个细节等会儿改，那段结果还要核对，还有一个思路想留着继续讨论。

先发进对话，容易打断当前任务；记到别处，回来又得重新找。AsideNote 就在会话旁边，让你先把事情记下，继续手头的工作。

不必为几件小事建立一套管理方法。想到就记，需要就看，做完就放下。它只在你需要时打开，用完收起，尽量少打扰当前的工作。

## 从随手记，到继续做

### 想到就记，继续手头的事

点击会话顶部右侧的「便笺」按钮，打开右侧面板，记录待办、补充想法或需要回看的细节。入口显示未完成数量，做完一条，勾掉一条。

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

[查看安装方法](#安装) · [反馈问题或建议](https://github.com/Rayle8/dsh-workspace-todos/issues)

## 功能

- 数据按**会话 ID** 隔离；同一个工作区的不同会话也各自独立。
- 顶部右侧保持 `28px` 正方形图标按钮，用低对比灰色角标显示未完成数；悬浮提示为「会话便笺 N」。
- 点击按钮在窗口右侧打开固定面板；切换会话时自动收起旧面板并更新入口。
- 便笺标题右侧的设置按钮展开设置卡片：可切换发送快捷键（Enter 发送，或 ⌘/Ctrl+Enter 发送，按键名随平台显示）；「一键转发」下提供单行起高的前缀提示词文本框（输入换行后自动增高至六行）和下方说明；底部显示版本、作者阿三石与可点击的 GitHub 项目地址，设置自动保存。
- 面板右上角对齐顶部入口按钮；DSH 右侧栏打开时自动左移，避免被右侧栏遮挡。
- 点击入口打开右侧面板：添加、打勾完成、复制、双击或铅笔编辑、删除、清除已完成（二次确认）、展开已完成。
- 拖动面板左边缘把手可调整宽度，双击把手复位；宽度会保存在浏览器中。
- 拖动面板底部中央把手可调整高度，双击把手恢复内容自适应；高度会保存。
- 未完成的便笺右侧提供复制、转发、编辑、删除；已完成的隐藏转发按钮，复制/编辑/删除保留。复制在编辑左侧，复制成功后由全局 Toast 提示，不再改动按钮本身。
- 转发只把每条便笺作为无序列表项 `- 内容` 追加；仅当输入框为空时写入设置中的前缀提示词（默认按界面语言，中文为「完成以下任务：」），已有内容时不再补前缀，光标停在末尾且不会自动发送。
- 转发成功后转发按钮显示勾选，并按会话记住转发状态；勾选框始终只表示未完成和已完成，不会被转发改变。
- 转发与完成状态互不影响：已完成便笺不显示转发按钮，勾选框保持完成态；已转发的便笺再次点击转发按钮会取消转发标识，不会重复追加。
- 勾选框与正文第一行合并；未完成行的复制/转发/编辑/删除放在底部时间行右侧，减少一行空间占用。
- 「清除已完成」需要二次确认：首次点击展开确认条，确认后才清除。
- 完成圆点视觉为 14px，点击区域 24px，与正文第一行文字中心对齐。
- 新增录入框和编辑框都会随内容自动增高为多行；录入框和二次编辑框都会沿用设置中的发送快捷键，另一种组合换行（macOS 显示为 ⌘+Enter，Windows 为 Ctrl+Enter），编辑框右侧显示当前快捷键提示。
- 新增框不再显示左侧加号；「添加」按钮固定在第二行右侧，输入换行时不会闪烁或跳动。
- 发送快捷键提示放在添加按钮左侧的空白处；切换设置后提示同步更新，输入框占位提示保持简洁。
- 新增和编辑中的草稿按会话自动保存；临时关闭面板后重新打开会恢复，光标停在草稿末尾，添加、保存、取消或删除后自动清除。
- 展开「已完成」不会压缩上方「未完成」列表；只有未完成与已完成区域内部滚动，标题、设置、录入框和底部保持固定。
- 「未完成」「已完成」标题在列表内吸顶：未吸顶时保持透明；吸顶时使用与面板共用的 `--dsh-an-panelSurface` 实色填充，标题字号、字重和间距保持原样，不做圆角、不加底层、不使用半透明或顶部模糊。
- 已完成的便笺同时显示创建时间与完成时间，并按完成时间倒序排列；未完成的只显示创建时间。
- 「未完成」「已完成」的展开/折叠状态会记住，重新打开面板时恢复上次状态。
- 便笺卡片的复制/编辑/删除按钮默认隐藏，悬浮或键盘聚焦时显示；触屏设备保持常显。
- 「未完成」和「已完成」标题都可点击折叠，两侧计数样式和颜色保持一致；两者可独立展开，互不影响；点击区域仅限箭头、文字和计数，右侧空白不触发。
- 同一浏览器的多个标签页会同步更新。
- 中英文界面，跟随 DSH 语言设置。
- 界面样式全部复用 DSH 设计令牌：语义色别名、共享圆角与阴影、实心抬升表面、共享滚动条；字号收敛到 12 / 13 / 14 三档、字重上限 500、中性描边统一 0.5px；悬停只在支持 hover 的设备启用，瞬时结果走全局 Toast。详见 [面板 UI 规则](./docs/panel-ui-rules.md)。

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
    <td>空状态<br>没有便笺时的引导</td>
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

1. 点击会话顶部右侧的「便笺」按钮，打开右侧面板；有未完成条目时，按钮角标显示数量。
2. 在面板里写一条具体的小事，按设置中的添加快捷键或点击「添加」。
3. 需要继续处理时，点击该条便笺的转发按钮，将内容追加到对话输入框，确认后自行发送。
4. 做完后点左侧圆圈打勾；点「已完成」展开回看。
5. 点面板外部或按 Esc 关闭。

## 数据保存在哪里

便笺保存在**当前浏览器**的 `localStorage` 中，键为 `dsh.aside-notes.v2`，结构为：

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
- 1.x 的便笺、草稿、转发标记与面板设置会在首次加载时复制到 `dsh.aside-notes.*.v2`；旧键保留，回退到 1.9.x 仍可读。

## 安装

```bash
git clone git@github.com:Rayle8/dsh-workspace-todos.git
```

把克隆目录 link 进 DSH profile（把 `<path-to-repo>` 换成实际克隆目录）：

```json
{
  "dependencies": {
    "dsh-asidenote": "link:<path-to-repo>"
  },
  "dsh": {
    "profile": {
      "bundles": ["dsh-asidenote"]
    }
  }
}
```

然后在 profile 目录执行 `pnpm install`。DSH 启动时会读取 `dsh.bundle.patch` 和 `dsh.client`。新增插件行后，可以在侧边栏「插件」页对该组合包**关闭再开启**，让运行中的 Host 在线重新组合，无需重启；如果插件页里还看不到它，再重启一次 DSH。之后修改 `src/client/` 后执行 `npm run build` 生成 `client/client.js`；开发模式下 DSH 会热替换该 bundle，否则刷新页面。构建需要 Node 22+。

## 开发

浏览器半侧在 `src/client/`，由 tsdown 打包成单个 `client/client.js`：

```bash
npm install
npm run check     # lint + typecheck + 测试 + 构建
npm run build     # 只重新生成 client/client.js
```

入口是 `src/client/index.ts`，导出 `apply(ctx)`；tsdown 负责套上 DSH 的加载壳：

```js
window.__ModuleLoader__.load({ id: 'dsh-asidenote', factory: (require) => { … } })
```

产物单独提交：CI 会重建并对比 `client/`，不一致就失败，因此不要手改 `client/client.js`。

`index.js` 是空的 Host 半侧；`cordis.patch.yml` 负责把包插入 profile 的组合。界面依赖 `slots` 与 `locale` 两个服务：

- `conversation.composer.dock`：只用来捕获当前会话 ID，不渲染可见入口。
- 顶部右侧入口由 MutationObserver 注入宿主 header，因为宿主重渲染会回收 React portal。

面板用 `react-dom/client` 的独立 root 挂到 `document.body`，用 fixed 定位跟随入口；所有样式使用 DSH 的 `--dsw-alias-*` 主题变量，自动适配明暗主题。

修改源码后先 `npm run build`；开发模式下 DSH 会热替换新 bundle，否则刷新页面或重启 DSH。

截图与预览图的产出流程见 [截图与预览图 SOP](./docs/screenshot-sop.md)：在隔离 profile 里造演示会话，一条命令重拍明暗两套；凭据默认不复制。

## 验证

已在独立的 DSH profile 中实际加载，并用无头 Chrome 走通：

- 会话顶部右侧出现「便笺」按钮，角标显示未完成数；
- 点击按钮在右侧打开面板，面板右上角对齐入口；
- 添加后按钮角标与面板计数同步；
- 面板内可完成、编辑、复制、转发、删除、清除已完成；
- 刷新页面后记录仍在，并按会话隔离；
- 重启后 1.x 的旧便笺自动出现在新键下。

`npm run check` 通过：lint、类型检查、构建与 44 个测试（含 jsdom 里驱动完整面板流程的集成测试）。
