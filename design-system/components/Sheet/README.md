# Sheet

A focused dialog for one task: rate a lecture, write notes, catch up, review terms, or read the help.

**Use** `<dialog class="sheet">` (desktop: 520px centred, `r-dialog`, `surface-raised`, `shadow-pop`, a blurred backdrop) with `.sheet__grab`, `.sheet__head` (title + close), `.sheet__body` and an optional `.sheet__foot`. Opened with `showModal()`: focus moves inside, Esc and the backdrop close it, focus returns.

- Desktop: in from `translateY(8px) scale(.96)` (220ms), out with a fade and `scale(.98)` (150ms).
- Phones: a bottom sheet (top corners `r-dialog`, max 88dvh) that slides up on the iOS drawer curve (280ms) and down on `ease-in` (200ms). Drag the grabber or header down to close (past 30% or a quick flick); it rubber-bands upward.
- Content changes inside an open sheet animate in place (the review session's next lecture slides in). It never closes and reopens.
