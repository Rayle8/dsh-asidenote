# 发布与版本迭代

本文是 AsideNote 的分支、构建与发布手册。发布动作只有两个入口：`main` 分支和 `vX.Y.Z` tag；npm 与 GitHub Release 都由同一次 tag 推送完成。

## 分支模型

`main` 始终可发布，功能与修复走短分支，合并后删除：

| 分支 | 用途 | 合并方式 |
| --- | --- | --- |
| `main` | 稳定线，永远对应最近一次可发布状态 | PR 或 fast-forward |
| `feat/<topic>` | 新功能 | squash merge 或 fast-forward |
| `fix/<topic>` | 缺陷修复 | 同上 |
| `docs/<topic>` | 文档、截图、CI | 可直接 fast-forward |
| `release/<version>` | 可选，发布前集中改版本与 CHANGELOG | 合回 main 后打 tag |

需要并行开发时，每个分支一个独立 worktree；合并后执行 `git worktree remove <path>` 并删除分支。

## 日常开发循环

```bash
git switch -c feat/xxx main
# 改 src/client/**，并更新 CHANGELOG.md 的 Unreleased
npm run check          # lint + typecheck + 测试 + build
npm run build          # 确保 client/client.js 与源码同步
git add src client CHANGELOG.md
git commit -m "feat: ..."
git push -u origin feat/xxx
```

必须遵守：

- `client/client.js` 是**提交进仓库的构建产物**，必须与 `src/client/**` 出现在同一个提交里；CI 会重新 build 并检查 `git diff client/`，不一致直接失败。
- 不要手改 `client/client.js`，构建会覆盖它。
- `package.json` 的 `version` 与 `src/client/constants.ts` 的 `PLUGIN_VERSION` 必须一致，契约测试会检查。
- UI 改动先在隔离的 DSH profile 里用 `npm pack` 的 tgz 做一次真机冒烟；截图按 [截图与预览图 SOP](./screenshot-sop.md) 重拍。

## 版本策略

| 变更 | 版本 |
| --- | --- |
| 修复、文档、内部整理 | `2.0.x` |
| 新功能、兼容性增强 | `2.x.0` |
| 破坏性变更（存储键、插件 id、DSH 兼容范围） | `3.0.0` |
| 预发布 | `2.1.0-beta.1` |

预发布 tag 形如 `v2.1.0-beta.1`：workflow 会发布到 npm 的 `next` dist-tag，并把 GitHub Release 标记为 prerelease，不会影响稳定用户的更新提示。

## 发布步骤

以 `2.0.1` 为例：

```bash
# 1. 同步版本号
#    package.json:            "version": "2.0.1"
#    src/client/constants.ts: PLUGIN_VERSION = '2.0.1'

# 2. CHANGELOG：把 Unreleased 改成 "## 2.0.1"

# 3. 全量检查并确认产物
npm run check
git diff --exit-code client/

# 4. 发布提交
git add -A
git commit -m "release: 2.0.1"
git push origin main

# 5. 打 tag 并推送：这一步触发 npm 发布和 GitHub Release
git tag -a v2.0.1 -m "AsideNote 2.0.1"
git push origin v2.0.1
```

## 自动发布链路

`.github/workflows/publish.yml` 由 tag 推送触发，依次执行：

1. `npm ci`（强制从 `registry.npmjs.org` 取包，不受开发机镜像影响）；
2. `npm run check`；
3. 校验 `v$(package.json version)` 与 tag 完全一致；
4. `npm publish --provenance`：通过 trusted publishing（OIDC）获取短时凭据，不使用长期 token；
5. 用 `node tools/release/notes.mjs` 由 `CHANGELOG.md` 生成 Release 正文（见下节），附安装链接与 Full Changelog；创建同名 GitHub Release，预发布加 `--prerelease`；
6. 把 `npm pack` 生成的 tgz 作为 Release 资产上传，保持「从 Release 安装」可用。

## 发布说明格式

Release 正文由 [tools/release/notes.mjs](../tools/release/notes.mjs) 从 `CHANGELOG.md` 对应版本小节生成，中英文各一段：

```md
## 2.1.0

<!-- app-update-notes:en:start -->
### Added
- **Update centre:** ...
<!-- app-update-notes:en:end -->

<!-- app-update-notes:zh:start -->
### 新增
- **更新中心：** ...
<!-- app-update-notes:zh:end -->
```

- 标记块只包裹「更新内容」本身；面板读取的就是块内文本，按当前语言取 `zh` 或 `en`，缺失时互相回退。
- 生成器负责加上 `# English` / `# 中文`、`## What's changed` / `## 更新内容`、安装或升级一节（npm 命令 + tgz 附件），以及 `<details>` 里的 Full Changelog 链接；这些不要手写进 CHANGELOG。
- 小节缺少版本标题或两组标记时，发布步骤会回退到 `--generate-notes` 并打印 warning，避免发出版本却没有 Release。
- 本地预览：

  ```bash
  node tools/release/notes.mjs --version 2.1.0 --tag v2.1.0 --prev v2.0.1
  ```

  再加 `--out notes.md` 可写到文件。`tests/release-notes-build.test.mjs` 会同时校验发布页正文与面板解析结果，防止两边漂移。

