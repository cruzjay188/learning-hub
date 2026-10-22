# Premium audit re-check: Eagle Learning Hub v3 (2026-10-20)

> [!summary] Verdict: v3 crossed the line from "default" to "crafted". It now feels like a real product on most screens.
> Of last round's top 15 fixes, **8 are fixed, 7 are partly fixed, 0 are not fixed**. All 15 checks in `hub/qa/motion.mjs` pass.
> Three things still hold it back:
> 1. **Every recall answer flashes a mirrored card.** For 200ms the card you leave shows the old term reversed ("IPA"). This is the core study loop. (Sev 3)
> 2. **"Mark done and continue" on the lecture page still lurches.** The next step opens before the done step folds, and the button vanishes with no "Done" moment. (Sev 2)
> 3. **A finished review doesn't count unless you re-tap a rating.** The end card pre-selects your old rating, so it looks done when it isn't. (Sev 2)
>
> **Keep:** the Back round trip (scroll kept, row highlighted, title flies home). Also keep the Up next swap with neighbours gliding, the rolling counters, the rating thumb with its word and date, the palette, the phone bottom sheets and the floating lecture pill.

**Scope.** I used the hub as Jeffrey would, in Playwright's Chromium (same setup as `hub/qa/shoot.mjs`), at 1360 and 390 wide, in light and dark. I tested 11:15 and 19:30 on Mon Oct 19, plus Sun Oct 18 at 14:00. I seeded the same week-3 state as last round: AI-1 to AI-7 partly done and rated, 5 reviews due, last week logged. For every interaction, a recorder logged each animation, transition and view transition (name, duration, delay). Frames were captured mid-motion. Scripts live in `/tmp/ux-v3r/`, outside the hub. I did not edit `hub/index.html`.

Screenshots are in `hub/design/screens-v3-recheck/`:
- `views/` holds every view at both widths and themes (full page plus `-fold`).
- `evening/` and `weekend/` hold the other times.
- `motion/` holds frames named by milliseconds, `components/` holds 2x crops, and `flow/` and `sheets/` hold the task steps.
- `motion-qa/` holds the `motion.mjs` frames.

---

## Scorecard (premium lens)

| # | Heuristic | Round 3 | **v3 now** | Δ | Worst sev | Main reason |
|---|---|---|---|---|---|---|
| 1 | Visibility of system status | 3 | **4** | +1 | 2 | Ticks happen on screen, counters roll, the rating gives a toast. A finished review can silently not count. |
| 2 | Match with the real world | 4 | **4** | 0 | 1 | Codes are quiet; the rating speaks in words ("Shaky"). |
| 3 | User control and freedom | 3 | **4** | +1 | 2 | Back keeps your place, ⌘Z undoes, and rating Undo works. A moved assignment still disappears into a collapsed group. |
| 4 | Consistency and standards (incl. design system) | 2 | **3** | +1 | 2 | Tokens and the button system are adopted. There are 5 primaries on Review, 12 control heights, a hardcoded Copy color, and 40px phone buttons. |
| 5 | Error prevention | 3 | **4** | +1 | 2 | After a flip, focus lands on "Not yet", and tapping the same rating twice no longer clears it. The review end card pre-selects the old rating. |
| 6 | Recognition rather than recall | 4 | **4** | 0 | 1 | Key hints sit on buttons. "1 of 5 done 8/42" on Course shows two unlabeled fractions. |
| 7 | Flexibility and efficiency | 4 | **5** | +1 | 1 | Space / ← / → in the deck, 1–4 in the menu, ⌘Z, and a much better palette. Esc on a lecture does nothing. |
| 8 | Aesthetic and minimalist design | 3 | **4** | +1 | 3 | Real depth and rhythm. The mirrored card flash reads as broken. |
| 9 | Error recovery | 4 | 4 | 0 | 1 | Not retested (round 2 covered it). |
| 10 | Help and documentation | 4 | 4 | 0 | 1 | Key caps in the deck, palette footer and toast teach the shortcuts. |

**Average: 3.4 → 4.0.**

---

## Last round's top 15: re-measured

> [!check] Tally: 8 Fixed · 7 Partly · 0 Not fixed

