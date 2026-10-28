# Notes

[中文](README.md) | English

> Product name: **Notes** (便笺). The repository keeps the `dsh-workspace-todos` name.

A lightweight note for the DeepSeek Harness Web GUI, scoped to one **session** at a time. Switching sessions never mixes notes, and sessions in the same workspace stay independent. A `Notes open count` badge after each sidebar session title shows which conversations still have follow-ups.

![Notes popover](./preview.png)

## Entries

The reminder badge after a session title:

![Notes badge after a session title](./preview-badge.png)

The right side of the status strip below the input, on the same line as turns, usage, and context:

![Notes entry at the right of the bottom status strip](./preview-history.png)

Every entry opens a **floating panel next to the trigger**; it never navigates to a separate detail page.

## Features

- Data is keyed by **session ID**; different sessions in one workspace stay independent.
- A `Notes open count` badge after the sidebar session title, counting only unchecked notes. It is hidden when there are no open notes.
- The badge hugs the title text instead of sitting at the row's right edge; sessions with a badge hide their relative time so the full title and badge fit.
- The conversation entry stays at the right of the composer status strip, visible and editable across turns and while the session is running.
- Clicking the entry opens a popover for add, complete, copy, edit (double-click or pencil), delete, clear completed, and expand completed.
- Each note has copy, edit, and delete actions; copy sits to the left of edit and briefly shows **Copied** after a successful copy.
- The completion circle shares the first line with the note text; copy, edit, and delete sit at the bottom-right beside the time, saving one row.
- The completion circle is visually 16px inside a 24px hit area, matching the row actions.
- Both the new-note input and the editor grow into multiple rows as you type; in the add box Enter inserts a line and Ctrl+Enter adds, while the editor uses Enter to save and Shift+Enter for a line.
- The add row no longer shows a plus icon, and **Add** always sits at the right of its own second row, so wrapping never flickers or jumps.
- The open and completed lists each scroll inside the popover; the popover frame itself does not show a vertical scrollbar.
- Both **Open** and **Completed** headings collapse on click with matching count styles; expanding one collapses the other; only the chevron, label, and count are clickable, not the blank right side.
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
