# DayTimeline

Today's class day as time-proportional blocks from 9:30am to 6:30pm ET, with a hairline marking now.

**Use** `<ol class="track">` of `.block` items (`--m` = minutes, `min-width` 96px) with `data-state` past / now / next, each holding a `.block__bar`, `.block__time` (`mono-label`) and `.block__label`. A `.nowline` (2px `now`, time label in `now-ink`) is placed by script at the current minute.

**The consumer provides** the day's items (time, title, lecture link).

- Past bars fill with tinted `teal`; the current bar gets a 2px `now` outline; future bars are `surface-2` with a `line` ring.
- On phones it collapses to one Now / Next row that expands to a vertical list.
- The now-line moves once a minute with no animation. Before 9:30: "Class starts at 9:30 ET".
- Expose the order as a list with `aria-current="time"` on the current block.
