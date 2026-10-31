# notes-trash-ux 移植清单

来源：分支 `feat/notes-trash-ux`（提交 `cce7789`，基于旧 main，未合并）。
结论：分支上的"隐藏已完成转发、清除二次确认、转发标识、Enter 快捷键"等**已经在 main 1.9.5–1.9.7 落地**；真正待移植的只有**按会话的垃圾箱**。不要 rebase 分支，按本清单在 `src/client/` 上重做。

## 1. 数据模型

```ts
// storage/trash.ts
interface TrashEntry {
  trashId: string          // uid()；重复时重新生成，保证可定位
  reason: 'deleted' | 'cleared'
  deletedAt: number        // 归档时刻，同一批共用
  item: Note               // 快照：保留原 open/done 状态、createdAt/completedAt
}
interface TrashStore {
  version: 1
  sessions: Record<string, { items: TrashEntry[] }>   // 每会话最多 50 条，最新在前
}
```

- 存储键：`dsh.session-notes.trash.v2`（2.0 改名后；分支里是 `dsh.memo.trash.v1`）。
- 上限 `TRASH_LIMIT = 50`，超出时截断尾部（最旧）。
- 单个便笺的状态由 `normalizeItems` 复用校验，坏条目直接丢弃。

## 2. 行为

| 场景 | 期望 |
|---|---|
| 删除单条 | 先归档（reason `deleted`），再删原条目；归档失败仍删除，但 Toast 报"已删除，但垃圾箱写入失败" |
| 清除已完成 | 先快照全部待清除项（reason `cleared`，`deletedAt` 相同），再清除 |
| 恢复 | 从垃圾箱移除该条，并以**原 open/done 状态**追加回清单；`completedAt` 保留 |
| 永久删除 | 只删该条 trash 记录 |
| 清空垃圾箱 | 删掉该会话整个 trash 记录；空时按钮禁用或不渲染 |
| 切换会话 | 垃圾箱按会话隔离，互不串 |
| 多标签页 | 写入后 `notifyTodoChange()`，其它标签页同步 |
| 坏数据 | `readTrashStore` 任何解析失败都视为空，不抛错 |

## 3. 设置页 UI

- 设置卡片新增「垃圾箱」分区，位置在「一键转发」之后、关于之前。
- 标题行：`settings.trash` + 条数；右侧「清空垃圾箱」（`trash.clear`），二次确认可复用清除已完成的确认条样式。
- 列表：`max-height: 160px`，滚动；每行 = 正文（截断）+ 元信息（`trash.reason.*` · 删除时间）+ 恢复 / 永久删除两个动作。
- 空态：`trash.empty` 一行说明，不占高度。
- 全部复用 `dsh-sn-*` 类名与现有令牌（`--wt-space-*` 改名后为 `--sn-*` 或直接沿用现有尺度变量——按 P2 的 CSS 拆分统一）。

## 4. 文案键（中英各一份）

`settings.trash`、`trash.empty`、`trash.reason.deleted`、`trash.reason.cleared`、`trash.restore`、`trash.delete`、`trash.clear`、`trash.restored`、`trash.deleted`、`trash.cleared`、`trash.failed`、`trash.archiveFailed`；
`toast.deleted` 改为「已移入垃圾箱」/ "Moved to trash"，`toast.cleared` 改为「已清除并移入垃圾箱」/ "Cleared and moved to trash"。

## 5. 测试（新增，不沿用分支的契约断言）

- `tests/storage/trash.spec.ts`：归档/恢复/永久删除/清空、50 条上限、重复 trashId、坏 JSON、写失败返回值、按会话隔离。
- `tests/ui/trash.spec.tsx`：空态、列表渲染、恢复后状态正确、清空确认、动作按钮的 disabled 条件。
- 分支自带的 `tests/contract.test.mjs` 增量（+429 行）不迁移。

## 6. 分支处置

移植完成并验证后删除 `feat/notes-trash-ux`；在此之前保留分支作为行为参考（本清单第 1–4 节已覆盖其全部新增行为）。
