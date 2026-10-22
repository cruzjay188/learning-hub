# FloatingBar

The phone lecture pill: progress and the three actions you need while reading a guide.

**Use** `.lecbar` (fixed, 12px from the sides and above the tab bar, `r-pill`, `surface-raised` at 94% with blur, `shadow-float`) holding a 28px Ring with the step count, quiet "Rate" and "Notes" buttons (Rate shows the rating once set, "2 · Shaky"), and a primary "Done" that runs "Mark done and continue".

- While you scroll down a lecture, the tab bar slides away (220ms) and the pill drops into its place; scrolling up or reaching the end brings it back. About 56px more reading space.
- "Done" scrolls the current step into view first, so the tick plays where you can see it.
