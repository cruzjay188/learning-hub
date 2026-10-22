# CommandPalette

⌘K, Ctrl-K or / opens search across lectures, key terms and assignments, plus a few actions.

**Use** a `<dialog class="palette">` (640px, `r-dialog`, `surface-raised`, `shadow-pop`) with a 56px input and an `esc` key cap, a fixed-height `role="listbox"` (so the box never jumps), and a footer of key caps plus the result count.

- Rows are one line, 40px: a 24px kind tile (action, lecture, term, assignment, recent), the title with the match highlighted in `teal-strong`, and a muted breadcrumb after it. The selected row gets `surface-2`, a 2px teal bar and a ↵ cap.
- No animation at all: not on open, close, results or selection. It's opened from the keyboard many times a day.
- Matching ignores case and punctuation ("fe-3" finds "FE 3"); prefix matches rank first.
