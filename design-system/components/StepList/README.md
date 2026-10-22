# StepList

A lecture guide's steps, shown one at a time: done steps fold away, the current one is open, future ones show a one-line peek.

**Use** `<ol class="steps">` of `.step` items with `data-done`, `data-current` and `data-open`. Each has a `.marker` (role="checkbox", the step number or a check), a `.step__toggle` header (`aria-expanded`), an `.step__undo` button and a `.step__body` that collapses with `grid-template-rows: 0fr → 1fr` over 240ms. Ticking a step cross-fades the number into a drawn check and fills the rail down to the next step (320ms, `ease-in-out`).

**The consumer provides** per step: `title`, `detail`, optional `code` + `codeLabel` (rendered with CodeBlock), and `doneWhen`.

- Markers are 36px circles on a 2px rail: future `control`, current `now` ring with a `now-soft` halo, done `teal` fill.
- The current step ends with "Mark done and continue" (primary) and "Skip for now" (quiet). After marking, scroll the next step 96px from the top once the collapse finishes.
- Collapsed content is `visibility: hidden` so it can't be tabbed into.
- Done titles strike through in `muted`; Undo appears on the line.
- Never show all steps expanded by default; "Expand all" is the user's choice.
