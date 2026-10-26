# 一点待办 · Yidian Todos

[English](README.en.md) | 中文

> 产品名是「一点待办」，仓库名沿用 `dsh-workspace-todos`。

一个给 DSH Web GUI 用的轻量待办面板。它按**工作区**隔离：每个项目有自己的清单，切换项目不会串味。适合记录“下一步要做什么”这类简短事项，而不是完整的任务管理。

![一点待办面板](./preview.png)

新会话输入框上方按钮行里的入口（与工作区、预设同一行）：

![输入框上方按钮行里的入口](./preview-dock.png)

历史会话没有这行按钮；入口放在最新一条回复底部的操作行，位于完成时间右侧：

![历史会话回复底部的入口](./preview-history.png)

## 功能

- 在侧边栏新增「一点待办」入口。
- 新会话时，入口出现在输入框上方按钮行，与工作区、Agent 预设同一行。
- 历史会话时，入口放在最新一条回复底部的操作行，位于「用量 … tok」和完成时间右侧，不新增一行。
- 入口显示当前工作区未完成数量，点击直接打开面板。
- 会话运行中自动隐藏入口，避免在生成过程中占用操作行。
- 按工作区隔离，自动跟随当前会话所属工作区；多工作区时可在顶部切换。
- 回车添加，打勾完成；支持双击或铅笔按钮编辑、删除、清除已完成。
- 显示完成进度、创建时间、已完成折叠区。
- 同一浏览器的多个标签页会同步更新。
- 中英文界面，跟随 DSH 语言设置。

## 使用

1. 点击侧边栏的「一点待办」，或输入框上方的「一点待办」入口。
2. 在输入框里写一条具体的小事，按 Enter 或点「添加」。
3. 做完后点左侧圆圈打勾；点「已完成」展开回看。
4. 顶部可切换工作区；「回到当前」回到当前会话所属项目。

## 数据保存在哪里

清单保存在**当前浏览器**的 `localStorage` 中，键为 `dsh.workspace-todos.v1`，按工作区 ID 隔离，并用工作区路径做兜底匹配。因此：

- 刷新页面、重启 DSH、切换会话都不会丢。
- 不会写入项目文件，也不会同步到其他机器或其他浏览器。
- 清理浏览器站点数据会清除清单。

如果之后需要“跟着仓库走”的持久化，可以在这个组件之上加 Host 侧文件路由（例如 `.dsh/workspace-todos.json`），界面层无需改动。

## 安装

```bash
git clone git@github.com:Rayle8/dsh-workspace-todos.git
```

把克隆目录 link 进 DSH profile（把 `<path-to-repo>` 换成实际克隆目录）：

```json
{
  "dependencies": {
    "dsh-workspace-todos": "link:<path-to-repo>"
  },
  "dsh": {
    "profile": {
      "bundles": ["dsh-workspace-todos"]
    }
  }
}
```

然后在 profile 目录执行 `pnpm install`。DSH 启动时会读取 `dsh.bundle.patch` 和 `dsh.client`，注册侧边栏入口与主面板。新增插件行后，可以在侧边栏「插件」页对该组合包**关闭再开启**，让运行中的 Host 在线重新组合，无需重启；如果插件页里还看不到它，再重启一次 DSH。之后单独修改 `client.js` 时，开发模式的 HMR 会直接替换 bundle。

## 开发

`client.js` 是浏览器半侧，采用 DSH 的 Module Loader 格式：

```js
window.__ModuleLoader__.load({
  id: 'dsh-workspace-todos',
  factory(require) {
    const React = require('react')
    return { inject: ['slots'], apply }
  },
})
```

`index.js` 是空的 Host 半侧；`cordis.patch.yml` 负责把包插入 profile 的组合。界面依赖 `slots` 与 `layout` 服务，并通过 slot props 里的 `useSessions` / `useWorkspaces` 读取当前工作区。所有样式使用 DSH 的 `--dsw-alias-*` 主题变量，自动适配明暗主题。

修改 `client.js` 后，在开发模式下 DSH 的 client HMR 会自动替换 bundle；否则刷新页面或重启 DSH。

## 验证

已在独立的 DSH profile 中实际加载，并用无头 Chrome 走通：

- 侧边栏出现「一点待办」入口，主面板正常渲染；
- 新会话按钮行里的入口与工作区、预设同一行，显示未完成数量，点击可打开面板；
- 添加、完成、编辑、删除、清除已完成、展开已完成；
- 刷新页面后清单仍在，并按工作区隔离。

`node --check client.js` 与槽位注册/首屏渲染的 smoke 测试也通过。
