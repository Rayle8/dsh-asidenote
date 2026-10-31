# 一键安装提示词

给 agent 的整段提示词，复制即可。它优先调用包内的安装器（`npx dsh-asidenote install`），
装不上时回退到手动改 profile；两条路径都以「不改仓库、不重启 DSH」为前提。

- 安装器源码与行为：[`scripts/install.mjs`](../scripts/install.mjs)
- 人工安装步骤：[README › 安装](../README.md#安装)
- 包与版本：npm [`dsh-asidenote`](https://www.npmjs.com/package/dsh-asidenote)

## 中文提示词

```text
在这台机器上安装 DSH 插件 AsideNote（npm 包 dsh-asidenote）。只做安装：不改仓库、不重启 DSH、
不动 profile 里其它依赖。

第一步，优先用包内安装器（需要 Node 22+）：
  npx -y dsh-asidenote install
它自己完成：定位 profile → 备份 package.json / pnpm-lock.yaml 到 .local-backup/ → 写入依赖并追加
dsh.profile.bundles → pnpm install → 校验 client/client.js。要指定 profile 就加 --profile <名字>
（或 --profile-dir <目录>）；想先看计划就加 --dry-run。

第二步，如果 npx 不可用，或这个版本还没有 bin（未发版时），按手动路径做：
1. 定位 profile：优先 $env:DSH_PROFILE_DIR（Windows）或 $DSH_PROFILE_DIR（macOS/Linux）；
   否则用 ~/.dsh/profiles/<profile>，默认 desktop（不确定就先启动一次 DSH）。
2. 备份 package.json 与 pnpm-lock.yaml 到 .local-backup/ 后再改。
3. 在 profile 的 package.json 里：dependencies 增加 "dsh-asidenote": "^2.0.1"；
   在 dsh.profile.bundles 末尾追加 "dsh-asidenote"，保留原有条目与顺序，不要动 @deepseek-ai/*。
4. 在 profile 目录执行 pnpm install（没有 pnpm 就先 corepack enable）。
5. 校验 node_modules/dsh-asidenote/package.json 的 version，以及 client/client.js 存在。
6. 把上面的实际输出贴给用户。

最后告诉用户：无需重启 DSH，刷新页面即可生效（profile 约 1 秒重新组合；从插件市场安装时
市场会替你刷新）。便笺存在浏览器 localStorage（dsh.aside-notes.*.v2），不写项目文件。

禁止：git clone、npm run build、删除或升级 profile 里其它依赖、修改 npm registry、自动重启 DSH。
遇到已安装的情况：先跑 --dry-run 确认是已配置还是版本不同，再决定是否重装，不要重复追加 bundles。
```

## English prompt

```text
Install the DSH plugin AsideNote (npm package dsh-asidenote) on this machine. Install only:
do not change the repository, do not restart DSH, do not touch other profile dependencies.

Step 1 — prefer the bundled installer (Node 22+):
  npx -y dsh-asidenote install
It resolves the profile, backs up package.json / pnpm-lock.yaml into .local-backup/, adds the
dependency and the dsh.profile.bundles entry, runs pnpm install and verifies client/client.js.
Add --profile <name> (or --profile-dir <dir>) to pick a profile, --dry-run to preview.

Step 2 — if npx is unavailable or the published version has no bin yet, do it by hand:
1. Find the profile: $DSH_PROFILE_DIR when set, otherwise ~/.dsh/profiles/<profile> (default
   desktop; start DSH once if the profile does not exist yet).
2. Back up package.json and pnpm-lock.yaml into .local-backup/ before editing.
3. In the profile package.json: add "dsh-asidenote": "^2.0.1" to dependencies, and append
   "dsh-asidenote" to dsh.profile.bundles — keep every existing entry and its order, and leave
   @deepseek-ai/* alone.
4. Run pnpm install in the profile directory (corepack enable first if pnpm is missing).
5. Verify node_modules/dsh-asidenote/package.json's version and that client/client.js exists.
6. Paste the real output back to the user.

Finally tell the user: no DSH restart is needed — reload the page (the profile is re-composed within
about a second; a marketplace install triggers that reload for you). Notes live in the browser
localStorage (dsh.aside-notes.*.v2); nothing is written to projects.

Never: git clone, npm run build, remove or upgrade other profile dependencies, change the npm
registry, or restart DSH automatically. If it is already installed, run --dry-run first to see
whether it is configured or on another version, and never append the bundle line twice.
```

## 验收标准

- profile 的 `dependencies` 里有 `dsh-asidenote`，`dsh.profile.bundles` 里有同名条目且只出现一次；
- `node_modules/dsh-asidenote/package.json` 的 `version` 是预期版本，`client/client.js` 存在；
- 用户被明确告知：刷新页面即可，无需重启；便笺在浏览器本地存储里。

## 卸载

从 `dsh.profile.bundles` 移除 `dsh-asidenote`，在 profile 目录执行 `pnpm remove dsh-asidenote`，
刷新页面。便笺数据仍在浏览器 localStorage 里，需要清空时删除 `dsh.aside-notes.*` 开头的键。
