# Changelog

## 1.2.0

- Rename the product to **Memo** (备忘录).
- Scope data to each session (`dsh.session-memos.v1`); the old workspace store is no longer read.
- Add a `Memo open/total` badge after each sidebar session title.
- Open every entry as a floating popover anchored to the trigger; the separate detail page is removed.
- New-session entry stays in the workspace/preset row; the latest-reply entry stays after the completion time.
- Hide the composer/footer entry while the session is running.

## 1.1.0

- Rename the product to **Yidian Todos** (一点待办).
- Add an entry above the input: in a new session it shares the workspace/preset row; in a historical conversation it sits in the latest assistant reply's footer, to the right of the usage pill and clock. It shows the current workspace's open count and opens the panel in one click.
- Hide the entry while the session is running.

## 1.0.0

- Initial release: a sidebar todo panel scoped to each DSH workspace.
- Quick add with Enter, complete, relabel, delete, clear completed.
- Progress summary and collapsible completed list.
- Browser-local persistence keyed by workspace id, with path fallback.
- Chinese and English copy; automatic light/dark theming through DSH tokens.