trusted publisher 配置：

```text
type: github
file: publish.yml
repository: Rayle8/dsh-asidenote
permissions: publish, stage publish
```

首次创建配置后必须在 2 天内完成一次 trusted publish，否则配置过期。过期后重跑下面的命令并用 security key 重新授权：

```bash
npx -y npm@11.21.1 trust github dsh-asidenote \
  --file publish.yml \
  --repo Rayle8/dsh-asidenote \
  --allow-publish \
  --registry=https://registry.npmjs.org/ -y
```

首次 trusted publish 成功后，建议在 npm 包设置中选择 **Require two-factor authentication and disallow tokens**，关闭 token 直发通道。

## 发布后校验

```bash
npm view dsh-asidenote version dist-tags --registry=https://registry.npmjs.org/
gh run list -R Rayle8/dsh-asidenote -L 3
gh release view v2.0.1 -R Rayle8/dsh-asidenote
```

再在一个临时目录 `npm install dsh-asidenote@2.0.1`，或在测试 profile 里加载，确认 bundle 能启动。

## 更新提示的耦合

应用内更新卡片需要三样东西同时成立：

1. **npm（或 GitHub Release）有新版本**：版本号来自 npm，npm 不可用时回退到 npmmirror，再回退到 GitHub 最新 Release。
2. **对应的 GitHub Release 存在**：面板按 `releases/tags/v<最新版本>` 读取正文；只打 tag 不建 Release 时读不到说明，卡片会退化为「暂无更新说明 + 完整更新说明链接」。workflow 已经自动创建 Release 并上传 tgz。
3. **Release 正文带 `app-update-notes` 标记**：没有标记的旧版本只显示完整说明链接；从 2.1.0 起由生成器保证标记存在。

`releases/latest` 会跳过 prerelease，所以预发布不会触发稳定用户的提示。手动补建 Release 时，建议直接用生成器，避免漏掉标记：

```bash
node tools/release/notes.mjs --version 2.0.1 --tag v2.0.1 --prev v2.0.0 --out notes.md
gh release create v2.0.1 --verify-tag --title "AsideNote 2.0.1" --notes-file notes.md
npm pack --pack-destination dist
gh release upload v2.0.1 dist/dsh-asidenote-2.0.1.tgz --clobber
```

## 应用内更新的依赖

「立即更新」通过 dshmarket 的公开更新 API（`/dsh-market/api/v1`）执行，**不是**本插件自己跑包管理器。因此：

- 未安装或未启用 dshmarket 时，卡片只给手动更新路径；插件不会尝试安装市场。
- 市场返回的 `RELEASE_TOO_FRESH` / `VERSION_UNCHANGED` 会显示「仍要更新」二次确认；失败时展示稳定的失败码文案。
- 更新完成后按市场给出的 `refreshRequired` / `restartRequired` 显示「刷新页面」或「重启 DSH」；Host 重启能力由市场的 capabilities 决定，插件不自行结束进程。
- 市场 API 处于 beta：客户端从 capabilities 读取端点与能力，不硬编码开关。

## 故障排查

| 现象 | 原因 / 处理 |
| --- | --- |
| workflow 在 tag 校验步骤失败 | tag 与 `package.json` 版本不一致；删掉错误 tag 后按正确版本重打 |
| `EPUBLISHCONFLICT` / 版本已存在 | 该版本已发布，不能覆盖；改为新版本号 |
| CI 报 `client/` 与源码不一致 | 本地 `npm run build` 后把 `client/client.js` 一起提交 |
| `ENEEDAUTH` / OIDC 认证失败 | trusted publisher 的 workflow 文件名或仓库名不匹配；核对 `publish.yml` 与 `Rayle8/dsh-asidenote` |
| 配置过期 | 重跑上面的 `npm trust` 命令并完成 Touch ID 授权 |
| 刚发布后 `npm view` 仍是旧版本 | registry 传播或 npmmirror 同步有延迟；等几分钟，更新检查的镜像回退会自动处理 |
| Release 已存在但没有 tgz 资产 | 重跑 workflow 会先卡在 npm 版本冲突；手动 `npm pack` 后 `gh release upload <tag> <tgz> --clobber` |

## 不要做

- 不重写已公开发布的 tag；错误版本用新的 patch 版本修正。
- 不手改构建产物，不从脏工作区发布。
- 不使用 bypass-2FA token 发布；npm 正在淘汰这条通道，统一走 trusted publishing。
