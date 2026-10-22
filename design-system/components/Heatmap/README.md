# Heatmap

Activity across the 15 weeks: commits plus study days, one 13px cell per day.

**Use** `.heat__grid` (a label column + 15 week columns, 7 rows Mon–Sun) of `.cell` items with `data-l` 0–3, `data-f` for future days (outlined, no fill), `data-off` for no-class days (hatched) and `data-today` (`now` ring). Add the `.legend` "Fewer … More".

- Levels are `teal` at 35%, 65% and 100% over `surface-2`.
- `role="img"` with a summary label ("14 commits and 2 study days so far"); each cell has a `title`.
- The preview shows example data.
