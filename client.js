window.__ModuleLoader__.load({
  id: 'dsh-workspace-todos',
  factory(require) {
    const React = require('react')
    const ReactDOM = require('react-dom')
    const ReactDOMClient = require('react-dom/client')
    const h = React.createElement

    // Shared controls come from the seeded platform module, so the panel uses the
    // product's Tooltip and Toast instead of a second copy. A host without the
    // seed still renders: Tooltip degrades to plain buttons, and the toast store
    // simply has no host to render into.
    const PRIMITIVES = (() => {
      try {
        return require('@deepseek-ai/dsh-client-ui-primitives') || {}
      } catch (error) {
        return {}
      }
    })()
    const Tooltip = typeof PRIMITIVES.Tooltip === 'function' ? PRIMITIVES.Tooltip : null
    const Toast = typeof PRIMITIVES.Toast === 'function' ? PRIMITIVES.Toast : null
    const icon = name => (typeof PRIMITIVES[name] === 'function' ? PRIMITIVES[name] : null)

    /** Locale namespace of this plugin's copy (also binds the renderer's `t` prop). */
    const NS = 'workspace-todos'
    /** Sidebar launcher id and the main panel key it addresses. */
    const PANEL_ID = 'workspace-todos'
    /** Session-scoped memo store used by the popover and the session-header entry. */
    const SESSION_STORAGE_KEY = 'dsh.session-memos.v1'
    /** Unsaved add/edit drafts, restored when the panel is reopened. */
    const DRAFT_STORAGE_KEY = 'dsh.memo.drafts.v1'
    /** Notes already forwarded to the composer, per session; marks the forward button. */
    const FORWARDED_STORAGE_KEY = 'dsh.memo.forwarded.v1'
    /** Shown in the in-panel settings; keep in sync with package.json. */
    const PLUGIN_VERSION = '1.9.5'
    const PLUGIN_AUTHOR = '阿三石'
    const PLUGIN_REPO_URL = 'https://github.com/Rayle8/dsh-workspace-todos'
    const PLUGIN_REPO_LABEL = 'github.com/Rayle8/dsh-workspace-todos'
    /** Send preference; persisted across panel openings. Enter sends by default. */
    const SEND_SHORTCUT_KEY = 'dsh.memo.send-shortcut.v1'
    const SEND_SHORTCUT_DEFAULT = 'enter'
    /** macOS names the command modifier with a symbol; other platforms say Ctrl. */
    const IS_MAC = (() => {
      try {
        const platform = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || ''
        return /mac/i.test(String(platform))
      } catch (error) {
        return false
      }
    })()
    const MOD_LABEL = IS_MAC ? '⌘' : 'Ctrl'

    /** Whether the key event carries this platform's command modifier. */
    function isSendModifier(event) {
      return IS_MAC ? event.metaKey === true : event.ctrlKey === true
    }
    /** Remembered expand/collapse state of the open/completed sections. */
    const SECTION_STATE_KEY = 'dsh.memo.sections.v1'
    const SECTION_STATE_DEFAULT = { open: true, done: false }
    /** How long the inline clear-completed confirmation waits before it dismisses itself. */
    const CLEAR_CONFIRM_MS = 5000
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
        'popover.title': '便笺',
        'popover.close': '关闭便笺',
        'popover.count': '{open} 未完成 · {total} 条',
        'popover.completed': '已完成',
        'popover.clearCancel': '取消',
        'popover.clearConfirm': '清除 {n} 项已完成便笺？',
        'popover.clearConfirmAction': '确认清除',
        'popover.clearDone': '清除已完成',
        'popover.storage': '按会话隔离 · 数据仅保存在本地',
        'popover.empty.title': '还没有便笺',
        'popover.empty.body': '记下这个会话要跟进的一件事',
        'settings.open': '设置',
        'settings.title': '设置',
        'settings.about': '关于',
        'settings.version': '版本',
        'settings.author': '作者',
        'settings.project': '项目地址',
        'settings.shortcut': '发送快捷键',
        'settings.shortcutCtrlEnter': '{mod}+Enter 发送，Enter 换行',
        'settings.shortcutEnter': 'Enter 发送，{mod}+Enter 换行',
        'settings.forward': '一键转发',
        'settings.forwardPrefixItem': '前缀提示词',
        'settings.forwardPrefixHint': '转发到会话时，若输入框为空，会先写入这段提示词，再追加便笺正文；留空则只转发便笺正文',
        'add.placeholder': '记一条便笺',
        'add.shortcut': '{mod}+Enter 发送 · Enter 换行',
        'add.shortcutEnter': 'Enter 发送 · {mod}+Enter 换行',
        'add.action': '添加',
        'list.open': '未完成',
        'list.allDone.title': '未完成的都清空了',
        'list.allDone.body': '可以继续添加，或展开下方回看已完成',
        'item.markDone': '标记为完成',
        'item.markOpen': '标记为未完成',
        'item.copy': '复制',
        'item.forward': '转发到会话',
        'item.forwarded': '已转发到会话，点击可移除标识',
        'item.edit': '编辑',
        'item.delete': '删除',
        'item.editHint': '双击编辑',
        'edit.save': '保存',
        'edit.cancel': '取消',
        'edit.hintCtrlEnter': '{mod}+Enter 保存 · Enter 换行',
        'edit.hintEnter': 'Enter 保存 · {mod}+Enter 换行',
        'time.now': '刚刚',
        'time.minutes': '{n} 分钟前',
        'time.hours': '{n} 小时前',
        'time.days': '{n} 天前',
        'time.createdDone': '{created}创建，{completed}完成',
        'storage.failed': '本地存储不可用，改动不会保留',
        'forward.prefix': '完成以下任务：',
        'resize.width': '调整便笺宽度',
        'resize.height': '调整便笺高度',
        'resize.hint': '拖动调整，双击复位',
        'dock.open': '打开便笺',
        'dock.count': '{n} 项未完成',
        'header.tooltip': '会话便笺 {n}',
        'header.tooltipEmpty': '会话便笺',
        'toast.copied': '已复制',
        'toast.copyFailed': '复制失败，请重试',
        'toast.forwarded': '已转发到会话',
        'toast.unforwarded': '已取消转发标识',
        'toast.forwardFailed': '没有找到输入框，转发失败',
        'toast.deleted': '已删除',
        'toast.cleared': '已清除已完成',
        'toast.saveFailed': '保存失败，内容没有改动',
      },
      en: {
        'nav.label': 'Notes',
        'title': 'Notes',
        'popover.title': 'Notes',
        'popover.close': 'Close notes',
        'popover.count': '{open} open · {total} total',
        'popover.completed': 'Completed',
        'popover.clearCancel': 'Cancel',
        'popover.clearConfirm': 'Clear {n} completed notes?',
        'popover.clearConfirmAction': 'Clear',
        'popover.clearDone': 'Clear completed',
        'popover.storage': 'Separate per session · saved only on this device',
        'popover.empty.title': 'No notes yet',
        'popover.empty.body': 'Write down one follow-up for this session',
        'settings.open': 'Settings',
        'settings.title': 'Settings',
        'settings.about': 'About',
        'settings.version': 'Version',
        'settings.author': 'Author',
        'settings.project': 'Project',
        'settings.shortcut': 'Send shortcut',
        'settings.shortcutCtrlEnter': '{mod}+Enter sends, Enter for a new line',
        'settings.shortcutEnter': 'Enter sends, {mod}+Enter for a new line',
        'settings.forward': 'One-click forward',
        'settings.forwardPrefixItem': 'Prefix prompt',
        'settings.forwardPrefixHint': 'When forwarding into an empty composer, this prompt is written before the note; leave it empty to forward the note on its own',
        'add.placeholder': 'Write a note',
        'add.shortcut': '{mod}+Enter sends · Enter for a new line',
        'add.shortcutEnter': 'Enter sends · {mod}+Enter for a new line',
        'add.action': 'Add',
        'list.open': 'Open',
        'list.allDone.title': 'Nothing left open',
        'list.allDone.body': 'Add another note, or expand completed below to look back',
        'item.markDone': 'Mark as done',
        'item.markOpen': 'Mark as open',
        'item.copy': 'Copy',
        'item.forward': 'Forward to chat',
        'item.forwarded': 'Forwarded to chat — click to remove the mark',
        'item.edit': 'Edit',
        'item.delete': 'Delete',
        'item.editHint': 'Double-click to edit',
        'edit.save': 'Save',
        'edit.cancel': 'Cancel',
        'edit.hintCtrlEnter': '{mod}+Enter saves · Enter for a new line',
        'edit.hintEnter': 'Enter saves · {mod}+Enter for a new line',
        'time.now': 'just now',
        'time.minutes': '{n} min ago',
        'time.hours': '{n} hr ago',
        'time.days': '{n} d ago',
        'time.createdDone': 'Created {created} · Completed {completed}',
        'storage.failed': 'Local storage is unavailable; changes may not persist',
        'forward.prefix': 'Complete this task:',
        'resize.width': 'Resize notes width',
        'resize.height': 'Resize notes height',
        'resize.hint': 'Drag to resize, double-click to reset',
        'dock.open': 'Open notes',
        'dock.count': '{n} open',
        'header.tooltip': 'Session notes {n}',
        'header.tooltipEmpty': 'Session notes',
        'toast.copied': 'Copied',
        'toast.copyFailed': 'Copy failed — try again',
        'toast.forwarded': 'Forwarded to chat',
        'toast.unforwarded': 'Forward mark removed',
        'toast.forwardFailed': 'No composer found — nothing was forwarded',
        'toast.deleted': 'Deleted',
        'toast.cleared': 'Cleared completed',
        'toast.saveFailed': 'Save failed — nothing changed',
      },
    }

    const CSS = [
      '/* ── 1 令牌 · 只映射 DSH 语义别名与共享尺度，不新建调色板 ─────────── */',
      'body{--wt-space-1:4px;--wt-space-2:8px;--wt-space-3:12px;--wt-space-4:16px;--wt-space-5:24px;--wt-space-6:32px;--wt-radius-pill:999px;--wt-fs-caption:12px;--wt-lh-caption:20px;--wt-fs-row:13px;--wt-lh-row:20px;--wt-fs-title:14px;--wt-lh-title:20px;--wt-hover:var(--dsw-alias-interactive-bg-hover);--wt-active:var(--dsw-alias-interactive-bg-active);--wt-field:var(--dsw-alias-bg-layer-1);--wt-field-line:var(--dsw-alias-border-l4);--wt-divider:var(--dsw-alias-border-l2);--wt-dur-fast:var(--ds-transition-duration-fast);--wt-dur-base:var(--ds-transition-duration);--wt-dur-spin:700ms;--wt-ease:var(--ds-ease-in-out);--wt-transition:background-color var(--wt-dur-fast) var(--wt-ease),border-color var(--wt-dur-fast) var(--wt-ease),color var(--wt-dur-fast) var(--wt-ease),opacity var(--wt-dur-fast) var(--wt-ease),transform var(--wt-dur-fast) var(--wt-ease),box-shadow var(--wt-dur-fast) var(--wt-ease)}',
      '',
      '/* ── 2 浮层 · 菜单材质 + 三层阴影，边框为 0（发丝线在阴影第一层） ── */',
      '.dsh-wt-popover{position:fixed;z-index:1000;box-sizing:border-box;display:flex;flex-direction:column;gap:var(--wt-space-3);min-height:0;padding:var(--wt-space-4);border:0;border-radius:var(--dsw-radius-panel);background:var(--dsw-specific-menu);-webkit-backdrop-filter:var(--dsw-menu-backdrop-filter);backdrop-filter:var(--dsw-menu-backdrop-filter);box-shadow:var(--dsw-elevation-panel);color:var(--dsw-alias-label-primary);font-size:var(--wt-fs-row);line-height:var(--wt-lh-row);--dsw-elevation-stroke-color:var(--dsw-alias-border-l2);--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2,var(--wt-divider));--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2,var(--dsw-alias-scrollbar-bg-l2,var(--wt-divider)));--dsh-wt-listGutter:var(--wt-space-4);--dsh-wt-scrollRail:9px;--dsh-wt-scrollInset:2px;overflow:hidden;animation:dsh-wt-pop-in var(--wt-dur-base) var(--wt-ease) both}',
      '.dsh-wt-popoverRight{padding-left:var(--wt-space-4)}',
      '',
      '/* ── 3 面板头 · 标题与计数同一行，动作收在右侧 ───────────────────── */',
      '.dsh-wt-popHead{display:flex;align-items:center;justify-content:space-between;gap:var(--wt-space-3);min-width:0}',
      '.dsh-wt-popTitleLine{display:flex;align-items:center;gap:var(--wt-space-3);flex:1 1 auto;min-width:0}',
      '.dsh-wt-popTitle{min-width:0;overflow:hidden;font-size:var(--wt-fs-title);line-height:var(--wt-lh-title);font-weight:500;color:var(--dsw-alias-label-primary);white-space:nowrap;text-overflow:ellipsis}',
      '.dsh-wt-popMeta{min-width:0;margin:0;overflow:hidden;font-size:var(--wt-fs-caption);line-height:16px;color:var(--dsw-alias-label-secondary);font-weight:400;font-variant-numeric:tabular-nums;white-space:nowrap;text-overflow:ellipsis}',
      '.dsh-wt-popActions{display:flex;align-items:center;flex:none;gap:var(--wt-space-2)}',
      '.dsh-wt-popClose,.dsh-wt-settingsBtn{display:grid;place-items:center;flex:none;width:24px;height:24px;padding:0;border:0;border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;transition:var(--wt-transition)}',
      '.dsh-wt-popClose:active,.dsh-wt-settingsBtn:active{background:var(--wt-active)}',
      '.dsh-wt-settingsBtn[data-active="true"]{background:var(--wt-hover);color:var(--dsw-alias-label-primary)}',
      '',
      '/* ── 4 添加区 · 嵌套表单组 R16，字段 0.5px 发丝线 ──────────────────── */',
      '.dsh-wt-add{display:flex;flex-direction:column;gap:var(--wt-space-2);padding:var(--wt-space-3);border:0.5px solid var(--dsw-alias-settings-card-stroke);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-settings-card-fill);transition:var(--wt-transition)}',
      '.dsh-wt-add:focus-within{border-color:var(--dsw-alias-state-business-primary)}',
      '.dsh-wt-input{display:block;flex:0 0 auto;width:100%;min-width:0;box-sizing:border-box;min-height:var(--wt-lh-row);max-height:120px;padding:0;border:0;outline:0;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:var(--wt-fs-row);line-height:var(--wt-lh-row);resize:none;overflow-y:auto;overflow-x:hidden}',
      '.dsh-wt-input::placeholder{color:var(--dsw-alias-label-secondary)}',
      '.dsh-wt-addFoot{display:flex;align-items:center;justify-content:space-between;gap:var(--wt-space-2);width:100%;min-width:0}',
      '.dsh-wt-addShortcut{min-width:0;overflow:hidden;font-size:var(--wt-fs-caption);line-height:var(--wt-lh-caption);color:var(--dsw-alias-label-secondary);white-space:nowrap;text-overflow:ellipsis}',
      '.dsh-wt-addBtn{display:inline-flex;align-items:center;justify-content:center;flex:none;height:28px;padding:0 var(--wt-space-2);border:0;border-radius:var(--dsw-radius-sm);background:var(--dsw-alias-button-primary-fill);color:var(--dsw-alias-label-primary-foreground);font:inherit;font-size:var(--wt-fs-caption);line-height:var(--wt-lh-caption);font-weight:500;cursor:pointer;transition:var(--wt-transition)}',
      '.dsh-wt-addBtn:active{background:var(--dsw-alias-button-primary-dimmed);transform:scale(.97)}',
      '.dsh-wt-addBtn[disabled]{background:transparent;color:var(--dsw-alias-label-secondary);box-shadow:inset 0 0 0 0.5px var(--wt-field-line);cursor:not-allowed}',
      '',
      '/* ── 5 分区与列表 · 9px 轨道内嵌 2px，底部羽化只盖内容不盖滚动条 ──── */',
      '/* The viewport grows into the popover padding so the 9px rail does not steal from the cards; the list pays the padding back minus the rail, so cards and the add field keep one content width at every panel size. */',
      '.dsh-wt-listViewport{position:relative;display:flex;flex-direction:column;flex:1 1 auto;min-height:0;margin-right:calc(var(--dsh-wt-listGutter) * -1)}',
      '/* Bottom edge treatment: a viewport-fixed alpha mask over the scroller itself, exactly like the DSH scroll areas. The first gradient fades the last 48px to transparent; the second keeps the 9px scrollbar rail opaque so the thumb stays crisp. There is no backdrop-filter layer, so there is no hard compositing edge to see. */',
      '.dsh-wt-listViewport[data-bottom="true"] .dsh-wt-listArea{--dsh-wt-fadeHeight:calc(var(--wt-space-6) + var(--wt-space-4));-webkit-mask-image:linear-gradient(to bottom,currentColor 0,currentColor calc(100% - var(--dsh-wt-fadeHeight)),transparent 100%),linear-gradient(to right,transparent calc(100% - var(--dsh-wt-scrollRail)),currentColor calc(100% - var(--dsh-wt-scrollRail)));mask-image:linear-gradient(to bottom,currentColor 0,currentColor calc(100% - var(--dsh-wt-fadeHeight)),transparent 100%),linear-gradient(to right,transparent calc(100% - var(--dsh-wt-scrollRail)),currentColor calc(100% - var(--dsh-wt-scrollRail)));-webkit-mask-composite:source-over;mask-composite:add}',
      '/* Geometry only: the shared DSH skin paints the thumb, so the plugin declares no scrollbar pseudo-elements. The popover already binds the l2 thumb pair for the menu material. */',
      '.dsh-wt-listArea{--dsh-scrollbar-width:var(--dsh-wt-scrollRail);--dsh-scrollbar-thumb-border:var(--dsh-wt-scrollInset);display:flex;flex-direction:column;flex:1 1 auto;min-height:0;padding-right:calc(var(--dsh-wt-listGutter) - var(--dsh-wt-scrollRail));overflow-x:hidden;overflow-y:auto;scrollbar-gutter:stable}',
      '.dsh-wt-listSection{display:flex;flex-direction:column;gap:var(--wt-space-2);min-width:0}',
      '.dsh-wt-listSection+.dsh-wt-listSection{margin-top:var(--wt-space-2)}',
      '.dsh-wt-sectionHead,.dsh-wt-doneHead{position:sticky;top:0;z-index:3;display:flex;align-items:center;justify-content:space-between;gap:var(--wt-space-3);min-height:28px;margin:0;padding:var(--wt-space-1) 0;background:transparent;transition:background-color var(--wt-dur-fast) var(--wt-ease)}',
      '.dsh-wt-sectionHead[data-stuck],.dsh-wt-doneHead[data-stuck]{background:var(--dsw-alias-menu-group-header-fill,var(--dsw-specific-menu));-webkit-backdrop-filter:var(--dsw-menu-backdrop-filter,blur(14px));backdrop-filter:var(--dsw-menu-backdrop-filter,blur(14px))}',
      '.dsh-wt-doneToggle{display:flex;align-items:center;gap:var(--wt-space-2);flex:none;min-width:0;margin:0;padding:var(--wt-space-1) var(--wt-space-2) var(--wt-space-1) 0;border:0;border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:var(--wt-fs-caption);line-height:var(--wt-lh-caption);font-weight:500;text-align:left;cursor:pointer;transition:var(--wt-transition)}',
      '.dsh-wt-doneToggle:active{background:var(--wt-active)}',
      '.dsh-wt-doneToggle[disabled]{color:var(--dsw-alias-label-tertiary);cursor:not-allowed;pointer-events:none}',
      '.dsh-wt-chevron{display:flex;align-items:center;justify-content:center;flex:none;width:16px;height:16px;color:var(--dsw-alias-label-secondary);transition:transform var(--wt-dur-fast) var(--wt-ease)}',
      '.dsh-wt-chevron[data-open="true"]{transform:rotate(90deg)}',
      '.dsh-wt-sectionCount{display:inline-flex;align-items:center;justify-content:center;min-width:18px;height:18px;padding:0 var(--wt-space-1);border:0.5px solid var(--dsw-alias-border-l3);border-radius:var(--wt-radius-pill);corner-shape:round;background:var(--dsw-alias-interactive-bg-hover-solid);color:var(--dsw-alias-label-primary);font-size:var(--wt-fs-caption);line-height:16px;font-weight:500;font-variant-numeric:tabular-nums}',
      '.dsh-wt-clear{display:inline-flex;align-items:center;flex:none;height:24px;margin-left:auto;padding:0 var(--wt-space-2);border:0;border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:var(--wt-fs-caption);line-height:var(--wt-lh-caption);font-weight:500;cursor:pointer;transition:var(--wt-transition)}',
      '.dsh-wt-clear:active{background:var(--wt-active);color:var(--dsw-alias-label-primary)}',
      '.dsh-wt-clearConfirm{display:flex;align-items:center;justify-content:space-between;gap:var(--wt-space-2);min-width:0;margin-top:var(--wt-space-1);padding:var(--wt-space-2);border:0.5px solid var(--dsw-alias-settings-card-stroke);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-settings-card-fill)}',
      '.dsh-wt-clearConfirmText{flex:1 1 auto;min-width:0;margin:0;font-size:var(--wt-fs-caption);line-height:var(--wt-lh-caption);color:var(--dsw-alias-label-primary);overflow-wrap:anywhere}',
      '.dsh-wt-clearConfirmActions{display:flex;align-items:center;flex:none;gap:var(--wt-space-1)}',
      '.dsh-wt-doneRows{margin-top:var(--wt-space-2)}',
      '.dsh-wt-rows{list-style:none;margin:0;padding:0;border:0.5px solid var(--dsw-alias-settings-card-stroke);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-settings-card-fill);overflow:hidden}',
      '.dsh-wt-row{display:flex;align-items:flex-start;gap:var(--wt-space-2);padding:var(--wt-space-2);border-top:0.5px solid var(--wt-divider);transition:var(--wt-transition)}',
      '.dsh-wt-row:first-child{border-top:0}',
      '',
      '/* ── 6 一行便笺 · 勾选圈 14px，命中区 24px ─────────────────────────── */',
      '.dsh-wt-check{display:flex;align-items:center;justify-content:center;flex:none;width:24px;height:24px;margin:-2px 0 0;padding:0;border:0;border-radius:var(--wt-radius-pill);corner-shape:round;background:transparent;color:transparent;font:inherit;cursor:pointer;transition:var(--wt-transition)}',
      '.dsh-wt-checkCircle{display:flex;align-items:center;justify-content:center;width:14px;height:14px;box-sizing:border-box;border:0.5px solid var(--dsw-alias-label-tertiary);border-radius:var(--wt-radius-pill);corner-shape:round;background:transparent;color:transparent;transition:border-color var(--wt-dur-fast) var(--wt-ease),background-color var(--wt-dur-fast) var(--wt-ease),color var(--wt-dur-fast) var(--wt-ease),transform var(--wt-dur-fast) var(--wt-ease)}',
      '.dsh-wt-check:active .dsh-wt-checkCircle{transform:scale(.9)}',
      '.dsh-wt-check[aria-checked="true"] .dsh-wt-checkCircle{border-color:var(--dsw-alias-brand-primary);background:var(--dsw-alias-brand-primary);color:var(--dsw-alias-label-primary-foreground)}',
      '.dsh-wt-itemBody{display:flex;flex:1;flex-direction:column;gap:var(--wt-space-1);min-width:0}',
      '.dsh-wt-text{display:block;width:100%;margin:0;padding:0;border:0;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:var(--wt-fs-row);line-height:var(--wt-lh-row);text-align:left;white-space:pre-wrap;overflow-wrap:anywhere;cursor:text;user-select:text;-webkit-user-select:text}',
      '.dsh-wt-rowDone .dsh-wt-text{color:var(--dsw-alias-label-secondary);text-decoration:line-through;text-decoration-thickness:1px;text-decoration-color:var(--dsw-alias-label-tertiary)}',
      '.dsh-wt-rowFoot{display:flex;align-items:center;justify-content:space-between;gap:var(--wt-space-2);min-height:24px}',
      '.dsh-wt-meta{flex:0 1 auto;min-width:0;overflow:hidden;font-size:var(--wt-fs-caption);line-height:var(--wt-lh-caption);color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums;white-space:nowrap;text-overflow:ellipsis}',
      '',
      '/* ── 7 行操作 · 图标按钮 H24/R8，触摸端常显 ────────────────────────── */',
      '.dsh-wt-actions{display:flex;flex:none;gap:var(--wt-space-1)}',
      '.dsh-wt-iconBtn{position:relative;display:flex;align-items:center;justify-content:center;width:24px;height:24px;padding:0;border:0;border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;transition:var(--wt-transition)}',
      '.dsh-wt-iconBtn:active{background:var(--wt-active);color:var(--dsw-alias-label-primary);transform:scale(.94)}',
      '.dsh-wt-iconBtn:disabled,.dsh-wt-iconBtn[disabled]{color:var(--dsw-alias-label-tertiary);cursor:not-allowed;pointer-events:none}',
      '.dsh-wt-forwardMark{position:absolute;right:0;bottom:0;display:flex;align-items:center;justify-content:center;width:10px;height:10px;border-radius:var(--wt-radius-pill);corner-shape:round;background:var(--dsw-alias-label-secondary);color:var(--dsw-alias-label-primary-foreground);pointer-events:none}',
      '',
      '/* ── 8 就地编辑 · 保存/取消为紧凑描边按钮 ──────────────────────────── */',
      '.dsh-wt-edit{display:flex;flex-direction:column;gap:var(--wt-space-1);width:100%}',
      '.dsh-wt-editInput{display:block;width:100%;box-sizing:border-box;min-height:var(--wt-lh-row);max-height:160px;padding:var(--wt-space-1) var(--wt-space-2);border:0.5px solid var(--wt-field-line);border-radius:var(--dsw-radius-sm);background:var(--wt-field);color:var(--dsw-alias-label-primary);font:inherit;font-size:var(--wt-fs-row);line-height:var(--wt-lh-row);outline:0;resize:none;overflow-y:auto;overflow-x:hidden;transition:var(--wt-transition)}',
      '.dsh-wt-editInput:focus{border-color:var(--dsw-alias-state-business-primary)}',
      '.dsh-wt-editActions{display:flex;align-items:center;gap:var(--wt-space-1)}',
      '.dsh-wt-editHint{flex:1 1 auto;min-width:0;margin-left:auto;overflow:hidden;font-size:var(--wt-fs-caption);line-height:var(--wt-lh-caption);text-align:right;color:var(--dsw-alias-label-secondary);white-space:nowrap;text-overflow:ellipsis}',
      '.dsh-wt-mini{display:inline-flex;align-items:center;justify-content:center;flex:none;height:24px;padding:0 var(--wt-space-2);border:0.5px solid var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:var(--wt-fs-caption);line-height:var(--wt-lh-caption);font-weight:500;cursor:pointer;transition:var(--wt-transition)}',
      '.dsh-wt-mini:active{background:var(--wt-active)}',
      '.dsh-wt-mini[disabled]{color:var(--dsw-alias-label-tertiary);cursor:not-allowed;pointer-events:none}',
      '.dsh-wt-miniPrimary{border-color:transparent;background:var(--dsw-alias-button-primary-fill);color:var(--dsw-alias-label-primary-foreground)}',
      '.dsh-wt-miniPrimary:active{background:var(--dsw-alias-button-primary-dimmed)}',
      '.dsh-wt-miniDanger{border-color:transparent;background:var(--dsw-alias-state-error-primary);color:var(--dsw-alias-label-primary-foreground)}',
      '.dsh-wt-miniDanger:active{background:var(--dsw-alias-state-error-primary)}',
      '',
      '/* ── 9 空态 · 虚线 1px，说明 12/次级墨色 ──────────────────────────── */',
      '.dsh-wt-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:var(--wt-space-2);padding:var(--wt-space-5) var(--wt-space-4);border:1px dashed var(--wt-divider);border-radius:var(--dsw-radius-lg);text-align:center}',
      '.dsh-wt-emptyIcon{display:flex;align-items:center;justify-content:center;width:32px;height:32px;margin:0 0 var(--wt-space-1);border-radius:var(--dsw-radius-md);background:var(--wt-hover);color:var(--dsw-alias-label-secondary)}',
      '.dsh-wt-emptyTitle{font-size:var(--wt-fs-row);line-height:var(--wt-lh-row);font-weight:500;color:var(--dsw-alias-label-primary)}',
      '.dsh-wt-emptyBody{max-width:36ch;font-size:var(--wt-fs-caption);line-height:var(--wt-lh-caption);color:var(--dsw-alias-label-secondary);overflow-wrap:anywhere}',
      '',
      '/* ── 10 设置 · 分组 R16，项间 0.5px 分隔线，链接走 --dsw-alias-link ── */',
      '.dsh-wt-settings{--dsh-wt-settingIndent:var(--wt-space-3);display:flex;flex-direction:column;gap:var(--wt-space-2);margin:0;padding:var(--wt-space-3);border:0.5px solid var(--dsw-alias-settings-card-stroke);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-settings-card-fill)}',
      '.dsh-wt-settingsHead{font-size:var(--wt-fs-row);line-height:var(--wt-lh-row);font-weight:500;color:var(--dsw-alias-label-primary)}',
      '.dsh-wt-settingGroup{display:flex;flex-direction:column;gap:var(--wt-space-1);min-width:0}',
      '.dsh-wt-settingGroup+.dsh-wt-settingGroup{margin-top:var(--wt-space-2);padding-top:var(--wt-space-2);border-top:0.5px solid var(--wt-divider)}',
      '.dsh-wt-settingLabel{font-size:var(--wt-fs-caption);line-height:var(--wt-lh-caption);font-weight:500;color:var(--dsw-alias-label-secondary)}',
      '.dsh-wt-settingBody{display:flex;flex-direction:column;gap:var(--wt-space-1);padding-left:var(--dsh-wt-settingIndent)}',
      '.dsh-wt-settingItem{display:flex;flex-direction:column;gap:var(--wt-space-1);min-width:0}',
      '.dsh-wt-settingItem+.dsh-wt-settingItem{margin-top:var(--wt-space-2);padding-top:var(--wt-space-2);border-top:0.5px solid var(--wt-divider)}',
      '.dsh-wt-settingChoices{display:flex;flex-direction:column;gap:var(--wt-space-1)}',
      '.dsh-wt-settingChoice{display:flex;align-items:flex-start;gap:var(--wt-space-2);font-size:var(--wt-fs-row);line-height:var(--wt-lh-row);color:var(--dsw-alias-label-primary);cursor:pointer}',
      '.dsh-wt-settingChoice input{appearance:none;flex:none;width:14px;height:14px;margin:calc((var(--wt-lh-row) - 14px) / 2) 0 0;box-sizing:border-box;border:0.5px solid var(--dsw-alias-label-tertiary);border-radius:var(--wt-radius-pill);corner-shape:round;background:transparent;cursor:pointer;transition:var(--wt-transition)}',
      '.dsh-wt-settingChoice input:checked{border-color:var(--dsw-alias-brand-primary);background:var(--dsw-alias-brand-primary);box-shadow:inset 0 0 0 3px var(--wt-field)}',
      '.dsh-wt-settingInput{box-sizing:border-box;width:100%;height:28px;padding:0 var(--wt-space-2);border:0.5px solid var(--wt-field-line);border-radius:var(--dsw-radius-sm);background:var(--wt-field);color:var(--dsw-alias-label-primary);font-family:inherit;font-size:var(--wt-fs-row);line-height:var(--wt-lh-row);font-weight:500;outline:0;transition:var(--wt-transition)}',
      '.dsh-wt-settingItem>.dsh-wt-settingInput{font-family:inherit;font-size:var(--wt-fs-row);line-height:var(--wt-lh-row);font-weight:500}',
      '.dsh-wt-settingInput:focus{border-color:var(--dsw-alias-state-business-primary)}',
      '.dsh-wt-settingHint{margin:0;font-size:var(--wt-fs-caption);line-height:var(--wt-lh-caption);color:var(--dsw-alias-label-secondary)}',
      '.dsh-wt-settingHintNote{margin-top:var(--wt-space-1)}',
      '.dsh-wt-settingAbout{display:flex;align-items:baseline;gap:var(--wt-space-1);min-width:0;overflow:hidden;font-size:var(--wt-fs-caption);line-height:var(--wt-lh-caption);color:var(--dsw-alias-label-secondary);white-space:nowrap}',
      '.dsh-wt-settingAbout>span{flex:none}',
      '.dsh-wt-settingProject{display:flex;align-items:baseline;gap:var(--wt-space-1);min-width:0;overflow:hidden;font-size:var(--wt-fs-caption);line-height:var(--wt-lh-caption);color:var(--dsw-alias-label-secondary);white-space:nowrap}',
      '.dsh-wt-settingProject>span{flex:none}',
      '.dsh-wt-settingDot{flex:none;color:var(--dsw-alias-label-tertiary)}',
      '.dsh-wt-settingLink{flex:0 1 auto;min-width:0;overflow:hidden;color:var(--dsw-alias-link);font-weight:500;text-decoration:none;text-overflow:ellipsis;transition:var(--wt-transition)}',
      '.dsh-wt-settingLink:focus-visible{text-decoration:underline;text-decoration-style:dotted;text-decoration-thickness:1px;text-underline-offset:3px}',
      '',
      '/* ── 11 面板脚注 · 存储状态就地提示，错误用状态色 ─────────────────── */',
      '.dsh-wt-popFoot{margin:0;font-size:var(--wt-fs-caption);line-height:var(--wt-lh-caption);color:var(--dsw-alias-label-secondary)}',
      '.dsh-wt-error{color:var(--dsw-alias-state-error-primary)}',
      '',
      '/* ── 12 会话顶部入口 · H28/R8，计数徽标为胶囊 ──────────────────────── */',
      '.dsh-wt-headerBtn{position:relative;display:inline-flex;align-items:center;justify-content:center;flex:none;width:28px;height:28px;padding:0;border:0;border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;transition:var(--wt-transition)}',
      '.dsh-wt-headerBtn:active{background:var(--wt-active);color:var(--dsw-alias-label-primary)}',
      '.dsh-wt-headerBtn[data-active="true"]{background:var(--wt-hover);color:var(--dsw-alias-label-primary)}',
      '.dsh-wt-headerBtn[data-disabled="true"]{color:var(--dsw-alias-label-tertiary);cursor:not-allowed;pointer-events:none}',
      '.dsh-wt-headerIcon{display:flex;align-items:center;justify-content:center;flex:none;width:16px;height:16px;color:currentColor}',
      '.dsh-wt-headerCount{position:absolute;top:-2px;right:-2px;box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;min-width:16px;height:16px;padding:0 var(--wt-space-1);border:0.5px solid var(--dsw-alias-bg-base);border-radius:var(--wt-radius-pill);corner-shape:round;background:var(--dsw-alias-interactive-bg-hover-solid);color:var(--dsw-alias-label-secondary);font-size:var(--wt-fs-caption);line-height:14px;font-weight:500;font-variant-numeric:tabular-nums}',
      '',
      '/* ── 13 拖拽把手 · 8px 命中带，3px 视觉条 ─────────────────────────── */',
      '.dsh-wt-resizeHandle{position:absolute;left:0;top:0;bottom:0;z-index:2;display:flex;align-items:center;justify-content:center;width:var(--wt-space-2);cursor:ew-resize;touch-action:none;outline:0}',
      '.dsh-wt-resizeHandle::before{content:"";width:3px;height:var(--wt-space-6);border-radius:var(--wt-radius-pill);corner-shape:round;background:var(--dsw-alias-border-l4);transition:transform var(--wt-dur-fast) var(--wt-ease),background-color var(--wt-dur-fast) var(--wt-ease)}',
      '.dsh-wt-resizeHandle:focus-visible::before{background:var(--dsw-alias-label-secondary)}',
      '.dsh-wt-resizeHandle:focus-visible{outline-offset:-2px;border-radius:var(--dsw-radius-sm)}',
      '.dsh-wt-resizeHandleBottom{position:absolute;left:50%;bottom:0;z-index:2;display:flex;align-items:center;justify-content:center;width:var(--wt-space-6);height:var(--wt-space-3);transform:translateX(-50%);cursor:ns-resize;touch-action:none;outline:0}',
      '.dsh-wt-resizeHandleBottom::before{content:"";width:var(--wt-space-5);height:3px;border-radius:var(--wt-radius-pill);corner-shape:round;background:var(--dsw-alias-border-l4);transition:transform var(--wt-dur-fast) var(--wt-ease),background-color var(--wt-dur-fast) var(--wt-ease)}',
      '.dsh-wt-resizeHandleBottom:focus-visible::before{background:var(--dsw-alias-label-secondary)}',
      '.dsh-wt-resizeHandleBottom:focus-visible{outline-offset:-2px;border-radius:var(--dsw-radius-sm)}',
      '',
      '/* ── 14 加载 · 控件内 12px 环，文字隐藏，不报"进行中" ──────────────── */',
      '[data-loading="true"]{position:relative;color:transparent!important;pointer-events:none;cursor:progress}',
      '[data-loading="true"]>*{visibility:hidden}',
      '[data-loading="true"]::after{content:"";position:absolute;left:50%;top:50%;box-sizing:border-box;width:12px;height:12px;margin:-6px 0 0 -6px;border:1.5px solid var(--dsw-alias-label-secondary);border-top-color:transparent;border-radius:var(--wt-radius-pill);corner-shape:round;animation:dsh-wt-spin var(--wt-dur-spin) linear infinite}',
      '',
      '/* ── 15 悬停 · 只在支持 hover 的设备上启用（触摸端常显操作） ────────── */',
      '@media (hover:hover){',
      '.dsh-wt-row:hover{background:var(--wt-hover)}',
      '.dsh-wt-actions{opacity:0;pointer-events:none}',
      '.dsh-wt-row:hover .dsh-wt-actions,.dsh-wt-row:focus-within .dsh-wt-actions{opacity:1;pointer-events:auto}',
      '.dsh-wt-iconBtn:hover{background:var(--wt-hover);color:var(--dsw-alias-label-primary)}',
      '.dsh-wt-iconBtnDanger:hover{background:var(--dsw-alias-interactive-bg-hover-danger);color:var(--dsw-alias-state-error-primary)}',
      '.dsh-wt-popClose:hover,.dsh-wt-settingsBtn:hover{background:var(--wt-hover);color:var(--dsw-alias-label-primary)}',
      '.dsh-wt-addBtn:hover:not([disabled]){background:var(--dsw-alias-button-primary-hover)}',
      '.dsh-wt-mini:hover:not([disabled]){background:var(--wt-hover)}',
      '.dsh-wt-miniPrimary:hover:not([disabled]){background:var(--dsw-alias-button-primary-hover);color:var(--dsw-alias-label-primary-foreground)}',
      '.dsh-wt-miniDanger:hover:not([disabled]){background:var(--dsw-alias-interactive-bg-hover-danger);color:var(--dsw-alias-state-error-primary)}',
      '.dsh-wt-clear:hover{background:var(--wt-hover);color:var(--dsw-alias-label-primary)}',
      '.dsh-wt-doneToggle:hover{background:var(--wt-hover)}',
      '.dsh-wt-check:hover .dsh-wt-checkCircle{border-color:var(--dsw-alias-label-primary)}',
      '.dsh-wt-settingChoice:hover input{border-color:var(--dsw-alias-label-primary)}',
      '.dsh-wt-settingLink:hover{text-decoration:underline;text-decoration-style:dotted;text-decoration-thickness:1px;text-underline-offset:3px}',
      '.dsh-wt-headerBtn:hover{background:var(--wt-hover);color:var(--dsw-alias-label-primary)}',
      '.dsh-wt-resizeHandle:hover::before{transform:scaleY(1.4);background:var(--dsw-alias-label-secondary)}',
      '.dsh-wt-resizeHandleBottom:hover::before{transform:scaleX(1.4);background:var(--dsw-alias-label-secondary)}',
      '}',
      '',
      '/* ── 16 动效 · 只动 opacity/transform，错峰出场封顶 ─────────────────── */',
      '@media (prefers-reduced-motion:no-preference){',
      '.dsh-wt-rows>.dsh-wt-row{animation:dsh-wt-row-in var(--wt-dur-base) var(--wt-ease) both}',
      '.dsh-wt-rows>.dsh-wt-row:nth-child(2){animation-delay:var(--wt-space-1)}',
      '.dsh-wt-rows>.dsh-wt-row:nth-child(3){animation-delay:var(--wt-space-2)}',
      '.dsh-wt-rows>.dsh-wt-row:nth-child(4){animation-delay:calc(var(--wt-space-2) + var(--wt-space-1))}',
      '.dsh-wt-rows>.dsh-wt-row:nth-child(n+5){animation-delay:var(--wt-space-3)}',
      '}',
      '@keyframes dsh-wt-pop-in{from{opacity:0}to{opacity:1}}',
      '@keyframes dsh-wt-row-in{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}',
      '@keyframes dsh-wt-spin{to{transform:rotate(360deg)}}',
      '@media (prefers-reduced-motion:reduce){',
      '.dsh-wt-popover,.dsh-wt-rows>.dsh-wt-row,.dsh-wt-chevron,[data-loading="true"]::after{animation:none}',
      '.dsh-wt-popover,.dsh-wt-row,.dsh-wt-actions,.dsh-wt-iconBtn{transition-duration:1ms}',
      '}',
      '',
      '/* ── 17 窄视口 · 390 基准下收紧内边距，主操作全部可达 ──────────────── */',
      '@media (max-width:480px){',
      '.dsh-wt-popover{padding:var(--wt-space-3);--dsh-wt-listGutter:var(--wt-space-3)}',
      '.dsh-wt-popoverRight{padding-left:var(--wt-space-4)}',
      '.dsh-wt-popHead{gap:var(--wt-space-2)}',
      '.dsh-wt-add{padding:var(--wt-space-2) var(--wt-space-3)}',
      '.dsh-wt-sectionHead,.dsh-wt-doneHead{min-height:24px}',
      '}',
      '',
    ].join('')

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
    function appendToConversation(text, prefix = '') {
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

    /**
     * Sanitize one session's notes. The store is user-editable, so treat
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
        return typeof raw === 'string' ? raw.slice(0, 80) : ''
      } catch (error) {
        return ''
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

    /** Per-session memos plus a synchronous writer that never invents state. */
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

      // A failed write leaves the rendered record alone: the row the user just
      // deleted stays on screen next to the failure toast, instead of the panel
      // reporting success for something the browser never stored.
      const commit = React.useCallback(updater => {
        const current = recordRef.current || { items: [], updatedAt: 0 }
        const nextItems = normalizeItems(updater(current.items || []))
        const next = { items: nextItems, updatedAt: Date.now() }
        const ok = writeSessionRecord(sessionRef.current, next)
        setSyncError(!ok)
        if (!ok) return false
        recordRef.current = next
        setRecord(next)
        return true
      }, [])

      return { record, syncError, commit }
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

    /**
     * Best-known completion stamp for a done note. Newer records carry
     * `completedAt`; older ones only have `updatedAt`, so fall back in order
     * until a finite time is found. Returns 0 when the item has no usable stamp.
     */
    function completedStamp(item) {
      if (!item) return 0
      const candidates = [item.completedAt, item.updatedAt, item.createdAt]
      for (const time of candidates) {
        if (Number.isFinite(time)) return time
      }
      return 0
    }

    /** Newest completion first; updatedAt then createdAt keep equal stamps stable. */
    function compareDoneItems(a, b) {
      const byCompletion = completedStamp(b) - completedStamp(a)
      if (byCompletion) return byCompletion
      const aUpdated = Number.isFinite(a && a.updatedAt) ? a.updatedAt : 0
      const bUpdated = Number.isFinite(b && b.updatedAt) ? b.updatedAt : 0
      if (aUpdated !== bUpdated) return bUpdated - aUpdated
      const aCreated = Number.isFinite(a && a.createdAt) ? a.createdAt : 0
      const bCreated = Number.isFinite(b && b.createdAt) ? b.createdAt : 0
      return bCreated - aCreated
    }

    /**
     * Mark the section head that is actually pinned to the scroller's top edge.
     * Sticky heads stay transparent in flow; only the pinned one takes the menu
     * group-header fill, so no full-width layer sits over the list at rest.
     */
    function syncStickyHeads(node) {
      const areaTop = node.getBoundingClientRect().top
      for (const head of node.querySelectorAll('.dsh-wt-sectionHead, .dsh-wt-doneHead')) {
        const naturalTop = head.offsetTop - node.offsetTop
        const top = head.getBoundingClientRect().top
        const pinned = node.scrollTop > naturalTop && top >= areaTop - 1 && top <= areaTop + 1
        head.toggleAttribute('data-stuck', pinned)
      }
    }

    /** Done notes show creation and completion age; open ones show creation age only. */
    function metaLabel(item, say, localeId) {
      const created = ageLabel(item && item.createdAt, say, localeId)
      if (!item || item.done !== true) return created
      const completed = completedStamp(item) || (item ? item.createdAt : 0)
      return say('time.createdDone', { created, completed: ageLabel(completed, say, localeId) })
    }

    /**
     * Glyphs come from the shared product icon set; this plugin draws none of
     * its own, so stroke weight, optical size and currentColor stay consistent
     * with the surrounding shell.
     */
    function Glyph(props) {
      const Component = icon(props.name)
      if (!Component) return null
      return h(Component, { size: props.size })
    }

    const IconCheck = props => h(Glyph, { name: 'IconCheckOutlineMedium', size: props && props.size ? props.size : 12 })
    const IconCopy = () => h(Glyph, { name: 'IconCopyOutlineRegular', size: 14 })
    const IconForward = () => h(Glyph, { name: 'IconShareOutlineRegular', size: 14 })
    const IconGear = () => h(Glyph, { name: 'IconSettingsOutlineRegular', size: 14 })
    const IconPencil = () => h(Glyph, { name: 'IconEditOutlineRegular', size: 14 })
    const IconTrash = () => h(Glyph, { name: 'IconTrashOutlineRegular', size: 14 })
    const IconChevron = () => h(Glyph, { name: 'IconChevronRightOutlineRegular', size: 12 })
    const IconEmpty = () => h(Glyph, { name: 'IconChecklistOutlineRegular', size: 18 })
    const IconClose = () => h(Glyph, { name: 'IconCloseOutlineRegular', size: 14 })

    /** Wrap one icon-only control in the shared tooltip; a bare button when absent. */
    function withTooltip(label, node) {
      if (!Tooltip) return node
      return h(Tooltip, { label, side: 'top', portal: true, gap: 6 }, node)
    }

    function TodoRow(props) {
      const { item, done, say, onToast, onToggle, onStartEdit, onDelete, editing, editDraft, setEditDraft, onEditDraftChange, onFinishEdit, onCancelEdit, editRef, forwardPrefix, sendShortcut = SEND_SHORTCUT_DEFAULT, forwarded = false, onForwarded, onUnforwarded } = props
      const editHintKey = sendShortcut === 'enter' ? 'edit.hintEnter' : 'edit.hintCtrlEnter'
      const [pending, setPending] = React.useState('')
      const mountedRef = React.useRef(true)

      React.useEffect(() => {
        mountedRef.current = true
        return () => {
          mountedRef.current = false
        }
      }, [])

      const copy = async () => {
        if (pending) return
        setPending('copy')
        let ok = false
        try {
          ok = await copyText(item.text)
        } finally {
          if (mountedRef.current) setPending('')
        }
        if (!mountedRef.current) return
        // Settled outcome goes to the frame-wide toast, which outlives the panel.
        if (onToast) onToast(ok ? 'copied' : 'copyFailed')
      }

      const forward = () => {
        // A forwarded note toggles its mark off instead of staging the text again.
        if (forwarded) {
          if (onUnforwarded) onUnforwarded(item)
          if (onToast) onToast('unforwarded')
          return
        }
        if (!appendToConversation(item.text, forwardPrefix)) {
          if (onToast) onToast('forwardFailed')
          return
        }
        // Remember the forward so the button keeps its check after a reopen.
        if (onForwarded) onForwarded(item)
        if (onToast) onToast('forwarded')
      }

      // The checkbox is only the note's state: open or done. Forwarding never moves it.
      const toggleCheck = () => onToggle(item)

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
                const chord = event.ctrlKey || event.metaKey
                const platformModifier = isSendModifier(event)
                if (sendShortcut === 'enter') {
                  if (!chord && !event.shiftKey) {
                    event.preventDefault()
                    onFinishEdit(item)
                  } else {
                    // The platform modifier (⌘/Ctrl)+Enter and Shift+Enter break the line instead of saving.
                    event.preventDefault()
                    insertEditNewline(event.currentTarget)
                  }
                  return
                }
                // 'ctrl-enter': the platform modifier saves; Enter and Shift+Enter break the line.
                if (platformModifier) {
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
              h('span', { className: 'dsh-wt-editHint', title: say(editHintKey, { mod: MOD_LABEL }) }, say(editHintKey, { mod: MOD_LABEL })),
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

      const checked = done === true

      return h(
        'li',
        { className: done ? 'dsh-wt-row dsh-wt-rowDone' : 'dsh-wt-row' },
        h(
          'button',
          {
            type: 'button',
            className: 'dsh-wt-check',
            role: 'checkbox',
            'aria-checked': checked ? 'true' : 'false',
            'aria-label': say(done ? 'item.markOpen' : 'item.markDone'),
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
                h('span', { className: 'dsh-wt-meta', title: metaLabel(item, say, props.localeId) }, metaLabel(item, say, props.localeId)),
                h(
                  'div',
                  { className: 'dsh-wt-actions' },
                  withTooltip(say('item.copy'), h(
                    'button',
                    {
                      type: 'button',
                      className: 'dsh-wt-iconBtn',
                      'aria-label': say('item.copy'),
                      'aria-busy': pending === 'copy' ? 'true' : 'false',
                      'data-loading': pending === 'copy' ? 'true' : undefined,
                      onClick: copy,
                    },
                    h(IconCopy, null),
                  )),
                  // A completed note has nothing left to hand to the composer,
                  // so the forward action is absent rather than disabled.
                  done ? null : withTooltip(say(forwarded ? 'item.forwarded' : 'item.forward'), h(
                    'button',
                    {
                      type: 'button',
                      className: 'dsh-wt-iconBtn',
                      'aria-label': say(forwarded ? 'item.forwarded' : 'item.forward'),
                      'data-forwarded': forwarded ? 'true' : undefined,
                      onClick: forward,
                    },
                    h(IconForward, null),
                    forwarded
                      ? h('span', { className: 'dsh-wt-forwardMark', 'aria-hidden': true }, h(IconCheck, { size: 8 }))
                      : null,
                  )),
                  withTooltip(say('item.edit'), h(
                    'button',
                    {
                      type: 'button',
                      className: 'dsh-wt-iconBtn',
                      'aria-label': say('item.edit'),
                      onClick: () => onStartEdit(item),
                    },
                    h(IconPencil, null),
                  )),
                  withTooltip(say('item.delete'), h(
                    'button',
                    {
                      type: 'button',
                      className: 'dsh-wt-iconBtn dsh-wt-iconBtnDanger',
                      'aria-label': say('item.delete'),
                      onClick: () => onDelete(item),
                    },
                    h(IconTrash, null),
                  )),
                ),
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

    /**
     * Frame-owned top safety margin for floating surfaces. Read from the layout
     * rather than baked in, so macOS window chrome and the Windows titlebar both
     * keep their clearance without this page touching the global variable.
     */
    function overlayTopFloor(margin) {
      try {
        const raw = getComputedStyle(document.body).getPropertyValue('--dsh-frame-overlay-top').trim()
        const value = Number.parseFloat(raw)
        if (Number.isFinite(value) && value > 0) return Math.max(margin, value)
      } catch (error) {
        /* fall through to the plain viewport margin */
      }
      return margin
    }

    /**
     * Fixed panel placement: a right-side panel for the experimental entry,
     * otherwise below the anchor. Both stay inside the viewport margin, and the
     * gap side is only abandoned when the opposite side genuinely fits.
     */
    function memoPopoverStyle(anchor, placement, requestedWidth, requestedHeight) {
      const margin = window.innerWidth <= 480 ? 12 : 16
      const topFloor = overlayTopFloor(margin)
      const available = Math.max(PANEL_MIN_WIDTH, window.innerWidth - margin * 2)
      const width = Math.max(PANEL_MIN_WIDTH, Math.min(PANEL_MAX_WIDTH, available, requestedWidth || PANEL_DEFAULT_WIDTH))
      if (placement === 'right') {
        const rect = anchor && anchor.isConnected ? anchor.getBoundingClientRect() : null
        let desiredRight = rect && rect.width > 0 ? rect.right : window.innerWidth - margin
        const sidebar = [...document.querySelectorAll('[data-sidebar-right-panel][data-sidebar-right-open]')].find(node => {
          const box = node.getBoundingClientRect()
          return box.width > 24 && box.left > 0 && box.left < window.innerWidth - 24
        })
        if (sidebar) {
          desiredRight = Math.min(desiredRight, sidebar.getBoundingClientRect().left - 8)
        }
        const rightInset = Math.max(margin, Math.min(window.innerWidth - margin, window.innerWidth - desiredRight))
        const top = rect && rect.width > 0 ? Math.max(topFloor, Math.round(rect.bottom + 8)) : topFloor
        const maxHeight = Math.max(160, window.innerHeight - top - margin)
        const height = requestedHeight
          ? Math.max(Math.min(PANEL_MIN_HEIGHT, maxHeight), Math.min(maxHeight, requestedHeight))
          : 0
        const style = { right: `${rightInset}px`, left: 'auto', top: `${top}px`, width: `${width}px`, maxHeight: `${maxHeight}px` }
        if (height) style.height = `${height}px`
        return style
      }
      const maxHeight = Math.max(160, Math.min(460, window.innerHeight - topFloor - margin))
      if (!anchor) return { left: `${margin}px`, top: `${topFloor}px`, width: `${width}px`, maxHeight: `${maxHeight}px` }
      const rect = anchor.getBoundingClientRect()
      const left = rect.left < 420
        ? Math.max(margin, rect.left)
        : Math.max(margin, Math.min(rect.right - width, window.innerWidth - width - margin))
      let top = rect.bottom + 8
      // Flip above only when the space below the anchor cannot hold the panel.
      if (top + maxHeight > window.innerHeight - margin) top = Math.max(topFloor, rect.top - maxHeight - 8)
      return { left: `${left}px`, top: `${top}px`, width: `${width}px`, maxHeight: `${maxHeight}px` }
    }

    /** Compact floating memo list, anchored to the entry that opened it. */
    function MemoPopover(props) {
      const say = props.say
      const localeId = props.localeId
      const sessionId = props.sessionId || ''
      /** Settled outcomes go to the frame-wide toast host, not to inline marks. */
      const report = typeof props.onToast === 'function' ? props.onToast : () => {}
      const { record, syncError, commit } = useSessionMemoStore(props.sessionId)
      const [draft, setDraft] = React.useState(() => readSessionDrafts(sessionId).add)
      const [editingId, setEditingId] = React.useState(null)
      const [editDraft, setEditDraft] = React.useState('')
      // Read the remembered section state once per mount; the popover unmounts on close.
      const [initialSections] = React.useState(readSectionState)
      const [showDone, setShowDone] = React.useState(initialSections.done)
      const [showOpen, setShowOpen] = React.useState(initialSections.open)
      const [confirmClear, setConfirmClear] = React.useState(false)
      const sectionsRef = React.useRef(initialSections)
      const [showSettings, setShowSettings] = React.useState(false)
      const [sendShortcut, setSendShortcut] = React.useState(readSendShortcut)
      const [forwardPrefix, setForwardPrefix] = React.useState(readForwardPrefix)
      // Forwarded item ids of this session, read once per mount so reopen restores the forward mark.
      const [forwardedIds, setForwardedIds] = React.useState(() => readForwardedIds(sessionId))
      const forwardedSessionRef = React.useRef(sessionId ? String(sessionId) : '')
      const [panelWidth, setPanelWidth] = React.useState(readPanelWidth)
      const [panelHeight, setPanelHeight] = React.useState(readPanelHeight)
      const [style, setStyle] = React.useState(() => memoPopoverStyle(props.anchorRef.current, props.placement, panelWidth, panelHeight))
      const [listHasMore, setListHasMore] = React.useState(false)
      const panelRef = React.useRef(null)
      const listRef = React.useRef(null)
      const panelWidthRef = React.useRef(panelWidth)
      const panelHeightRef = React.useRef(panelHeight)
      const lastStyleRef = React.useRef('')
      const editRef = React.useRef(null)
      const addRef = React.useRef(null)
      const cancelEditRef = React.useRef(false)
      const composingRef = React.useRef(false)
      const clearConfirmTimerRef = React.useRef(0)

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

      // Opening the panel focuses the composer on pointer devices only: on touch
      // the same focus raises the software keyboard before the user asked for it.
      React.useLayoutEffect(() => {
        const node = addRef.current
        if (!node) return
        if (typeof window.matchMedia === 'function' && !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
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
      const doneItems = items.filter(item => item.done).sort(compareDoneItems)
      const openCount = openItems.length
      const total = items.length

      // Retire the confirmation when the completed section empties or collapses,
      // or when the popover switches session; unmount also drops the timer.
      React.useEffect(() => () => stopClearConfirmTimer(), [])
      React.useEffect(() => {
        if (confirmClear && (!showDone || doneItems.length === 0)) dismissClearConfirm()
      }, [confirmClear, showDone, doneItems.length])
      React.useEffect(() => {
        dismissClearConfirm()
      }, [sessionId])

      /** The bottom fade exists only while the list can still scroll down. */
      const syncListEdge = React.useCallback(() => {
        const node = listRef.current
        if (!node) return
        syncStickyHeads(node)
        const more = node.scrollTop + node.clientHeight < node.scrollHeight - 1
        setListHasMore(current => (current === more ? current : more))
      }, [])

      React.useEffect(() => {
        const node = listRef.current
        if (!node) return undefined
        syncListEdge()
        if (typeof ResizeObserver !== 'function') return undefined
        const observer = new ResizeObserver(syncListEdge)
        observer.observe(node)
        // Section boxes report added, removed, and edited notes; the viewport box
        // reports panel resizes. Neither needs to re-measure on every render.
        for (const section of node.children) observer.observe(section)
        return () => observer.disconnect()
      }, [items, showOpen, showDone, syncListEdge])

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
        const ok = commit(currentItems => [{ id: uid(), text, done: false, createdAt: now, updatedAt: now }, ...currentItems])
        // The draft is only cleared once the note is actually stored.
        if (!ok) {
          report('saveFailed')
          return
        }
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
        const ok = commit(currentItems => currentItems.map(candidate => {
          if (candidate.id !== item.id) return candidate
          const now = Date.now()
          return {
            ...candidate,
            done: !candidate.done,
            updatedAt: now,
            ...(candidate.done ? { completedAt: undefined } : { completedAt: now }),
          }
        }))
        if (!ok) {
          report('saveFailed')
          return
        }
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

      /** Remember a successful forward so the forward button keeps its check after closing the panel. */
      const rememberForwarded = item => {
        const id = item && item.id ? String(item.id) : ''
        if (!id) return
        markForwarded(sessionId, id)
        setForwardedIds(current => (current[id] ? current : { ...current, [id]: true }))
      }

      /** Toggle the forward mark off; the note and its open/done state stay untouched. */
      const unrememberForwarded = item => {
        const id = item && item.id ? String(item.id) : ''
        if (!id) return
        forgetForwardedItems(id)
      }

      const remove = item => {
        const ok = commit(currentItems => currentItems.filter(candidate => candidate.id !== item.id))
        // A failed delete keeps the row, its draft and its forward flag exactly
        // as they were, and the toast carries the failure.
        if (!ok) {
          report('saveFailed')
          return
        }
        report('deleted')
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
          const ok = commit(currentItems => currentItems.map(candidate => {
            if (candidate.id !== item.id) return candidate
            return { ...candidate, text, updatedAt: Date.now() }
          }))
          // Keeping the editor open preserves what the user typed.
          if (!ok) {
            report('saveFailed')
            return
          }
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

      /** Drop the pending auto-dismiss clock without touching state. */
      const stopClearConfirmTimer = () => {
        if (!clearConfirmTimerRef.current) return
        window.clearTimeout(clearConfirmTimerRef.current)
        clearConfirmTimerRef.current = 0
      }

      /** Close the inline band and drop its pending timer. */
      const dismissClearConfirm = () => {
        stopClearConfirmTimer()
        setConfirmClear(false)
      }

      /** Open the inline band; it retires itself after a short pause. */
      const askClearConfirm = () => {
        stopClearConfirmTimer()
        setConfirmClear(true)
        clearConfirmTimerRef.current = window.setTimeout(() => {
          clearConfirmTimerRef.current = 0
          setConfirmClear(false)
        }, CLEAR_CONFIRM_MS)
      }

      /** Only the destructive confirm action reaches the existing clear routine. */
      const confirmClearDone = () => {
        dismissClearConfirm()
        clearDone()
      }

      const clearDone = () => {
        // Capture the completed items before the commit so their forward flags can be cleared.
        const clearedItems = items.filter(item => item.done)
        const ok = commit(currentItems => currentItems.filter(item => !item.done))
        if (!ok) {
          report('saveFailed')
          return
        }
        report('cleared')
        forgetForwardedItems(clearedItems.map(item => item.id))
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
        onToast: report,
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
        forwardPrefix: forwardPrefix.trim() ? forwardPrefix : say('forward.prefix'),
        sendShortcut,
        forwarded: forwardedIds[item.id] === true,
        onForwarded: rememberForwarded,
        onUnforwarded: unrememberForwarded,
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
              'aria-label': say('resize.width'),
              tabIndex: 0,
              title: say('resize.hint'),
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
              'aria-label': say('resize.height'),
              tabIndex: 0,
              title: say('resize.hint'),
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
            { className: 'dsh-wt-popTitleLine' },
            h('div', { className: 'dsh-wt-popTitle' }, say('popover.title')),
            h('p', { className: 'dsh-wt-popMeta' }, say('popover.count', { open: openCount, total })),
          ),
          h(
            'div',
            { className: 'dsh-wt-popActions' },
            withTooltip(say('settings.open'), h(
              'button',
              {
                type: 'button',
                className: 'dsh-wt-settingsBtn',
                'data-active': showSettings ? 'true' : undefined,
                'aria-label': say('settings.open'),
                'aria-expanded': showSettings,
                onClick: () => setShowSettings(value => !value),
              },
              h(IconGear, null),
            )),
            withTooltip(say('popover.close'), h(
              'button',
              { type: 'button', className: 'dsh-wt-popClose', 'aria-label': say('popover.close'), onClick: props.onClose },
              h(IconClose, null),
            )),
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
                        checked: sendShortcut === 'enter',
                        onChange: () => chooseShortcut('enter'),
                      }),
                      h('span', null, say('settings.shortcutEnter', { mod: MOD_LABEL })),
                    ),
                    h(
                      'label',
                      { className: 'dsh-wt-settingChoice' },
                      h('input', {
                        type: 'radio',
                        name: 'dsh-wt-send-shortcut',
                        checked: sendShortcut === 'ctrl-enter',
                        onChange: () => chooseShortcut('ctrl-enter'),
                      }),
                      h('span', null, say('settings.shortcutCtrlEnter', { mod: MOD_LABEL })),
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
                    h('input', {
                      id: 'dsh-wt-forward-prefix',
                      className: 'dsh-wt-settingInput',
                      value: forwardPrefix,
                      maxLength: 80,
                      placeholder: say('forward.prefix'),
                      'aria-label': say('settings.forwardPrefixItem'),
                      'aria-describedby': 'dsh-wt-forward-prefix-hint',
                      style: {
                        fontFamily: 'inherit',
                        fontSize: 'var(--wt-fs-row)',
                        lineHeight: 'var(--wt-lh-row)',
                        fontWeight: 500,
                      },
                      onChange: event => changeForwardPrefix(event.target.value),
                    }),
                    h('p', { id: 'dsh-wt-forward-prefix-hint', className: 'dsh-wt-settingHint' }, say('settings.forwardPrefixHint')),
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
                    h('span', null, `${say('settings.author')} ${PLUGIN_AUTHOR}`),
                  ),
                  h(
                    'div',
                    { className: 'dsh-wt-settingProject' },
                    h('span', null, say('settings.project')),
                    h(
                      'a',
                      {
                        className: 'dsh-wt-settingLink',
                        href: PLUGIN_REPO_URL,
                        target: '_blank',
                        rel: 'noreferrer',
                        title: PLUGIN_REPO_URL,
                      },
                      PLUGIN_REPO_LABEL,
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
              const chord = event.ctrlKey || event.metaKey
              const platformModifier = isSendModifier(event)
              const shouldSend = sendShortcut === 'enter'
                ? !chord && !event.shiftKey
                : platformModifier
              if (shouldSend) {
                event.preventDefault()
                add()
                return
              }
              if (sendShortcut === 'enter' && (chord || event.shiftKey)) {
                event.preventDefault()
                insertDraftNewline(event.currentTarget)
              }
            },
          }),
          h(
            'div',
            { className: 'dsh-wt-addFoot' },
            h('span', { className: 'dsh-wt-addShortcut' }, say(sendShortcut === 'enter' ? 'add.shortcutEnter' : 'add.shortcut', { mod: MOD_LABEL })),
            h('button', { type: 'submit', className: 'dsh-wt-addBtn', disabled: !draft.trim() }, say('add.action')),
          ),
        ),
        h(
          'div',
          {
            className: 'dsh-wt-listViewport',
            'data-bottom': listHasMore ? 'true' : undefined,
          },
          h(
            'div',
            { className: 'dsh-wt-listArea', ref: listRef, onScroll: syncListEdge },
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
                  openCount ? h('span', { className: 'dsh-wt-sectionCount' }, String(openCount)) : null,
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
                      ? h('button', {
                          type: 'button',
                          className: 'dsh-wt-clear',
                          'aria-expanded': confirmClear ? 'true' : 'false',
                          onClick: askClearConfirm,
                        }, say('popover.clearDone'))
                      : null,
                  ),
                  showDone && confirmClear
                    ? h(
                        'div',
                        {
                          className: 'dsh-wt-clearConfirm',
                          role: 'group',
                          'aria-live': 'polite',
                          'aria-label': say('popover.clearConfirm', { n: doneItems.length }),
                        },
                        h('p', { className: 'dsh-wt-clearConfirmText' }, say('popover.clearConfirm', { n: doneItems.length })),
                        h(
                          'div',
                          { className: 'dsh-wt-clearConfirmActions' },
                          h('button', { type: 'button', className: 'dsh-wt-mini', onClick: dismissClearConfirm }, say('popover.clearCancel')),
                          h('button', { type: 'button', className: 'dsh-wt-mini dsh-wt-miniDanger', onClick: confirmClearDone }, say('popover.clearConfirmAction')),
                        ),
                      )
                    : null,
                  showDone ? h('ul', { className: 'dsh-wt-rows dsh-wt-doneRows' }, doneItems.map(row)) : null,
                )
              : null,
          ),
        ),
        h(
          'div',
          { className: 'dsh-wt-popFoot', role: 'status' },
          h('span', { className: syncError ? 'dsh-wt-error' : undefined }, say(syncError ? 'storage.failed' : 'popover.storage')),
        ),
      )

      return ReactDOM.createPortal(content, document.body)
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

      const tr = (key, vars) => fill(say(key), vars)
      let activePopover = null
      let activeSessionId = ''

      // Settled outcomes (copy, forward, delete, write failure) live here rather
      // than inside the panel: the panel unmounts on close, the banner must not.
      const toastSource = (() => {
        let notice = null
        let sequence = 0
        const listeners = new Set()
        const publish = next => {
          notice = next
          for (const listener of listeners) listener()
        }
        return {
          hooks: {
            notice: {
              getSnapshot: () => notice,
              subscribe: listener => {
                listeners.add(listener)
                return () => { listeners.delete(listener) }
              },
            },
          },
          show(kind) {
            sequence += 1
            publish({ kind, sequence })
          },
          dismiss() {
            publish(null)
          },
        }
      })()

      const TOAST_COPY = {
        copied: { key: 'toast.copied', tone: 'success' },
        forwarded: { key: 'toast.forwarded', tone: 'success' },
        unforwarded: { key: 'toast.unforwarded', tone: 'success' },
        deleted: { key: 'toast.deleted', tone: 'success' },
        cleared: { key: 'toast.cleared', tone: 'success' },
        copyFailed: { key: 'toast.copyFailed' },
        forwardFailed: { key: 'toast.forwardFailed' },
        saveFailed: { key: 'toast.saveFailed' },
      }
      const WarningIcon = icon('IconWarningOutlineRegular')

      /** The frame-wide toast seat: one notice at a time, dismissed when faded. */
      function ToastHost(props) {
        const notice = React.useSyncExternalStore(
          toastSource.hooks.notice.subscribe,
          toastSource.hooks.notice.getSnapshot,
        )
        if (!notice || !Toast) return null
        const copy = TOAST_COPY[notice.kind] || TOAST_COPY.saveFailed
        const bound = props && typeof props.t === 'function' ? props.t(copy.key) : ''
        // The slot's `t` falls back to the key when the namespace is not bound yet.
        const text = bound && bound !== copy.key ? bound : tr(copy.key)
        return h(Toast, {
          key: notice.sequence,
          text,
          tone: copy.tone,
          icon: copy.tone ? undefined : WarningIcon ? h(WarningIcon, { size: 16 }) : undefined,
          onDone: toastSource.dismiss,
        })
      }

      const closeMemoPopover = () => {
        const current = activePopover
        activePopover = null
        if (!current) return
        // Only hand focus back to the entry when the panel itself had it; a click
        // elsewhere must leave focus where the user put it.
        const hadFocus = current.container.contains(document.activeElement)
        try {
          current.root.unmount()
        } catch (error) {
          /* already unmounted */
        }
        current.container.remove()
        const anchor = current.anchor
        if (hadFocus && anchor && anchor.isConnected && typeof anchor.focus === 'function') {
          anchor.focus({ preventScroll: true })
        }
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
          onToast: kind => toastSource.show(kind),
        }))
        refreshHeaderEntry()
      }

      // The plugin's own glyph, shared by the header entry and `.icon.svg`
      // (same paths, same stroke). The entry is host-owned DOM, so the glyph is
      // inlined rather than rendered through a React root the host would reclaim.
      const HEADER_ICON = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" aria-hidden="true"><path d="M3.25 2.75h6.5l3 3v7.5c0 .55-.45 1-1 1H3.25c-.55 0-1-.45-1-1V3.75c0-.55.45-1 1-1Z"/><path d="M9.75 2.75v3h3"/><path d="M4.9 7.6h5.4M4.9 9.9h3.6" stroke-linecap="round"/></svg>'

      const refreshHeaderEntry = () => {
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
        // The header entry is host-owned DOM (a React portal beside it would be
        // reconciled away), so the shared Tooltip cannot wrap it; a native title
        // keeps the icon-only control explained on hover.
        button.title = open > 0 ? tr('header.tooltip', { n: open }) : tr('header.tooltipEmpty')
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

      // Transient outcomes belong to the frame, not to the panel that raised
      // them; the layout's overlay seat keeps them alive after the panel closes.
      ctx.slots.inject('shell.overlay', () =>
        ctx.slots.register(
          {
            name: 'shell.overlay',
            id: `${PANEL_ID}.toast`,
            order: 60,
            locale: NS,
          },
          ToastHost,
        ),
      )
    }

    return { inject: ['slots'], apply }
  },
})
