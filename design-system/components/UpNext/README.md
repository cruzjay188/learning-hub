# UpNext

The one card on Today: the exact next step, with everything needed to finish it in place.

**Use** `.upnext` (`surface`, `shadow-raise`, `r-panel`; a 3px `now` mark inset 16px from top and bottom) containing the eyebrow (why it's next · lecture link) with a ring and a rolling "Step n of N" at the right, `.segs` (one 3px segment per step: done `teal`, current `now`, future `track`), the step title in `title`, a 2-line detail, an optional CodeBlock, the Done when line, and actions: "Mark step done" (primary, with the Done morph), "Open guide" (quiet), time left.

**The consumer provides** the lecture, the step and the reason it's next: today's lecture, "Tonight's homework" after 6:30pm, "Pick up where you left off", "Still open from <date>", or "Prep for <date>".

- `.upnext__back` peeks 6px under the card when another step waits; it comes forward as the next card.
- After "Mark step done": the button says Done for 300ms, then a view transition swaps the content (out 140ms, in 240ms on `--spring-soft`) while the card's height and everything under it glide (260ms). A toast offers Undo.
- When nothing is open: "You're caught up" without the orange mark.
