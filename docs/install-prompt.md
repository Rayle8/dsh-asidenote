# 一键安装提示词

给 agent 的一句话，复制即可。安装动作全部由 `npx dsh-aside-note install` 完成——它自己定位 DSH profile、备份清单、写依赖与 `dsh.profile.bundles`、执行 `pnpm install` 并校验产物。

面向的机器都已经装好 DeepSeek Harness；没装的情况只需要 agent 转告用户先装客户端，不需要尝试别的安装方式。

## 中文

```text
帮我安装 DSH 插件 AsideNote（旁边记），在终端执行：npx -y dsh-aside-note install
装好后告诉我刷新页面即可，不用重启 DSH。
如果提示找不到 DSH 或找不到 profile，转告我先安装并启动 DeepSeek Harness 再重试；
不要改仓库、不要手动拼装依赖、不要重启 DSH。
```

## English

```text
Install the DSH plugin AsideNote by running: npx -y dsh-aside-note install
Tell me to reload the page when it finishes — no DSH restart needed.
If it says DSH or a profile cannot be found, tell me to install and start the DeepSeek Harness
client first and retry; do not clone the repo, hand-assemble dependencies, or restart DSH.
```

## 说明

- 命令从 **0.9.10** 起可用（更早的包里还没有 `bin`，`npx` 会提示找不到可执行文件）。
- 装完的效果：会话顶部右侧出现「旁边记」按钮；记录存在浏览器 `localStorage`，不写项目文件。
- 不需要重启：profile 会在约 1 秒内重新组合，刷新页面即可。
- 卸载：从 `dsh.profile.bundles` 移除 `dsh-aside-note`，在 profile 目录执行 `pnpm remove dsh-aside-note`，刷新页面。
- 要手动配置或指定 profile，见 [README › 安装](../README.md#安装)。

## 未安装 DSH 时用户看到什么

安装器会检测 `~/.dsh/profiles`：不存在就直接说明「还没有安装 / 启动过 DeepSeek Harness，装好客户端启动一次再执行这条命令」，不会去改任何文件；指定了 `--profile` 但名字不存在时，也会提示可用 `--profile` 换一个或先启动一次 DSH。
