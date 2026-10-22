# ConfidenceRating

A 1–5 rating of how well a lecture is understood; ratings 1–4 schedule its next review.

**Use** `.rating` (`role="radiogroup"`, `--c` = the chosen value, `data-on`) with one `.rating__thumb` and five separate `role="radio"` segments (44px, 6px gaps, 1.5px `control` border, `r-ctl`). Above it `.rating__top` shows the question and the chosen word (`.rating__word`); below, `.rating__help` names the real date it comes back.

- The teal thumb slides to the chosen segment (`translateX`, 200ms, `--spring-soft`); the word swaps with a 160ms rise.
- Scale: 1 Lost · 2 Shaky · 3 Getting it · 4 Solid · 5 Could teach it. Review comes back after: next class day · 2 · 4 · 10 days · never.
- A toast confirms with Undo ("Rated Shaky · back Thu Oct 22"). Arrow keys and 1–5 act instantly.
- Disabled before the lecture's date. "Clear rating" is a quiet button that appears only when rated.
