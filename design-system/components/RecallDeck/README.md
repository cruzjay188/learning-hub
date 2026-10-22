# RecallDeck

Active recall, one card at a time: say the term's meaning, flip, then answer Got it or Not yet.

**Use** `.deck` (with a `.deck__back` card peeking 7px under it) holding `.flip` (two `.face`s, `backface-visibility: hidden`, `perspective: 900px`), then `.deck__acts` with "Not yet ←" (secondary) and "Got it →" (primary). Above it, `.deck__segs` (one 3px segment per term: got `teal`, missed `warn-mark`, current `ink-2`) and an ✕ / ✓ tally of Tickers.

- Flip: `rotateY(180deg)` in 280ms `ease-in-out`. Answer: the card tilts away (±48px, ±3°) and fades in 200ms `--ease-in`; the next card comes forward from `scale(.97)` on `--spring-soft`.
- Keys act instantly with no motion: Space flips, ← Not yet, → Got it. After a flip, focus goes to Not yet, so pressing Enter repeatedly can't mark terms as known by accident.
- The end card shows "7 of 9 recalled", the missed terms as chips, and "Go through again". The same deck runs inside the Review session sheet, which chains every due lecture.
