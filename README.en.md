# Yidian Todos

[中文](README.md) | English

> Product name: **Yidian Todos** (一点待办). The repository keeps the `dsh-workspace-todos` name.

A small todo panel for the DeepSeek Harness Web GUI. Each **workspace** keeps its own list, so moving between projects never mixes notes. It is meant for one-line next steps, not full task management.

![Yidian Todos panel](./preview.png)

The persistent chip above the chat input:

![Yidian Todos entry above the composer](./preview-dock.png)

## Features

- A **Yidian Todos** entry in the sidebar.
- A persistent **Yidian Todos** management chip above the chat input, showing the current workspace's open count and opening the panel in one click.
- Per-workspace notes, following the workspace of the active session; switch workspaces from the header.
- Add with Enter; complete, relabel, delete, and clear completed items.
- Progress summary, creation time, and a collapsible completed section.
- Syncs across tabs in the same browser.
- Chinese and English copy, following the DSH locale.

## Usage

1. Click **Yidian Todos** in the sidebar, or the chip above the chat input.
2. Write one concrete next step and press Enter (or **Add**).
3. Click the circle to complete it; expand **Completed** to look back.
4. Use the header selector to switch projects; **Back to current** returns to the active session's workspace.

## Where data lives

Notes are stored in the browser's `localStorage` under `dsh.workspace-todos.v1`, keyed by workspace id with a workspace-path fallback. As a result:

- Reloads, DSH restarts, and session switches keep the list.
- Nothing is written into the project, and nothing syncs across machines or browsers.
- Clearing site data clears the list.

A host-side file route (for example `.dsh/workspace-todos.json`) can be added later without changing the panel.

## Install

```bash
git clone git@github.com:Rayle8/dsh-workspace-todos.git
```

Link the clone into a DSH profile (replace `<path-to-repo>`):

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

Then run `pnpm install` in the profile. On startup DSH reads `dsh.bundle.patch` and `dsh.client` and registers the sidebar entry and main panel. After adding a bundle row, toggle that bundle **off and on** in the sidebar's **Plugins** page to recompose the running Host online; only restart DSH if the bundle is not listed there. After that, editing `client.js` alone is picked up by development-mode HMR.

## Development

`client.js` is the browser half in DSH's Module Loader format:

```js
window.__ModuleLoader__.load({
  id: 'dsh-workspace-todos',
  factory(require) {
    const React = require('react')
    return { inject: ['slots'], apply }
  },
})
```

`index.js` is the empty host half; `cordis.patch.yml` inserts the package into the profile composition. The UI only depends on the `slots` service and reads the active workspace through the `useSessions` / `useWorkspaces` slot props. Styling uses DSH `--dsw-alias-*` tokens, so it follows light and dark themes.

```bash
node --check client.js
node --check index.js
node --test tests/contract.test.mjs
```
