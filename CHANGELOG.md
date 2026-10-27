# Changelog

## 1.4.7

- Remove the plus icon from the add row and move the Add button to the left of a new line once the input wraps.

## 1.4.6

- Make the new-note input auto-grow as well, so long text wraps into multiple rows before adding.

## 1.4.5

- Replace the single-line editor input with an auto-growing textarea so wrapped or pasted text shows in multiple rows; Enter saves and Shift+Enter adds a line.

## 1.4.4

- Match the editor's font size and line height to the popover body, tighten its padding/gaps, and hide the meta row while editing.

## 1.4.3

- Remove the extra horizontal padding on the open-section heading so its count aligns with the completed-section count.

## 1.4.2

- Render note text as selectable text instead of a button so it can be dragged and selected; double-click still starts editing.

## 1.4.1

- Merge the completion circle with the first text line and move copy/edit/delete to the bottom time row, saving one row of height.

## 1.4.0

- Redesign note rows with a dedicated first line for the completion button and copy/edit/delete actions; actions stay visible and the text begins below.

## 1.3.7

- Move the floating copy/edit/delete actions to the top-right of the note row instead of vertically centering them.

## 1.3.6

- Float the copy/edit/delete actions over the note row so they no longer reserve width or leave blank space beside the text.

## 1.3.5

- Add an expand/collapse chevron to the open section and align its count style with the completed section.

## 1.3.4

- Remove the inherited section margin that left a large blank below the popover's add form.
- Bound the completed list so many completed notes scroll vertically instead of being clipped.

## 1.3.3

- Sidebar badge now shows only the open-note count and hides when none are open.
- The composer status-strip count now inherits the label style instead of using a dark pill.

## 1.3.2

- Center the popover's add-button label by dropping the inherited 30px line-height and centering the label with flex.

## 1.3.1

- Remove the redundant new-session hero entry above the input; notes remain reachable from the sidebar badge and the composer status strip.

## 1.3.0

- Rename the product to **Notes** (便笺).
- Replace the checklist icon with a folded sticky-note icon in the badge, dock entry, and package icon.
- Add a copy action to each note, placed to the left of edit, with a brief copied state.

## 1.2.0

- Rename the product to **Memo** (备忘录).
- Scope data to each session (`dsh.session-memos.v1`); the old workspace store is no longer read.
- Add a `Memo open/total` badge directly after each sidebar session title, hiding the relative time to keep the full title and badge together.
- Open every entry as a floating popover anchored to the trigger; the separate detail page is removed.
- New-session entry stays in the workspace/preset row; the conversation entry stays at the right of the composer status strip and remains visible while running.

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
