# Row

Rows are the hub's main unit: one item per line on a hairline, never a grid of cards.

**Use** `.rows` with `.row` items (status icon · `.row__main` with `.row__title` and `.row__sub` · `.row__end`). The Course map uses `.lrow`, a link row with fixed columns: status, code (`mono-label`), title, date, progress mini-bar, confidence, chevron.

**The consumer provides** the title, sub-line, status and end meta.

- Min height `row` (40px; 52px on phones). Titles in `row-title`, sub-lines in `meta` + `muted`.
- External links end with the ↗ icon; internal ones don't.
- One status signal per row (the icon), not an icon plus a pill saying the same thing.
- Hover tints the row `surface-2`; the chevron nudges 2px.
