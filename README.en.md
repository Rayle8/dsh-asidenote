# Notes

[中文](README.md) | English

> Product name: **Notes** (便笺). The repository keeps the `dsh-workspace-todos` name.

A lightweight note for the DeepSeek Harness Web GUI, scoped to one **session** at a time. Switching sessions never mixes notes, and sessions in the same workspace stay independent. The entry lives in the top-right header button and the notes panel opens from the right side.

![Notes right-side panel](./preview-right.png)

## Entry

A **Notes** button at the top right of the conversation, with the open count:

![Notes button at the top right](./preview-right.png)

Clicking it opens a fixed panel on the right. The sidebar title badge and composer status-strip entry are not used on this branch.

## Features

- Data is keyed by **session ID**; different sessions in one workspace stay independent.
- A 28px square top-right icon button shows the open count as a low-contrast gray corner badge; its tooltip reads “Session notes N”.
- Clicking it opens a fixed right-side panel; switching sessions closes the old panel and updates the entry.
- The settings button beside the notes title expands a settings area for the send shortcut; **One-click forward** contains two items, **Prefix prompt** and **Forward completion**, with the version/GitHub author link on one line at the bottom; settings persist automatically.
- The panel's top-right corner aligns with the header entry and shifts left of the DSH right sidebar when that sidebar is open.
- Clicking the entry opens the right-side panel for add, complete, copy, edit (double-click or pencil), delete, clear completed, and expand completed.
- Drag the handle on the panel's left edge to resize its width; double-click the handle to reset it, and the width persists in the browser.
- Drag the bottom-center handle to resize its height; double-click the handle to return to content sizing, and the height persists.
- Each note has copy, forward, edit, and delete actions; copy sits to the left of edit and briefly shows **Copied** after a successful copy.
- Forward appends each note as a `-` list item; the configured prefix (default **完成以下任务：**) is written only when the composer is empty, never when it already has content. The caret stays at the end and nothing is sent automatically.
- After forwarding, the checkbox becomes half-checked and the forwarded state is remembered per session; the next click starts a 3-second countdown with the remaining seconds shown, then a leave animation and move to completed, and clicking again during the delay restores it as open with the half-check kept.
- Notes completed after forwarding use a gray completion check, distinct from manually completed notes.
- The completion circle shares the first line with the note text; copy, edit, and delete sit at the bottom-right beside the time, saving one row.
- The completion circle is visually 14px inside a 24px hit area and centers on the first line of note text.
- Both the new-note input and the editor grow into multiple rows as you type; both use the configured send shortcut, with the other combination inserting a newline, and the editor shows a right-aligned shortcut hint.
- The add row no longer shows a plus icon, and **Add** always sits at the right of its own second row, so wrapping never flickers or jumps.
- The send-shortcut hint sits in the empty space left of the Add button and updates with the setting, keeping the input placeholder short.
- Unsaved add/edit drafts are saved per session and restored after closing and reopening the panel, with the add caret at the end of the draft; they clear after add, save, cancel, or delete.
- Expanding **Completed** does not compress the **Open** list; only the open/completed list region scrolls, the active section header stays sticky while scrolling, and the header, settings, composer, and footer stay fixed.
- The open/completed expand state is remembered and restored when the panel is reopened; sticky headers remain clickable to collapse.
- Note-card copy/edit/delete actions appear on hover or keyboard focus while keeping their layout space; touch devices keep them visible.
- Both **Open** and **Completed** headings collapse on click with matching count styles; either can stay expanded independently; only the chevron, label, and count are clickable, not the blank right side.
- The sidebar reminder stays visible while the session is running.
- Syncs across tabs in the same browser.
- Chinese and English copy, following the DSH locale.

## Usage

1. Click the badge after a session title (it appears when that session has notes), or the **Notes** entry at the right of the composer status strip.
2. Write one concrete follow-up in the popover and press Enter (or **Add**).
3. Click the circle to complete it; expand **Completed** to look back.
4. Click outside or press Esc to close.

## Where data lives

Notess live in the browser's `localStorage` under `dsh.session-notes.v1`:

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

Therefore:

- Refreshing, restarting DSH, or switching sessions keeps the records.
- Nothing is written into the project or synced to another machine/browser.
- Clearing site data clears the notes.
- The old `dsh.workspace-todos.v1` workspace store is no longer read; records need to be recreated after upgrading.

## Install

```bash
git clone git@github.com:Rayle8/dsh-workspace-todos.git
```

Link the checkout into a DSH profile (replace `<path-to-repo>`):

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

Then run `pnpm install` in the profile directory. On startup DSH reads `dsh.bundle.patch` and `dsh.client`. After adding the bundle row, toggle it off/on in the sidebar **Plugins** page to recompose a running Host without a restart; restart once if the row is not listed yet. Later `client.js` edits are replaced by the dev client HMR.

## Development

`client.js` is the browser half, in DSH's Module Loader format:

```js
window.__ModuleLoader__.load({
  id: 'dsh-workspace-todos',
  factory(require) {
    const React = require('react')
    return { inject: ['slots'], apply }
  },
})
```

`index.js` is the empty Host half; `cordis.patch.yml` inserts the package into the profile composition. The UI depends on `slots` only:

- `conversation.composer.dock`: the entry at the right of the status strip below the input.
- The sidebar badge is injected after each session title with a MutationObserver, because the packaged session row does not render the inline trailing slot.

The popover mounts as its own `react-dom/client` root on `document.body` and follows the trigger with fixed positioning. All styles use DSH's `--dsw-alias-*` theme variables, so light and dark themes work.

`client.js` changes reload through the dev client HMR; otherwise refresh the page or restart DSH.

## Verification

Loaded in an isolated DSH profile and driven through headless Chrome:

- the `Notes 1/1` badge appears after the session title;
- clicking the badge or an entry opens the floating panel next to the trigger;
- adding updates both the popover and the badge;
- complete, edit, delete, and clear-completed work in the popover;
- records survive a refresh and stay session-scoped.

`node --check client.js` and the contract tests pass.
