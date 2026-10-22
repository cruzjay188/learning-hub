# SegmentedControl

One choice from a short set: list filters (Course, Review) and sub-views (Work).

**Use** `.segc` (`surface-2` track, 3px padding, `r-ctl`) holding one `.segc__thumb` and `.segc__i` buttons with `aria-pressed` (or links with `aria-current="page"`). Counts go in `.n` (mono 12px).

- One thumb slides under the chosen item. Items differ in width, so the thumb spans the track and is cut to the item with `clip-path: inset(0 R 0 L)`; only the clip-path animates (220ms, `--spring-soft`).
- The thumb is `surface` with an inset ring and highlight, so it reads as a raised key without an outer shadow.
- On phones the track scrolls sideways inside the toolbar; the page never does.
- Replaces the v2 black-filled chips. Long lists (modules) go in a `.select`.
