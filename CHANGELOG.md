# Changelog

## 1.9.5

- Restore sticky **Open** and **Completed** headers while the note list scrolls. They sit on the opaque `bg-layer-1` surface rather than the translucent menu fill, so rows cannot read through them and the header does not double-paint a seam over the panel.
- Hide the forward action on completed notes, so a done row only offers copy, edit, and delete.
- Require a second confirmation for clearing completed notes: the header button opens an inline confirmation band with the live count, Cancel, and a destructive Confirm, which auto-dismisses after five seconds.
- Remove the stale forwarded-marker description from settings; the mark on the forward button is self-explanatory.
- Replace the prefix-prompt title with a hint under the field that explains both the lead-in and the empty-prefix behaviour.
- Give the forwarded mark the forward icon's neutral palette instead of success green, and let a second click on the forward button remove the mark (with its own toast) rather than appending the note twice.
- Drop the success tint from the completed count badge so it matches the open count exactly; the number stays quiet instead of competing for attention.
- Stop forwarding from touching the checkbox: it keeps only open and done, the forward button gains a small check, and the half-check, three-second completion countdown, and gray forwarded-done check are gone.
- Default the send shortcut to Enter, with the platform command modifier plus Enter for a new line; macOS labels the key ⌘ and other platforms label it Ctrl.
- Pull the shortcut copy out of hardcoded `Ctrl` strings: every send/newline hint and setting interpolates `{mod}`, so both locales follow the current platform.

## 1.9.4

- Remove the pressed `scale(.94)` from the top-right notes anchor. The panel's first position was measured while that transform was still easing back, so it was computed from a shrunken rect and snapped right/down a few milliseconds later.

## 1.9.3

- Replace the bottom blur overlay with a viewport-fixed alpha mask on the list itself: the last 48px fade smoothly to transparent, the 9px scrollbar rail stays opaque, and there is no compositing edge left to show as a horizontal line.

## 1.9.2

- Soften the bottom fade's crisp-to-blurred boundary with a 48px low-blur halo and long multi-stop gradient/mask ramps, so no horizontal line is visible.

## 1.9.1

- Remove the tiny down-right settle when the panel opens; it now fades in without moving.
- Force the prefix-prompt input to the same 13px/20px, weight-500 text as its child title, even against host input styles.
- Restore the bottom edge fade as a soft 28px gradient/blur that only appears while notes remain below the fold, with no top fade.
- Move the list to the DSH workspace scrollbar rail: 9px track, 2px transparent inset, and a visible 5px pill thumb that no longer sits flush against the panel edge.
- Pull the panel's visual hierarchy apart: the title and count share one line, the count drops to a 12/400 caption, section labels drop from 13/500 primary to 12/500 secondary, and settings/close move into one right-side action group.
- Keep the open count readable when it exists: a solid neutral fill and primary numeral replace the old low-contrast outline.
- Put the add field and note cards on the shared settings-card fill and stroke, and bind the panel's elevation hairline to `border-l2` so the surface edge stays visible on white.
- Add a contract test for the section-label, zero-badge, completed-badge, and card-surface decisions, with before/after screenshots in `docs/ui-design-check.md` §1.1.

## 1.9.0

Re-checked the panel against `dsh-ui-ux-design-standard.md` and removed the styling that had drifted from it. The version moves past main's 1.8.1 so this branch never claims a released number.

- Carry over what main gained while this audit branch was open: done notes show both the creation and completion age, the completed list sorts by newest completion, and the About block names the author and links to the project.
- Clarify the storage copy: notes are kept only on this device, and a failed write says local storage is unavailable.
- Replace the plugin's own 11-step grey ramp with the DSH semantic aliases (`label-*`, `interactive-bg-hover/active`, `border-l1…l4`, settings-card fill and stroke). Text now reads at 17.7:1 / 13.6:1 (primary) and 5.4:1 / 9.4:1 (secondary) in the light and dark themes; `label-tertiary` no longer carries text.
- Collapse the type scale to 12 / 13 / 14 on a 20px line height and cap every weight at 500.
- Take radii from the shared scale by role: 28 for the floating panel, 16 for groups and fields, 8 for compact controls, with `corner-shape:round` on every pill and circle.
- Draw neutral borders at 0.5px, give the panel `border:0` plus `--dsw-elevation-panel`, and use the menu material (`--dsw-specific-menu` + backdrop filter) so the popover matches DSH menus.
- Drop the component's private scrollbar rules in favour of the shared skin, rebinding `--dsh-scrollbar-*` to the l2 pair inside the panel.
- Gate every hover rule behind `@media (hover:hover)`; touch devices keep the row actions visible.
- Report copy, forward, delete, clear-completed, and every failed write through a new `shell.overlay` toast that survives closing the panel. The inline "copied" check and its timers are gone.
- Keep the row, draft, and forward flag when a write fails: `commit()` no longer updates state after a failed save, and the failure is announced instead.
- Use the shared `Tooltip` for the four row actions plus settings and close; the local icon set is replaced by `ui-primitives` glyphs.
- Stop focusing the note composer on touch devices, restore focus to the header entry when the panel closes, and keep the panel inside a 390px viewport (12px margins, height clamped to the viewport).
- Floor the panel's top edge at `--dsh-frame-overlay-top`, so macOS window chrome and the Windows titlebar keep their clearance without the plugin touching that global variable.
- Move all product copy into the dictionary: `locale/zh.json` and `locale/en.json` now carry the full 62-key set, the two hardcoded Chinese accessibility labels and the forwarding prefix are localized, and Chinese hints no longer end with a full stop.
- Remove the retired full-page entry (`Panel`, `PanelBody`, `MemoEntry`, workspace store) and its styles, so there is no second implementation to keep in sync.
- Retire the sticky section headers: a second fill layer over the translucent menu material painted a brighter band across the panel.
- Redraw `icon.svg` on the 36×36 artwork canvas, keeping the approved path shapes.
- Grow the contract suite from 11 to 24 tests covering the shared tokens, hairline widths, radius roles, elevation pairing, scrollbar skin, hover gating, hardcoded copy, toast wiring, failed-write behaviour, localization parity, the completion ordering, and the touch-focus rule.

