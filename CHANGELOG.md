# Changelog

## 1.5.7

- Add a settings entry beside the notes title with the plugin version, author, send-shortcut choice, and configurable one-click forward prefix.
- Apply the selected shortcut to the add box and use the saved prefix when forwarding.

## 1.5.6

- Prepend the fixed prompt “完成以下任务：” when forwarding, followed by a newline and the note text.

## 1.5.5

- Add a forward action to each note card that appends the note to the conversation composer, separated by a newline when the composer already has content.

## 1.5.4

- Let the completed section extend below the open list without compressing it; scroll the whole panel when the content exceeds the viewport.
- Show note-card copy/edit/delete actions on hover or keyboard focus instead of always, while keeping their layout space.

## 1.5.3

- Focus the add input with the caret at the end when the panel is reopened with a restored draft.

## 1.5.2

- Auto-save unsaved add and edit drafts per session; restore them when the panel is reopened, and clear them after add, save, cancel, or delete.

## 1.5.1

- Remove the mutual exclusion between the open and completed sections now that the panel can be resized; both can stay expanded.

## 1.5.0

- Promote the right-side notes panel to main: top-right square icon entry, fixed right panel, drag-to-resize width/height, right-sidebar avoidance, and the shortcut hint beside the Add button.

## 1.5.0-experimental.10

- Detect the DSH right sidebar as open only when `data-sidebar-right-open` is present, so the notes panel no longer shifts left while the sidebar is collapsed.

## 1.5.0-experimental.9

- Move the shortcut hint to the empty space left of the Add button and shorten the placeholder.
- Anchor the panel's right edge to the header entry and shift it left of the DSH right sidebar when that sidebar is open.
- Refresh the folded-note header icon with a cleaner 1.4px stroke and simplified folds.

## 1.5.0-experimental.8

- Move the count badge 2px closer to the header icon so it reads as attached to the note rather than a separate notification.

## 1.5.0-experimental.7

- Keep the header entry as a 28px square with a 16px icon; show the count as a low-contrast gray corner badge instead of inline text.

## 1.5.0-experimental.6

- Increase the header notes icon to 18px so its visual size matches the neighboring toolbar icons.

## 1.5.0-experimental.5

- Replace the badge-style count with a small gray inline number to avoid an unread-notification look; tooltip now reads “会话便笺 N”.

## 1.5.0-experimental.4

- Refine the header entry into a compact icon-only button at the far right of the header utilities, with an overlapping count badge.

## 1.5.0-experimental.3

- Add a bottom-center handle for vertical resizing of the right panel; height persists and double-click restores content sizing.

## 1.5.0-experimental.2

- Add a drag handle on the right panel's left edge to resize its width; the width persists across opens, and double-click resets it.

## 1.5.0-experimental.1

- Experimental branch: move the entry to a top-right header button and open notes in a fixed right-side panel.
- Remove the sidebar session badge and composer status-strip entry on this branch.

## 1.4.13

- Right-align the Add button on its second row.

## 1.4.12

- Limit the open/completed toggle hit area to the chevron, label, and count; clicking the blank right side no longer expands or collapses the section.

## 1.4.11

- Change the add input shortcut: Enter inserts a new line, Ctrl+Enter adds the note, and update the placeholder text.

## 1.4.10

- Keep the Add button on its own second row at all times, removing the wrap-state layout change that caused flicker and extra space above the button.

## 1.4.9

- Make the open and completed sections mutually exclusive: expanding one collapses the other.

## 1.4.8

- Keep the popover frame fixed and scroll the open and completed lists internally.
- Shrink the completion circle to 16px inside a 24px hit area to match the row action buttons.

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