| # | Fix | Status | Evidence (measured or seen) |
|---|---|---|---|
| 1 | Make the tick visible; sequence "Mark done and continue" | **Partly** | The tick now plays on screen: the done step stays at y 70 throughout (desktop). On phone, the page scrolls to the step header first (y 112), then ticks at about 400ms (`motion/pill-done-250.png` → `-550`). **But** the next step starts expanding at about 40ms while the done step is still open. The clicked button vanishes at once, and at 400ms the next header travels from y 522 to y 125 (`motion/dc-desk-120.png`, `dc-desk-400.png`, `dc-desk-850.png`). See new issue N2. |
| 2 | Restore your place on Back | **Fixed** | scrollY 828 → lecture → Back → **828** (desktop and phone). Browser Back and the breadcrumb both restore. Focus lands on the origin row. `originFade` runs for 600ms after a 300ms delay. The title flies home (`motion/back-desk-260.png`, `back-desk-450.png`). Esc doesn't go back yet (N9). |
| 3 | Elevation and control scale | **Partly** | Elevation is in place. Primary hover is `translateY(-1px)` plus a `::after` lift; the secondary has a ring plus a 1px shadow; Up next uses `shadow-raise`. Radii dropped from 11 to 9 values, all on-scale except a 9px badge and a 22px select. **Control heights are still 12 values** (26, 28, 30, 32, 33, 34, 36, 40, 44, 50, 52, 57). On phone, `btn--sm` stays 40px, and "Mark done and continue" is 40px (the brief says 44). |
| 4 | Review deck as a real card session | **Fixed** | Sheet height holds at 473px through the flip and the next card. There is a segmented progress line, a ✕/✓ tally that rolls, and Space / ← / → (verified). Focus after a flip is "Not yet". Six Enters now mark terms "Not yet", not "Got it". **But** the exit motion is broken (N1). |
| 5 | Phone main action above the fold | **Fixed** | "Mark step done" sits at y 582–626 and is 322px wide; the tab bar starts at 787 (`views/today-390-light-fold.png`). The code block is clamped. |
| 6 | Rating motion and words | **Partly** | The thumb slides 200ms, the word swaps ("Shaky"), and the help shows the real date. The toast reads "Rated Shaky · back Thu Oct 22" with Undo, and Undo restores the old value. The rail clip is fixed (right edge 1300 vs rail 1304). **Still shown twice** on a finished guide: the panel and the rail (`motion/complete-desk-1500.png`). |
| 7 | Drill-in title collision | **Fixed** | At 120 and 180ms the title flies in clear space (`motion/drill-desk-120.png`, `-180`). The old root fades out in 90ms; the new one fades in at 150ms. |
| 8 | Animate list changes | **Partly** | Course and Review filters slide the thumb (220ms) and fade rows in (`rowIn` 200ms). **The Work status change still teleports.** The row goes into the collapsed Done group, 0 row animations were recorded (pointer and key), and the group header doesn't pulse (`flow/status-moved.png`). |
| 9 | Smooth the Up next height and the content below | **Fixed** | The card goes 481 → 438px, and three `below-*` view-transition groups glide over 260ms. "Step 4 → 5" rolls (220ms), and the ring and segments fill (`motion/upnext-440.png`). |
| 10 | Rebuild the recall cards | **Fixed** | One deck replaces the 9 buttons. A 220px card flips (`rotateY`, 280ms), a next card peeks behind, and "Show all terms" sits below (`views/lecture-ai-8-1360-light.png`). |
| 11 | Tighten the command palette | **Fixed** | Rows are 40px with kind tiles; matches are highlighted; ↵ shows on the selected row only; the footer has key caps and "12 results". Height stays 494px whether there are 5, 12 or 0 results. 0 animations on open (`components/palette-auth.png`). |
| 12 | Make finishing a guide a moment | **Partly** | The motion is there: the header ring closes into a disc, the panel rises (`finishIn` 280ms +160), the rating segments stagger in (+320ms), and focus moves to the rating. **But** it's still a flat teal box with a small "Next up: AI-8" text link and no primary action, and the rating is duplicated in the rail (`motion/complete-desk-1500.png`). |
| 13 | Quiet the done steps | **Partly** | On desktop, Undo is hidden until hover or focus (opacity 0 → 1). **The strike-through stays** (`text-decoration: line-through`, 18px weight 500, line 593) and still reads harsh (`components/steps-done.png`). |
| 14 | Phone bottom sheets | **Fixed** | Full width, 16px top corners, grabber, and `translateY` in over 280ms. Dragging 300px down closes it. Rate auto-closes about 500–700ms after a pick; the pill then reads "2 · Shaky" and gets focus. A redundant "Done" footer remains (N10). |
| 15 | Polish nits (8) | **Partly (6 of 8)** | Fixed: goal ring not clipped (rings at 984 vs rail 980); 3px orange mark inset 16px; SVG check in the menu; quiet mono codes; toast with icon, 12px radius and contained Undo; Work group headers on hairlines. **Not fixed:** the heatmap (13px cells, far left, 12 empty future columns, `views/work-activity-fold.png`) and the Copy button colors (`#dcecea`, `#8fe0c9` and `#a9d6d2` are hardcoded, even though `--code-ink` exists). |

