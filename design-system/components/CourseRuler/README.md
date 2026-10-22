# CourseRuler

The whole bootcamp as one row of ticks, one per weekday, so time passing never masquerades as progress.

**Use** `.ruler` with `.ruler__ticks` (one `<i>` per weekday: `data-p` past / today / future, `data-off` for no-class days) and `.ruler__weeks` labels underneath.

- Past ticks are `ink-2` at 45% over `surface-2`, today is `now`, no-class days are hollow.
- It replaces "% elapsed" meters. Learning progress uses `teal` bars, never the ruler.
- `role="img"` with a label: "Bootcamp timeline: class day 10 of 67".