## 1.8.1

- Reword the footer as “按会话隔离 · 数据仅保存在本地”, removing browser internals from the storage hint.
- Match the prefix-prompt input's type size and 20px line box to its child-title label.
- Show the author as 阿三石 and add a clickable link to the GitHub repository under About.
- Lighten the note cards in the light theme and use a gentler hover tint.
- Keep only a softer bottom-edge blur (32px band, 2px blur) and adopt the DSH workspace scrollbar: a 9px track with a 5px pill thumb inset 2px.

## 1.8.0

- Turn the settings area into a full-bleed separator band with a labeled rule and top/bottom dividers; it no longer looks like another note card.
- Add a fixed frosted blur at the top and bottom of the note list while keeping sticky headers and the 4px scrollbar crisp.
- Show both creation and completion ages on completed notes, and order the completed list newest-completion first.
- Keep the Open section toggle inside the scroll clip so its left corners stay rounded.

## 1.7.1

- Slim the right-panel scrollbar from 6px to 4px and pin it to the panel's right edge, so it no longer narrows the todo cards.
- Reserve the scrollbar gutter inside the panel padding, keeping cards, section headers, and the add box on the same content width.

## 1.7.0

- Rebuild the panel styling on design tokens: an 11-step neutral ramp (50 to 950), a five-step 1.25 type scale, a 4px spacing scale, three radii, one layered shadow, and tokenised durations and easings.
- Give every button the six states (default, hover, pressed, focus, disabled, loading); the copy action now reports its async work with a loading ring and a success tint.
- Animate the panel in and stagger list rows by 40ms using only transform and opacity; the progress bar scales instead of resizing.
- Fix hover feedback that was invisible in the light theme, and raise tertiary text and the check ring to WCAG AA contrast.
- Keep the section toggle's hover pill inside the scrolling list, so its rounded left edge is no longer clipped away.
- Add contract tests that keep the tokens honest, and a review report with before/after evidence under docs/.

## 1.6.3

- Nudge the forward icon further down for true optical alignment with neighboring actions.
- Persist forwarded items per session so the half-check survives reopening the panel.
- Render forwarded completed notes with a gray-and-white completion check.
- Count the pending completion down over three seconds and update the undo hint each second.

## 1.6.2

- Restructure one-click forward settings into two items: the prefix prompt and the forward completion behavior.

## 1.6.1

- Move the half-check completion explanation under the one-click forward settings.

## 1.6.0

- Honor the configured send shortcut in note edit mode and show a right-aligned edit hint.
- Vertically center the forward icon with the other card actions.
- After forwarding, show a half-check; the next checkbox click stages a delayed, cancellable completion, with an undo hint.
- Reduce the completion circle to 14px while keeping the 24px hit area and text alignment.
- Make the settings gear hover padding symmetric.
- Keep the active open/completed section header sticky while scrolling, with its collapse action intact.
- Separate settings groups, align secondary rows to one content column, and document the half-check behavior in settings.

## 1.5.9

- Combine the About version and author into one line, with the author linked to GitHub.

## 1.5.8

- Move the About block (version/author) to the bottom of the settings area.
- Align the completion circle with the first line of note text.
- Scope the vertical scrollbar to the open/completed list region instead of the whole popover.
- Forward notes as `-` list items; write the configured prefix only when the composer is empty.
- Replace the bare forward arrow with a chat-bubble forward icon.
- Remember the last open/completed expand state across panel openings.

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
