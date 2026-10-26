window.__ModuleLoader__.load({
  id: 'dsh-workspace-todos',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    /** Locale namespace of this plugin's copy (also binds the renderer's `t` prop). */
    const NS = 'workspace-todos'
    /** Sidebar launcher id and the main panel key it addresses. */
    const PANEL_ID = 'workspace-todos'
    /** One browser-local store for every workspace's notes. */
    const STORAGE_KEY = 'dsh.workspace-todos.v1'
    /** A note is meant to stay brief; this is the hard cap. */
    const MAX_TEXT = 280
    /** Defensive cap so a corrupted store cannot freeze the panel. */
    const MAX_ITEMS = 300
    /** Same-tab subscribers, so the composer dock's count follows panel edits. */
    const TODO_LISTENERS = new Set()

    /** Notify same-tab readers after a successful write (storage events only cross tabs). */
    function notifyTodoChange() {
      for (const listener of TODO_LISTENERS) {
        try {
          listener()
        } catch (error) {
          console.error('workspace-todos: listener failed', error)
        }
      }
    }

    const DICT = {
      zh: {
        'nav.label': '一点待办',
        'title': '一点待办',
        'eyebrow': 'WORKSPACE',
        'subtitle': '把下一步记在这里，不用一直记在脑子里。',
        'dock.label': '一点待办',
        'dock.open': '打开一点待办',
        'dock.count': '{n} 项未完成',
        'dock.empty': '记一条',
        'workspace.label': '工作区',
        'workspace.follow': '回到当前',
        'workspace.current': '当前会话',
        'stats.openLabel': '未完成',
        'stats.allDone': '全部完成',
        'add.placeholder': '记一条待办，按 Enter 添加',
        'add.action': '添加',
        'add.hint': '只记一件具体的小事，做完就打勾。',
        'progress': '{done} / {total} 已完成',
        'list.open': '未完成',
        'list.completed': '已完成',
        'list.clearDone': '清除已完成',
        'list.empty.title': '还没有待办',
        'list.empty.body': '先记下下一件要做的事，完成后再回来打勾。',
        'list.allDone.title': '未完成的都清空了',
        'list.allDone.body': '可以继续添加，或展开下方回看已完成。',
        'item.markDone': '标记为完成',
        'item.markOpen': '标记为未完成',
        'item.edit': '编辑',
        'item.delete': '删除',
        'item.editHint': '双击编辑',
        'edit.save': '保存',
        'edit.cancel': '取消',
        'time.now': '刚刚',
        'time.minutes': '{n} 分钟前',
        'time.hours': '{n} 小时前',
        'time.days': '{n} 天前',
        'footer.storage': '按工作区隔离 · 保存在此浏览器',
        'footer.saved': '已保存',
        'footer.error': '浏览器存储不可用，改动可能不会保留',
        'state.loading': '正在读取工作区…',
        'state.unsupported': '当前页面没有提供工作区数据，无法显示待办。',
        'state.noWorkspace.title': '还没有工作区',
        'state.noWorkspace.body': '先在侧边栏添加一个工作区，待办会跟着项目走。',
      },
      en: {
        'nav.label': 'Yidian Todos',
        'title': 'Yidian Todos',
        'eyebrow': 'WORKSPACE',
        'subtitle': 'Park the next small step here so it does not live rent-free in your head.',
        'dock.label': 'Yidian Todos',
        'dock.open': 'Open Yidian Todos',
        'dock.count': '{n} open',
        'dock.empty': 'Capture one',
        'workspace.label': 'Workspace',
        'workspace.follow': 'Back to current',
        'workspace.current': 'Current session',
        'stats.openLabel': 'open',
        'stats.allDone': 'all done',
        'add.placeholder': 'Write a todo and press Enter',
        'add.action': 'Add',
        'add.hint': 'Keep it to one concrete next step; check it off when done.',
        'progress': '{done} / {total} done',
        'list.open': 'Open',
        'list.completed': 'Completed',
        'list.clearDone': 'Clear completed',
        'list.empty.title': 'No todos yet',
        'list.empty.body': 'Write down the next thing to do, then come back and check it off.',
        'list.allDone.title': 'Nothing left open',
        'list.allDone.body': 'Add another todo, or expand completed below to look back.',
        'item.markDone': 'Mark as done',
        'item.markOpen': 'Mark as open',
        'item.edit': 'Edit',
        'item.delete': 'Delete',
        'item.editHint': 'Double-click to edit',
        'edit.save': 'Save',
        'edit.cancel': 'Cancel',
        'time.now': 'just now',
        'time.minutes': '{n} min ago',
        'time.hours': '{n} hr ago',
        'time.days': '{n} d ago',
        'footer.storage': 'Separate per workspace · kept in this browser',
        'footer.saved': 'Saved',
        'footer.error': 'Browser storage is unavailable; changes may not persist',
        'state.loading': 'Reading workspaces…',
        'state.unsupported': 'This page exposes no workspace data, so todos cannot render.',
        'state.noWorkspace.title': 'No workspace yet',
        'state.noWorkspace.body': 'Add a workspace from the sidebar first; todos follow the project.',
      },
    }

    const CSS = [
      '.dsh-wt-page{display:flex;flex-direction:column;height:100%;min-height:0;overflow:auto;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-size:13px}',
      '.dsh-wt-shell{width:100%;max-width:780px;margin:0 auto;padding:34px 28px 80px;box-sizing:border-box}',
      '.dsh-wt-head{display:flex;align-items:flex-start;justify-content:space-between;gap:28px;margin:0 0 18px}',
      '.dsh-wt-headText{min-width:0;flex:1}',
      '.dsh-wt-eyebrow{font-size:10px;line-height:14px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--dsw-alias-label-secondary)}',
      '.dsh-wt-title{margin:4px 0 0;font-size:22px;line-height:30px;font-weight:650;letter-spacing:-.015em}',
      '.dsh-wt-sub{margin:6px 0 0;max-width:470px;font-size:12.5px;line-height:20px;color:var(--dsw-alias-label-secondary)}',
      '.dsh-wt-workspace{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:14px 0 0;min-width:0}',
      '.dsh-wt-select{max-width:280px;height:28px;padding:0 26px 0 9px;border:1px solid var(--dsw-alias-border-l1);border-radius:7px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;line-height:26px;cursor:pointer}',
      '.dsh-wt-select:hover{border-color:var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1)}',
      '.dsh-wt-select:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}',
      '.dsh-wt-workspaceName{display:inline-flex;align-items:center;gap:6px;min-width:0;font-size:12px;line-height:20px;font-weight:600}',
      '.dsh-wt-path{min-width:0;max-width:100%;font-size:11px;line-height:18px;color:var(--dsw-alias-label-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      '.dsh-wt-current{flex:none;padding:0 6px;border:1px solid var(--dsw-alias-border-l1);border-radius:999px;font-size:10px;line-height:16px;font-weight:500;color:var(--dsw-alias-label-secondary)}',
      '.dsh-wt-follow{height:24px;padding:0 8px;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-brand-primary);font:inherit;font-size:11px;line-height:24px;cursor:pointer}',
      '.dsh-wt-follow:hover{background:var(--dsw-alias-bg-layer-2)}',
      '.dsh-wt-follow:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}',
      '.dsh-wt-stat{flex:none;display:flex;flex-direction:column;align-items:flex-end;gap:0;padding:2px 0 0;min-width:60px}',
      '.dsh-wt-statNum{font-size:28px;line-height:32px;font-weight:650;letter-spacing:-.03em;font-variant-numeric:tabular-nums}',
      '.dsh-wt-statLabel{font-size:11px;line-height:16px;color:var(--dsw-alias-label-secondary)}',
      '.dsh-wt-progressWrap{display:flex;align-items:center;gap:10px;margin:0 0 18px}',
      '.dsh-wt-track{flex:1;height:4px;border-radius:999px;background:var(--dsw-alias-border-l1);overflow:hidden}',
      '.dsh-wt-fill{height:100%;border-radius:inherit;background:var(--dsw-alias-brand-primary);transition:width .25s ease}',
      '.dsh-wt-progressText{flex:none;font-size:11px;line-height:16px;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums}',
      '.dsh-wt-add{display:flex;align-items:center;gap:10px;padding:7px 7px 7px 13px;border:1px solid var(--dsw-alias-border-l1);border-radius:12px;background:var(--dsw-alias-bg-layer-1);transition:border-color .15s ease}',
      '.dsh-wt-add:focus-within{border-color:var(--dsw-alias-brand-primary)}',
      '.dsh-wt-addIcon{display:flex;align-items:center;justify-content:center;flex:none;width:18px;height:18px;color:var(--dsw-alias-label-secondary)}',
      '.dsh-wt-input{flex:1;min-width:0;height:28px;padding:0;border:0;outline:0;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:14px;line-height:28px}',
      '.dsh-wt-input::placeholder{color:var(--dsw-alias-label-secondary);opacity:.78}',
      '.dsh-wt-addBtn{flex:none;height:30px;padding:0 13px;border:0;border-radius:7px;background:var(--dsw-alias-brand-primary);color:var(--dsw-alias-bg-base);font:inherit;font-size:12px;font-weight:600;line-height:30px;cursor:pointer}',
      '.dsh-wt-addBtn:hover{filter:brightness(1.06)}',
      '.dsh-wt-addBtn:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}',
      '.dsh-wt-addBtn[disabled]{cursor:default;opacity:.42}',
      '.dsh-wt-addHint{margin:7px 0 0;font-size:11px;line-height:17px;color:var(--dsw-alias-label-secondary)}',
      '.dsh-wt-sectionHead{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:26px 0 9px;min-height:20px}',
      '.dsh-wt-sectionName{display:flex;align-items:center;gap:7px;font-size:12px;line-height:18px;font-weight:600}',
      '.dsh-wt-sectionCount{padding:0 6px;border:1px solid var(--dsw-alias-border-l1);border-radius:999px;font-size:10px;line-height:15px;font-weight:500;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums}',
      '.dsh-wt-clear{height:24px;padding:0 8px;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:11px;line-height:24px;cursor:pointer}',
      '.dsh-wt-clear:hover{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}',
      '.dsh-wt-clear:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}',
      '.dsh-wt-rows{list-style:none;margin:0;padding:0;border:1px solid var(--dsw-alias-border-l1);border-radius:12px;background:var(--dsw-alias-bg-layer-1);overflow:hidden}',
      '.dsh-wt-row{display:flex;align-items:flex-start;gap:11px;padding:12px 13px;border-top:1px solid var(--dsw-alias-border-l1);transition:background .12s ease}',
      '.dsh-wt-row:first-child{border-top:0}',
      '.dsh-wt-row:hover{background:var(--dsw-alias-bg-layer-2)}',
      '.dsh-wt-check{flex:none;display:flex;align-items:center;justify-content:center;width:20px;height:20px;margin:1px 0 0;padding:0;border:1.5px solid var(--dsw-alias-border-l2);border-radius:50%;background:transparent;color:transparent;cursor:pointer;transition:border-color .12s ease,background .12s ease,color .12s ease}',
      '.dsh-wt-check:hover{border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-brand-primary)}',
      '.dsh-wt-check:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}',
      '.dsh-wt-check[aria-checked="true"]{border-color:var(--dsw-alias-brand-primary);background:var(--dsw-alias-brand-primary);color:var(--dsw-alias-bg-base)}',
      '.dsh-wt-itemBody{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}',
      '.dsh-wt-text{display:block;width:100%;margin:0;padding:0;border:0;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:14px;line-height:21px;text-align:left;white-space:pre-wrap;overflow-wrap:anywhere;cursor:text}',
      '.dsh-wt-text:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px;border-radius:4px}',
      '.dsh-wt-meta{font-size:10.5px;line-height:16px;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums}',
      '.dsh-wt-edit{display:flex;flex-direction:column;gap:6px;width:100%}',
      '.dsh-wt-editInput{width:100%;box-sizing:border-box;padding:4px 7px;border:1px solid var(--dsw-alias-brand-primary);border-radius:6px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:inherit;font-size:14px;line-height:21px;outline:0}',
      '.dsh-wt-editActions{display:flex;gap:6px}',
      '.dsh-wt-mini{height:24px;padding:0 8px;border:1px solid var(--dsw-alias-border-l1);border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:11px;line-height:22px;cursor:pointer}',
      '.dsh-wt-mini:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-2)}',
      '.dsh-wt-mini:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}',
      '.dsh-wt-miniPrimary{border-color:transparent;background:var(--dsw-alias-brand-primary);color:var(--dsw-alias-bg-base)}',
      '.dsh-wt-actions{flex:none;display:flex;gap:1px;margin:1px 0 0;opacity:0;transition:opacity .12s ease}',
      '.dsh-wt-row:hover .dsh-wt-actions,.dsh-wt-row:focus-within .dsh-wt-actions{opacity:1}',
      '@media (hover:none){.dsh-wt-actions{opacity:1}}',
      '.dsh-wt-iconBtn{display:flex;align-items:center;justify-content:center;width:24px;height:24px;padding:0;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer}',
      '.dsh-wt-iconBtn:hover{background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary)}',
      '.dsh-wt-iconBtn:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}',
      '.dsh-wt-rowDone .dsh-wt-text{color:var(--dsw-alias-label-secondary);text-decoration:line-through;text-decoration-thickness:1px;text-decoration-color:var(--dsw-alias-border-l2)}',
      '.dsh-wt-doneHead{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:20px 0 0}',
      '.dsh-wt-doneToggle{display:flex;align-items:center;gap:7px;flex:1;min-width:0;margin:0;padding:0;border:0;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;line-height:20px;font-weight:600;text-align:left;cursor:pointer}',
      '.dsh-wt-doneToggle:hover{color:var(--dsw-alias-label-primary)}',
      '.dsh-wt-doneToggle:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px;border-radius:4px}',
      '.dsh-wt-chevron{display:flex;align-items:center;justify-content:center;width:14px;height:14px;transition:transform .15s ease}',
      '.dsh-wt-chevron[data-open="true"]{transform:rotate(90deg)}',
      '.dsh-wt-doneRows{margin-top:8px;opacity:.86}',
      '.dsh-wt-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:34px 22px 32px;border:1px dashed var(--dsw-alias-border-l1);border-radius:12px;text-align:center}',
      '.dsh-wt-emptyIcon{display:flex;align-items:center;justify-content:center;width:34px;height:34px;margin:0 0 3px;border-radius:10px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary)}',
      '.dsh-wt-emptyTitle{font-size:13px;line-height:20px;font-weight:600}',
      '.dsh-wt-emptyBody{max-width:360px;font-size:12px;line-height:19px;color:var(--dsw-alias-label-secondary)}',
      '.dsh-wt-footer{display:flex;align-items:center;justify-content:space-between;gap:14px;margin:26px 0 0;font-size:10.5px;line-height:16px;color:var(--dsw-alias-label-secondary)}',
      '.dsh-wt-footRight{flex:none;font-variant-numeric:tabular-nums}',
      '.dsh-wt-dock{display:flex;align-items:center;justify-content:flex-start;gap:8px;min-height:24px;margin:0 0 7px;padding:0 var(--dsh-composer-side-clearance,14px)}',
      '.dsh-wt-dockBtn{display:inline-flex;align-items:center;gap:7px;height:27px;padding:0 10px;border:1px solid var(--dsw-alias-border-l1);border-radius:999px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);font:inherit;font-size:11.5px;line-height:25px;cursor:pointer;transition:border-color .12s ease,background .12s ease,color .12s ease}',
      '.dsh-wt-dockBtn:hover{border-color:var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}',
      '.dsh-wt-dockBtn:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}',
      '.dsh-wt-dockIcon{display:flex;align-items:center;justify-content:center;flex:none;width:14px;height:14px;color:var(--dsw-alias-brand-primary)}',
      '.dsh-wt-dockLabel{font-weight:600;color:var(--dsw-alias-label-primary)}',
      '.dsh-wt-dockCount{min-width:16px;padding:0 5px;border-radius:999px;background:var(--dsw-alias-brand-primary);color:var(--dsw-alias-bg-base);font-size:10px;line-height:16px;text-align:center;font-variant-numeric:tabular-nums}',
      '.dsh-wt-dockMuted{color:var(--dsw-alias-label-secondary)}',
      '.dsh-wt-error{color:var(--dsw-alias-state-warning-primary)}',
      '@media (max-width:640px){.dsh-wt-shell{padding:22px 16px 56px}.dsh-wt-head{gap:16px}.dsh-wt-title{font-size:20px;line-height:28px}.dsh-wt-statNum{font-size:24px;line-height:28px}.dsh-wt-sub{font-size:12px}.dsh-wt-select{max-width:210px}.dsh-wt-row{padding:11px 10px}.dsh-wt-actions{opacity:1}}',
    ].join('')

    /** Local midnight-independent clock for "saved at" copy. */
    function clockLabel(time, localeId) {
      try {
        return new Intl.DateTimeFormat(localeId, { hour: '2-digit', minute: '2-digit' }).format(time)
      } catch (error) {
        return ''
      }
    }

    /** Last path segment, accepting both separators. */
    function basename(path) {
      if (!path) return ''
      const parts = String(path).split(/[\\/]+/).filter(Boolean)
      return parts.length ? parts[parts.length - 1] : String(path)
    }

    /** Stable comparison form for a workspace path. */
    function normalizePath(value) {
      return String(value || '').replace(/\\/g, '/').replace(/\/+$/, '').toLowerCase()
    }

    /** Unique note id, with a fallback for browsers without randomUUID. */
    function uid() {
      try {
        if (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function') {
          return globalThis.crypto.randomUUID()
        }
      } catch (error) {
        /* fall through */
      }
      return `todo-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
    }

    /** Replace `{name}` placeholders in one localized template. */
    function fill(template, vars) {
      return String(template).replace(/\{(\w+)\}/g, (match, name) => {
        return vars && vars[name] !== undefined && vars[name] !== null ? String(vars[name]) : match
      })
    }

    /** The browser store, or null when storage is blocked. */
    function storage() {
      try {
        return window.localStorage
      } catch (error) {
        return null
      }
    }

    /** Empty in-memory shape; never share one object between reads. */
    function emptyStore() {
      return { version: 1, workspaces: {} }
    }

    /**
     * Sanitize one workspace's notes. The store is user-editable, so treat
     * every field defensively and preserve the authored order.
     */
    function normalizeItems(items) {
      if (!Array.isArray(items)) return []
      const seen = new Set()
      const normalized = []
      for (const raw of items) {
        if (!raw || typeof raw !== 'object') continue
        const text = String(raw.text || '').trim().slice(0, MAX_TEXT)
        if (!text) continue
        let id = typeof raw.id === 'string' && raw.id ? raw.id : uid()
        if (seen.has(id)) id = uid()
        seen.add(id)
        const done = raw.done === true
        const createdAt = Number.isFinite(raw.createdAt) ? raw.createdAt : Date.now()
        const updatedAt = Number.isFinite(raw.updatedAt) ? raw.updatedAt : createdAt
        normalized.push({
          id,
          text,
          done,
          createdAt,
          updatedAt,
          ...(done && Number.isFinite(raw.completedAt) ? { completedAt: raw.completedAt } : {}),
        })
        if (normalized.length >= MAX_ITEMS) break
      }
      return normalized
    }

    /** Read the whole store; a corrupt or unavailable store reads as empty. */
    function readStore() {
      const ls = storage()
      if (!ls) return emptyStore()
      try {
        const raw = ls.getItem(STORAGE_KEY)
        if (!raw) return emptyStore()
        const parsed = JSON.parse(raw)
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return emptyStore()
        const workspaces = parsed.workspaces
        if (!workspaces || typeof workspaces !== 'object' || Array.isArray(workspaces)) return emptyStore()
        return { version: 1, workspaces }
      } catch (error) {
        return emptyStore()
      }
    }

    /** Find a workspace's record by id, then by normalized path for re-added workspaces. */
    function findRecord(store, workspace) {
      if (!workspace) return undefined
      const byId = store.workspaces[String(workspace.workspaceId)]
      if (byId) return byId
      const path = normalizePath(workspace.path)
      if (!path) return undefined
      for (const record of Object.values(store.workspaces)) {
        if (record && normalizePath(record.path) === path) return record
      }
      return undefined
    }

    /** Read one workspace's notes. */
    function readRecord(workspace) {
      if (!workspace) return { items: [], updatedAt: 0 }
      const record = findRecord(readStore(), workspace)
      return {
        items: normalizeItems(record && record.items),
        updatedAt: record && Number.isFinite(record.updatedAt) ? record.updatedAt : 0,
      }
    }

    /**
     * Persist one workspace's notes. A re-added workspace with a new id takes
     * over the old record for the same path, so the reader keeps its history.
     */
    function writeRecord(workspace, record) {
      const ls = storage()
      if (!ls || !workspace) return false
      const store = readStore()
      const key = String(workspace.workspaceId)
      const path = normalizePath(workspace.path)
      store.workspaces[key] = {
        workspaceId: key,
        path: String(workspace.path || ''),
        title: String(workspace.title || ''),
        updatedAt: record.updatedAt || Date.now(),
        items: normalizeItems(record.items),
      }
      for (const [otherKey, other] of Object.entries(store.workspaces)) {
        if (otherKey === key) continue
        if (path && other && normalizePath(other.path) === path) delete store.workspaces[otherKey]
      }
      try {
        ls.setItem(STORAGE_KEY, JSON.stringify(store))
        notifyTodoChange()
        return true
      } catch (error) {
        return false
      }
    }

    /** The workspace owning the session currently retained by the main view. */
    function currentWorkspaceOf(list, snapshot) {
      const rows = list && list.byId ? Object.values(list.byId) : []
      const session = rows.find(row => row && (row.retainedBy && row.retainedBy.mainView ? row.retainedBy.mainView : 0) > 0)
      if (!session) return null
      const workspaces = (snapshot && snapshot.items) || []
      const byMembership = workspaces.find(workspace => {
        return workspace && Array.isArray(workspace.sessionIds) && workspace.sessionIds.includes(session.id)
      })
      if (byMembership) return byMembership
      const cwd = normalizePath(session.cwd)
      if (!cwd) return null
      return workspaces.find(workspace => normalizePath(workspace.path) === cwd) || null
    }

    /** Relative age copy for a note's creation stamp. */
    function ageLabel(time, say, localeId) {
      const stamp = Number.isFinite(time) ? time : Date.now()
      const elapsed = Math.max(0, Date.now() - stamp)
      if (elapsed < 60 * 1000) return say('time.now')
      const minutes = Math.floor(elapsed / (60 * 1000))
      if (minutes < 60) return say('time.minutes', { n: minutes })
      const hours = Math.floor(minutes / 60)
      if (hours < 24) return say('time.hours', { n: hours })
      const days = Math.floor(hours / 24)
      if (days < 7) return say('time.days', { n: days })
      try {
        return new Intl.DateTimeFormat(localeId, { month: 'short', day: 'numeric' }).format(stamp)
      } catch (error) {
        return ''
      }
    }

    /** Per-workspace notes plus an optimistic, synchronous writer. */
    function useTodoStore(workspace) {
      const workspaceKey = workspace ? String(workspace.workspaceId) : ''
      const workspacePath = workspace ? normalizePath(workspace.path) : ''
      const workspaceRef = React.useRef(workspace)
      workspaceRef.current = workspace

      const [record, setRecord] = React.useState(() => readRecord(workspace))
      const [syncError, setSyncError] = React.useState(false)
      const recordRef = React.useRef(record)
      recordRef.current = record

      React.useEffect(() => {
        setRecord(readRecord(workspaceRef.current))
        setSyncError(false)
      }, [workspaceKey, workspacePath])

      React.useEffect(() => {
        const onStorage = event => {
          if (event.key !== STORAGE_KEY) return
          setRecord(readRecord(workspaceRef.current))
        }
        window.addEventListener('storage', onStorage)
        return () => window.removeEventListener('storage', onStorage)
      }, [])

      const commit = React.useCallback(updater => {
        const current = recordRef.current || { items: [], updatedAt: 0 }
        const nextItems = normalizeItems(updater(current.items || []))
        const next = { items: nextItems, updatedAt: Date.now() }
        const ok = writeRecord(workspaceRef.current, next)
        recordRef.current = next
        setRecord(next)
        setSyncError(!ok)
      }, [])

      return { record, syncError, commit }
    }

    /** Small inline icons, sized to the shared 16px grid. */
    function IconCheck(props) {
      const size = props && props.size ? props.size : 12
      return h(
        'svg',
        {
          width: size,
          height: size,
          viewBox: '0 0 16 16',
          fill: 'none',
          'aria-hidden': true,
          focusable: false,
          style: { display: 'block' },
        },
        h('path', {
          d: 'M3.25 8.25 6.6 11.4 12.9 4.8',
          stroke: 'currentColor',
          strokeWidth: 2,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        }),
      )
    }

    function IconPlus() {
      return h(
        'svg',
        {
          width: 16,
          height: 16,
          viewBox: '0 0 16 16',
          fill: 'none',
          'aria-hidden': true,
          focusable: false,
          style: { display: 'block' },
        },
        h('path', {
          d: 'M8 3.25v9.5M3.25 8h9.5',
          stroke: 'currentColor',
          strokeWidth: 1.5,
          strokeLinecap: 'round',
        }),
      )
    }

    function IconPencil() {
      return h(
        'svg',
        {
          width: 14,
          height: 14,
          viewBox: '0 0 16 16',
          fill: 'none',
          'aria-hidden': true,
          focusable: false,
          style: { display: 'block' },
        },
        h('path', {
          d: 'M3 11.6 3.6 9l6.1-6.1a1.35 1.35 0 0 1 1.9 0l1.5 1.5a1.35 1.35 0 0 1 0 1.9L7 12.4l-2.6.6a.8.8 0 0 1-.95-.95Z',
          stroke: 'currentColor',
          strokeWidth: 1.3,
          strokeLinejoin: 'round',
        }),
        h('path', { d: 'm9.1 3.6 3.3 3.3', stroke: 'currentColor', strokeWidth: 1.3 }),
      )
    }

    function IconTrash() {
      return h(
        'svg',
        {
          width: 14,
          height: 14,
          viewBox: '0 0 16 16',
          fill: 'none',
          'aria-hidden': true,
          focusable: false,
          style: { display: 'block' },
        },
        h('path', {
          d: 'M3.75 4.75h8.5M6.25 4.75V3.4c0-.4.33-.73.73-.73h2.04c.4 0 .73.33.73.73v1.35M5 4.75l.5 7.1c.03.45.4.8.86.8h3.28c.46 0 .83-.35.86-.8l.5-7.1',
          stroke: 'currentColor',
          strokeWidth: 1.25,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        }),
      )
    }

    function IconChevron() {
      return h(
        'svg',
        {
          width: 12,
          height: 12,
          viewBox: '0 0 16 16',
          fill: 'none',
          'aria-hidden': true,
          focusable: false,
          style: { display: 'block' },
        },
        h('path', {
          d: 'm6 3.75 4.25 4.25L6 12.25',
          stroke: 'currentColor',
          strokeWidth: 1.5,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        }),
      )
    }

    function IconEmpty() {
      return h(
        'svg',
        {
          width: 19,
          height: 19,
          viewBox: '0 0 16 16',
          fill: 'none',
          'aria-hidden': true,
          focusable: false,
          style: { display: 'block' },
        },
        h('path', {
          d: 'M2.75 4.5h10.5M2.75 8h7M2.75 11.5h4.5',
          stroke: 'currentColor',
          strokeWidth: 1.4,
          strokeLinecap: 'round',
        }),
        h('path', {
          d: 'm10.25 10.35.95 1 1.8-2.05',
          stroke: 'currentColor',
          strokeWidth: 1.4,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        }),
      )
    }

    function TodoRow(props) {
      const { item, done, say, onToggle, onStartEdit, onDelete, editing, editDraft, setEditDraft, onFinishEdit, onCancelEdit, editRef } = props
      const rowClass = done ? 'dsh-wt-row dsh-wt-rowDone' : 'dsh-wt-row'

      const body = editing
        ? h(
            'div',
            { className: 'dsh-wt-edit' },
            h('input', {
              ref: editRef,
              className: 'dsh-wt-editInput',
              value: editDraft,
              maxLength: MAX_TEXT,
              'aria-label': say('item.edit'),
              onChange: event => setEditDraft(event.target.value),
              onKeyDown: event => {
                const composing = event.isComposing || (event.nativeEvent && event.nativeEvent.isComposing)
                if (composing) return
                if (event.key === 'Enter') {
                  event.preventDefault()
                  onFinishEdit(item)
                } else if (event.key === 'Escape') {
                  event.preventDefault()
                  onCancelEdit()
                }
              },
              onBlur: () => onFinishEdit(item),
            }),
            h(
              'div',
              { className: 'dsh-wt-editActions' },
              h(
                'button',
                {
                  type: 'button',
                  className: 'dsh-wt-mini dsh-wt-miniPrimary',
                  onMouseDown: event => event.preventDefault(),
                  onClick: () => onFinishEdit(item),
                },
                say('edit.save'),
              ),
              h(
                'button',
                {
                  type: 'button',
                  className: 'dsh-wt-mini',
                  onMouseDown: event => event.preventDefault(),
                  onClick: onCancelEdit,
                },
                say('edit.cancel'),
              ),
            ),
          )
        : h(
            React.Fragment,
            null,
            h(
              'button',
              {
                type: 'button',
                className: 'dsh-wt-text',
                title: say('item.editHint'),
                onDoubleClick: () => onStartEdit(item),
              },
              item.text,
            ),
            h('span', { className: 'dsh-wt-meta' }, ageLabel(item.createdAt, say, props.localeId)),
          )

      return h(
        'li',
        { className: rowClass },
        h(
          'button',
          {
            type: 'button',
            className: 'dsh-wt-check',
            role: 'checkbox',
            'aria-checked': done ? 'true' : 'false',
            'aria-label': say(done ? 'item.markOpen' : 'item.markDone'),
            onClick: () => onToggle(item),
          },
          done ? h(IconCheck, { size: 12 }) : null,
        ),
        h('div', { className: 'dsh-wt-itemBody' }, body),
        editing
          ? null
          : h(
              'div',
              { className: 'dsh-wt-actions' },
              h(
                'button',
                {
                  type: 'button',
                  className: 'dsh-wt-iconBtn',
                  'aria-label': say('item.edit'),
                  title: say('item.edit'),
                  onClick: () => onStartEdit(item),
                },
                h(IconPencil, null),
              ),
              h(
                'button',
                {
                  type: 'button',
                  className: 'dsh-wt-iconBtn',
                  'aria-label': say('item.delete'),
                  title: say('item.delete'),
                  onClick: () => onDelete(item),
                },
                h(IconTrash, null),
              ),
            ),
      )
    }

    function EmptyState(props) {
      return h(
        'div',
        { className: 'dsh-wt-empty' },
        h('div', { className: 'dsh-wt-emptyIcon' }, h(IconEmpty, null)),
        h('div', { className: 'dsh-wt-emptyTitle' }, props.title),
        h('div', { className: 'dsh-wt-emptyBody' }, props.body),
      )
    }

    function PageShell(props) {
      return h(
        'div',
        { className: 'dsh-wt-page' },
        h('div', { className: 'dsh-wt-shell' }, props.children),
      )
    }

    function Unsupported(props) {
      const say = props.say
      return h(
        PageShell,
        null,
        h('div', { className: 'dsh-wt-title' }, say('title')),
        h('div', { className: 'dsh-wt-empty', style: { marginTop: '18px' } }, say('state.unsupported')),
      )
    }

    function PanelBody(props) {
      const list = props.useSessions(state => state)
      const snapshot = props.useWorkspaces(state => state)
      const [pickedId, setPickedId] = React.useState(null)
      const [draft, setDraft] = React.useState('')
      const [editingId, setEditingId] = React.useState(null)
      const [editDraft, setEditDraft] = React.useState('')
      const [showDone, setShowDone] = React.useState(false)
      const editRef = React.useRef(null)
      const cancelEditRef = React.useRef(false)
      const composingRef = React.useRef(false)
      const [, setTick] = React.useState(0)

      const localeId = String(props.localeId || 'zh').split('-')[0] === 'en' ? 'en' : 'zh'
      const say = (key, vars) => fill((props.say ? props.say(key) : key) || key, vars)

      React.useEffect(() => {
        const timer = setInterval(() => setTick(value => value + 1), 60 * 1000)
        return () => clearInterval(timer)
      }, [])

      const workspaces = (snapshot && Array.isArray(snapshot.items) ? snapshot.items : []).filter(workspace => {
        return workspace && workspace.workspaceId !== undefined
      })
      const current = currentWorkspaceOf(list, snapshot)
      const picked = pickedId ? workspaces.find(workspace => String(workspace.workspaceId) === String(pickedId)) : null
      const workspace = picked || current || workspaces[0] || null
      const workspaceKey = workspace ? String(workspace.workspaceId) : ''
      const workspacePath = workspace ? normalizePath(workspace.path) : ''

      const { record, syncError, commit } = useTodoStore(workspace)
      const items = record.items || []
      const openItems = items.filter(item => !item.done)
      const doneItems = items.filter(item => item.done)
      const total = items.length
      const doneCount = doneItems.length
      const percent = total ? Math.round((doneCount / total) * 100) : 0

      React.useEffect(() => {
        setDraft('')
        setEditingId(null)
        setEditDraft('')
        cancelEditRef.current = false
      }, [workspaceKey, workspacePath])

      React.useEffect(() => {
        if (!editingId || !editRef.current) return
        editRef.current.focus()
        editRef.current.select()
      }, [editingId])

      const add = () => {
        const text = draft.trim().slice(0, MAX_TEXT)
        if (!text || !workspace) return
        const now = Date.now()
        commit(currentItems => {
          return [
            { id: uid(), text, done: false, createdAt: now, updatedAt: now },
            ...currentItems,
          ]
        })
        setDraft('')
      }

      const toggle = item => {
        commit(currentItems => {
          return currentItems.map(candidate => {
            if (candidate.id !== item.id) return candidate
            const now = Date.now()
            return {
              ...candidate,
              done: !candidate.done,
              updatedAt: now,
              ...(candidate.done ? { completedAt: undefined } : { completedAt: now }),
            }
          })
        })
        if (item.id === editingId) {
          setEditingId(null)
          setEditDraft('')
        }
      }

      const remove = item => {
        commit(currentItems => currentItems.filter(candidate => candidate.id !== item.id))
        if (item.id === editingId) {
          setEditingId(null)
          setEditDraft('')
        }
      }

      const startEdit = item => {
        cancelEditRef.current = false
        setEditingId(item.id)
        setEditDraft(item.text)
      }

      const finishEdit = item => {
        if (cancelEditRef.current) {
          cancelEditRef.current = false
          return
        }
        if (!editingId) return
        const text = editDraft.trim().slice(0, MAX_TEXT)
        if (text && text !== item.text) {
          commit(currentItems => {
            return currentItems.map(candidate => {
              if (candidate.id !== item.id) return candidate
              return { ...candidate, text, updatedAt: Date.now() }
            })
          })
        }
        setEditingId(null)
        setEditDraft('')
      }

      const cancelEdit = () => {
        cancelEditRef.current = true
        setEditingId(null)
        setEditDraft('')
      }

      const clearDone = () => {
        commit(currentItems => currentItems.filter(item => !item.done))
        setShowDone(false)
      }

      const selectWorkspace = event => {
        setPickedId(event.target.value)
      }

      const backToCurrent = () => {
        setPickedId(null)
      }

      const workspaceName = workspace
        ? workspace.title || basename(workspace.path) || String(workspace.workspaceId)
        : ''
      const isCurrent = current && workspace && String(current.workspaceId) === String(workspace.workspaceId)
      const savedAt = record.updatedAt ? clockLabel(record.updatedAt, localeId) : ''
      const showLoading = !snapshot || (snapshot.phase === 'pending' && !workspaces.length)

      let body
      if (showLoading) {
        body = h(EmptyState, { title: say('state.loading'), body: '' })
      } else if (!workspaces.length) {
        body = h(EmptyState, { title: say('state.noWorkspace.title'), body: say('state.noWorkspace.body') })
      } else {
        body = h(
          React.Fragment,
          null,
          h(
            'form',
            {
              className: 'dsh-wt-add',
              onSubmit: event => {
                event.preventDefault()
                if (composingRef.current) return
                add()
              },
            },
            h('span', { className: 'dsh-wt-addIcon', 'aria-hidden': true }, h(IconPlus, null)),
            h('input', {
              className: 'dsh-wt-input',
              value: draft,
              maxLength: MAX_TEXT,
              placeholder: say('add.placeholder'),
              'aria-label': say('add.placeholder'),
              onChange: event => setDraft(event.target.value),
              onCompositionStart: () => { composingRef.current = true },
              onCompositionEnd: () => { composingRef.current = false },
              onKeyDown: event => {
                const composing = event.isComposing || (event.nativeEvent && event.nativeEvent.isComposing)
                if (event.key === 'Escape') {
                  event.currentTarget.blur()
                  return
                }
                // Never submit the half-finished candidate of an IME composition.
                if (event.key === 'Enter' && composing) event.preventDefault()
              },
            }),
            h(
              'button',
              {
                type: 'submit',
                className: 'dsh-wt-addBtn',
                disabled: !draft.trim(),
              },
              say('add.action'),
            ),
          ),
          h('div', { className: 'dsh-wt-addHint' }, say('add.hint')),
          total
            ? h(
                'div',
                { className: 'dsh-wt-progressWrap' },
                h(
                  'div',
                  {
                    className: 'dsh-wt-track',
                    role: 'progressbar',
                    'aria-valuemin': 0,
                    'aria-valuemax': total,
                    'aria-valuenow': doneCount,
                    'aria-label': say('progress', { done: doneCount, total }),
                  },
                  h('div', { className: 'dsh-wt-fill', style: { width: `${percent}%` } }),
                ),
                h('span', { className: 'dsh-wt-progressText' }, say('progress', { done: doneCount, total })),
              )
            : null,
          h(
            'div',
            { className: 'dsh-wt-sectionHead' },
            h(
              'div',
              { className: 'dsh-wt-sectionName' },
              say('list.open'),
              h('span', { className: 'dsh-wt-sectionCount' }, String(openItems.length)),
            ),
          ),
          openItems.length
            ? h(
                'ul',
                { className: 'dsh-wt-rows' },
                openItems.map(item =>
                  h(TodoRow, {
                    key: item.id,
                    item,
                    done: false,
                    say,
                    localeId,
                    onToggle: toggle,
                    onStartEdit: startEdit,
                    onDelete: remove,
                    editing: editingId === item.id,
                    editDraft,
                    setEditDraft,
                    onFinishEdit: finishEdit,
                    onCancelEdit: cancelEdit,
                    editRef,
                  }),
                ),
              )
            : h(EmptyState, {
                title: total ? say('list.allDone.title') : say('list.empty.title'),
                body: total ? say('list.allDone.body') : say('list.empty.body'),
              }),
          doneItems.length
            ? h(
                React.Fragment,
                null,
                h(
                  'div',
                  { className: 'dsh-wt-doneHead' },
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'dsh-wt-doneToggle',
                      'aria-expanded': showDone ? 'true' : 'false',
                      onClick: () => setShowDone(value => !value),
                    },
                    h('span', { className: 'dsh-wt-chevron', 'data-open': showDone ? 'true' : 'false' }, h(IconChevron, null)),
                    say('list.completed'),
                    h('span', { className: 'dsh-wt-sectionCount' }, String(doneItems.length)),
                  ),
                  showDone
                    ? h(
                        'button',
                        { type: 'button', className: 'dsh-wt-clear', onClick: clearDone },
                        say('list.clearDone'),
                      )
                    : null,
                ),
                showDone
                  ? h(
                      'ul',
                      { className: 'dsh-wt-rows dsh-wt-doneRows' },
                      doneItems.map(item =>
                        h(TodoRow, {
                          key: item.id,
                          item,
                          done: true,
                          say,
                          localeId,
                          onToggle: toggle,
                          onStartEdit: startEdit,
                          onDelete: remove,
                          editing: editingId === item.id,
                          editDraft,
                          setEditDraft,
                          onFinishEdit: finishEdit,
                          onCancelEdit: cancelEdit,
                          editRef,
                        }),
                      ),
                    )
                  : null,
              )
            : null,
          h(
            'div',
            { className: 'dsh-wt-footer' },
            h('span', { className: syncError ? 'dsh-wt-error' : undefined }, say(syncError ? 'footer.error' : 'footer.storage')),
            h('span', { className: 'dsh-wt-footRight' }, savedAt ? `${say('footer.saved')} ${savedAt}` : ''),
          ),
        )
      }

      return h(
        PageShell,
        null,
        h(
          'header',
          { className: 'dsh-wt-head' },
          h(
            'div',
            { className: 'dsh-wt-headText' },
            h('div', { className: 'dsh-wt-eyebrow' }, say('eyebrow')),
            h('h1', { className: 'dsh-wt-title' }, say('title')),
            h('p', { className: 'dsh-wt-sub' }, say('subtitle')),
            workspace
              ? h(
                  'div',
                  { className: 'dsh-wt-workspace' },
                  workspaces.length > 1
                    ? h(
                        'select',
                        {
                          className: 'dsh-wt-select',
                          value: String(workspace.workspaceId),
                          'aria-label': say('workspace.label'),
                          onChange: selectWorkspace,
                        },
                        workspaces.map(candidate =>
                          h(
                            'option',
                            { key: String(candidate.workspaceId), value: String(candidate.workspaceId) },
                            candidate.title || basename(candidate.path) || String(candidate.workspaceId),
                          ),
                        ),
                      )
                    : h('span', { className: 'dsh-wt-workspaceName' }, workspaceName),
                  h('span', { className: 'dsh-wt-path', title: workspace.path || '' }, workspace.path || ''),
                  isCurrent ? h('span', { className: 'dsh-wt-current' }, say('workspace.current')) : null,
                  !isCurrent && current
                    ? h('button', { type: 'button', className: 'dsh-wt-follow', onClick: backToCurrent }, say('workspace.follow'))
                    : null,
                )
              : null,
          ),
          h(
            'div',
            { className: 'dsh-wt-stat' },
            h('div', { className: 'dsh-wt-statNum' }, String(openItems.length)),
            h(
              'div',
              { className: 'dsh-wt-statLabel' },
              openItems.length === 0 && total > 0 ? say('stats.allDone') : say('stats.openLabel'),
            ),
          ),
        ),
        body,
      )
    }

    function Panel(props) {
      const ready = typeof props.useSessions === 'function' && typeof props.useWorkspaces === 'function'
      if (!ready) return h(Unsupported, { say: props.say || (key => key) })
      return h(PanelBody, props)
    }

    function PanelIcon(props) {
      const size = typeof props.size === 'number' ? props.size : 16
      return h(
        'svg',
        {
          width: size,
          height: size,
          viewBox: '0 0 16 16',
          fill: 'none',
          'aria-hidden': true,
          focusable: false,
          style: { display: 'block' },
        },
        h('path', {
          d: 'M2.25 4.25 3.5 5.5l2.25-2.5',
          stroke: 'currentColor',
          strokeWidth: 1.4,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        }),
        h('path', {
          d: 'M2.25 11.25 3.5 12.5l2.25-2.5',
          stroke: 'currentColor',
          strokeWidth: 1.4,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        }),
        h('path', {
          d: 'M8.25 4.5h5.5M8.25 11.5h5.5',
          stroke: 'currentColor',
          strokeWidth: 1.4,
          strokeLinecap: 'round',
        }),
      )
    }

    /**
     * Compact management entry above the composer. It always exposes the
     * current workspace's open count and opens the full panel in one click.
     */
    function InputDock(props) {
      const useSessions = typeof props.useSessions === 'function' ? props.useSessions : selector => selector(undefined)
      const useWorkspaces = typeof props.useWorkspaces === 'function' ? props.useWorkspaces : selector => selector(undefined)
      const list = useSessions(state => state)
      const snapshot = useWorkspaces(state => state)
      const [, force] = React.useState(0)

      React.useEffect(() => {
        const listener = () => force(value => value + 1)
        TODO_LISTENERS.add(listener)
        const onStorage = event => {
          if (event.key === STORAGE_KEY) listener()
        }
        window.addEventListener('storage', onStorage)
        return () => {
          TODO_LISTENERS.delete(listener)
          window.removeEventListener('storage', onStorage)
        }
      }, [])

      const workspace = currentWorkspaceOf(list, snapshot)
      if (!workspace) return null

      const { items } = readRecord(workspace)
      const open = items.filter(item => !item.done).length
      const say = props.say
      const label = say('dock.label')
      const detail = open > 0 ? say('dock.count', { n: open }) : say('dock.empty')
      const aria = open > 0 ? `${say('dock.open')}, ${detail}` : say('dock.open')

      return h(
        'div',
        { className: 'dsh-wt-dock' },
        h(
          'button',
          {
            type: 'button',
            className: 'dsh-wt-dockBtn',
            title: say('dock.open'),
            'aria-label': aria,
            onClick: props.openTodos,
          },
          h('span', { className: 'dsh-wt-dockIcon', 'aria-hidden': true }, h(PanelIcon, { size: 14 })),
          h('span', { className: 'dsh-wt-dockLabel' }, label),
          open > 0
            ? h('span', { className: 'dsh-wt-dockCount' }, String(open))
            : h('span', { className: 'dsh-wt-dockMuted' }, detail),
        ),
      )
    }

    /** Translate through the locale service, falling back to the bundled copy. */
    function makeSay(ctx, getLocaleId) {
      const locale = ctx.get('locale')
      const bound = locale && typeof locale.bind === 'function' ? locale.bind(NS) : null
      return key => {
        if (bound) {
          try {
            const value = bound(key)
            if (typeof value === 'string' && value && value !== key) return value
          } catch (error) {
            /* fall through */
          }
        }
        const language = String(getLocaleId()).split('-')[0]
        const dict = DICT[language] || DICT.zh
        return dict[key] || DICT.zh[key] || key
      }
    }

    function apply(ctx) {
      const locale = ctx.get('locale')

      // One document-level sheet covers both the panel and the composer dock;
      // the dock mounts outside the panel tree, so a panel-local <style> would
      // leave it unstyled until the panel had been opened once.
      ctx.effect(() => {
        const style = document.createElement('style')
        style.dataset.dshPlugin = 'workspace-todos'
        style.textContent = CSS
        document.head.appendChild(style)
        return () => { style.remove() }
      }, 'workspace-todos: styles')

      if (locale && typeof locale.register === 'function') {
        ctx.effect(() => locale.register(NS, DICT), 'workspace-todos: dictionaries')
      }

      const localeId = () => {
        try {
          const current = locale && typeof locale.getLocale === 'function' ? locale.getLocale() : null
          const id = current && (current.id || current.locale)
          return typeof id === 'string' && id ? id : 'zh'
        } catch (error) {
          return 'zh'
        }
      }

      const say = makeSay(ctx, localeId)

      const translator = props => {
        return (key, vars) => {
          if (props && typeof props.t === 'function') {
            try {
              const value = props.t(key)
              if (typeof value === 'string' && value && value !== key) return fill(value, vars)
            } catch (error) {
              /* fall back to the plugin's own binding */
            }
          }
          return fill(say(key), vars)
        }
      }

      function BoundPanel(props) {
        const propsLocale = String(localeId()).split('-')[0] === 'en' ? 'en' : 'zh'
        return h(Panel, {
          ...props,
          say: translator(props),
          localeId: propsLocale,
        })
      }

      function BoundIcon(props) {
        return h(PanelIcon, props)
      }

      function BoundInputDock(props) {
        return h(InputDock, {
          ...props,
          say: translator(props),
        })
      }

      ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: PANEL_ID, locale: NS }, BoundPanel))

      ctx.slots.inject('conversation.input.dock', () =>
        ctx.slots.register(
          {
            name: 'conversation.input.dock',
            id: PANEL_ID,
            order: 30,
            locale: NS,
            inject: () => ({
              openTodos: () => {
                try {
                  ctx.layout.selectPanel(PANEL_ID)
                } catch (error) {
                  console.error('workspace-todos: open panel failed', error)
                }
              },
            }),
          },
          BoundInputDock,
        ),
      )

      ctx.slots.inject('sidebar.panellist', () =>
        ctx.slots.register(
          {
            name: 'sidebar.panellist',
            id: PANEL_ID,
            order: 30,
            label: () => say('nav.label'),
            locale: NS,
          },
          BoundIcon,
        ),
      )
    }

    return { inject: ['slots', 'layout'], apply }
  },
})
