window.__ModuleLoader__.load({
  id: 'dsh-workspace-todos',
  factory(require) {
    const React = require('react')
    const ReactDOM = require('react-dom')
    const ReactDOMClient = require('react-dom/client')
    const h = React.createElement

    /** Locale namespace of this plugin's copy (also binds the renderer's `t` prop). */
    const NS = 'workspace-todos'
    /** Sidebar launcher id and the main panel key it addresses. */
    const PANEL_ID = 'workspace-todos'
    /** Legacy workspace store; retained only by the retired full-page panel. */
    const STORAGE_KEY = 'dsh.workspace-todos.v1'
    /** Session-scoped memo store used by the badge, popover, and composer entries. */
    const SESSION_STORAGE_KEY = 'dsh.session-memos.v1'
    /** Unsaved add/edit drafts, restored when the panel is reopened. */
    const DRAFT_STORAGE_KEY = 'dsh.memo.drafts.v1'
    /** Notes already forwarded to the composer, per session; keeps the half check. */
    const FORWARDED_STORAGE_KEY = 'dsh.memo.forwarded.v1'
    /** Fixed lead-in used when forwarding a note to the conversation composer. */
    const FORWARD_PREFIX = '完成以下任务：'
    /** Shown in the in-panel settings; keep in sync with package.json. */
    const PLUGIN_VERSION = '1.7.0'
    const PLUGIN_AUTHOR_URL = 'https://github.com/Rayle8'
    const PLUGIN_AUTHOR_LABEL = 'github.com/Rayle8'
    /** Enter-to-send preference; persisted across panel openings. */
    const SEND_SHORTCUT_KEY = 'dsh.memo.send-shortcut.v1'
    const SEND_SHORTCUT_DEFAULT = 'ctrl-enter'
    /** Remembered expand/collapse state of the open/completed sections. */
    const SECTION_STATE_KEY = 'dsh.memo.sections.v1'
    const SECTION_STATE_DEFAULT = { open: true, done: false }
    /** Persisted width of the experimental right-side panel. */
    const PANEL_WIDTH_KEY = 'dsh.memo.panel-width.v1'
    const PANEL_DEFAULT_WIDTH = 360
    const PANEL_MIN_WIDTH = 280
    const PANEL_MAX_WIDTH = 720
    /** Persisted height of the experimental right-side panel; 0 means content-sized. */
    const PANEL_HEIGHT_KEY = 'dsh.memo.panel-height.v1'
    const PANEL_MIN_HEIGHT = 240
    /** A note is meant to stay brief; this is the hard cap. */
    const MAX_TEXT = 280
    /** Defensive cap so a corrupted store cannot freeze the panel. */
    const MAX_ITEMS = 300
    /** A forwarded open note waits this long for a second click before it completes. */
    const HALF_DONE_DELAY = 3000
    /** Countdown cadence of the pending hint, so `n` steps 3 → 2 → 1 once per second. */
    const HALF_DONE_TICK = 1000
    /** First `n` of the pending hint, derived so the delay and the copy stay in sync. */
    const HALF_DONE_COUNTDOWN = Math.round(HALF_DONE_DELAY / HALF_DONE_TICK)
    /** Card-leave animation played before the delayed completion is committed. */
    const HALF_DONE_LEAVE = 200
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
        'nav.label': '便笺',
        'title': '便笺',
        'eyebrow': 'SESSION',
        'subtitle': '记下这个会话要跟进的事，完成后打勾。',
        'dock.label': '便笺',
        'dock.open': '打开便笺',
        'dock.count': '{n} 项未完成',
        'badge.label': '便笺',
        'badge.title': '打开当前会话的便笺',
        'header.tooltip': '会话便笺 {n}',
        'badge.count': '{open}',
        'popover.title': '便笺',
        'popover.close': '关闭便笺',
        'settings.open': '设置',
        'settings.title': '设置',
        'settings.about': '关于',
        'settings.version': '版本',
        'settings.author': '作者',
        'settings.shortcut': '发送快捷键',
        'settings.shortcutCtrlEnter': 'Ctrl+Enter 发送，Enter 换行',
        'settings.shortcutEnter': 'Enter 发送，Ctrl+Enter 换行',
        'settings.forward': '一键转发',
        'settings.forwardPrefixItem': '前缀提示词',
        'settings.forwardCheck': '转发勾选完成',
        'settings.forwardPrefixHint': '留空则只转发便笺正文',
        'settings.halfCheck': '转发后勾选框变为半选；再次点击标记完成，延迟期间可再点一次还原。',
        'popover.count': '{open} 未完成 · {total} 条',
        'popover.session': '当前会话',
        'popover.empty.title': '还没有便笺',
        'popover.empty.body': '记下这个会话要跟进的一件事。',
        'popover.completed': '已完成',
        'popover.clearDone': '清除已完成',
        'popover.storage': '按会话隔离 · 保存在此浏览器',
        'workspace.label': '工作区',
        'workspace.follow': '回到当前',
        'workspace.current': '当前会话',
        'stats.openLabel': '未完成',
        'stats.allDone': '全部完成',
        'add.placeholder': '记一条便笺',
        'add.shortcut': 'Ctrl+Enter 发送 · Enter 换行',
        'add.shortcutEnter': 'Enter 发送 · Ctrl+Enter 换行',
        'add.action': '添加',
        'add.hint': '只记一件具体的小事，做完就打勾。',
        'progress': '{done} / {total} 已完成',
        'list.open': '未完成',
        'list.completed': '已完成',
        'list.clearDone': '清除已完成',
        'list.empty.title': '还没有便笺',
        'list.empty.body': '先记下这个会话要跟进的事，完成后再回来打勾。',
        'list.allDone.title': '未完成的都清空了',
        'list.allDone.body': '可以继续添加，或展开下方回看已完成。',
        'item.markDone': '标记为完成',
        'item.markOpen': '标记为未完成',
        'item.copy': '复制',
        'item.copied': '已复制',
        'item.forward': '转发到会话',
        'item.forwarded': '已转发',
        'item.pendingUndo': '再点一次可还原为未完成状态',
        'item.pendingCountdown': '已完成，{n} 秒后进入已完成清单，再次点击可以还原为未完成状态',
        'item.edit': '编辑',
        'item.delete': '删除',
        'item.editHint': '双击编辑',
        'edit.save': '保存',
        'edit.cancel': '取消',
        'edit.hintCtrlEnter': 'Ctrl+Enter 保存 · Enter 换行',
        'edit.hintEnter': 'Enter 保存 · Ctrl+Enter 换行',
        'time.now': '刚刚',
        'time.minutes': '{n} 分钟前',
        'time.hours': '{n} 小时前',
        'time.days': '{n} 天前',
        'footer.storage': '按会话隔离 · 保存在此浏览器',
        'footer.saved': '已保存',
        'footer.error': '浏览器存储不可用，改动可能不会保留',
        'state.loading': '正在读取会话…',
        'state.unsupported': '当前页面没有提供会话数据，无法显示便笺。',
        'state.noWorkspace.title': '还没有工作区',
        'state.noWorkspace.body': '先在侧边栏添加一个工作区，便笺会跟着会话走。',
      },
      en: {
        'nav.label': 'Notes',
        'title': 'Notes',
        'eyebrow': 'SESSION',
        'subtitle': 'Keep the follow-ups for this session here, then check them off.',
        'dock.label': 'Notes',
        'dock.open': 'Open notes',
        'dock.count': '{n} open',
        'badge.label': 'Notes',
        'header.tooltip': 'Session notes {n}',
        'badge.title': 'Open this session’s notes',
        'badge.count': '{open}',
        'popover.title': 'Notes',
        'popover.close': 'Close notes',
        'settings.open': 'Settings',
        'settings.title': 'Settings',
        'settings.about': 'About',
        'settings.version': 'Version',
        'settings.author': 'Author',
        'settings.shortcut': 'Send shortcut',
        'settings.shortcutCtrlEnter': 'Ctrl+Enter sends, Enter for a new line',
        'settings.shortcutEnter': 'Enter sends, Ctrl+Enter for a new line',
        'settings.forward': 'One-click forward',
        'settings.forwardPrefixItem': 'Prefix prompt',
        'settings.forwardCheck': 'Forward completion',
        'settings.forwardPrefixHint': 'Leave empty to forward the note only',
        'settings.halfCheck': 'After forwarding, the checkbox becomes half-checked; click again to complete, or click once more during the delay to restore it.',
        'popover.count': '{open} open · {total} total',
        'popover.session': 'Current session',
        'popover.empty.title': 'No notes yet',
        'popover.empty.body': 'Write down one follow-up for this session.',
        'popover.completed': 'Completed',
        'popover.clearDone': 'Clear completed',
        'popover.storage': 'Separate per session · kept in this browser',
        'workspace.label': 'Workspace',
        'workspace.follow': 'Back to current',
        'workspace.current': 'Current session',
        'stats.openLabel': 'open',
        'stats.allDone': 'all done',
        'add.placeholder': 'Write a note',
        'add.shortcut': 'Ctrl+Enter sends · Enter for a new line',
        'add.shortcutEnter': 'Enter sends · Ctrl+Enter for a new line',
        'add.action': 'Add',
        'add.hint': 'Keep it to one concrete next step; check it off when done.',
        'progress': '{done} / {total} done',
        'list.open': 'Open',
        'list.completed': 'Completed',
        'list.clearDone': 'Clear completed',
        'list.empty.title': 'No notes yet',
        'list.empty.body': 'Write down the next follow-up for this session, then check it off.',
        'list.allDone.title': 'Nothing left open',
        'list.allDone.body': 'Add another note, or expand completed below to look back.',
        'item.markDone': 'Mark as done',
        'item.markOpen': 'Mark as open',
        'item.copy': 'Copy',
        'item.copied': 'Copied',
        'item.forward': 'Forward to chat',
        'item.forwarded': 'Forwarded',
        'item.pendingUndo': 'Click again to keep it open',
        'item.pendingCountdown': 'Done — moving to Completed in {n}s; click again to restore it to open.',
        'item.edit': 'Edit',
        'item.delete': 'Delete',
        'item.editHint': 'Double-click to edit',
        'edit.save': 'Save',
        'edit.cancel': 'Cancel',
        'edit.hintCtrlEnter': 'Ctrl+Enter saves · Enter for a new line',
        'edit.hintEnter': 'Enter saves · Ctrl+Enter for a new line',
        'time.now': 'just now',
        'time.minutes': '{n} min ago',
        'time.hours': '{n} hr ago',
        'time.days': '{n} d ago',
        'footer.storage': 'Separate per session · kept in this browser',
        'footer.saved': 'Saved',
        'footer.error': 'Browser storage is unavailable; changes may not persist',
        'state.loading': 'Reading sessions…',
        'state.unsupported': 'This page exposes no session data, so notes cannot render.',
        'state.noWorkspace.title': 'No workspace yet',
        'state.noWorkspace.body': 'Add a workspace from the sidebar first; notes follow the session.',
      },
    }

    const CSS = [
      '/* ── 1 色彩 · 三类分工：中性灰 / 语义色 / 强调色 ───────────────── */',
      'body{--wt-n-50:color-mix(in srgb,var(--dsw-alias-label-primary) 0%,var(--dsw-alias-bg-layer-1));--wt-n-100:color-mix(in srgb,var(--dsw-alias-label-primary) 4%,var(--dsw-alias-bg-layer-1));--wt-n-200:color-mix(in srgb,var(--dsw-alias-label-primary) 9%,var(--dsw-alias-bg-layer-1));--wt-n-300:color-mix(in srgb,var(--dsw-alias-label-primary) 15%,var(--dsw-alias-bg-layer-1));--wt-n-400:color-mix(in srgb,var(--dsw-alias-label-primary) 23%,var(--dsw-alias-bg-layer-1));--wt-n-500:color-mix(in srgb,var(--dsw-alias-label-primary) 33%,var(--dsw-alias-bg-layer-1));--wt-n-600:color-mix(in srgb,var(--dsw-alias-label-primary) 46%,var(--dsw-alias-bg-layer-1));--wt-n-700:color-mix(in srgb,var(--dsw-alias-label-primary) 62%,var(--dsw-alias-bg-layer-1));--wt-n-800:color-mix(in srgb,var(--dsw-alias-label-primary) 76%,var(--dsw-alias-bg-layer-1));--wt-n-900:color-mix(in srgb,var(--dsw-alias-label-primary) 89%,var(--dsw-alias-bg-layer-1));--wt-n-950:var(--dsw-alias-label-primary);--wt-surface:var(--dsw-alias-bg-layer-1);--wt-canvas:var(--dsw-alias-bg-base);--wt-ink:var(--wt-n-950);--wt-ink-secondary:var(--wt-n-800);--wt-ink-tertiary:var(--wt-n-700);--wt-line:var(--wt-n-300);--wt-line-strong:var(--wt-n-400);--wt-success:var(--dsw-alias-state-success-primary);--wt-success-soft:color-mix(in srgb,var(--dsw-alias-state-success-primary) 16%,var(--dsw-alias-bg-layer-1));--wt-warn:var(--dsw-alias-state-warn-label);--wt-danger:var(--dsw-alias-state-error-primary);--wt-danger-soft:var(--dsw-alias-interactive-bg-hover-danger);--wt-accent:var(--dsw-alias-brand-primary);--wt-accent-ink:var(--dsw-alias-bg-base);--wt-accent-hover:var(--dsw-alias-button-primary-hover);--wt-accent-active:color-mix(in srgb,var(--dsw-alias-brand-primary) 84%,var(--dsw-alias-bg-layer-1));--wt-focus:var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));--wt-focus-width:var(--dsw-focus-ring-width,2px);--wt-focus-soft:color-mix(in srgb,var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary)) 16%,transparent)}',
      '/* ── 2 排版 · 1.25 阶梯 5 级 · 字重 3 种 · 正文行高 1.6 ───────── */',
      'body{--wt-fs-caption:10px;--wt-lh-caption:14px;--wt-fs-body-sm:12.5px;--wt-lh-body-sm:20px;--wt-fs-body:15.5px;--wt-lh-body:25px;--wt-fs-heading:19.5px;--wt-lh-heading:26px;--wt-fs-display:24.5px;--wt-lh-display:30px;--wt-fw-regular:400;--wt-fw-medium:500;--wt-fw-semibold:600;--wt-measure:66ch}',
      '/* ── 3 间距 · 4px 基准刻度 ────────────────────────────────────── */',
      'body{--wt-space-1:4px;--wt-space-2:8px;--wt-space-3:12px;--wt-space-4:16px;--wt-space-5:24px;--wt-space-6:32px;--wt-space-7:48px;--wt-space-8:64px}',
      '/* ── 4 圆角与阴影 · 3 种圆角 · 多层浅阴影 ─────────────────────── */',
      'body{--wt-radius-sm:8px;--wt-radius-md:12px;--wt-radius-pill:999px;--wt-shadow-float:var(--dsw-elevation-soft);--wt-shadow-ring:0 0 0 3px var(--wt-focus-soft)}',
      '/* ── 5 动效 · 时长与缓动令牌化 ────────────────────────────────── */',
      'body{--wt-dur-fast:150ms;--wt-dur-base:200ms;--wt-dur-slow:300ms;--wt-ease-standard:cubic-bezier(.4,0,.2,1);--wt-ease-out:cubic-bezier(.16,1,.3,1);--wt-ease-in:cubic-bezier(.4,0,1,1);--wt-stagger:40ms;--wt-dur-loop:700ms}',
      '/* ── 6 交互状态 · 统一 150ms 过渡 ─────────────────────────────── */',
      'body{--wt-transition:background-color var(--wt-dur-fast) var(--wt-ease-standard),border-color var(--wt-dur-fast) var(--wt-ease-standard),color var(--wt-dur-fast) var(--wt-ease-standard),box-shadow var(--wt-dur-fast) var(--wt-ease-standard),opacity var(--wt-dur-fast) var(--wt-ease-standard),transform var(--wt-dur-fast) var(--wt-ease-standard)}',
      '.dsh-wt-page{display:flex;flex-direction:column;height:100%;min-height:0;overflow:auto;background:var(--wt-canvas);color:var(--wt-ink);font-size:var(--wt-fs-body);line-height:var(--wt-lh-body)}',
      '.dsh-wt-shell{width:100%;max-width:780px;margin:0 auto;padding:var(--wt-space-6) var(--wt-space-5) var(--wt-space-8);box-sizing:border-box}',
      '.dsh-wt-head{display:flex;align-items:flex-start;justify-content:space-between;gap:var(--wt-space-5);margin:0 0 var(--wt-space-4)}',
      '.dsh-wt-headText{min-width:0;flex:1}',
      '.dsh-wt-eyebrow{font-size:var(--wt-fs-caption);line-height:var(--wt-lh-caption);font-weight:var(--wt-fw-semibold);letter-spacing:.12em;text-transform:uppercase;color:var(--wt-ink-tertiary)}',
      '.dsh-wt-title{margin:var(--wt-space-1) 0 0;font-size:var(--wt-fs-display);line-height:var(--wt-lh-display);font-weight:var(--wt-fw-semibold);letter-spacing:-.01em;color:var(--wt-ink)}',
      '.dsh-wt-sub{margin:var(--wt-space-2) 0 0;max-width:var(--wt-measure);font-size:var(--wt-fs-body);line-height:var(--wt-lh-body);color:var(--wt-ink-secondary)}',
      '.dsh-wt-workspace{display:flex;align-items:center;gap:var(--wt-space-2);flex-wrap:wrap;margin:var(--wt-space-3) 0 0;min-width:0}',
      '.dsh-wt-select{max-width:280px;height:28px;padding:0 var(--wt-space-5) 0 var(--wt-space-2);border:1px solid var(--wt-line);border-radius:var(--wt-radius-sm);background:var(--wt-canvas);color:var(--wt-ink);font:inherit;font-size:var(--wt-fs-body-sm);line-height:26px;cursor:pointer;transition:var(--wt-transition)}',
      '.dsh-wt-select:hover{border-color:var(--wt-line-strong);background:var(--wt-n-100)}',
      '.dsh-wt-select:focus-visible{outline:var(--wt-focus-width) solid var(--wt-focus);outline-offset:2px}',
      '.dsh-wt-workspaceName{display:inline-flex;align-items:center;gap:var(--wt-space-1);min-width:0;font-size:var(--wt-fs-body-sm);line-height:var(--wt-lh-body-sm);font-weight:var(--wt-fw-semibold);color:var(--wt-ink)}',
      '.dsh-wt-path{min-width:0;max-width:100%;font-size:var(--wt-fs-caption);line-height:var(--wt-lh-caption);color:var(--wt-ink-tertiary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      '.dsh-wt-current{flex:none;display:inline-flex;align-items:center;height:16px;padding:0 var(--wt-space-2);border:1px solid var(--wt-line);border-radius:var(--wt-radius-pill);font-size:var(--wt-fs-caption);line-height:1;font-weight:var(--wt-fw-medium);color:var(--wt-ink-tertiary)}',
      '.dsh-wt-follow{display:inline-flex;align-items:center;height:24px;padding:0 var(--wt-space-2);border:0;border-radius:var(--wt-radius-sm);background:transparent;color:var(--wt-ink);font:inherit;font-size:var(--wt-fs-caption);line-height:1;font-weight:var(--wt-fw-medium);cursor:pointer;transition:var(--wt-transition)}',
      '.dsh-wt-follow:hover{background:var(--wt-n-200)}',
      '.dsh-wt-follow:active{background:var(--wt-n-300)}',
      '.dsh-wt-follow:focus-visible{outline:var(--wt-focus-width) solid var(--wt-focus);outline-offset:2px}',
      '.dsh-wt-stat{flex:none;display:flex;flex-direction:column;align-items:flex-end;gap:0;min-width:64px}',
      '.dsh-wt-statNum{font-size:var(--wt-fs-display);line-height:var(--wt-lh-display);font-weight:var(--wt-fw-semibold);letter-spacing:-.02em;font-variant-numeric:tabular-nums;color:var(--wt-ink)}',
      '.dsh-wt-statLabel{font-size:var(--wt-fs-caption);line-height:var(--wt-lh-caption);color:var(--wt-ink-tertiary)}',
      '.dsh-wt-progressWrap{display:flex;align-items:center;gap:var(--wt-space-3);margin:0 0 var(--wt-space-4)}',
      '.dsh-wt-track{flex:1;height:4px;border-radius:var(--wt-radius-pill);background:var(--wt-n-200);overflow:hidden}',
      '.dsh-wt-fill{width:100%;height:100%;transform-origin:left center;background:var(--wt-n-800);transition:transform var(--wt-dur-slow) var(--wt-ease-standard)}',
      '.dsh-wt-progressText{flex:none;font-size:var(--wt-fs-caption);line-height:var(--wt-lh-caption);color:var(--wt-ink-tertiary);font-variant-numeric:tabular-nums}',
      '.dsh-wt-add{display:flex;flex-direction:column;align-items:stretch;gap:var(--wt-space-2);padding:var(--wt-space-3);border:1px solid var(--wt-line);border-radius:var(--wt-radius-md);background:var(--wt-n-100);transition:var(--wt-transition)}',
      '.dsh-wt-add:focus-within{border-color:var(--wt-line-strong);background:var(--wt-n-50);box-shadow:var(--wt-shadow-ring)}',
      '.dsh-wt-addIcon{display:flex;align-items:center;justify-content:center;flex:none;width:16px;height:16px;color:var(--wt-ink-tertiary)}',
      '.dsh-wt-input{display:block;flex:0 0 auto;width:100%;min-width:0;box-sizing:border-box;min-height:20px;max-height:120px;padding:0;border:0;outline:0;background:transparent;color:var(--wt-ink);font:inherit;font-size:var(--wt-fs-body-sm);line-height:var(--wt-lh-body-sm);resize:none;overflow-y:auto;overflow-x:hidden}',
      '.dsh-wt-input::placeholder{color:var(--wt-ink-tertiary)}',
      '.dsh-wt-addFoot{display:flex;align-items:center;justify-content:space-between;gap:var(--wt-space-2);width:100%;min-width:0}',
      '.dsh-wt-addShortcut{min-width:0;overflow:hidden;font-size:var(--wt-fs-caption);line-height:var(--wt-lh-caption);color:var(--wt-ink-tertiary);white-space:nowrap;text-overflow:ellipsis}',
      '.dsh-wt-addFoot .dsh-wt-addBtn{align-self:center}',
      '.dsh-wt-addBtn{display:inline-flex;align-self:flex-end;align-items:center;justify-content:center;flex:none;min-width:56px;height:28px;padding:0 var(--wt-space-3);border:0;border-radius:var(--wt-radius-sm);background:var(--wt-accent);color:var(--wt-accent-ink);font:inherit;font-size:var(--wt-fs-body-sm);font-weight:var(--wt-fw-semibold);line-height:1;cursor:pointer;transition:var(--wt-transition)}',
      '.dsh-wt-addBtn:hover{background:var(--wt-accent-hover)}',
      '.dsh-wt-addBtn:active{background:var(--wt-accent-active);transform:scale(.97)}',
      '.dsh-wt-addBtn:focus-visible{outline:var(--wt-focus-width) solid var(--wt-focus);outline-offset:2px}',
      '.dsh-wt-addBtn[disabled]{background:var(--wt-n-100);color:var(--wt-ink-tertiary);box-shadow:inset 0 0 0 1px var(--wt-line);cursor:not-allowed}',
      '.dsh-wt-addBtn[disabled]:hover{background:var(--wt-n-100)}',
      '.dsh-wt-addHint{margin:var(--wt-space-2) 0 0;font-size:var(--wt-fs-caption);line-height:var(--wt-lh-caption);color:var(--wt-ink-tertiary)}',
      '.dsh-wt-sectionHead{display:flex;align-items:center;justify-content:space-between;gap:var(--wt-space-3);margin:var(--wt-space-4) 0 var(--wt-space-2);min-height:24px}',
      '.dsh-wt-sectionName{display:flex;align-items:center;gap:var(--wt-space-2);font-size:var(--wt-fs-body-sm);line-height:var(--wt-lh-body-sm);font-weight:var(--wt-fw-semibold);color:var(--wt-ink)}',
      '.dsh-wt-sectionCount{display:inline-flex;align-items:center;justify-content:center;min-width:20px;height:16px;padding:0 var(--wt-space-1);border:1px solid var(--wt-line);border-radius:var(--wt-radius-pill);font-size:var(--wt-fs-caption);line-height:1;font-weight:var(--wt-fw-medium);color:var(--wt-ink-tertiary);font-variant-numeric:tabular-nums}',
      '.dsh-wt-clear{display:inline-flex;align-items:center;height:24px;margin-left:auto;padding:0 var(--wt-space-2);border:0;border-radius:var(--wt-radius-sm);background:transparent;color:var(--wt-ink-tertiary);font:inherit;font-size:var(--wt-fs-caption);line-height:1;font-weight:var(--wt-fw-medium);cursor:pointer;transition:var(--wt-transition)}',
      '.dsh-wt-clear:hover{background:var(--wt-n-200);color:var(--wt-ink)}',
      '.dsh-wt-clear:active{background:var(--wt-n-300)}',
      '.dsh-wt-clear:focus-visible{outline:var(--wt-focus-width) solid var(--wt-focus);outline-offset:2px}',
      '.dsh-wt-clear[disabled]{color:var(--wt-n-400);cursor:not-allowed;pointer-events:none}',
      '.dsh-wt-rows{list-style:none;margin:0;padding:0;border:1px solid var(--wt-line);border-radius:var(--wt-radius-md);background:var(--wt-n-100);overflow:hidden}',
      '.dsh-wt-row{display:flex;align-items:flex-start;gap:var(--wt-space-2);padding:var(--wt-space-2);border-top:1px solid var(--wt-line);transition:var(--wt-transition)}',
      '.dsh-wt-row:first-child{border-top:0}',
      '.dsh-wt-row:hover{background:var(--wt-n-200)}',
      '.dsh-wt-check{flex:none;display:flex;align-items:center;justify-content:center;width:24px;height:24px;margin:-2px 0 0;padding:0;border:0;border-radius:var(--wt-radius-pill);background:transparent;color:transparent;cursor:pointer;transition:var(--wt-transition)}',
      '.dsh-wt-check:focus-visible{outline:var(--wt-focus-width) solid var(--wt-focus);outline-offset:2px}',
      '.dsh-wt-checkCircle{display:flex;align-items:center;justify-content:center;width:14px;height:14px;box-sizing:border-box;border:1.5px solid var(--wt-n-700);border-radius:var(--wt-radius-pill);background:transparent;color:transparent;transition:border-color var(--wt-dur-fast) var(--wt-ease-standard),background-color var(--wt-dur-fast) var(--wt-ease-standard),color var(--wt-dur-fast) var(--wt-ease-standard),transform var(--wt-dur-fast) var(--wt-ease-standard)}',
      '.dsh-wt-check:hover .dsh-wt-checkCircle{border-color:var(--wt-accent);color:var(--wt-accent)}',
      '.dsh-wt-check:active .dsh-wt-checkCircle{transform:scale(.9)}',
      '.dsh-wt-check[aria-checked="true"] .dsh-wt-checkCircle{border-color:var(--wt-accent);background:var(--wt-accent);color:var(--wt-accent-ink)}',
      '.dsh-wt-itemBody{flex:1;min-width:0;display:flex;flex-direction:column;gap:var(--wt-space-1)}',
      '.dsh-wt-rowFoot{display:flex;align-items:center;justify-content:space-between;gap:var(--wt-space-2);min-height:24px}',
      '.dsh-wt-text{display:block;width:100%;margin:0;padding:0;border:0;background:transparent;color:var(--wt-ink);font:inherit;font-size:var(--wt-fs-body-sm);line-height:var(--wt-lh-body-sm);text-align:left;white-space:pre-wrap;overflow-wrap:anywhere;cursor:text;user-select:text;-webkit-user-select:text}',
      '.dsh-wt-text:focus-visible{outline:var(--wt-focus-width) solid var(--wt-focus);outline-offset:2px;border-radius:var(--wt-radius-sm)}',
      '.dsh-wt-meta{font-size:var(--wt-fs-caption);line-height:var(--wt-lh-caption);color:var(--wt-ink-tertiary);font-variant-numeric:tabular-nums}',
      '.dsh-wt-edit{display:flex;flex-direction:column;gap:var(--wt-space-1);width:100%}',
      '.dsh-wt-editInput{display:block;width:100%;box-sizing:border-box;min-height:20px;max-height:160px;padding:var(--wt-space-1) var(--wt-space-2);border:1px solid var(--wt-line-strong);border-radius:var(--wt-radius-sm);background:var(--wt-n-50);color:var(--wt-ink);font:inherit;font-size:var(--wt-fs-body-sm);line-height:var(--wt-lh-body-sm);outline:0;resize:none;overflow-y:auto;overflow-x:hidden;transition:var(--wt-transition)}',
      '.dsh-wt-editInput:focus{border-color:var(--wt-accent);box-shadow:var(--wt-shadow-ring)}',
      '.dsh-wt-editActions{display:flex;align-items:center;gap:var(--wt-space-1)}',
      '.dsh-wt-mini{display:inline-flex;align-items:center;justify-content:center;height:24px;padding:0 var(--wt-space-2);border:1px solid var(--wt-line);border-radius:var(--wt-radius-sm);background:var(--wt-n-50);color:var(--wt-ink-secondary);font:inherit;font-size:var(--wt-fs-caption);line-height:1;font-weight:var(--wt-fw-medium);cursor:pointer;transition:var(--wt-transition)}',
      '.dsh-wt-mini:hover{border-color:var(--wt-line-strong);background:var(--wt-n-100);color:var(--wt-ink)}',
      '.dsh-wt-mini:active{background:var(--wt-n-200);transform:scale(.97)}',
      '.dsh-wt-mini:focus-visible{outline:var(--wt-focus-width) solid var(--wt-focus);outline-offset:2px}',
      '.dsh-wt-mini[disabled]{border-color:var(--wt-n-200);color:var(--wt-n-400);cursor:not-allowed;pointer-events:none}',
      '.dsh-wt-miniPrimary{border-color:transparent;background:var(--wt-accent);color:var(--wt-accent-ink)}',
      '.dsh-wt-miniPrimary:hover{border-color:transparent;background:var(--wt-accent-hover);color:var(--wt-accent-ink)}',
      '.dsh-wt-miniPrimary:active{background:var(--wt-accent-active)}',
      '.dsh-wt-actions{display:flex;flex:none;gap:var(--wt-space-1);opacity:0;pointer-events:none;transition:opacity var(--wt-dur-fast) var(--wt-ease-standard)}',
      '.dsh-wt-row:hover .dsh-wt-actions,.dsh-wt-row:focus-within .dsh-wt-actions{opacity:1;pointer-events:auto}',
      '.dsh-wt-iconBtn{display:flex;align-items:center;justify-content:center;width:24px;height:24px;padding:0;border:0;border-radius:var(--wt-radius-sm);background:transparent;color:var(--wt-ink-tertiary);cursor:pointer;transition:var(--wt-transition)}',
      '.dsh-wt-iconBtn:hover{background:var(--wt-n-300);color:var(--wt-ink)}',
      '.dsh-wt-iconBtn:active{background:var(--wt-line-strong);transform:scale(.94)}',
      '.dsh-wt-iconBtn:focus-visible{outline:var(--wt-focus-width) solid var(--wt-focus);outline-offset:2px}',
      '.dsh-wt-iconBtn[disabled]{color:var(--wt-n-400);cursor:not-allowed;pointer-events:none}',
      '.dsh-wt-iconBtnDanger:hover{background:var(--wt-danger-soft);color:var(--wt-danger)}',
      '.dsh-wt-iconBtn.dsh-wt-copied,.dsh-wt-iconBtn.dsh-wt-forwarded{background:var(--wt-success-soft);color:var(--wt-success)}',
      '.dsh-wt-rowDone .dsh-wt-text{color:var(--wt-ink-tertiary);text-decoration:line-through;text-decoration-thickness:1px;text-decoration-color:var(--wt-line-strong)}',
      '.dsh-wt-doneHead{display:flex;align-items:center;justify-content:space-between;gap:var(--wt-space-3);margin:var(--wt-space-3) 0 0}',
      '.dsh-wt-doneToggle{display:flex;align-items:center;gap:var(--wt-space-2);flex:none;width:auto;min-width:0;margin:0;padding:var(--wt-space-1) var(--wt-space-2) var(--wt-space-1) 0;border:0;border-radius:var(--wt-radius-sm);background:transparent;color:var(--wt-ink-secondary);font:inherit;font-size:var(--wt-fs-body-sm);line-height:var(--wt-lh-body-sm);font-weight:var(--wt-fw-semibold);text-align:left;cursor:pointer;transition:var(--wt-transition)}',
      '.dsh-wt-doneToggle:hover{background:var(--wt-n-200);color:var(--wt-ink)}',
      '.dsh-wt-doneToggle:active{background:var(--wt-n-300)}',
      '.dsh-wt-doneToggle:focus-visible{outline:var(--wt-focus-width) solid var(--wt-focus);outline-offset:2px}',
      '.dsh-wt-doneToggle[disabled]{color:var(--wt-n-400);cursor:not-allowed;pointer-events:none}',
      '.dsh-wt-chevron{display:flex;align-items:center;justify-content:center;flex:none;width:16px;height:16px;transition:transform var(--wt-dur-fast) var(--wt-ease-standard)}',
      '.dsh-wt-chevron[data-open="true"]{transform:rotate(90deg)}',
      '.dsh-wt-doneRows{margin-top:var(--wt-space-2)}',
      '.dsh-wt-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:var(--wt-space-2);padding:var(--wt-space-6) var(--wt-space-4);border:1px dashed var(--wt-line);border-radius:var(--wt-radius-md);text-align:center}',
      '.dsh-wt-emptyIcon{display:flex;align-items:center;justify-content:center;width:32px;height:32px;margin:0 0 var(--wt-space-1);border-radius:var(--wt-radius-sm);background:var(--wt-n-200);color:var(--wt-ink-tertiary)}',
      '.dsh-wt-emptyTitle{font-size:var(--wt-fs-body-sm);line-height:var(--wt-lh-body-sm);font-weight:var(--wt-fw-semibold);color:var(--wt-ink)}',
      '.dsh-wt-emptyBody{max-width:36ch;font-size:var(--wt-fs-body-sm);line-height:var(--wt-lh-body-sm);color:var(--wt-ink-secondary);overflow-wrap:anywhere}',
      '.dsh-wt-footer{display:flex;align-items:center;justify-content:space-between;gap:var(--wt-space-4);margin:var(--wt-space-5) 0 0;font-size:var(--wt-fs-caption);line-height:var(--wt-lh-caption);color:var(--wt-ink-tertiary)}',
      '.dsh-wt-footRight{flex:none;font-variant-numeric:tabular-nums}',
      '.dsh-wt-heroBtn{display:inline-flex;align-items:center;gap:var(--wt-space-1);min-height:28px;padding:0 var(--wt-space-2);border:0;border-radius:var(--wt-radius-sm);background:transparent;color:var(--wt-ink);font:inherit;font-size:var(--wt-fs-body-sm);line-height:var(--wt-lh-body-sm);font-weight:var(--wt-fw-medium);cursor:pointer;transition:var(--wt-transition)}',
      '.dsh-wt-heroBtn:hover{background:var(--wt-n-200)}',
      '.dsh-wt-heroBtn:active{background:var(--wt-n-300)}',
      '.dsh-wt-heroBtn:focus-visible{outline:var(--wt-focus-width) solid var(--wt-focus);outline-offset:2px}',
      '.dsh-wt-heroIcon{display:flex;align-items:center;justify-content:center;flex:none;width:16px;height:16px;color:currentColor}',
      '.dsh-wt-heroLabel{white-space:nowrap}',
      '.dsh-wt-heroCount{display:inline-flex;align-items:center;justify-content:center;min-width:16px;height:16px;padding:0 var(--wt-space-1);border:1px solid var(--wt-line);border-radius:var(--wt-radius-pill);background:var(--wt-n-200);color:var(--wt-ink-secondary);font-size:var(--wt-fs-caption);line-height:1;font-variant-numeric:tabular-nums}',
      '.dsh-wt-footerBtn{display:inline-flex;align-items:center;gap:var(--wt-space-1);height:24px;padding:0 var(--wt-space-2);border:0;border-radius:var(--wt-radius-sm);background:transparent;color:var(--wt-ink-tertiary);font:inherit;font-size:var(--wt-fs-caption);line-height:1;cursor:pointer;order:1;transition:var(--wt-transition)}',
      '.dsh-wt-footerBtn:hover{background:var(--wt-n-200);color:var(--wt-ink)}',
      '.dsh-wt-footerBtn:active{background:var(--wt-n-300)}',
      '.dsh-wt-footerBtn:focus-visible{outline:var(--wt-focus-width) solid var(--wt-focus);outline-offset:2px}',
      '.dsh-wt-footerIcon{display:flex;align-items:center;justify-content:center;flex:none;width:14px;height:14px;color:currentColor}',
      '.dsh-wt-footerLabel{white-space:nowrap}',
      '.dsh-wt-footerCount{display:inline-flex;align-items:center;justify-content:center;min-width:16px;height:16px;padding:0 var(--wt-space-1);border:1px solid var(--wt-line);border-radius:var(--wt-radius-pill);background:var(--wt-n-200);color:var(--wt-ink-secondary);font-size:var(--wt-fs-caption);line-height:1;font-variant-numeric:tabular-nums}',
      '.dsh-wt-badge{display:inline-flex;align-items:center;gap:var(--wt-space-1);height:18px;padding:0 var(--wt-space-2);border:0;border-radius:var(--wt-radius-pill);background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary);font:inherit;font-size:var(--wt-fs-caption);line-height:1;cursor:pointer;white-space:nowrap;flex:none;transition:var(--wt-transition)}',
      '.dsh-wt-badge:hover{background:var(--dsw-alias-interactive-bg-hover-solid);color:var(--dsw-alias-label-primary)}',
      '.dsh-wt-badge:active{transform:scale(.97)}',
      '.dsh-wt-badge:focus-visible{outline:var(--wt-focus-width) solid var(--wt-focus);outline-offset:2px}',
      '.dsh-wt-badgeCount{font-variant-numeric:tabular-nums;color:var(--dsw-alias-label-secondary)}',
      '.dsh-wt-headerBtn{position:relative;display:inline-flex;align-items:center;justify-content:center;flex:none;width:28px;height:28px;padding:0;border:0;border-radius:var(--wt-radius-sm);background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:var(--wt-fs-caption);line-height:1;cursor:pointer;transition:var(--wt-transition)}',
      '.dsh-wt-headerBtn:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}',
      '.dsh-wt-headerBtn:active{background:var(--dsw-alias-interactive-bg-hover-solid);transform:scale(.94)}',
      '.dsh-wt-headerBtn:focus-visible{outline:var(--wt-focus-width) solid var(--wt-focus);outline-offset:2px}',
      '.dsh-wt-headerBtn[data-active="true"]{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}',
      '.dsh-wt-headerBtn[disabled],.dsh-wt-headerBtn[data-disabled="true"]{opacity:.45;cursor:not-allowed;pointer-events:none}',
      '.dsh-wt-headerIcon{display:flex;align-items:center;justify-content:center;flex:none;width:16px;height:16px;color:currentColor}',
      '.dsh-wt-headerCount{position:absolute;top:-2px;right:-2px;box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;min-width:16px;height:16px;padding:0 var(--wt-space-1);border:1px solid var(--dsw-alias-bg-base);border-radius:var(--wt-radius-pill);background:var(--dsw-alias-interactive-bg-hover-solid);color:var(--dsw-alias-label-secondary);font-size:var(--wt-fs-caption);line-height:1;font-weight:var(--wt-fw-medium);font-variant-numeric:tabular-nums}',
      '.dsh-wt-dockBtn{display:inline-flex;align-items:center;gap:var(--wt-space-1);flex:none;height:24px;padding:0 var(--wt-space-2);border:0;border-radius:var(--wt-radius-sm);background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:var(--wt-fs-caption);line-height:1;cursor:pointer;order:99;white-space:nowrap;transition:var(--wt-transition)}',
      '.dsh-wt-dockBtn:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}',
      '.dsh-wt-dockBtn:active{background:var(--dsw-alias-interactive-bg-hover-solid);transform:scale(.97)}',
      '.dsh-wt-dockBtn:focus-visible{outline:var(--wt-focus-width) solid var(--wt-focus);outline-offset:2px}',
      '.dsh-wt-dockIcon{display:flex;align-items:center;justify-content:center;flex:none;width:14px;height:14px;color:currentColor}',
      '.dsh-wt-dockCount{font-size:var(--wt-fs-caption);line-height:1;font-variant-numeric:tabular-nums}',
      '[data-row-key^="session:"]:has(> .dsh-wt-badge) > [class*="_title"]{flex:0 1 auto}',
      '[data-row-key^="session:"]:has(> .dsh-wt-badge) > [class*="_time"]{display:none}',
      '/* ── 浮层 · 最大元素用中等圆角 + 多层浅阴影 ────────────────────── */',
      '.dsh-wt-popover{position:fixed;z-index:1000;box-sizing:border-box;display:flex;flex-direction:column;min-height:0;padding:var(--wt-space-4);border:1px solid var(--wt-line);border-radius:var(--wt-radius-md);background:var(--wt-surface);box-shadow:var(--wt-shadow-float);color:var(--wt-ink);font-size:var(--wt-fs-body-sm);line-height:var(--wt-lh-body-sm);gap:var(--wt-space-3);overflow:hidden;animation:dsh-wt-pop-in var(--wt-dur-base) var(--wt-ease-out) both}',
      '.dsh-wt-popoverRight{padding-left:var(--wt-space-4)}',
      '.dsh-wt-resizeHandle{position:absolute;left:0;top:0;bottom:0;z-index:2;display:flex;align-items:center;justify-content:center;width:8px;cursor:ew-resize;touch-action:none;outline:0}',
      '.dsh-wt-resizeHandle::before{content:"";width:3px;height:32px;border-radius:var(--wt-radius-pill);background:var(--wt-line-strong);opacity:.7;transition:transform var(--wt-dur-fast) var(--wt-ease-standard),background-color var(--wt-dur-fast) var(--wt-ease-standard),opacity var(--wt-dur-fast) var(--wt-ease-standard)}',
      '.dsh-wt-resizeHandle:hover::before,.dsh-wt-resizeHandle:focus-visible::before{transform:scaleY(1.4);background:var(--wt-ink-tertiary);opacity:1}',
      '.dsh-wt-resizeHandle:focus-visible{outline:var(--wt-focus-width) solid var(--wt-focus);outline-offset:-2px;border-radius:var(--wt-radius-sm)}',
      '.dsh-wt-resizeHandleBottom{position:absolute;left:50%;bottom:0;z-index:2;display:flex;align-items:center;justify-content:center;width:48px;height:12px;transform:translateX(-50%);cursor:ns-resize;touch-action:none;outline:0}',
      '.dsh-wt-resizeHandleBottom::before{content:"";width:24px;height:3px;border-radius:var(--wt-radius-pill);background:var(--wt-line-strong);opacity:.7;transition:transform var(--wt-dur-fast) var(--wt-ease-standard),background-color var(--wt-dur-fast) var(--wt-ease-standard),opacity var(--wt-dur-fast) var(--wt-ease-standard)}',
      '.dsh-wt-resizeHandleBottom:hover::before,.dsh-wt-resizeHandleBottom:focus-visible::before{transform:scaleX(1.4);background:var(--wt-ink-tertiary);opacity:1}',
      '.dsh-wt-resizeHandleBottom:focus-visible{outline:var(--wt-focus-width) solid var(--wt-focus);outline-offset:-2px;border-radius:var(--wt-radius-sm)}',
      '.dsh-wt-popHead{display:flex;align-items:flex-start;justify-content:space-between;gap:var(--wt-space-3);margin:0 0 var(--wt-space-3)}',
      '.dsh-wt-popTitleLine{display:flex;align-items:center;gap:var(--wt-space-1)}',
      '.dsh-wt-popTitle{font-size:var(--wt-fs-body);line-height:20px;font-weight:var(--wt-fw-semibold);letter-spacing:-.01em;color:var(--wt-ink)}',
      '.dsh-wt-popMeta{margin:var(--wt-space-1) 0 0;font-size:var(--wt-fs-caption);line-height:var(--wt-lh-caption);color:var(--wt-ink-tertiary)}',
      '.dsh-wt-popClose{display:grid;place-items:center;flex:none;width:24px;height:24px;padding:0;border:0;border-radius:var(--wt-radius-sm);background:transparent;color:var(--wt-ink-tertiary);font:inherit;font-size:var(--wt-fs-body);line-height:1;cursor:pointer;transition:var(--wt-transition)}',
      '.dsh-wt-popClose:hover{background:var(--wt-n-200);color:var(--wt-ink)}',
      '.dsh-wt-popClose:active{background:var(--wt-n-300);transform:scale(.94)}',
      '.dsh-wt-popClose:focus-visible{outline:var(--wt-focus-width) solid var(--wt-focus);outline-offset:2px}',
      '.dsh-wt-settingsBtn{display:grid;place-items:center;flex:none;width:24px;height:24px;padding:0;border:0;border-radius:var(--wt-radius-sm);background:transparent;color:var(--wt-ink-tertiary);cursor:pointer;transition:var(--wt-transition)}',
      '.dsh-wt-settingsBtn:hover,.dsh-wt-settingsBtn[data-active="true"]{background:var(--wt-n-200);color:var(--wt-ink)}',
      '.dsh-wt-settingsBtn:active{background:var(--wt-n-300);transform:scale(.94)}',
      '.dsh-wt-settingsBtn:focus-visible{outline:var(--wt-focus-width) solid var(--wt-focus);outline-offset:2px}',
      '.dsh-wt-settings{--dsh-wt-settingIndent:var(--wt-space-3);margin:0 0 var(--wt-space-3);padding:var(--wt-space-3);border:1px solid var(--wt-line);border-radius:var(--wt-radius-md);background:var(--wt-n-100)}',
      '.dsh-wt-settingsHead{margin:0 0 var(--wt-space-2);font-size:var(--wt-fs-body-sm);line-height:var(--wt-lh-body-sm);font-weight:var(--wt-fw-semibold);color:var(--wt-ink)}',
      '.dsh-wt-settingLabel{display:block;margin:0;font-size:var(--wt-fs-caption);line-height:var(--wt-lh-caption);font-weight:var(--wt-fw-medium);color:var(--wt-ink-tertiary)}',
      '.dsh-wt-settingChoices{display:flex;flex-direction:column;gap:var(--wt-space-1)}',
      '.dsh-wt-settingChoice{display:flex;align-items:flex-start;gap:var(--wt-space-2);font-size:var(--wt-fs-body-sm);line-height:var(--wt-lh-body-sm);color:var(--wt-ink);cursor:pointer}',
      '.dsh-wt-settingChoice input{appearance:none;flex:none;width:14px;height:14px;margin:2px 0 0;box-sizing:border-box;border:1.5px solid var(--wt-n-700);border-radius:var(--wt-radius-pill);background:transparent;cursor:pointer;transition:var(--wt-transition)}',
      '.dsh-wt-settingChoice input:hover{border-color:var(--wt-accent)}',
      '.dsh-wt-settingChoice input:checked{border-color:var(--wt-accent);background:var(--wt-accent);box-shadow:inset 0 0 0 3px var(--wt-surface)}',
      '.dsh-wt-settingChoice input:focus-visible{outline:var(--wt-focus-width) solid var(--wt-focus);outline-offset:2px}',
      '.dsh-wt-settingInput{box-sizing:border-box;width:100%;height:28px;padding:0 var(--wt-space-2);border:1px solid var(--wt-line);border-radius:var(--wt-radius-sm);background:var(--wt-n-50);color:var(--wt-ink);font:inherit;font-size:var(--wt-fs-body-sm);line-height:1;outline:0;transition:var(--wt-transition)}',
      '.dsh-wt-settingInput:focus{border-color:var(--wt-accent);box-shadow:var(--wt-shadow-ring)}',
      '.dsh-wt-settingHint{margin:0;font-size:var(--wt-fs-caption);line-height:var(--wt-lh-caption);color:var(--wt-ink-tertiary)}',
      '.dsh-wt-popFoot{margin:var(--wt-space-3) 0 0;font-size:var(--wt-fs-caption);line-height:var(--wt-lh-caption);color:var(--wt-ink-tertiary)}',
      '.dsh-wt-popover .dsh-wt-add{margin:0}',
      '.dsh-wt-popover .dsh-wt-popHead{margin:0}',
      '.dsh-wt-popover .dsh-wt-popFoot{margin:0}',
      '.dsh-wt-popover .dsh-wt-addHint{display:none}',
      '.dsh-wt-popover .dsh-wt-sectionHead{position:sticky;top:0;z-index:1;margin:0;padding:var(--wt-space-1) 0;background:var(--wt-surface)}',
      '.dsh-wt-popover > *{flex:none}',
      '.dsh-wt-popover .dsh-wt-rows{flex:none;min-height:0;overflow:visible}',
      '.dsh-wt-popover .dsh-wt-doneHead{position:sticky;top:0;z-index:1;margin:0;padding:var(--wt-space-1) 0;background:var(--wt-surface)}',
      '.dsh-wt-popover .dsh-wt-empty{padding:var(--wt-space-5) var(--wt-space-3)}',
      '.dsh-wt-popover .dsh-wt-doneRows{margin-top:0}',
      '.dsh-wt-popoverRight .dsh-wt-popFoot{margin-top:auto}',
      '.dsh-wt-page .dsh-wt-text,.dsh-wt-page .dsh-wt-input{font-size:var(--wt-fs-body);line-height:var(--wt-lh-body)}',
      '.dsh-wt-page .dsh-wt-row{padding:var(--wt-space-3)}',
      '.dsh-wt-page .dsh-wt-add{padding:var(--wt-space-4)}',
      '.dsh-wt-error{color:var(--wt-warn)}',
      '/* ── 状态补全：加载态（可复用，不占位） ────────────────────────── */',
      '[data-loading="true"]{position:relative;color:transparent!important;pointer-events:none;cursor:progress}',
      '[data-loading="true"]>*{visibility:hidden}',
      '[data-loading="true"]::after{content:"";position:absolute;left:50%;top:50%;box-sizing:border-box;width:12px;height:12px;margin:-6px 0 0 -6px;border:1.5px solid var(--wt-ink-secondary);border-top-color:transparent;border-radius:var(--wt-radius-pill);animation:dsh-wt-spin var(--wt-dur-loop) linear infinite}',
      '.dsh-wt-addBtn[data-loading="true"]::after,.dsh-wt-miniPrimary[data-loading="true"]::after{border-color:var(--wt-accent-ink);border-top-color:transparent}',
      '/* ── 动效：只动位置 / 缩放 / 透明度，列表依次出场 ───────────────── */',
      '@media (prefers-reduced-motion:no-preference){.dsh-wt-rows > .dsh-wt-row{animation:dsh-wt-row-in var(--wt-dur-base) var(--wt-ease-out) both}.dsh-wt-rows > .dsh-wt-row:nth-child(1){animation-delay:0ms}.dsh-wt-rows > .dsh-wt-row:nth-child(2){animation-delay:var(--wt-stagger)}.dsh-wt-rows > .dsh-wt-row:nth-child(3){animation-delay:calc(var(--wt-stagger) * 2)}.dsh-wt-rows > .dsh-wt-row:nth-child(4){animation-delay:calc(var(--wt-stagger) * 3)}.dsh-wt-rows > .dsh-wt-row:nth-child(5){animation-delay:calc(var(--wt-stagger) * 4)}.dsh-wt-rows > .dsh-wt-row:nth-child(6){animation-delay:calc(var(--wt-stagger) * 5)}.dsh-wt-rows > .dsh-wt-row:nth-child(6){animation-delay:calc(var(--wt-stagger) * 5)}.dsh-wt-rows > .dsh-wt-row:nth-child(n+7){animation-delay:calc(var(--wt-stagger) * 5)}}',
      '@keyframes dsh-wt-pop-in{from{opacity:0;transform:translateY(-4px) scale(.985)}to{opacity:1;transform:none}}',
      '@keyframes dsh-wt-row-in{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}',
      '@keyframes dsh-wt-spin{to{transform:rotate(360deg)}}',
      '@media (prefers-reduced-motion:reduce){.dsh-wt-popover,.dsh-wt-rows > .dsh-wt-row,.dsh-wt-chevron,.dsh-wt-fill{animation:none;transition-duration:1ms}}',
      '@media (max-width:640px){.dsh-wt-shell{padding:var(--wt-space-5) var(--wt-space-4) var(--wt-space-8)}.dsh-wt-head{gap:var(--wt-space-4)}.dsh-wt-title{font-size:var(--wt-fs-heading);line-height:var(--wt-lh-heading)}.dsh-wt-statNum{font-size:var(--wt-fs-heading);line-height:var(--wt-lh-heading)}.dsh-wt-select{max-width:210px}}',
      '@media (hover:none){.dsh-wt-actions{opacity:1;pointer-events:auto}}',
      '/* ── main 1.6.x 新增结构：滚动区 / 分组 / 半勾 / 转发态 ─────────── */',
      '.dsh-wt-listArea{display:flex;flex-direction:column;flex:1 1 auto;min-height:0;overflow-x:hidden;overflow-y:auto;scrollbar-width:thin;scrollbar-color:var(--wt-line) transparent}',
      '.dsh-wt-listArea::-webkit-scrollbar{width:6px;height:6px}',
      '.dsh-wt-listArea::-webkit-scrollbar-track{background:transparent}',
      '.dsh-wt-listArea::-webkit-scrollbar-thumb{border-radius:var(--wt-radius-pill);background-color:var(--wt-line)}',
      '.dsh-wt-listArea::-webkit-scrollbar-thumb:hover{background-color:var(--wt-ink-tertiary)}',
      '.dsh-wt-listSection{display:flex;flex-direction:column;gap:var(--wt-space-2);min-width:0}',
      '.dsh-wt-listSection+.dsh-wt-listSection{margin-top:var(--wt-space-1)}',
      '.dsh-wt-rowLeaving{pointer-events:none;opacity:0;transform:translateY(-2px) scale(.985);transition:opacity var(--wt-dur-base) var(--wt-ease-standard),transform var(--wt-dur-base) var(--wt-ease-standard)}',
      '.dsh-wt-rowHint{margin:var(--wt-space-1) 0 0;min-height:28px;font-size:var(--wt-fs-caption);line-height:var(--wt-lh-caption);font-weight:var(--wt-fw-medium);color:var(--wt-ink-secondary);white-space:normal;overflow-wrap:anywhere}',
      '.dsh-wt-checkHalf .dsh-wt-checkCircle{border-color:var(--wt-accent);background:linear-gradient(90deg,var(--wt-accent) 50%,transparent 50%)}',
      '.dsh-wt-checkForwarded[aria-checked="true"] .dsh-wt-checkCircle{border-color:var(--wt-ink-tertiary);background:var(--wt-ink-tertiary);color:var(--wt-accent-ink)}',
      '.dsh-wt-editActions .dsh-wt-mini{flex:none}',
      '.dsh-wt-editHint{flex:1 1 auto;min-width:0;margin-left:auto;overflow:hidden;font-size:var(--wt-fs-caption);line-height:var(--wt-lh-caption);text-align:right;color:var(--wt-ink-tertiary);white-space:nowrap;text-overflow:ellipsis}',
      '.dsh-wt-settingGroup{display:flex;flex-direction:column;gap:var(--wt-space-1)}',
      '.dsh-wt-settingGroup+.dsh-wt-settingGroup{margin-top:var(--wt-space-2);padding-top:var(--wt-space-2);border-top:1px solid var(--wt-line)}',
      '.dsh-wt-settingItem{display:flex;flex-direction:column;gap:var(--wt-space-1);min-width:0}',
      '.dsh-wt-settingItem+.dsh-wt-settingItem{margin-top:var(--wt-space-2);padding-top:var(--wt-space-2);border-top:1px solid var(--wt-line)}',
      '.dsh-wt-settingItemLabel{font-size:var(--wt-fs-body-sm);line-height:var(--wt-lh-body-sm);font-weight:var(--wt-fw-medium);color:var(--wt-ink)}',
      '.dsh-wt-settingBody{display:flex;flex-direction:column;gap:var(--wt-space-1);padding-left:var(--dsh-wt-settingIndent)}',
      '.dsh-wt-settingHintNote{margin-top:var(--wt-space-1)}',
      '.dsh-wt-settingAbout{display:flex;align-items:baseline;gap:var(--wt-space-1);min-width:0;overflow:hidden;font-size:var(--wt-fs-caption);line-height:var(--wt-lh-caption);color:var(--wt-ink-tertiary);white-space:nowrap}',
      '.dsh-wt-settingAbout>span{flex:none}',
      '.dsh-wt-settingDot{opacity:.7}',
      '.dsh-wt-settingLink{min-width:0;overflow:hidden;color:var(--wt-ink);text-decoration:underline;text-decoration-color:var(--wt-line-strong);text-underline-offset:2px;text-overflow:ellipsis;transition:var(--wt-transition)}',
      '.dsh-wt-settingLink:hover{text-decoration-color:var(--wt-ink)}',
      '.dsh-wt-popover .dsh-wt-check{margin-top:calc((20px - 24px) / 2)}',
      '.dsh-wt-popover .dsh-wt-rowHint{font-size:var(--wt-fs-caption);line-height:var(--wt-lh-caption);min-height:28px}',
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

    /** Copy plain text, with a synchronous fallback for restricted clipboards. */
    async function copyText(text) {
      try {
        if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
          await navigator.clipboard.writeText(text)
          return true
        }
      } catch (error) {
        /* fall through to execCommand */
      }
      try {
        const area = document.createElement('textarea')
        area.value = text
        area.setAttribute('readonly', '')
        area.style.position = 'fixed'
        area.style.opacity = '0'
        document.body.appendChild(area)
        area.select()
        const ok = document.execCommand('copy')
        area.remove()
        return ok
      } catch (error) {
        return false
      }
    }

    /** Append one note to the conversation composer (Lexical contenteditable or textarea). */
    function appendToConversation(text, prefix = FORWARD_PREFIX) {
      const note = String(text || '').replace(/^\s+|\s+$/g, '')
      if (!note) return false
      const bullet = `- ${note}`
      const lead = prefix ? String(prefix).trim() : ''
      const emptyBlock = lead ? `${lead}\n${bullet}` : bullet
      const visible = node => {
        const rect = node.getBoundingClientRect()
        return rect.width > 0 && rect.height > 0
      }
      const specific = [...document.querySelectorAll('[data-composer-input]')].filter(visible)
      const editor = (specific.length
        ? specific
        : [...document.querySelectorAll('[contenteditable="true"][role="textbox"], textarea[role="textbox"]')].filter(visible))[0]
      if (!editor) return false
      /** Payload for a composer whose current plain text is `current`. */
      const payloadFor = current => {
        const value = typeof current === 'string' ? current : ''
        if (!value.trim()) return emptyBlock
        return value.endsWith('\n') ? bullet : `\n${bullet}`
      }

      if (editor.tagName === 'TEXTAREA') {
        const current = editor.value
        const payload = payloadFor(current)
        const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set
        setter.call(editor, `${current}${payload}`)
        editor.dispatchEvent(new Event('input', { bubbles: true }))
        editor.focus()
        const end = editor.value.length
        editor.setSelectionRange(end, end)
        return true
      }

      const current = typeof editor.innerText === 'string' ? editor.innerText : ''
      const payload = payloadFor(current)
      editor.focus()
      try {
        const range = document.createRange()
        range.selectNodeContents(editor)
        range.collapse(false)
        const selection = window.getSelection()
        selection.removeAllRanges()
        selection.addRange(range)
      } catch (error) {
        /* selection is best effort */
      }
      try {
        const data = new DataTransfer()
        data.setData('text/plain', payload)
        const event = new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: data })
        const notHandled = editor.dispatchEvent(event)
        if (!notHandled) return true
      } catch (error) {
        /* fall through to execCommand */
      }
      try {
        return document.execCommand('insertText', false, payload)
      } catch (error) {
        return false
      }
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

    /** Empty session-scoped store. */
    function emptySessionStore() {
      return { version: 1, sessions: {} }
    }

    /** Read the whole session memo store; corrupt or unavailable reads as empty. */
    function readSessionStore() {
      const ls = storage()
      if (!ls) return emptySessionStore()
      try {
        const raw = ls.getItem(SESSION_STORAGE_KEY)
        if (!raw) return emptySessionStore()
        const parsed = JSON.parse(raw)
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return emptySessionStore()
        const sessions = parsed.sessions
        if (!sessions || typeof sessions !== 'object' || Array.isArray(sessions)) return emptySessionStore()
        return { version: 1, sessions }
      } catch (error) {
        return emptySessionStore()
      }
    }

    /** Read the persisted right-panel width, clamped for the current viewport. */
    function readPanelWidth() {
      const ls = storage()
      const max = Math.min(PANEL_MAX_WIDTH, Math.max(PANEL_MIN_WIDTH, window.innerWidth - 32))
      try {
        const saved = ls && Number(ls.getItem(PANEL_WIDTH_KEY))
        if (Number.isFinite(saved) && saved > 0) return Math.max(PANEL_MIN_WIDTH, Math.min(max, saved))
      } catch (error) {
        /* fall through */
      }
      return Math.max(PANEL_MIN_WIDTH, Math.min(max, PANEL_DEFAULT_WIDTH))
    }

    /** Persist the right-panel width so it survives reopening the popover. */
    function writePanelWidth(width) {
      const ls = storage()
      if (!ls) return
      try {
        ls.setItem(PANEL_WIDTH_KEY, String(Math.round(width)))
      } catch (error) {
        /* storage is best effort */
      }
    }

    /** Read the persisted right-panel height; 0 means content-sized. */
    function readPanelHeight() {
      const ls = storage()
      try {
        const saved = ls && Number(ls.getItem(PANEL_HEIGHT_KEY))
        if (Number.isFinite(saved) && saved > 0) return saved
      } catch (error) {
        /* fall through */
      }
      return 0
    }

    /** Persist the right-panel height; 0 restores content sizing. */
    function writePanelHeight(height) {
      const ls = storage()
      if (!ls) return
      try {
        if (height > 0) ls.setItem(PANEL_HEIGHT_KEY, String(Math.round(height)))
        else ls.removeItem(PANEL_HEIGHT_KEY)
      } catch (error) {
        /* storage is best effort */
      }
    }

    /** Read the Enter-to-send preference. */
    function readSendShortcut() {
      try {
        const saved = storage() && storage().getItem(SEND_SHORTCUT_KEY)
        return saved === 'enter' || saved === 'ctrl-enter' ? saved : SEND_SHORTCUT_DEFAULT
      } catch (error) {
        return SEND_SHORTCUT_DEFAULT
      }
    }

    function writeSendShortcut(value) {
      try {
        storage() && storage().setItem(SEND_SHORTCUT_KEY, value === 'enter' ? 'enter' : 'ctrl-enter')
      } catch (error) {
        /* storage is best effort */
      }
    }

    /** Read the user's forward lead-in; an empty string means no prefix. */
    function readForwardPrefix() {
      try {
        const raw = storage() && storage().getItem('dsh.memo.forward-prefix.v1')
        return typeof raw === 'string' ? raw.slice(0, 80) : FORWARD_PREFIX
      } catch (error) {
        return FORWARD_PREFIX
      }
    }

    function writeForwardPrefix(value) {
      try {
        storage() && storage().setItem('dsh.memo.forward-prefix.v1', String(value || '').slice(0, 80))
      } catch (error) {
        /* storage is best effort */
      }
    }

    /** Remembered section state; corrupt or missing storage falls back to defaults. */
    function readSectionState() {
      const fallback = { open: SECTION_STATE_DEFAULT.open, done: SECTION_STATE_DEFAULT.done }
      const ls = storage()
      if (!ls) return fallback
      try {
        const raw = ls.getItem(SECTION_STATE_KEY)
        if (!raw) return fallback
        const saved = JSON.parse(raw)
        if (!saved || typeof saved !== 'object') return fallback
        return {
          open: typeof saved.open === 'boolean' ? saved.open : fallback.open,
          done: typeof saved.done === 'boolean' ? saved.done : fallback.done,
        }
      } catch (error) {
        return fallback
      }
    }

    /** Persist the section state immediately; storage failures are ignored. */
    function writeSectionState(state) {
      const ls = storage()
      if (!ls) return
      try {
        ls.setItem(SECTION_STATE_KEY, JSON.stringify({ open: state.open === true, done: state.done === true }))
      } catch (error) {
        /* storage is best effort */
      }
    }

    /** Empty unsaved-draft store. */
    function emptyDraftStore() {
      return { version: 1, sessions: {} }
    }

    /** Read the unsaved add/edit drafts; corrupt or unavailable reads as empty. */
    function readDraftStore() {
      const ls = storage()
      if (!ls) return emptyDraftStore()
      try {
        const raw = ls.getItem(DRAFT_STORAGE_KEY)
        if (!raw) return emptyDraftStore()
        const parsed = JSON.parse(raw)
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return emptyDraftStore()
        const sessions = parsed.sessions
        if (!sessions || typeof sessions !== 'object' || Array.isArray(sessions)) return emptyDraftStore()
        return { version: 1, sessions }
      } catch (error) {
        return emptyDraftStore()
      }
    }

    function writeDraftStore(store) {
      const ls = storage()
      if (!ls) return
      try {
        ls.setItem(DRAFT_STORAGE_KEY, JSON.stringify(store))
      } catch (error) {
        /* storage is best effort */
      }
    }

    function readSessionDrafts(sessionId) {
      const key = sessionId ? String(sessionId) : ''
      const record = key ? readDraftStore().sessions[key] : null
      if (!record || typeof record !== 'object' || Array.isArray(record)) {
        return { add: '', edits: {} }
      }
      return {
        add: typeof record.add === 'string' ? record.add : '',
        edits: record.edits && typeof record.edits === 'object' && !Array.isArray(record.edits)
          ? record.edits
          : {},
      }
    }

    function pruneDraftSession(store, sessionId) {
      const record = store.sessions[sessionId]
      if (!record) return
      const hasAdd = typeof record.add === 'string' && record.add.length > 0
      const hasEdits = record.edits && typeof record.edits === 'object' && Object.keys(record.edits).length > 0
      if (!hasAdd && !hasEdits) delete store.sessions[sessionId]
    }

    function saveAddDraft(sessionId, text) {
      const key = sessionId ? String(sessionId) : ''
      if (!key) return
      const store = readDraftStore()
      const record = store.sessions[key] || {}
      const value = String(text || '').slice(0, MAX_TEXT)
      if (value) record.add = value
      else delete record.add
      record.edits = record.edits && typeof record.edits === 'object' ? record.edits : {}
      store.sessions[key] = record
      pruneDraftSession(store, key)
      writeDraftStore(store)
    }

    function clearAddDraft(sessionId) {
      saveAddDraft(sessionId, '')
    }

    function readEditDraft(sessionId, itemId) {
      const key = sessionId ? String(sessionId) : ''
      if (!key || !itemId) return null
      const edits = readSessionDrafts(key).edits
      return typeof edits[itemId] === 'string' ? edits[itemId] : null
    }

    function saveEditDraft(sessionId, itemId, text) {
      const key = sessionId ? String(sessionId) : ''
      if (!key || !itemId) return
      const store = readDraftStore()
      const record = store.sessions[key] || {}
      record.edits = record.edits && typeof record.edits === 'object' ? record.edits : {}
      record.edits[itemId] = String(text || '').slice(0, MAX_TEXT)
      store.sessions[key] = record
      writeDraftStore(store)
    }

    function clearEditDraft(sessionId, itemId) {
      const key = sessionId ? String(sessionId) : ''
      if (!key || !itemId) return
      const store = readDraftStore()
      const record = store.sessions[key]
      if (!record || !record.edits || typeof record.edits !== 'object') return
      delete record.edits[itemId]
      pruneDraftSession(store, key)
      writeDraftStore(store)
    }

    /** Empty forwarded-flag store; shape is { version, sessions: { [sessionId]: { [itemId]: true } } }. */
    function emptyForwardedStore() {
      return { version: 1, sessions: {} }
    }

    /** Read the forwarded-flag store; corrupt or unavailable reads as empty. */
    function readForwardedStore() {
      const ls = storage()
      if (!ls) return emptyForwardedStore()
      try {
        const raw = ls.getItem(FORWARDED_STORAGE_KEY)
        if (!raw) return emptyForwardedStore()
        const parsed = JSON.parse(raw)
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return emptyForwardedStore()
        const sessions = parsed.sessions
        if (!sessions || typeof sessions !== 'object' || Array.isArray(sessions)) return emptyForwardedStore()
        return { version: 1, sessions }
      } catch (error) {
        return emptyForwardedStore()
      }
    }

    function writeForwardedStore(store) {
      const ls = storage()
      if (!ls) return false
      try {
        ls.setItem(FORWARDED_STORAGE_KEY, JSON.stringify(store))
        return true
      } catch (error) {
        return false
      }
    }

    /** Keep only `true` flags on non-empty ids; anything else in the stored record is dropped. */
    function normalizeForwardedRecord(record) {
      if (!record || typeof record !== 'object' || Array.isArray(record)) return {}
      const next = {}
      for (const [itemId, flag] of Object.entries(record)) {
        if (itemId && flag === true) next[itemId] = true
      }
      return next
    }

    /** Forwarded item ids of one session, as an id -> true map. */
    function readForwardedIds(sessionId) {
      const key = sessionId ? String(sessionId) : ''
      if (!key) return {}
      return normalizeForwardedRecord(readForwardedStore().sessions[key])
    }

    /** Remember that one note was forwarded; best effort, never blocks the send. */
    function markForwarded(sessionId, itemId) {
      const key = sessionId ? String(sessionId) : ''
      const id = itemId ? String(itemId) : ''
      if (!key || !id) return false
      const store = readForwardedStore()
      store.sessions[key] = { ...normalizeForwardedRecord(store.sessions[key]), [id]: true }
      return writeForwardedStore(store)
    }

    /** Drop forwarded flags that can no longer be rendered (deleted or cleared notes). */
    function forgetForwarded(sessionId, itemIds) {
      const key = sessionId ? String(sessionId) : ''
      if (!key) return false
      const ids = Array.isArray(itemIds) ? itemIds : [itemIds]
      const store = readForwardedStore()
      const record = normalizeForwardedRecord(store.sessions[key])
      let changed = false
      for (const rawId of ids) {
        const id = rawId ? String(rawId) : ''
        if (!id || !record[id]) continue
        delete record[id]
        changed = true
      }
      if (!changed) return false
      if (Object.keys(record).length) store.sessions[key] = record
      else delete store.sessions[key]
      return writeForwardedStore(store)
    }

    /** Read one session's memo record. */
    function readSessionRecord(sessionId) {
      const key = sessionId ? String(sessionId) : ''
      if (!key) return { items: [], updatedAt: 0 }
      const record = readSessionStore().sessions[key]
      return {
        items: normalizeItems(record && record.items),
        updatedAt: record && Number.isFinite(record.updatedAt) ? record.updatedAt : 0,
      }
    }

    /** Persist one session's memo record. */
    function writeSessionRecord(sessionId, record) {
      const ls = storage()
      const key = sessionId ? String(sessionId) : ''
      if (!ls || !key) return false
      const store = readSessionStore()
      store.sessions[key] = {
        sessionId: key,
        updatedAt: record.updatedAt || Date.now(),
        items: normalizeItems(record.items),
      }
      try {
        ls.setItem(SESSION_STORAGE_KEY, JSON.stringify(store))
        notifyTodoChange()
        return true
      } catch (error) {
        return false
      }
    }

    /** The session currently retained by the main view. */
    function currentSessionOf(list) {
      const rows = list && list.byId ? Object.values(list.byId) : []
      return rows.find(row => row && (row.retainedBy && row.retainedBy.mainView ? row.retainedBy.mainView : 0) > 0) || null
    }

    /** Per-session memos plus an optimistic, synchronous writer. */
    function useSessionMemoStore(sessionId) {
      const sessionKey = sessionId ? String(sessionId) : ''
      const sessionRef = React.useRef(sessionKey)
      sessionRef.current = sessionKey

      const [record, setRecord] = React.useState(() => readSessionRecord(sessionKey))
      const [syncError, setSyncError] = React.useState(false)
      const recordRef = React.useRef(record)
      recordRef.current = record

      React.useEffect(() => {
        setRecord(readSessionRecord(sessionRef.current))
        setSyncError(false)
      }, [sessionKey])

      React.useEffect(() => {
        const onStorage = event => {
          if (event.key !== SESSION_STORAGE_KEY) return
          setRecord(readSessionRecord(sessionRef.current))
        }
        const onLocal = () => setRecord(readSessionRecord(sessionRef.current))
        TODO_LISTENERS.add(onLocal)
        window.addEventListener('storage', onStorage)
        return () => {
          TODO_LISTENERS.delete(onLocal)
          window.removeEventListener('storage', onStorage)
        }
      }, [])

      const commit = React.useCallback(updater => {
        const current = recordRef.current || { items: [], updatedAt: 0 }
        const nextItems = normalizeItems(updater(current.items || []))
        const next = { items: nextItems, updatedAt: Date.now() }
        const ok = writeSessionRecord(sessionRef.current, next)
        recordRef.current = next
        setRecord(next)
        setSyncError(!ok)
      }, [])

      return { record, syncError, commit }
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

    function IconCopy() {
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
        h('rect', {
          x: 6,
          y: 4.5,
          width: 7,
          height: 8.5,
          rx: 1.2,
          stroke: 'currentColor',
          strokeWidth: 1.3,
        }),
        h('path', {
          d: 'M10.75 4.5V3.75c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v7.5c0 .55.45 1 1 1h2',
          stroke: 'currentColor',
          strokeWidth: 1.3,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        }),
      )
    }

    function IconForward() {
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
        // The bubble body (y=2.75..10.25) carries almost all of the visual mass and
        // only the thin tail reaches down to 12.15, so a bbox-only nudge still reads
        // high next to copy/edit/delete. Measured at render size, those neighbours
        // put their ink-mass centre at y≈7.8 of 16 while an unshifted bubble sits at
        // y≈6.7; dropping the pair 1.10 lands it on the same optical line (ink-gravity
        // centre 8.00/16, trimmed mass centre 7.83/16) without touching the shape.
        h(
          'g',
          { transform: 'translate(0 1.1)' },
          h('path', {
            d: 'M4.45 2.75h7.3a2 2 0 0 1 2 2v3.5a2 2 0 0 1-2 2H7.9l-2.65 1.9a.5.5 0 0 1-.8-.4v-1.5a2 2 0 0 1-2-2v-3.5a2 2 0 0 1 2-2Z',
            stroke: 'currentColor',
            strokeWidth: 1.3,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
          }),
          h('path', {
            d: 'M5.5 7h5.25M8.85 5.1 10.75 7l-1.9 1.9',
            stroke: 'currentColor',
            strokeWidth: 1.3,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
          }),
        ),
      )
    }

    function IconGear() {
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
          d: 'M2.5 5h11M2.5 11h11',
          stroke: 'currentColor',
          strokeWidth: 1.4,
          strokeLinecap: 'round',
        }),
        h('circle', { cx: 6, cy: 5, r: 1.6, stroke: 'currentColor', strokeWidth: 1.4 }),
        h('circle', { cx: 10, cy: 11, r: 1.6, stroke: 'currentColor', strokeWidth: 1.4 }),
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
      const { item, done, say, onToggle, onStartEdit, onDelete, editing, editDraft, setEditDraft, onEditDraftChange, onFinishEdit, onCancelEdit, editRef, forwardPrefix, sendShortcut = 'ctrl-enter', forwarded = false, onForwarded } = props
      const editHintKey = sendShortcut === 'enter' ? 'edit.hintEnter' : 'edit.hintCtrlEnter'
      const [copied, setCopied] = React.useState(false)
      const [pending, setPending] = React.useState('')
      // Short-lived check on the forward action; the durable flag lives in storage.
      const [justForwarded, setJustForwarded] = React.useState(false)
      // A forwarded note stays open and wears a half check until the user decides.
      const [half, setHalf] = React.useState(() => forwarded === true && done !== true)
      // Optimistic full check while the staged completion can still be undone.
      const [pendingDone, setPendingDone] = React.useState(false)
      // Remaining seconds announced by the pending hint; ticks 3 → 2 → 1.
      const [pendingSeconds, setPendingSeconds] = React.useState(HALF_DONE_COUNTDOWN)
      // Card-leave animation played just before the completion is committed.
      const [leaving, setLeaving] = React.useState(false)
      const copyTimerRef = React.useRef(null)
      const forwardTimerRef = React.useRef(null)
      const pendingTimerRef = React.useRef(null)
      const pendingTickRef = React.useRef(null)
      const leaveTimerRef = React.useRef(null)
      const mountedRef = React.useRef(true)
      const doneRef = React.useRef(done)

      const clearPendingTick = () => {
        if (pendingTickRef.current) {
          clearInterval(pendingTickRef.current)
          pendingTickRef.current = null
        }
      }

      const clearPendingTimers = () => {
        if (pendingTimerRef.current) {
          clearTimeout(pendingTimerRef.current)
          pendingTimerRef.current = null
        }
        if (leaveTimerRef.current) {
          clearTimeout(leaveTimerRef.current)
          leaveTimerRef.current = null
        }
        clearPendingTick()
      }

      React.useEffect(() => {
        mountedRef.current = true
        return () => {
          mountedRef.current = false
          clearPendingTimers()
          if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
          if (forwardTimerRef.current) clearTimeout(forwardTimerRef.current)
          copyTimerRef.current = null
          forwardTimerRef.current = null
        }
      }, [])

      React.useEffect(() => {
        doneRef.current = done
      }, [done])

      // A committed toggle (or another tab) beats the local half/pending state.
      React.useEffect(() => {
        if (done) {
          clearPendingTimers()
          setHalf(false)
          setPendingDone(false)
          setPendingSeconds(HALF_DONE_COUNTDOWN)
          setLeaving(false)
          return
        }
        // Reopening a forwarded note (and reopening the panel) restores its half check.
        if (forwarded === true) setHalf(true)
      }, [done, forwarded])

      const copy = async () => {
        if (pending) return
        setPending('copy')
        let ok = false
        try {
          ok = await copyText(item.text)
        } finally {
          if (mountedRef.current) setPending('')
        }
        if (!ok || !mountedRef.current) return
        setCopied(true)
        if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
        copyTimerRef.current = setTimeout(() => {
          copyTimerRef.current = null
          if (!mountedRef.current) return
          setCopied(false)
        }, 1200)
      }

      const forward = () => {
        if (!appendToConversation(item.text, forwardPrefix)) return
        // Remember the forward so the half check (and the muted check) survives reopen.
        if (onForwarded) onForwarded(item)
        setJustForwarded(true)
        if (forwardTimerRef.current) clearTimeout(forwardTimerRef.current)
        forwardTimerRef.current = setTimeout(() => {
          forwardTimerRef.current = null
          if (!mountedRef.current) return
          setJustForwarded(false)
        }, 1200)
        // Forwarding an open note never completes it; it stages the half check.
        if (done) return
        clearPendingTimers()
        setPendingDone(false)
        setPendingSeconds(HALF_DONE_COUNTDOWN)
        setLeaving(false)
        setHalf(true)
      }

      const cancelPending = () => {
        clearPendingTimers()
        setPendingDone(false)
        setPendingSeconds(HALF_DONE_COUNTDOWN)
        setLeaving(false)
      }

      const startPending = () => {
        clearPendingTimers()
        setPendingDone(true)
        setPendingSeconds(HALF_DONE_COUNTDOWN)
        setLeaving(false)
        // Countdown ticks run on their own 1s interval and are cleared with the timeouts,
        // so a cancel, unmount, or commit can never leave a stray tick behind.
        pendingTickRef.current = setInterval(() => {
          if (!mountedRef.current) return
          setPendingSeconds(value => (value > 1 ? value - 1 : value))
        }, HALF_DONE_TICK)
        pendingTimerRef.current = setTimeout(() => {
          pendingTimerRef.current = null
          clearPendingTick()
          if (!mountedRef.current) return
          setLeaving(true)
          leaveTimerRef.current = setTimeout(() => {
            leaveTimerRef.current = null
            if (!mountedRef.current) return
            setPendingDone(false)
            setPendingSeconds(HALF_DONE_COUNTDOWN)
            setLeaving(false)
            setHalf(false)
            if (doneRef.current) return
            onToggle(item)
          }, HALF_DONE_LEAVE)
        }, HALF_DONE_DELAY)
      }

      const toggleCheck = () => {
        if (done) {
          cancelPending()
          // A forwarded note goes back to the half check, not a plain empty circle.
          setHalf(forwarded === true)
          onToggle(item)
          return
        }
        // Second click during the delay keeps the note open and restores the half check.
        if (pendingDone) {
          cancelPending()
          return
        }
        if (half) {
          startPending()
          return
        }
        onToggle(item)
      }

      const resizeEditor = node => {
        if (!node) return
        node.style.height = 'auto'
        node.style.height = `${node.scrollHeight + 2}px`
      }

      const setEditorRef = React.useCallback(node => {
        editRef.current = node
        if (node) {
          node.style.height = 'auto'
          node.style.height = `${node.scrollHeight + 2}px`
        }
      }, [editRef])

      /** Insert a line break at the caret of the controlled edit textarea and keep focus there. */
      const insertEditNewline = node => {
        if (!node) return
        const start = node.selectionStart === null ? node.value.length : node.selectionStart
        const end = node.selectionEnd === null ? start : node.selectionEnd
        const next = `${node.value.slice(0, start)}\n${node.value.slice(end)}`
        const caret = start + 1
        setEditDraft(next)
        if (onEditDraftChange) onEditDraftChange(next)
        window.requestAnimationFrame(() => {
          node.focus()
          try {
            node.setSelectionRange(caret, caret)
          } catch (error) {
            /* selection APIs are best effort */
          }
          resizeEditor(node)
        })
      }

      const body = editing
        ? h(
            'div',
            { className: 'dsh-wt-edit' },
            h('textarea', {
              ref: setEditorRef,
              className: 'dsh-wt-editInput',
              value: editDraft,
              rows: 1,
              maxLength: MAX_TEXT,
              'aria-label': say('item.edit'),
              onChange: event => {
                const value = event.target.value
                setEditDraft(value)
                if (onEditDraftChange) onEditDraftChange(value)
                resizeEditor(event.target)
              },
              onKeyDown: event => {
                const composing = event.isComposing || (event.nativeEvent && event.nativeEvent.isComposing)
                if (composing) return
                if (event.key === 'Escape') {
                  event.preventDefault()
                  onCancelEdit()
                  return
                }
                if (event.key !== 'Enter') return
                const modifier = event.ctrlKey || event.metaKey
                if (sendShortcut === 'enter') {
                  if (!modifier && !event.shiftKey) {
                    event.preventDefault()
                    onFinishEdit(item)
                  } else {
                    // Ctrl/Meta+Enter and Shift+Enter break the line instead of saving.
                    event.preventDefault()
                    insertEditNewline(event.currentTarget)
                  }
                  return
                }
                // Default 'ctrl-enter': the modifier saves; Enter and Shift+Enter break the line.
                if (modifier) {
                  event.preventDefault()
                  if (event.shiftKey) insertEditNewline(event.currentTarget)
                  else onFinishEdit(item)
                } else if (event.shiftKey) {
                  event.preventDefault()
                  insertEditNewline(event.currentTarget)
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
              h('span', { className: 'dsh-wt-editHint', title: say(editHintKey) }, say(editHintKey)),
            ),
          )
        : h(
            'div',
            {
              className: 'dsh-wt-text',
              title: say('item.editHint'),
              onDoubleClick: () => onStartEdit(item),
            },
            item.text,
          )

      const halfCheck = half && !done && !pendingDone
      // A completed note that was forwarded wears a muted (gray) check instead of the brand one.
      const forwardedDone = done === true && forwarded === true
      const checked = done || pendingDone
      const checkClass = forwardedDone
        ? 'dsh-wt-check dsh-wt-checkForwarded'
        : halfCheck
          ? 'dsh-wt-check dsh-wt-checkHalf'
          : 'dsh-wt-check'
      const rowClass = `${done ? 'dsh-wt-row dsh-wt-rowDone' : 'dsh-wt-row'}${leaving ? ' dsh-wt-rowLeaving' : ''}`

      return h(
        'li',
        { className: rowClass },
        h(
          'button',
          {
            type: 'button',
            className: checkClass,
            role: 'checkbox',
            'aria-checked': checked ? 'true' : half ? 'mixed' : 'false',
            'aria-label': say(done ? 'item.markOpen' : 'item.markDone'),
            'aria-describedby': pendingDone ? `${item.id}-pending-hint` : undefined,
            onClick: toggleCheck,
          },
          h(
            'span',
            { className: 'dsh-wt-checkCircle' },
            checked ? h(IconCheck, { size: 9 }) : null,
          ),
        ),
        h(
          'div',
          { className: 'dsh-wt-itemBody' },
          body,
          editing
            ? null
            : h(
                'div',
                { className: 'dsh-wt-rowFoot' },
                h('span', { className: 'dsh-wt-meta' }, ageLabel(item.createdAt, say, props.localeId)),
                h(
                  'div',
                  { className: 'dsh-wt-actions' },
                  h(
                    'button',
                    {
                      type: 'button',
                      className: copied ? 'dsh-wt-iconBtn dsh-wt-copied' : 'dsh-wt-iconBtn',
                      'aria-label': say(copied ? 'item.copied' : 'item.copy'),
                      'aria-busy': pending === 'copy' ? 'true' : 'false',
                      'data-loading': pending === 'copy' ? 'true' : undefined,
                      title: say(copied ? 'item.copied' : 'item.copy'),
                      onClick: copy,
                    },
                    copied ? h(IconCheck, { size: 12 }) : h(IconCopy, null),
                  ),
                  h(
                    'button',
                    {
                      type: 'button',
                      className: justForwarded ? 'dsh-wt-iconBtn dsh-wt-forwarded' : 'dsh-wt-iconBtn',
                      'aria-label': say(justForwarded ? 'item.forwarded' : 'item.forward'),
                      title: say(justForwarded ? 'item.forwarded' : 'item.forward'),
                      onClick: forward,
                    },
                    justForwarded ? h(IconCheck, { size: 12 }) : h(IconForward, null),
                  ),
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
                      className: 'dsh-wt-iconBtn dsh-wt-iconBtnDanger',
                      'aria-label': say('item.delete'),
                      title: say('item.delete'),
                      onClick: () => onDelete(item),
                    },
                    h(IconTrash, null),
                  ),
                ),
          ),
          pendingDone
            ? h(
                'div',
                {
                  id: `${item.id}-pending-hint`,
                  className: 'dsh-wt-rowHint',
                  role: 'status',
                  'aria-live': 'polite',
                  'aria-atomic': 'true',
                },
                say('item.pendingCountdown', { n: pendingSeconds }),
              )
            : null,
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
                  h('div', { className: 'dsh-wt-fill', style: { transform: `scaleX(${percent / 100})` } }),
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
          d: 'M3.25 2.75h6.5l3 3v7.5c0 .55-.45 1-1 1H3.25c-.55 0-1-.45-1-1V3.75c0-.55.45-1 1-1Z',
          stroke: 'currentColor',
          strokeWidth: 1.3,
          strokeLinejoin: 'round',
        }),
        h('path', {
          d: 'M9.75 2.75v3h3',
          stroke: 'currentColor',
          strokeWidth: 1.3,
          strokeLinejoin: 'round',
        }),
        h('path', {
          d: 'M4.9 7.6h5.4M4.9 9.9h3.6',
          stroke: 'currentColor',
          strokeWidth: 1.3,
          strokeLinecap: 'round',
        }),
      )
    }

    /** Fixed panel placement: a right-side panel for the experimental entry, otherwise below the anchor. */
    function memoPopoverStyle(anchor, placement, requestedWidth, requestedHeight) {
      const available = Math.max(PANEL_MIN_WIDTH, window.innerWidth - 32)
      const width = Math.max(PANEL_MIN_WIDTH, Math.min(PANEL_MAX_WIDTH, available, requestedWidth || PANEL_DEFAULT_WIDTH))
      if (placement === 'right') {
        const rect = anchor && anchor.isConnected ? anchor.getBoundingClientRect() : null
        let desiredRight = rect && rect.width > 0 ? rect.right : window.innerWidth - 16
        const sidebar = [...document.querySelectorAll('[data-sidebar-right-panel][data-sidebar-right-open]')].find(node => {
          const box = node.getBoundingClientRect()
          return box.width > 24 && box.left > 0 && box.left < window.innerWidth - 24
        })
        if (sidebar) {
          desiredRight = Math.min(desiredRight, sidebar.getBoundingClientRect().left - 8)
        }
        const rightInset = Math.max(12, Math.min(window.innerWidth - 12, window.innerWidth - desiredRight))
        const top = rect && rect.width > 0 ? Math.max(12, Math.round(rect.bottom + 8)) : 64
        const maxHeight = Math.max(PANEL_MIN_HEIGHT, window.innerHeight - top - 16)
        const height = requestedHeight
          ? Math.max(PANEL_MIN_HEIGHT, Math.min(maxHeight, requestedHeight))
          : 0
        const style = { right: `${rightInset}px`, left: 'auto', top: `${top}px`, width: `${width}px`, maxHeight: `${maxHeight}px` }
        if (height) style.height = `${height}px`
        return style
      }
      const maxHeight = Math.min(460, window.innerHeight - 24)
      if (!anchor) return { left: '12px', top: '12px', width: `${width}px`, maxHeight: `${maxHeight}px` }
      const rect = anchor.getBoundingClientRect()
      const left = rect.left < 420
        ? Math.max(12, rect.left)
        : Math.max(12, Math.min(rect.right - width, window.innerWidth - width - 12))
      let top = rect.bottom + 8
      if (top + maxHeight > window.innerHeight - 12) top = Math.max(12, rect.top - maxHeight - 8)
      return { left: `${left}px`, top: `${top}px`, width: `${width}px`, maxHeight: `${maxHeight}px` }
    }

    /** Compact floating memo list, anchored to the entry that opened it. */
    function MemoPopover(props) {
      const say = props.say
      const localeId = props.localeId
      const sessionId = props.sessionId || ''
      const { record, syncError, commit } = useSessionMemoStore(props.sessionId)
      const [draft, setDraft] = React.useState(() => readSessionDrafts(sessionId).add)
      const [editingId, setEditingId] = React.useState(null)
      const [editDraft, setEditDraft] = React.useState('')
      // Read the remembered section state once per mount; the popover unmounts on close.
      const [initialSections] = React.useState(readSectionState)
      const [showDone, setShowDone] = React.useState(initialSections.done)
      const [showOpen, setShowOpen] = React.useState(initialSections.open)
      const sectionsRef = React.useRef(initialSections)
      const [showSettings, setShowSettings] = React.useState(false)
      const [sendShortcut, setSendShortcut] = React.useState(readSendShortcut)
      const [forwardPrefix, setForwardPrefix] = React.useState(readForwardPrefix)
      // Forwarded item ids of this session, read once per mount so reopen restores the half check.
      const [forwardedIds, setForwardedIds] = React.useState(() => readForwardedIds(sessionId))
      const forwardedSessionRef = React.useRef(sessionId ? String(sessionId) : '')
      const [panelWidth, setPanelWidth] = React.useState(readPanelWidth)
      const [panelHeight, setPanelHeight] = React.useState(readPanelHeight)
      const [style, setStyle] = React.useState(() => memoPopoverStyle(props.anchorRef.current, props.placement, panelWidth, panelHeight))
      const panelRef = React.useRef(null)
      const panelWidthRef = React.useRef(panelWidth)
      const panelHeightRef = React.useRef(panelHeight)
      const lastStyleRef = React.useRef('')
      const editRef = React.useRef(null)
      const addRef = React.useRef(null)
      const cancelEditRef = React.useRef(false)
      const composingRef = React.useRef(false)

      const resizeAdd = node => {
        if (!node) return
        node.style.height = 'auto'
        node.style.height = `${node.scrollHeight + 2}px`
      }

      React.useEffect(() => {
        resizeAdd(addRef.current)
      }, [draft])

      // Only a genuine session switch re-reads the flags; parent re-renders keep this state.
      React.useEffect(() => {
        const key = sessionId ? String(sessionId) : ''
        if (forwardedSessionRef.current === key) return
        forwardedSessionRef.current = key
        setForwardedIds(readForwardedIds(key))
      }, [sessionId])

      React.useLayoutEffect(() => {
        const node = addRef.current
        if (!node) return
        node.focus()
        const end = node.value.length
        try {
          node.setSelectionRange(end, end)
        } catch (error) {
          /* selection APIs are best effort */
        }
      }, [])

      const updatePosition = React.useCallback(() => {
        if (props.anchorRef.current || props.placement === 'right') {
          const next = memoPopoverStyle(props.anchorRef.current, props.placement, panelWidth, panelHeight)
          const key = JSON.stringify(next)
          if (key === lastStyleRef.current) return
          lastStyleRef.current = key
          setStyle(next)
        }
      }, [props.anchorRef, props.placement, panelWidth, panelHeight])

      React.useEffect(() => {
        panelWidthRef.current = panelWidth
      }, [panelWidth])

      React.useEffect(() => {
        panelHeightRef.current = panelHeight
      }, [panelHeight])

      const clampPanelWidth = value => {
        const max = Math.min(PANEL_MAX_WIDTH, Math.max(PANEL_MIN_WIDTH, window.innerWidth - 32))
        return Math.max(PANEL_MIN_WIDTH, Math.min(max, value))
      }

      const commitPanelWidth = value => {
        const next = clampPanelWidth(value)
        panelWidthRef.current = next
        setPanelWidth(next)
        writePanelWidth(next)
      }

      const startPanelResize = event => {
        if (event.button !== 0) return
        event.preventDefault()
        const startX = event.clientX
        const startWidth = panelWidthRef.current
        const onMove = moveEvent => {
          const next = clampPanelWidth(startWidth + (startX - moveEvent.clientX))
          panelWidthRef.current = next
          setPanelWidth(next)
        }
        const onUp = () => {
          window.removeEventListener('pointermove', onMove)
          window.removeEventListener('pointerup', onUp)
          document.body.style.userSelect = ''
          document.body.style.cursor = ''
          writePanelWidth(panelWidthRef.current)
        }
        window.addEventListener('pointermove', onMove)
        window.addEventListener('pointerup', onUp, { once: true })
        document.body.style.userSelect = 'none'
        document.body.style.cursor = 'ew-resize'
      }

      const onPanelResizeKeyDown = event => {
        if (event.key === 'ArrowLeft') {
          event.preventDefault()
          commitPanelWidth(panelWidthRef.current + 16)
        } else if (event.key === 'ArrowRight') {
          event.preventDefault()
          commitPanelWidth(panelWidthRef.current - 16)
        } else if (event.key === 'Home') {
          event.preventDefault()
          commitPanelWidth(PANEL_DEFAULT_WIDTH)
        }
      }

      const clampPanelHeight = value => {
        const max = Math.max(PANEL_MIN_HEIGHT, window.innerHeight - 64 - 16)
        return Math.max(PANEL_MIN_HEIGHT, Math.min(max, value))
      }

      const commitPanelHeight = value => {
        const next = value > 0 ? clampPanelHeight(value) : 0
        panelHeightRef.current = next
        setPanelHeight(next)
        writePanelHeight(next)
      }

      const startPanelHeightResize = event => {
        if (event.button !== 0) return
        event.preventDefault()
        const startY = event.clientY
        const startHeight = panelHeightRef.current
          || (panelRef.current ? panelRef.current.getBoundingClientRect().height : 360)
        const onMove = moveEvent => {
          const next = clampPanelHeight(startHeight + (moveEvent.clientY - startY))
          panelHeightRef.current = next
          setPanelHeight(next)
        }
        const onUp = () => {
          window.removeEventListener('pointermove', onMove)
          window.removeEventListener('pointerup', onUp)
          document.body.style.userSelect = ''
          document.body.style.cursor = ''
          writePanelHeight(panelHeightRef.current)
        }
        window.addEventListener('pointermove', onMove)
        window.addEventListener('pointerup', onUp, { once: true })
        document.body.style.userSelect = 'none'
        document.body.style.cursor = 'ns-resize'
      }

      const onPanelHeightKeyDown = event => {
        if (event.key === 'ArrowDown') {
          event.preventDefault()
          commitPanelHeight((panelHeightRef.current || 360) + 16)
        } else if (event.key === 'ArrowUp') {
          event.preventDefault()
          commitPanelHeight((panelHeightRef.current || 360) - 16)
        } else if (event.key === 'Home') {
          event.preventDefault()
          commitPanelHeight(0)
        }
      }

      React.useLayoutEffect(() => {
        updatePosition()
        window.addEventListener('resize', updatePosition)
        window.addEventListener('scroll', updatePosition, true)
        return () => {
          window.removeEventListener('resize', updatePosition)
          window.removeEventListener('scroll', updatePosition, true)
        }
      }, [updatePosition])

      React.useEffect(() => {
        const anchor = props.anchorRef.current
        if (!anchor || typeof ResizeObserver !== 'function') return undefined
        const target = anchor.closest('[class*="_header"]') || anchor
        const observer = new ResizeObserver(updatePosition)
        observer.observe(target)
        return () => observer.disconnect()
      }, [props.anchorRef, updatePosition])

      React.useEffect(() => {
        const timer = window.setInterval(updatePosition, 400)
        return () => window.clearInterval(timer)
      }, [updatePosition])

      React.useEffect(() => {
        const onPointerDown = event => {
          if (panelRef.current && panelRef.current.contains(event.target)) return
          if (props.anchorRef.current && props.anchorRef.current.contains(event.target)) return
          props.onClose()
        }
        const onKeyDown = event => {
          if (event.key === 'Escape') props.onClose()
        }
        document.addEventListener('pointerdown', onPointerDown, true)
        document.addEventListener('keydown', onKeyDown)
        return () => {
          document.removeEventListener('pointerdown', onPointerDown, true)
          document.removeEventListener('keydown', onKeyDown)
        }
      }, [props.onClose, props.anchorRef])

      React.useEffect(() => {
        if (!editingId || !editRef.current) return
        editRef.current.focus()
        editRef.current.select()
      }, [editingId])

      const items = record.items || []
      const openItems = items.filter(item => !item.done)
      const doneItems = items.filter(item => item.done)
      const openCount = openItems.length
      const total = items.length

      const chooseShortcut = value => {
        setSendShortcut(value)
        writeSendShortcut(value)
      }

      const changeForwardPrefix = value => {
        const next = String(value || '').slice(0, 80)
        setForwardPrefix(next)
        writeForwardPrefix(next)
      }

      const add = () => {
        const text = draft.trim().slice(0, MAX_TEXT)
        if (!text) return
        const now = Date.now()
        commit(currentItems => [{ id: uid(), text, done: false, createdAt: now, updatedAt: now }, ...currentItems])
        setDraft('')
        clearAddDraft(sessionId)
      }

      const insertDraftNewline = node => {
        if (!node) return
        const start = node.selectionStart === null ? node.value.length : node.selectionStart
        const end = node.selectionEnd === null ? start : node.selectionEnd
        const next = `${node.value.slice(0, start)}\n${node.value.slice(end)}`
        setDraft(next)
        saveAddDraft(sessionId, next)
        window.requestAnimationFrame(() => {
          node.selectionStart = start + 1
          node.selectionEnd = start + 1
          resizeAdd(node)
        })
      }

      const toggle = item => {
        commit(currentItems => currentItems.map(candidate => {
          if (candidate.id !== item.id) return candidate
          const now = Date.now()
          return {
            ...candidate,
            done: !candidate.done,
            updatedAt: now,
            ...(candidate.done ? { completedAt: undefined } : { completedAt: now }),
          }
        }))
        if (item.id === editingId) {
          setEditingId(null)
          setEditDraft('')
          clearEditDraft(sessionId, item.id)
        }
      }

      /** Drop forwarded flags for notes that no longer render (deleted or cleared). */
      const forgetForwardedItems = itemIds => {
        const ids = (Array.isArray(itemIds) ? itemIds : [itemIds]).filter(Boolean)
        if (!ids.length) return
        forgetForwarded(sessionId, ids)
        setForwardedIds(current => {
          if (!ids.some(id => current[id])) return current
          const next = { ...current }
          for (const id of ids) delete next[id]
          return next
        })
      }

      /** Remember a successful forward so the half check survives closing the panel. */
      const rememberForwarded = item => {
        const id = item && item.id ? String(item.id) : ''
        if (!id) return
        markForwarded(sessionId, id)
        setForwardedIds(current => (current[id] ? current : { ...current, [id]: true }))
      }

      const remove = item => {
        commit(currentItems => currentItems.filter(candidate => candidate.id !== item.id))
        clearEditDraft(sessionId, item.id)
        forgetForwardedItems(item.id)
        if (item.id === editingId) {
          setEditingId(null)
          setEditDraft('')
        }
      }

      const startEdit = item => {
        cancelEditRef.current = false
        const saved = readEditDraft(sessionId, item.id)
        setEditingId(item.id)
        setEditDraft(saved === null ? item.text : saved)
      }

      const finishEdit = item => {
        if (cancelEditRef.current) {
          cancelEditRef.current = false
          return
        }
        if (!editingId) return
        const text = editDraft.trim().slice(0, MAX_TEXT)
        if (text && text !== item.text) {
          commit(currentItems => currentItems.map(candidate => {
            if (candidate.id !== item.id) return candidate
            return { ...candidate, text, updatedAt: Date.now() }
          }))
        }
        setEditingId(null)
        setEditDraft('')
        clearEditDraft(sessionId, item.id)
      }

      const cancelEdit = () => {
        cancelEditRef.current = true
        const currentId = editingId
        setEditingId(null)
        setEditDraft('')
        if (currentId) clearEditDraft(sessionId, currentId)
      }

      /** Apply one section state and remember it right away, using the next value. */
      const applySections = next => {
        sectionsRef.current = next
        setShowOpen(next.open)
        setShowDone(next.done)
        writeSectionState(next)
      }

      const clearDone = () => {
        forgetForwardedItems(items.filter(item => item.done).map(item => item.id))
        commit(currentItems => currentItems.filter(item => !item.done))
        applySections({ open: sectionsRef.current.open, done: false })
      }

      const toggleOpen = () => {
        applySections({ open: !sectionsRef.current.open, done: sectionsRef.current.done })
      }

      const toggleDone = () => {
        applySections({ open: sectionsRef.current.open, done: !sectionsRef.current.done })
      }

      const row = item => h(TodoRow, {
        key: item.id,
        item,
        done: item.done,
        say,
        localeId,
        onToggle: toggle,
        onStartEdit: startEdit,
        onDelete: remove,
        editing: editingId === item.id,
        editDraft,
        setEditDraft,
        onEditDraftChange: value => saveEditDraft(sessionId, item.id, value),
        onFinishEdit: finishEdit,
        onCancelEdit: cancelEdit,
        editRef,
        forwardPrefix,
        sendShortcut,
        forwarded: forwardedIds[item.id] === true,
        onForwarded: rememberForwarded,
      })

      const content = h(
        'div',
        {
          ref: panelRef,
          className: props.placement === 'right' ? 'dsh-wt-popover dsh-wt-popoverRight' : 'dsh-wt-popover',
          style,
          role: 'dialog',
          'aria-label': say('popover.title'),
        },
        props.placement === 'right'
          ? h('div', {
              className: 'dsh-wt-resizeHandle',
              role: 'separator',
              'aria-orientation': 'vertical',
              'aria-label': '调整便笺宽度',
              tabIndex: 0,
              title: '拖动调整宽度，双击复位',
              onPointerDown: startPanelResize,
              onDoubleClick: () => commitPanelWidth(PANEL_DEFAULT_WIDTH),
              onKeyDown: onPanelResizeKeyDown,
            })
          : null,
        props.placement === 'right'
          ? h('div', {
              className: 'dsh-wt-resizeHandleBottom',
              role: 'separator',
              'aria-orientation': 'horizontal',
              'aria-label': '调整便笺高度',
              tabIndex: 0,
              title: '拖动调整高度，双击复位',
              onPointerDown: startPanelHeightResize,
              onDoubleClick: () => commitPanelHeight(0),
              onKeyDown: onPanelHeightKeyDown,
            })
          : null,
        h(
          'div',
          { className: 'dsh-wt-popHead' },
          h(
            'div',
            null,
            h(
              'div',
              { className: 'dsh-wt-popTitleLine' },
              h('div', { className: 'dsh-wt-popTitle' }, say('popover.title')),
              h(
                'button',
                {
                  type: 'button',
                  className: 'dsh-wt-settingsBtn',
                  'data-active': showSettings ? 'true' : undefined,
                  'aria-label': say('settings.open'),
                  'aria-expanded': showSettings,
                  title: say('settings.open'),
                  onClick: () => setShowSettings(value => !value),
                },
                h(IconGear, null),
              ),
            ),
            h('p', { className: 'dsh-wt-popMeta' }, say('popover.count', { open: openCount, total })),
          ),
          h(
            'button',
            { type: 'button', className: 'dsh-wt-popClose', 'aria-label': say('popover.close'), onClick: props.onClose },
            '×',
          ),
        ),
        showSettings
          ? h(
              'div',
              { className: 'dsh-wt-settings' },
              h('div', { className: 'dsh-wt-settingsHead' }, say('settings.title')),
              h(
                'div',
                { className: 'dsh-wt-settingGroup' },
                h('div', { className: 'dsh-wt-settingLabel' }, say('settings.shortcut')),
                h(
                  'div',
                  { className: 'dsh-wt-settingBody' },
                  h(
                    'div',
                    { className: 'dsh-wt-settingChoices' },
                    h(
                      'label',
                      { className: 'dsh-wt-settingChoice' },
                      h('input', {
                        type: 'radio',
                        name: 'dsh-wt-send-shortcut',
                        checked: sendShortcut === 'ctrl-enter',
                        onChange: () => chooseShortcut('ctrl-enter'),
                      }),
                      h('span', null, say('settings.shortcutCtrlEnter')),
                    ),
                    h(
                      'label',
                      { className: 'dsh-wt-settingChoice' },
                      h('input', {
                        type: 'radio',
                        name: 'dsh-wt-send-shortcut',
                        checked: sendShortcut === 'enter',
                        onChange: () => chooseShortcut('enter'),
                      }),
                      h('span', null, say('settings.shortcutEnter')),
                    ),
                  ),
                ),
              ),
              h(
                'div',
                { className: 'dsh-wt-settingGroup' },
                h('div', { className: 'dsh-wt-settingLabel' }, say('settings.forward')),
                h(
                  'div',
                  { className: 'dsh-wt-settingBody' },
                  h(
                    'div',
                    { className: 'dsh-wt-settingItem' },
                    h('label', { className: 'dsh-wt-settingItemLabel', htmlFor: 'dsh-wt-forward-prefix' }, say('settings.forwardPrefixItem')),
                    h('input', {
                      id: 'dsh-wt-forward-prefix',
                      className: 'dsh-wt-settingInput',
                      value: forwardPrefix,
                      maxLength: 80,
                      placeholder: FORWARD_PREFIX,
                      onChange: event => changeForwardPrefix(event.target.value),
                    }),
                    h('p', { className: 'dsh-wt-settingHint' }, say('settings.forwardPrefixHint')),
                  ),
                  h(
                    'div',
                    { className: 'dsh-wt-settingItem' },
                    h('div', { className: 'dsh-wt-settingItemLabel' }, say('settings.forwardCheck')),
                    h('p', { className: 'dsh-wt-settingHint dsh-wt-settingHintNote' }, say('settings.halfCheck')),
                  ),
                ),
              ),
              h(
                'div',
                { className: 'dsh-wt-settingGroup' },
                h('div', { className: 'dsh-wt-settingLabel' }, say('settings.about')),
                h(
                  'div',
                  { className: 'dsh-wt-settingBody' },
                  h(
                    'div',
                    { className: 'dsh-wt-settingAbout' },
                    h('span', null, `${say('settings.version')} ${PLUGIN_VERSION}`),
                    h('span', { className: 'dsh-wt-settingDot', 'aria-hidden': true }, '·'),
                    h('span', null, say('settings.author')),
                    h(
                      'a',
                      {
                        className: 'dsh-wt-settingLink',
                        href: PLUGIN_AUTHOR_URL,
                        target: '_blank',
                        rel: 'noreferrer',
                      },
                      PLUGIN_AUTHOR_LABEL,
                    ),
                  ),
                ),
              ),
            )
          : null,
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
          h('textarea', {
            ref: addRef,
            className: 'dsh-wt-input',
            value: draft,
            rows: 1,
            maxLength: MAX_TEXT,
            placeholder: say('add.placeholder'),
            'aria-label': say('add.placeholder'),
            onChange: event => {
              const value = event.target.value
              setDraft(value)
              saveAddDraft(sessionId, value)
              resizeAdd(event.target)
            },
            onCompositionStart: () => { composingRef.current = true },
            onCompositionEnd: () => { composingRef.current = false },
            onKeyDown: event => {
              const composing = event.isComposing || (event.nativeEvent && event.nativeEvent.isComposing)
              if (event.key === 'Escape') {
                event.currentTarget.blur()
                return
              }
              if (event.key !== 'Enter') return
              if (composing) {
                event.preventDefault()
                return
              }
              const modifier = event.ctrlKey || event.metaKey
              const shouldSend = sendShortcut === 'enter'
                ? !modifier && !event.shiftKey
                : modifier
              if (shouldSend) {
                event.preventDefault()
                add()
                return
              }
              if (sendShortcut === 'enter' && (modifier || event.shiftKey)) {
                event.preventDefault()
                insertDraftNewline(event.currentTarget)
              }
            },
          }),
          h(
            'div',
            { className: 'dsh-wt-addFoot' },
            h('span', { className: 'dsh-wt-addShortcut' }, say(sendShortcut === 'enter' ? 'add.shortcutEnter' : 'add.shortcut')),
            h('button', { type: 'submit', className: 'dsh-wt-addBtn', disabled: !draft.trim() }, say('add.action')),
          ),
        ),
        h(
          'div',
          { className: 'dsh-wt-listArea' },
          h(
            'div',
            { className: 'dsh-wt-listSection' },
            h(
              'div',
              { className: 'dsh-wt-sectionHead' },
              h(
                'button',
                {
                  type: 'button',
                  className: 'dsh-wt-doneToggle',
                  'aria-expanded': showOpen ? 'true' : 'false',
                  onClick: toggleOpen,
                },
                h('span', { className: 'dsh-wt-chevron', 'data-open': showOpen ? 'true' : 'false' }, h(IconChevron, null)),
                say('list.open'),
                h('span', { className: 'dsh-wt-sectionCount' }, String(openCount)),
              ),
            ),
            showOpen
              ? openItems.length
                ? h('ul', { className: 'dsh-wt-rows' }, openItems.map(row))
                : h(EmptyState, {
                    title: say(total ? 'list.allDone.title' : 'popover.empty.title'),
                    body: say(total ? 'list.allDone.body' : 'popover.empty.body'),
                  })
              : null,
          ),
          doneItems.length
            ? h(
                'div',
                { className: 'dsh-wt-listSection' },
                h(
                  'div',
                  { className: 'dsh-wt-doneHead' },
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'dsh-wt-doneToggle',
                      'aria-expanded': showDone ? 'true' : 'false',
                      onClick: toggleDone,
                    },
                    h('span', { className: 'dsh-wt-chevron', 'data-open': showDone ? 'true' : 'false' }, h(IconChevron, null)),
                    say('popover.completed'),
                    h('span', { className: 'dsh-wt-sectionCount' }, String(doneItems.length)),
                  ),
                  showDone
                    ? h('button', { type: 'button', className: 'dsh-wt-clear', onClick: clearDone }, say('popover.clearDone'))
                    : null,
                ),
                showDone ? h('ul', { className: 'dsh-wt-rows dsh-wt-doneRows' }, doneItems.map(row)) : null,
              )
            : null,
        ),
        h(
          'div',
          { className: 'dsh-wt-popFoot' },
          h('span', { className: syncError ? 'dsh-wt-error' : undefined }, say(syncError ? 'footer.error' : 'popover.storage')),
        ),
      )

      return ReactDOM.createPortal(content, document.body)
    }

    /**
     * One memo entry. The hero and latest-reply variants open a floating list;
     * the sidebar variant is the inline "Notes open/total" reminder badge.
     */
    function MemoEntry(props) {
      const useSessions = typeof props.useSessions === 'function' ? props.useSessions : selector => selector(undefined)
      const list = useSessions(state => state)
      const session = props.session
        || (props.sessionId && list && list.byId ? list.byId[props.sessionId] : undefined)
        || currentSessionOf(list)
      const sessionId = session && session.id ? session.id : props.sessionId
      const { record } = useSessionMemoStore(sessionId)
      const [open, setOpen] = React.useState(false)
      const anchorRef = React.useRef(null)
      const say = props.say
      const localeId = props.localeId
      const variant = props.variant || 'hero'
      const items = record.items || []
      const openCount = items.filter(item => !item.done).length
      const total = items.length

      if (!sessionId) return null
      if (variant === 'hero' && session && session.running) return null
      if (variant === 'badge' && openCount === 0) return null

      if (variant === 'badge') {
        const label = say('badge.label')
        const counts = say('badge.count', { open: openCount })
        return h(
          React.Fragment,
          null,
          h(
            'button',
            {
              ref: anchorRef,
              type: 'button',
              className: 'dsh-wt-badge',
              title: say('badge.title'),
              'aria-label': `${label}, ${say('dock.count', { n: openCount })}`,
              onMouseDown: event => event.stopPropagation(),
              onClick: event => {
                event.stopPropagation()
                setOpen(value => !value)
              },
            },
            h('span', null, label),
            h('span', { className: 'dsh-wt-badgeCount' }, counts),
          ),
          open
            ? h(MemoPopover, {
                sessionId,
                say,
                localeId,
                anchorRef,
                onClose: () => setOpen(false),
              })
            : null,
        )
      }

      if (variant === 'dock') {
        const aria = openCount > 0 ? `${say('dock.open')}, ${say('dock.count', { n: openCount })}` : say('dock.open')
        return h(
          React.Fragment,
          null,
          h(
            'button',
            {
              ref: anchorRef,
              type: 'button',
              className: 'dsh-wt-dockBtn',
              title: say('dock.open'),
              'aria-label': aria,
              onClick: () => setOpen(value => !value),
            },
            h('span', { className: 'dsh-wt-dockIcon', 'aria-hidden': true }, h(PanelIcon, { size: 13 })),
            h('span', null, say('dock.label')),
            openCount > 0 ? h('span', { className: 'dsh-wt-dockCount' }, String(openCount)) : null,
          ),
          open
            ? h(MemoPopover, {
                sessionId,
                say,
                localeId,
                anchorRef,
                onClose: () => setOpen(false),
              })
            : null,
        )
      }

      const compact = variant === 'footer'
      const buttonClass = compact ? 'dsh-wt-footerBtn' : 'dsh-wt-heroBtn'
      const iconClass = compact ? 'dsh-wt-footerIcon' : 'dsh-wt-heroIcon'
      const labelClass = compact ? 'dsh-wt-footerLabel' : 'dsh-wt-heroLabel'
      const countClass = compact ? 'dsh-wt-footerCount' : 'dsh-wt-heroCount'
      const aria = openCount > 0 ? `${say('dock.open')}, ${say('dock.count', { n: openCount })}` : say('dock.open')

      return h(
        React.Fragment,
        null,
        h(
          'button',
          {
            ref: anchorRef,
            type: 'button',
            className: buttonClass,
            title: say('dock.open'),
            'aria-label': aria,
            onClick: () => setOpen(value => !value),
          },
          h('span', { className: iconClass, 'aria-hidden': true }, h(PanelIcon, { size: compact ? 14 : 16 })),
          h('span', { className: labelClass }, say('dock.label')),
          openCount > 0 ? h('span', { className: countClass }, String(openCount)) : null,
        ),
        open
          ? h(MemoPopover, {
              sessionId,
              say,
              localeId,
              anchorRef,
              onClose: () => setOpen(false),
            })
          : null,
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

      const tr = (key, vars) => fill(say(key), vars)
      let activePopover = null
      let activeSessionId = ''

      const closeMemoPopover = () => {
        const current = activePopover
        activePopover = null
        if (!current) return
        try {
          current.root.unmount()
        } catch (error) {
          /* already unmounted */
        }
        current.container.remove()
        refreshHeaderEntry()
      }

      const openMemoPopover = (sessionId, anchor, placement = 'popover') => {
        if (activePopover && activePopover.anchor === anchor) {
          closeMemoPopover()
          return
        }
        closeMemoPopover()
        const container = document.createElement('div')
        container.dataset.dshMemoPopoverRoot = 'true'
        document.body.appendChild(container)
        const root = ReactDOMClient.createRoot(container)
        activePopover = { container, root, anchor, placement }
        root.render(h(MemoPopover, {
          sessionId,
          say: tr,
          localeId: localeId(),
          anchorRef: { current: anchor },
          placement,
          onClose: closeMemoPopover,
        }))
        refreshHeaderEntry()
      }

      const HEADER_ICON = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.25 2.5h6.5L13 5.75v7.5c0 .69-.56 1.25-1.25 1.25h-8.5C2.56 14.5 2 13.94 2 13.25v-9.5C2 3.06 2.56 2.5 3.25 2.5Z"/><path d="M9.75 2.5v3.25H13"/><path d="M5.25 8.25h5.5M5.25 10.75h3.5"/></svg>'

      const refreshHeaderEntry = () => {
        for (const badge of document.querySelectorAll('.dsh-wt-badge')) badge.remove()
        const host = document.querySelector('[class*="_headerUtilities"]')
        let button = host ? host.querySelector(':scope > .dsh-wt-headerBtn') : null
        if (!host || !activeSessionId) {
          if (button) button.remove()
          return
        }
        const store = readSessionStore()
        const items = normalizeItems(store.sessions[activeSessionId] && store.sessions[activeSessionId].items)
        const open = items.filter(item => !item.done).length
        if (!button) {
          button = document.createElement('button')
          button.type = 'button'
          button.className = 'dsh-wt-headerBtn'
          button.addEventListener('pointerdown', event => event.stopPropagation())
          button.addEventListener('click', event => {
            event.preventDefault()
            event.stopPropagation()
            openMemoPopover(activeSessionId, button, 'right')
          })
          host.appendChild(button)
        }
        button.dataset.active = activePopover && activePopover.anchor === button ? 'true' : 'false'
        const signature = `${localeId()}:${activeSessionId}:${open}`
        if (button.dataset.signature !== signature) {
          const icon = document.createElement('span')
          icon.className = 'dsh-wt-headerIcon'
          icon.innerHTML = HEADER_ICON
          button.replaceChildren(icon)
          if (open > 0) {
            const count = document.createElement('span')
            count.className = 'dsh-wt-headerCount'
            count.textContent = open > 99 ? '99+' : String(open)
            button.appendChild(count)
          }
          button.dataset.signature = signature
        }
        button.dataset.sessionId = activeSessionId
        button.title = tr('header.tooltip', { n: open })
        button.setAttribute('aria-label', open > 0
          ? `${tr('dock.open')}, ${tr('dock.count', { n: open })}`
          : tr('dock.open'))
      }

      ctx.effect(() => {
        let scheduled = false
        const schedule = () => {
          if (scheduled) return
          scheduled = true
          requestAnimationFrame(() => {
            scheduled = false
            refreshHeaderEntry()
          })
        }
        const onStorage = event => {
          if (event.key === SESSION_STORAGE_KEY) schedule()
        }
        TODO_LISTENERS.add(schedule)
        window.addEventListener('storage', onStorage)
        const observer = new MutationObserver(schedule)
        observer.observe(document.body, { childList: true, subtree: true })
        refreshHeaderEntry()
        return () => {
          TODO_LISTENERS.delete(schedule)
          window.removeEventListener('storage', onStorage)
          observer.disconnect()
          closeMemoPopover()
          for (const button of document.querySelectorAll('.dsh-wt-headerBtn')) button.remove()
        }
      }, 'workspace-todos: right-side entry')

      function BoundSessionCapture(props) {
        const sessionId = props.sessionId || ''
        React.useEffect(() => {
          if (activeSessionId !== sessionId) {
            activeSessionId = sessionId
            closeMemoPopover()
          }
          refreshHeaderEntry()
        }, [sessionId])
        return null
      }

      ctx.slots.inject('conversation.composer.dock', () =>
        ctx.slots.register(
          {
            name: 'conversation.composer.dock',
            id: PANEL_ID,
            order: 30,
            locale: NS,
          },
          BoundSessionCapture,
        ),
      )
    }

    return { inject: ['slots'], apply }
  },
})