---

## New problems introduced by v3 (severity-ranked)

**N1. [Sev 3] The recall card shows a mirrored front face when you answer.**
- **Where:** the review sheet and the lecture "Check yourself" deck (same CSS). Desktop and phone.
- **Seen:** from 60ms after "Got it" or "Not yet", the leaving card shows the previous term reversed ("IPA", "Term 1 of 9", "Space"). You never see the tinted meaning card that the spec describes (`motion/rv-got-phone-60.png`, `motion/rv-got-desk-140.png`).
- **Why:** `.flip[data-flipped="true"]` is `rotateY(180deg)`, but `.is-got` is `rotateY(180deg) translateX(-48px) rotateZ(-3deg)`. The function lists differ, so the browser falls back to matrix interpolation and spins through the front face.
- **Fix:**
  - Use matching lists: `.flip[data-flipped="true"] { transform: rotateY(180deg) translateX(0) rotateZ(0) }`.
  - Better: put the exit on a wrapper (`.deck__card`) and keep only the flip on `.flip`.
  - Add a #19 frame at 80ms to `motion.mjs` and assert the back face is the visible one.
- **Reference:** [Quizlet](https://mobbin.com/screens/5dacac8f-b958-417c-bae8-e70c4ac3273f) and [Nibble](https://mobbin.com/screens/435a72da-ac45-49b6-b7d5-f9aab3e32b05) both keep the answered face visible and tinted as it leaves.

**N2. [Sev 2] "Mark done and continue" (lecture) opens the next step before the done one folds.**
- **Seen:**
  - At 40ms the next step (s5) has already started expanding (40 → 495px), while s4 is still open.
  - The clicked button is gone from the DOM, with no "Done" morph (Today has one).
  - At 400ms s4 collapses (452 → 55px), and the next header travels about 400px up (y 522 → 125) (`motion/dc-desk-120.png`, `dc-desk-400.png`, `dc-desk-850.png`).
- **Why:** `patchLecture` opens whichever step is now current (`isCur`) right after `toggleStep`. The 360ms hold in `doneContinue` only delays the collapse.
- **Fix:**
  - Hold the old step as "current" for rendering until the collapse phase, e.g. `state.ui.hold = sid` and skip `isCur` for the next step while it is set.
  - Keep the action row and morph its button to "✓ Done" (the Today recipe).
  - At 360ms, collapse and expand in the same 220ms frame, so the next header slides about 55px instead of 400px.

**N3. [Sev 2] A review only counts if you re-tap a rating.**
- **Where:** the review session end card.
- **Seen:** after "9 of 9 recalled", the end card shows the old rating pre-selected ("1 · Lost") and "Comes back for review today." Closing the sheet left AI-7 in Due. Tapping the same "1" again saved it ("Rated Lost", back Wed Oct 21). "Next due" also moves on without saving.
- **Fix:**
  - Don't pre-select. Show "Last time: Lost" as text, and pre-highlight a suggested value from the recall score (9/9 → 4) as a dashed outline.
  - Set `reviewedAt` when the deck finishes.
  - Label the primary "Save and next: AI-5" so leaving always records the review.

**N4. [Sev 2] The phone segmented control spills past its track.**
- **Where:** Course at 390px.
- **Seen:** "Not checked off 4" is cut at the screen edge. The track is 358px wide and its content 381px. There is no scroll and no fade mask (`components/phone-course-segc.png`).
- **Fix:**
  - Apply the brief: `overflow-x: auto`, 16px fade masks at both ends, and `scrollIntoView({inline: "nearest"})` on select.
  - Or shorten the label to "Unchecked 4" on phones.
- **Reference:** [Glovo](https://mobbin.com/screens/a0c42cc2-4ce1-4dab-8dfa-91cbf02ce70b) and [YouTube](https://mobbin.com/screens/f4fb54b1-ce8b-4376-9944-fd6a03c42b1e) let chips run under the edge so the cut-off chip reads as "scroll".

**N5. [Sev 2] The Review tab has five primaries and five orange labels.**
- **Seen:** every row has a teal primary "Review" button and an orange "Due today" (`views/review-1360-light.png`). Today's Review rows use secondary buttons, so the same action has two looks. This breaks the brief's "one primary per region" rule. On the "Due" filter, "Due today" is implied, so the orange (now/next) is noise.
- **Fix:**
  - One primary "Start review · 5" in the view header that chains all due lectures.
  - Rows get secondary `sm` buttons.
  - Drop "Due today" while the Due filter is on, and show the date only on other filters.

**N6. [Sev 1] Keyboard actions still play animations.**
- **Seen:** after Space flips a card, `rowIn` 160ms runs on both buttons. After →, `cardForward` 220ms runs. After pressing "2" to rate, `swapIn` 160ms runs on the word and the help line.
- **Why:** `html.instant` only kills transitions. The rule is "keyboard shortcuts animate nothing".
- **Fix:**
  - Add `html.instant *, html.instant *::before, html.instant *::after { animation: none !important }`.
  - Extend `motion.mjs` beyond `x` to Space, ←/→ and 1–5.

**N7. [Sev 1] The Done morph on Today splits icon and label.**
- **Seen:** at 240ms the check is pinned left and "Done" is centered across a 155px button, so they read as two things (`motion/upnext-240.png`).
- **Fix:** put the check inside the `.lbl__done` cell (`display: inline-flex; gap: 8px`) so "✓ Done" is centered as one unit.

**N8. [Sev 1] The drill-in has a blank frame.**
- **Seen:** at 180ms the whole page is empty except the flying title (`motion/drill-desk-180.png`). The old root fades out by 90ms, and the new root waits until 150ms before fading in over 160ms.
- **Fix:** start the new root fade at 100ms (as the brief says), not 150ms. Or fade the old root over 120ms.

**N9. [Sev 1] Esc and the X hint are missing.**
- **Seen:** Esc on a lecture page does nothing; the only Escape handler closes menus. "Mark done and continue" has no `X` key cap. Both are in the brief (Loop B and §2.4).
- **Fix:** if no sheet, menu or palette is open, Esc → `history.back()` (or `navigate("#course")` with no history). Add `<kbd>X</kbd>` on desktop.

**N10. [Sev 1] The phone rate sheet keeps a redundant "Done".**
- **Seen:** the sheet auto-closes after a pick, but its footer still has a primary "Done" (`sheets/rate-sheet-phone.png`).
- **Fix:** remove the footer. The grabber, the close icon and the auto-close cover it.

**N11. [Sev 1] Course week headers show two unlabeled fractions.**
- **Seen:** "1 of 5 done 8/42" next to a ring (`views/course-1360-light.png`). Which 8/42 is it: steps or terms?
- **Fix:** "1 of 5 lectures · 8/42 steps", or keep "1 of 5 done" and move the steps figure into the ring's title.

**N12. [Sev 1] `motion.mjs` wasn't extended for v3.**
- **Seen:** it still runs the same 15 checks. None of the frames the brief asked for are there (§5: #3, #13, #16, #18, #19, #21, #24 overlap assert, #27, #35). A #19 frame would have caught N1.
- **Fix:** add those frames plus keyboard no-animation asserts for the deck and rating keys.

---

## Task walkthroughs (the 6 loops)

### Loop 1: Start the day, finish a step, move on (Today) ✅
- 1 click. The button morphs to "Done" (160ms draw), holds, then Up next swaps through a view transition at about 370ms.
- The content below glides 43px instead of snapping (`below-0..2`, 260ms). "Step 4 of 10" rolls to 5; the ring and segments fill.
- The toast shows a check, "Done: …", a contained Undo and ⌘Z. ⌘Z restored step 4 and swapped the toast to "Undone".
- **Evening (19:30):** "Tonight's homework · AI-8" fits on one line on phone (last round's dangling "·" is gone). The timeline greys out with "Class is over for today" (`evening/today-390-light-fold.png`, `evening/today-1360-dark-fold.png`).
- **Weekend:** a quiet notice ("No class today. Next class: Monday…"), and Up next picks up the open AI-7 step (`weekend/today-390-light-fold.png`).

### Loop 2: Course → lecture → work the steps → rate → back ⚠️
- The drill-in is clean (N8 aside).
- Working steps: the tick is visible now, but the next step opens early (N2).
- Finishing AI-7 took 7 clicks. The ring closes into a disc and the panel rises with the rating focused. The only way on is a text link (item 12).
- Rating gives a word, a real date and a toast with Undo.
- **Back is now the best flow in the app:** scroll 828 → 828, the row is tinted and focused, and the title flies home. Ticked progress lands on the row ("prep 1/3", half-filled status icon, `motion/back-desk-450.png`).

### Loop 3: Review weak lectures ⚠️
- Review → "Review" opens one session sheet: "Review AI-7 · 1 of 5".
- The flip, tally, keys and focus all work. "Next due: AI-5" slides the next deck in (220ms) inside the same sheet.
- On close, focus returns to a row's Review button. The row leaves Due and the badge reads 4.
- Two flaws: the mirrored exit on every answer (N1), and the review not counting without a re-tap (N3).

### Loop 4: Find something with ⌘K ✅
- ⌘K → "auth" → 12 results in 4 groups with highlighted matches, kind tiles, and ↵ on the selected row. The box keeps a fixed 494px height. No animation.

### Loop 5: Check assignments ⚠️
- The status menu is a real menu now: SVG icons, a selected check and 1–4 hints. "4" works, and focus moves to the Done group header.
- The row still vanishes into the collapsed group with no motion (item 8).

### Loop 6: Phone between classes ✅
- The main action is on the first screen. Bottom sheets rise from the edge and can be dragged closed.
- On a lecture, the tab bar hides on scroll down (top 787 → 846). The floating pill drops from y 724 to 780 and comes back on scroll up (`flow/phone-lecture-reading.png`).
- "Done" in the pill scrolls to the step first, then ticks it in view. The segmented control overflows (N4).

---

## Strengths to keep
- **The Back round trip.** Scroll, expanded weeks, origin highlight, focus and the title morph home. This is Linear-level.
- **The continuity layer.** Counters roll and rings fill when a value changes, including after you come back from a lecture: the ring and ticker on Today animated about 300ms after arrival.
- **Up next.** Step segments, the peeking next card, the Done morph, and neighbours gliding during the swap.
- **The rating.** Separate segments, a sliding thumb, a word, the real review date, and Undo in the toast.
- **The palette.** Fixed height, kind tiles, match highlight, ↵ hint and no animation.
- **Phone.** Bottom sheets with drag, the floating pill, the tab bar that hides while reading, and the sliding tab pill.
- **Directional tab transitions** (`vt-tab-fwd` / `vt-tab-back`, 120ms out and 220ms in) with the frame held still.
- **Discipline.** Reduced motion still turns everything off, and `x` and `g c` still run no animation (`motion.mjs` 15/15).

---

## Design-system drift (heuristic 4)
- **Adopted:** `--ring`, `--ring-strong`, `--track`, `--row-hover`, `--row-sel`, the shadow family, the radius scale (`r-xs` to `r-pill`), and the retuned durations and curves.
- **Still off-token:**
  - `.copy-btn` hardcodes `#dcecea`, `#8fe0c9` and a 6px radius; `.code__more` hardcodes `#a9d6d2`. Use `--code-ink`, `--toast-ok` and `r-item`.
  - The badge radius is 9px; the phone select radius is 22px.
- **Orange = now / next:** mostly respected (Up next eyebrow, the now block, "This week", today's dot). The 5 "Due today" labels on the Review tab stretch the rule (N5).
- **Button sizes:** the brief defines sm 32, md 40 and lg 44 on phones. Phones still render `btn--sm` at 40px and the lecture primary at 40px.
- **Still to do:** add the new components (Ring, Ticker, SegmentedControl, RecallDeck, FloatingBar) to `hub/design-system/`, if they aren't there yet. I did not verify the artifact.

## Accessibility and quality floor
- **Contrast:** no real failures. Disabled rating numerals on future lectures are 3.17:1 (light) and 4.07:1 (dark), which WCAG exempts for disabled controls. My script flagged the blurred, color-mixed top bar and tab bar, but those are false positives from the color parser; the screenshots show clear text.
- **Focus:** a visible ring on all 70 tab stops I walked on AI-8 (markers, toggles, Undo, Copy, deck card). Each step costs 2–3 tab stops (marker, toggle, Undo), so the deck is 39 stops in. Consider `tabindex="-1"` on the done-step toggles.
- **Phone targets under 44px (lecture):** step Undo 69×32, "Expand all" 34px tall, breadcrumb "Course" 41×17 (still underlined), done-step title toggles 26px tall, and "Mark done and continue", "Skip for now" and Copy at 40px.
- **Reduced motion:** passes (0 animations, no view transitions).
- **Horizontal overflow:** 0px on all 31 captures. The phone segmented control overflows inside its own box (N4).

---

## Prioritized fix list

| Priority | Fix | Heuristics | Severity | Effort |
|---|---|---|---|---|
| 1 | N1: matching transform lists, or move the exit to a wrapper, for the recall card; add a #19 frame to `motion.mjs` | 8, 1 | 3 | S |
| 2 | N2: hold the done step as current until the collapse; morph the lecture button to "✓ Done"; collapse and expand in one frame | 1, 3, 8 | 2 | M |
| 3 | N3: don't pre-select the old rating; save `reviewedAt` on finish; "Save and next" | 1, 5 | 2 | S |
| 4 | Item 8: Work status move as a view-transition glide, plus a count roll and header pulse on the collapsed group | 1, 3 | 2 | M |
| 5 | Item 12: finished panel with a primary "Start AI-8 →" / "Back to Today"; hide the rail rating while it shows | 7, 8 | 2 | S |
| 6 | N4: scrollable phone segmented control with fade masks | 4, 8 | 2 | S |
| 7 | N5: one "Start review · 5" primary; secondary row buttons; drop "Due today" on the Due filter | 4, 8 | 2 | S |
| 8 | Phone targets: Undo, Expand all, breadcrumb and step buttons at 44px (`btn--lg` under 900px) | 4, a11y | 2 | S |
| 9 | Item 13: done-step title in `muted` 500 without the strike (or a 50% strike color) | 8 | 2 | S |
| 10 | N6: `html.instant` also kills keyframe animations; extend `motion.mjs` asserts | 4, 7 | 1 | S |
| 11 | Item 15 leftovers: heatmap sized to the column with faded future cells; Copy colors to tokens | 4, 8 | 1 | S |
| 12 | N7–N11: Done morph centering, drill-in blank frame, Esc back + X hint, remove the rate sheet "Done", label the week fractions | 2, 6, 7, 8 | 1 | S |
| 13 | N12: add the v3 motion frames to `motion.mjs`; add the new components to the design system | 4 | 1 | M |

## `motion.mjs` result
`node hub/qa/motion.mjs hub/design/screens-v3-recheck/motion-qa` → **15/15 checks passed**: first paint, tab underline, drill-in view transition, step tick, sheet in and out, back transition, Up next Done morph and swap, toast hover, menu, `x` with no animation, `g c` instant, reduced motion, phone dark overflow, and no page errors. It does not yet cover the v3 moments (N12).

## References (Mobbin)
- [Quizlet: flashcard swipe](https://mobbin.com/screens/5dacac8f-b958-417c-bae8-e70c4ac3273f): the answered card leaves tilted with a green "Know" tint while the next card sits flat behind it. Borrow this for N1: tint the visible face and never show the other side.
- [Nibble: card sort](https://mobbin.com/screens/435a72da-ac45-49b6-b7d5-f9aab3e32b05): the leaving card keeps its face, rotates a few degrees and takes a brand tint. The stack behind stays still.
- [Duolingo: card stack](https://mobbin.com/screens/32152f82-25d6-4f8e-af8c-b71e9b9c88cc): two quiet layers peek behind the card, as the hub's deck does now. Keep it.
- [Coursera: course complete](https://mobbin.com/screens/15cacd44-7839-4c9f-9623-1db6833c291d): a "Next course" card with a primary "Get started", and the rating as a separate quiet row. The model for item 12.
- [Uxcel: lesson complete](https://mobbin.com/screens/079d1b0e-d73a-46cf-9c46-0c138b025d6f) and [Babbel: results](https://mobbin.com/screens/bd0a42ab-2f2f-43c4-a83c-c9138522bc5c): a short stat line plus exactly one primary ("Continue" / "Continue learning") and one secondary ("Correct my mistakes (14)"). Borrow the secondary for N3's end card: "Practice the 4 missed terms".
- [Glovo: filter tabs](https://mobbin.com/screens/a0c42cc2-4ce1-4dab-8dfa-91cbf02ce70b) and [YouTube: chips](https://mobbin.com/screens/f4fb54b1-ce8b-4376-9944-fd6a03c42b1e): scrolling filters run under the screen edge, so the cut chip signals "more". For N4, let the track scroll rather than letting an item overflow a fixed pill.
