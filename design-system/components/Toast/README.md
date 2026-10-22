# Toast

A short confirmation at the bottom of the screen, with Undo when the action changed data.

**Use** `.toast` (`toast-bg` / `toast-ink`: ink in light, a raised `#1d2c30` in dark, never inverted white; `shadow-float`, `r-panel`, 44px) with a 16px leading icon (check, copy, or `warn-mark` alert), the message, and a contained action button ("Undo ⌘Z").

- In: rises 12px out of a 2px blur (240ms). Out: fades with a 6px drop (150ms). A second message swaps its text in place.
- ⌘Z / Ctrl+Z runs the Undo while the toast shows, instantly, and the text swaps to "Undone".
- Shows 2.2s, or 6s with an action; waits while hovered or focused. `role="status"`.
