# Premium audit: Eagle Learning Hub, round 3 (2026-10-20)

> [!summary] Verdict: usable and honest, but it looks flat, the flows drop your place, and the motion stops where the real change happens.
> The basics are solid (round 2 rated usability about 4/5). This round asks a different question: does it feel like Linear or Things 3? Not yet. Three things hold it back:
> 1. **The finish moments have no motion or are hidden.** Ticking a step in the guide happens off screen, review cards swap with zero motion, ratings and filters snap.
> 2. **Flows lose your place.** Back from a lecture drops Course from 828px to the top. On the phone, "Mark step done" sits below the fold.
> 3. **Everything is a 1px ring.** There are 11 corner radii and 11 control heights, and no hover state lifts. The result reads as "default", not "crafted".
>
> **Keep:** the tick (spring press, check draw, rail fill), the Up next swap, the tab underline, the sliding drill-in, the instant keyboard rule and the reduced-motion rule. All 15 checks in `hub/qa/motion.mjs` pass.

**Scope.** I used the hub as Jeffrey would, in Playwright's Chromium (same setup as `hub/qa/shoot.mjs`), at 1360 and 390 wide, in light and dark, at 11:15 and 19:30 on Mon Oct 19 (plus the weekend). I seeded a realistic week-3 state: AI-1 to AI-7 partly done and rated, 5 reviews due, last week logged. For every interaction, a script logged each animation, transition and view transition that ran (name, duration, delay, easing). Frames were captured mid-motion. Scripts live outside the hub (`/tmp/ux-v3/`); they are not part of the page.

Screenshots are in `hub/design/screens-v3-audit/`. Views are at the root, plus `components/` (2x crops), `motion/` (mid-animation frames), `sheets/` (frame strips), `flow/`, `evening/` and `weekend/`.

---

## Scorecard (premium lens)

| # | Heuristic | Score (1–5) | Worst severity | Findings |
|---|---|---|---|---|
| 1 | Visibility of system status | 3 | 3 | The step tick runs off screen; counts and badges change with no motion; the rating gives no toast |
| 2 | Match with the real world | 4 | 1 | Vocabulary is right; code tags look like raw links |
| 3 | User control and freedom | 3 | 3 | Back loses the scroll position; status change hides the row in a collapsed group |
| 4 | Consistency and standards (incl. design system) | 2 | 3 | 11 radii, 11 control heights, text "✓" glyph, hardcoded colors, rail clipping |
| 5 | Error prevention | 3 | 2 | Review deck focuses "Got it", so Enter-mashing marks terms as known |
| 6 | Recognition rather than recall | 4 | 2 | Rating cells are bare numerals; the word appears only after you pick |
| 7 | Flexibility and efficiency | 4 | 2 | Review deck has no keys (1, 2 and Space do nothing); palette rows are 2 lines tall |
| 8 | Aesthetic and minimalist design | 3 | 3 | Flat rings, repeated Undo buttons, tall empty recall cards, grey group bars |
| 9 | Error recovery | 4 | 1 | Not retested this round (round 2 covered it) |
| 10 | Help and documentation | 4 | 1 | The help sheet is good; the review deck shows no keyboard hints |

---

## Task walkthroughs (flow)

### Loop 1 — Start the day, finish a step, move on (Today, desktop) ⚠️
- **1 click per step** ("Mark step done"). Good. The Up next content swaps through a view transition (`sheets/upnext-swap.png`).
- **But the page below jumps.** The card went from 458px to 415px tall, and "Review due" snapped up 43px with no motion (measured `#rd-h` top 811 → 768).
- The toast says "Done: <step>" with Undo. Good.
- **Evening (19:30):** the eyebrow changes to "Tonight's homework" and the timeline reads "Class is over for today" (`evening/today-1360-dark.png`). Clear. On the phone, the eyebrow wraps and leaves "step 1 of 10" alone on line 2 after a dangling "·" (`evening/today-390-light.png`).

### Loop 2 — Course → lecture → work the steps → rate → back ⚠️
- **2 clicks to the guide** (Course tab, then the row). The drill-in slides forward and the row's title flies into the heading.
- **The morph collides.** At 150ms the flying title sits on top of the summary paragraph, because the new page has already faded in under it (`motion/drill-morph-150.png`, `sheets/drill-morph.png`).
- **The tick happens where you can't see it.** "Mark done and continue" collapses the step, opens the next one and scrolls, all at the same moment. At 60ms the done step is already off screen and there is a 100px blank gap (`motion/done-continue-060.png`). By 160ms the done step's title is half under the top bar (`motion/done-continue-160.png`). The check draw and rail fill (the best motion in the app) play out of view.
- **Finishing a guide:** 7 clicks for AI-7's remaining steps. The panel lands fine (top 193px, focus on rating 1). But it is a flat teal box. The rating appears twice (panel and rail), and the only way forward is a small "Next up" text link (`flow/guide-finished-rated.png`). Rating gives no toast.
- **Back loses your place.** On Course I opened week 6 and scrolled to 828px, opened a lecture, then pressed Back. I landed at 0. The breadcrumb also lands at 0. Open weeks are kept (`flow/back-from-lecture.png`).

### Loop 3 — Review a weak lecture (recall cards) ❌
- Today → Review → **18 clicks for 9 terms** (Show meaning + Got it/Not yet each), then 1 to re-rate.
- **Zero motion between cards.** The recorder found no animation on reveal and none on the next term. The content just swaps (`motion/review-show-*.png`, `motion/review-next-*.png`).
- **The dialog jumps.** It grows from 294px to 324px on reveal, and its top moves up 15px, because it is vertically centered.
- **Keyboard bias.** After reveal, focus lands on "Got it". Pressing Enter 7 times took me to term 4 and marked three terms as known without reading them. The keys 1, 2, → and j do nothing (the shortcut handler exits while a sheet is open).
- There is no progress bar, only the text "Term 1 of 9".

### Loop 4 — Find something with ⌘K ✅
- ⌘K, type "stripe", Enter → Stripe lecture. 3 actions, instant, no animation (that is the right rule).
- **The craft is thin** (`components/palette-auth.png`, `components/palette-empty.png`). There are no type icons and no match highlight. Every row is 2 lines (~54px), so only 5 actions fit on open. The selected row has only a grey fill and no "↵" hint.

### Loop 5 — Check assignments ⚠️
- Work → status icon → menu → "Done" (2 clicks). The menu scales in from its trigger (`motion/menu-open-*.png`) and the toast offers Undo. Good.
- **But the row disappears.** It moves into the collapsed Done group, so you never see where it went (measured: "hidden (collapsed Done group)", `flow/status-moved.png`). Nothing animates the move or the group count.

### Loop 6 — Phone between classes ⚠️
- **The day's main action is below the fold.** On Today at 390×844, "Mark step done" sits at y 849–893, under the tab bar (top 787). The first screen shows the code block but not the button (`flow/phone-today-fold.png`).
- **Lecture "Done" in the sticky bar ticks a step you can't see.** From the top of AI-8, it ticked step 4 at y 905 (off screen). The page then jumped 884px, leaving step 4 at y 21, under the 48px top bar (`flow/phone-lecbar-done-after.png`, `sheets/phone-lecbar.png`).
- **"Rate" opens a centered modal, not a sheet.** It has 266px of backdrop above and below, plus a redundant "Done" button (`components/phone-rate-sheet.png`).

---

## 1. Component craft

> [!note] Measured hover and press changes
> - Secondary button hover: border color only (`#d3dddd` → `#7a8e90`).
> - Primary button hover: background darkens only.
> - Press on both: `scale(.97)`.
> - Chip hover: border only. Course row and week head: `surface-2` fill only. Pager: ring color only.
> - Recall card and step title: **no hover at all**.
> - No component changes its shadow on hover anywhere in the app.

| Component | Craft (1–5) | What works | What's missing (evidence) |
|---|---|---|---|
| **Button** | 3 | Clear verbs; solid 2px focus ring at 2px offset (`components/btn-focus.png`); press scale | Flat fill with no 1px inner highlight, no layered shadow and no hover lift. Heights vary: 26/28/29/32/33/34/36/40/44/50/52px across views (measured). Linear and Vercel use about 3 heights. |
| **Checkbox** | 4 | Spring press plus check draw (`motion/checkbox-*.png`); 44px hit area | Hover is border only; no fill hint on hover. |
| **UpNext card** | 3 | Strong hierarchy and the orange "now" rule (`components/upnext.png`) | 1px ring with a near-invisible `0 1px 2px .04` shadow. The 4px orange strip is a separate pseudo-element whose corner doesn't match the card's 10px radius. On phone, the action is below the fold. |
| **StepList** | 3 | Rail with numbered markers; the current step has an orange halo (`components/steps.png`) | Done rows use strike-through on 18px condensed semibold, which looks harsh. Every done row shows an "Undo" button (9 of them on a finished guide, `flow/guide-finished-rated.png`). The step title has no hover. |
| **Row** (course, assignments) | 3 | Dense aligned ledger; tabular numbers | Mono, underlined code tags ("AI-5") look like raw links. Course rows stretch 1240px wide, with a long eye-jump from title to date (`components/course-week3.png`). Work group headers are heavy grey bars (`components/work-groups.png`). |
| **Chip** | 3 | Counts in chips; ink "pressed" state (per spec) | Hover is border only. Zero-count chips ("Weak 0") look as active as the rest (`components/empty-review.png`). Filtering animates nothing. |
| **Toast** | 3 | Rises in, waits on hover, swaps text in place | No icon or status color; 8px radius (off-token) (`components/toast.png`). |
| **Sheet** | 2 | Fade and rise in, faster fade out; focus is trapped | Centered on phone (not a bottom sheet). Height jumps on content change. 12px radius vs 10px panels. |
| **Menu** | 3 | Scales from its trigger corner (180ms in, 120ms out) | The check is a text glyph "✓", not the SVG icon (`components/menu.png`). No item is highlighted on open. |
| **CommandPalette** | 3 | Fast, grouped, Recent list, right "no animation" rule | No type icons, no match highlight, 2-line rows, no hint on the selected row. |
| **Navigation / tabs** | 4 | The underline slides between tabs (280ms); the phone tab bar is clean | The Review badge count changes (5 → 4) with no motion. |
| **WeekGoal** | 3 | Today's dot pops when logged | Today's orange ring is **clipped on the left** by the rail (ring edge at x 980.5, rail edge at 984; `components/goal.png`). The stepper count changes with no motion (0 animations recorded). |
| **ConfidenceRating** | 2 | Big 44px cells; clear end labels | Bare numerals, so the word appears only after you pick. Selection is instant (0 animations). The right edge is clipped 0.58px by the rail (`components/rail-lecture.png`). It appears twice on a finished guide. |
| **RecallCard** | 2 | Got it / Not yet rings the card teal / amber (`components/recall.png`) | The grid stretches rows, so a card with one button is 290px tall. There are 9 identical "Show meaning" buttons. No hover, no reveal motion. |
| **DayTimeline** | 4 | Proportional blocks, now-line, honest past state (`components/timeline.png`) | The "now" block is only outlined; it doesn't fill with elapsed time the way the now-line suggests. |
| **Heatmap** | 2 | Right encoding; no-class days are hatched | 13px cells in the far left of a wide column, with 13 future columns of empty outlines (`components/heatmap.png`). |
| **EmptyState** | 3 | Direction, not mood; one action | Plain text plus a button floating in white space, with nothing to anchor the eye (`components/empty-review.png`). |

---

## 2. Motion audit

### What runs today (measured)

| Motion | Timing / easing (measured) | Verdict |
|---|---|---|
| Tab underline | `clip-path` 280ms ease-in-out | **Keep.** Feels like Linear. |
| View change (tabs) | `viewEnter` 240ms, 6px rise + fade, whole view | OK but generic. The heading fades with the content, and lateral tabs get no direction. |
| Course → lecture | root slides 24px (280ms); title morph 300ms | **Good idea, collision at 150ms** (`motion/drill-morph-150.png`). |
| Back / lecture → lecture | reverse slide | Good. Back has no reverse morph into the row, and the scroll position is lost. |
| Step tick | marker fill 180ms; number blurs out 120ms; check draws 240ms (+60ms); rail fills 320ms (+80ms); spring press 280ms | **Best motion in the app**, but in "Mark done and continue" it plays off screen. |
| Step expand / collapse | `grid-template-rows` 240ms; content fades 140ms and rises 4px | Good on its own. Collapse and expand run at the same moment as the scroll, so you get a gap and a jump. |
| Week expand | rows 240ms + chevron 180ms | Rows unmask but don't fade or stagger. Fine. |
| Up next swap | old fades out 140ms, new rises out of blur 280ms (+60ms) | **Keep.** The card height and the content below snap. |
| Sheet | 220ms in, 150ms out | Good on desktop. On phone it should rise from the bottom. |
| Menu | 180ms in from the trigger, 120ms out | Good. |
| Toast | 260ms rise, 150ms out | Good. |
| Progress bars | `clip-path` 480ms ease-in-out | Good. The numbers beside them jump. |
| Goal dot pop | 320ms spring | Good. |
| Keyboard shortcuts, ⌘K, reduced motion | none (all 15 `motion.mjs` checks pass; reduced motion leaves 0 running animations) | **Keep exactly as is.** |

### Moments with no motion that need it (0 animations recorded)

| Moment | Why it matters |
|---|---|
| Review deck: reveal, next term, finish | This is the core learning loop. Each card should feel like a card. |
| Rating selection (rail, finished panel, sheet) | The most important self-report gets no confirmation. |
| Recall card reveal and Got it / Not yet | Same as the review deck. |
| Course filter and Review filter chips | The whole list swaps instantly, so you can't tell what changed. |
| Assignment status change | The row teleports or vanishes into a collapsed group. |
| Up next card height | Everything below jumps 43px. |
| Counts: "3 of 10 steps", "4/10", Review badge, goal "4 days", "0 of 4 days" | Numbers are the reward. Linear, Stripe and Vercel roll them. |
| Copy button | The label swaps instantly; only the toast moves. |
| Phone sheet | It should rise from the bottom edge, not fade in the middle. |

### What feels cheap
- The same 6px fade-up on every tab switch, including the page title. Premium apps keep the frame still and move only the content.
- A crossfade between two scaled bitmaps of different font sizes in the title morph. Mid-flight it shows doubled, soft text.
- Collapse, expand and scroll fired together. The page lurches instead of moving in sequence.

---

## 3. Design-system drift (heuristic 4)

- **Corner radii:** 11 values found (1, 2, 3, 4, 6, 8, 9, 10, 12, 18px, 50%). Tokens define 4 (`r-ctl` 6, `r-code` 8, `r-panel` 10, `r-pill`) plus 12px dialogs. The toast uses 8px; the segmented control uses 8px.
- **Control heights:** 11 values from 26px to 52px.
- **Icons:** the menu check is the text glyph "✓". The design system says inline SVG only.
- **Colors:** the code block's Copy button hardcodes `#dcecea`, `#8fe0c9` and `#a9d6d2` instead of `code-ink` / `code-meta` tokens.
- **Clipping:** `.rail { overflow-y: auto }` clips the goal ring and the rating's right edge. It also makes the lecture rail a nested scroll area (scroll height 832px in an 800px rail).
- **Sheet on phone:** the README says Rate and Notes "open as sheets from the sticky bar". They render as centered dialogs.
- **The rule that causes the flatness.** "`shadow-pop` only for floating layers… no other shadows" is honest, but it is the main reason controls look default. **Change the design system first** (an elevation scale with 2 resting levels, and motion tokens in `tokens.json`), then the page. CLAUDE.md requires new patterns to go into the design system.

---

## 4. Accessibility and quality floor
- **Reduced motion:** passes. Zero running animations, no view transitions.
- **Keyboard:** shortcuts run with no animation. Focus ring is solid and visible. **Gap:** no shortcuts inside the review deck, and focus is biased to "Got it".
- **Phone targets under 44px on the lecture page:** breadcrumb "Course" 41×17, "Expand all" 34px tall, step Undo 32px, step title toggle 26px. Step markers are 36px with a 4px hit extension, so 44px effective.
- **Horizontal overflow:** 0px on every view at 390 and 1360, light and dark.
- **Contrast:** not remeasured; the tokens were checked in round 2.

---

## 5. Severity-ranked fixes (top 15)

> [!important] Order of work
> Update `hub/design-system/` first: elevation tokens, motion tokens and the bottom-sheet pattern. Then change `hub/index.html`. Keep the three rules: under 300ms, no motion on keyboard shortcuts or ⌘K, and reduced motion turns everything off.

**1. [Sev 3] Make the step tick visible and sequence "Mark done and continue".**
- **Where:** lecture steps (desktop) and the phone sticky-bar "Done".
- **Wrong:** collapse, expand and scroll fire together. The done step is off screen at 60ms with a 100px gap (`motion/done-continue-060.png`). On phone, the tick lands at y 905 and the page jumps 884px (`flow/phone-lecbar-done-after.png`).
- **Reference:** Things 3. The box fills, the item lingers about 400ms, then moves.
- **Fix:**
  - 0ms: the button's label crossfades to "Done" with the check drawing in (160ms).
  - 0–240ms: the marker tick plays in place.
  - 200ms: collapse the done step (240ms `ease-out`) while `scrollTo` keeps the **done header** 24px below the bar, so the rail fill visibly runs into the next marker.
  - 320ms: expand the next step.
  - On phone, if the current step is off screen, scroll it into view first (smooth, about 250ms), then tick.
  - Keep the instant path for `x`.

**2. [Sev 3] Restore your place on Back.**
- **Where:** Course → lecture → Back or breadcrumb.
- **Wrong:** scrollY goes from 828 to 0 (measured).
- **Reference:** Linear. The list keeps its scroll and the row stays selected.
- **Fix:**
  - Save `scrollY` per hash in a `Map` before navigating; in `navRender`, restore it inside the view-transition callback after `render()` (skip the `scrollTo(0,0)` for back nav).
  - Give the source row `view-transition-name: lec-title` on the way back so the title flies home.
  - Tint the row `surface-2` and fade it out over 600ms.

**3. [Sev 3] Add an elevation and control scale (fixes the "default" look).**
- **Where:** Button, UpNext, RecallCard, pager, chips, segmented control.
- **Wrong:** 173 inset 1px rings; hover changes only a border color; 11 heights; 11 radii.
- **Reference:** Linear and Vercel buttons: a 1px inner top highlight, a hairline, and a 1–2px soft shadow that grows on hover.
- **Fix (add to tokens):**
  - `--shadow-1: 0 0 0 1px rgb(15 36 39/.08), 0 1px 2px rgb(15 36 39/.06), inset 0 1px 0 rgb(255 255 255/.7)` for resting cards and secondary buttons.
  - `--shadow-2: 0 0 0 1px rgb(15 36 39/.10), 0 4px 12px -2px rgb(15 36 39/.10)` for hover (dark: replace the inset with `rgb(255 255 255/.04)` and use black shadows).
  - Primary button: `box-shadow: inset 0 1px 0 rgb(255 255 255/.16), 0 1px 2px rgb(15 36 39/.25)`.
  - Hover: `translateY(-1px)` plus `--shadow-2` (140ms `ease-out`). Active: `translateY(0) scale(.98)`.
  - Heights: 28 (inline), 36 (default), 44 (phone). Radii: 6 (controls), 10 (cards), 14 (floating layers), pill.

**4. [Sev 3] Make the review deck a real card session.**
- **Where:** Review sheet.
- **Wrong:** 0 animations on reveal and next. Height 294 → 324 and top shifts 15px. Focus defaults to "Got it" (Enter ×7 marked 3 terms). Keys 1, 2 and Space do nothing.
- **Reference:** [Gemini Notebook flashcards](https://mobbin.com/screens/34c51558-a1fa-4db3-a2c6-2ec7ef560b06), [Duolingo lesson](https://mobbin.com/screens/0c9e3e44-84fe-4feb-92bc-baa1f2f333d6), [Babbel](https://mobbin.com/screens/b60c1efc-e38e-46cd-82e1-04e9540c61c1).
- **Fix:**
  - Pin the sheet top (`margin-top: 14vh`) and give `.rv-card` `min-height: 220px`.
  - Reveal: the term moves up 8px and the meaning fades in and rises 6px (200ms `ease-out`).
  - Next: the old card exits `translateX(-24px)` with a fade (140ms); the new one enters from `+24px` (220ms `ease-out`).
  - Add a 3px teal progress bar under the header (`scaleX`, 240ms `ease-in-out`) and "✕ 2 · ✓ 5" counters.
  - Keys: Space reveals, 1 = Not yet, 2 = Got it, shown as kbd hints on the buttons.
  - Focus the card, not "Got it".

**5. [Sev 3] Bring the phone's main action above the fold.**
- **Where:** Today at 390px.
- **Wrong:** "Mark step done" sits at y 849, under the tab bar at 787 (`flow/phone-today-fold.png`).
- **Reference:** the hub's own lecture sticky bar; Things 3 quick complete.
- **Fix:**
  - On phones, clamp the Up next code block to 3 lines behind "Show prompt (12 lines)" and keep the Copy button visible.
  - Put the actions before the code block.
  - Or show a slim sticky "Mark step done" bar above the tab bar while the card's own button is off screen (IntersectionObserver).

**6. [Sev 2] Give ConfidenceRating a selection motion and words.**
- **Where:** lecture rail, finished panel, rate sheet.
- **Wrong:** bare numerals; 0 animations on select; shown twice; right edge clipped 0.58px.
- **Reference:** [Cleo AI rating sheet](https://mobbin.com/screens/26d2816d-4b10-4cb3-826b-a2c70aaea3c9) (pills with end labels), [Urban Company](https://mobbin.com/screens/cf40f67b-986a-44d4-bfee-5a81998d4b06) (label in the selected segment).
- **Fix:**
  - A teal pill that slides behind the chosen cell (reuse the tab underline's `clip-path` technique, 220ms `ease-in-out`).
  - The selected cell reads "2 · Shaky". The help line crossfades (160ms).
  - Toast "Rated Shaky · back Thu Oct 22".
  - Hide the rail copy while the finished panel is on screen.
  - Fix the clip with `.rail { overflow: clip auto; overflow-clip-margin: 6px }` or `padding-inline: 4px; margin-inline: -4px`.

**7. [Sev 2] Fix the drill-in title collision.**
- **Where:** Course row → lecture.
- **Wrong:** at 150ms the flying title overlaps the summary (`motion/drill-morph-150.png`).
- **Reference:** Arc and iOS shared-element transitions. The hero lands first, then the content settles in.
- **Fix:**
  - Delay the new root fade: `vtFadeIn 180ms ease-out 120ms`.
  - Shorten the title group to 260ms `cubic-bezier(.2,.8,.2,1)`.
  - Hide the old title snapshot (`::view-transition-old(lec-title){opacity:0}`) so only one crisp title moves.

**8. [Sev 2] Animate list changes (filters, status moves, recall results).**
- **Where:** Course chips, Review chips, Work status, recall cards.
- **Wrong:** 0 animations recorded on every filter. A moved assignment disappears into collapsed Done.
- **Reference:** Linear list re-sort; Things 3 move.
- **Fix:**
  - Wrap these renders in `withTransition("vt-list")` and give each row `view-transition-name: row-<id>`, so moved rows glide (240ms `ease-in-out`).
  - New rows fade and rise 4px (180ms, 20ms stagger, max 6). Leaving rows fade in 120ms.
  - On a status change into a collapsed group, roll the group count (+1) and pulse its header `surface-2` once (400ms).

**9. [Sev 2] Smooth the Up next height and the content below it.**
- **Where:** Today.
- **Wrong:** the card shrank 43px and the sections below snapped.
- **Reference:** Linear inbox. Surrounding items glide when one changes size.
- **Fix:**
  - Name `#upnext` and the following sections (`view-transition-name: upnext-card`, `today-below`) inside `vt-swap` so their groups animate size and position (280ms `ease-in-out`).
  - Roll "step 4 of 10" → "5" as a number ticker (`translateY` 100% → 0, 200ms).

**10. [Sev 2] Rebuild recall cards as tappable cards.**
- **Where:** lecture "Check yourself".
- **Wrong:** a stretched grid (a 290px card holding one button), 9 identical buttons, no hover, instant reveal (`components/recall.png`).
- **Reference:** Gemini Notebook flashcards; Quizlet-style tap-to-flip.
- **Fix:**
  - `align-items: start` on the grid.
  - Make the whole card a button: hover `--shadow-2` plus `translateY(-1px)`.
  - Reveal the meaning with `grid-template-rows 0fr → 1fr` (200ms) and a fade.
  - After reveal, show Not yet / Got it as small segmented pills. The result tag slides in from the right (160ms).

**11. [Sev 2] Tighten the command palette.**
- **Where:** ⌘K.
- **Wrong:** 2-line rows (~54px), no icons, no match highlight, no hint on the selected row.
- **Reference:** [Vapi](https://mobbin.com/screens/593d7acd-2e16-4365-bcd6-02ce52f48f3b) (one line with "— meta"), [Juicebox](https://mobbin.com/screens/84169c57-5cd6-4495-bb71-93d37266f4c4) (type icons, accent on the selected row), [Remote](https://mobbin.com/screens/2c863fcf-aab8-4a14-a85d-c6839d1b40f8) ("Select ↵" on the selected row), [Magnific](https://mobbin.com/screens/14ceb943-f04a-460f-b4f5-2ebd78d74aff) (shortcut chips).
- **Fix:**
  - 40px one-line rows: `[16px icon] Title · muted meta`. Use the lecture's StatusIcon, an assignment icon, and an "Aa" icon for terms.
  - Bold the matched substring in `ink`.
  - Put "Open ↵" on the right of the selected row, and add a 2px teal left bar on it.
  - Keep **no animation** on open and selection.

**12. [Sev 2] Make finishing a guide a real moment.**
- **Where:** `#finished` panel.
- **Wrong:** a flat teal box, the rating repeated, and a small "Next up" link (`flow/guide-finished-rated.png`).
- **Reference:** [Uxcel lesson complete](https://mobbin.com/screens/079d1b0e-d73a-46cf-9c46-0c138b025d6f) (stats + Continue), [Unity tutorial complete](https://mobbin.com/screens/fe650398-23a4-4ff8-b76c-2aead134d25c) (Next up card with time + rating).
- **Fix:**
  - A ring fills to 100% (480ms `ease-in-out`).
  - The line "9 of 9 steps · about 3 hrs" ticks up.
  - Rating with words.
  - Primary button "Start AI-8 →" (or "Prep AI-9 →"), secondary "Back to Today".
  - Keep the existing 420ms blur-rise entrance.

**13. [Sev 2] Quiet the done steps.**
- **Where:** StepList.
- **Wrong:** strike-through on 18px condensed semibold, plus an "Undo" on every done row (9 on a finished guide).
- **Reference:** Things 3 and Linear sub-issues. Done items dim; actions appear on hover.
- **Fix:**
  - Done title: `color: var(--muted); font-weight: 500`, with no strike, or a strike at `text-decoration-color: color-mix(in srgb, var(--muted) 50%, transparent)`.
  - On desktop, Undo shows on `:hover` / `:focus-within` only (opacity 0 → 1, 120ms).
  - On phone, keep it as a 44px icon button.

**14. [Sev 2] Turn phone sheets into bottom sheets.**
- **Where:** Rate, Notes and Review at under 900px.
- **Wrong:** a centered modal with 266px of backdrop above and below, plus a redundant Done (`components/phone-rate-sheet.png`).
- **Reference:** [Cleo AI](https://mobbin.com/screens/26d2816d-4b10-4cb3-826b-a2c70aaea3c9), [Sesame](https://mobbin.com/screens/e7e08aa7-05ab-4152-92f3-fd1fc6157c80).
- **Fix:**
  - `@media (max-width:899px){ .sheet{ margin:auto 0 0; width:100%; max-width:100%; border-radius:16px 16px 0 0; padding-bottom: env(safe-area-inset-bottom) } }`.
  - Add a 36×4 grabber.
  - Enter `translateY(100%) → 0` (280ms `cubic-bezier(.32,.72,0,1)`); exit 200ms.
  - The rating closes the sheet 250ms after a pick, followed by a toast.

**15. [Sev 1] Fix the polish nits.**
- **Where:** several.
- **Wrong and fix:**
  - The goal ring is clipped by the rail (`components/goal.png`). Fix with the same rail clip fix as item 6.
  - The orange strip on Up next has a mismatched corner. Use `box-shadow: inset 4px 0 0 var(--now)` on the card and delete `::before`.
  - The menu "✓" glyph → use `I.check(14)`.
  - Code tags "AI-5" → quiet tags: `background: var(--surface-2); border-radius: 4px; padding: 1px 6px; text-decoration: none`, teal on hover.
  - Heatmap → size cells to the column (`grid-template-columns: 28px repeat(15, minmax(13px, 1fr))`, square cells) and fade future cells to `opacity: .4`.
  - Toast → add a 16px status icon and `border-radius: 10px`.
  - Code Copy colors → use tokens.
  - Work group headers → transparent with a bottom hairline instead of grey bars.

---

## What to keep (don't regress these)
- The tick choreography: spring press, number blurring out, check drawing in, rail filling 80ms later.
- The tab underline slide, the menu growing from its trigger, the toast that waits on hover, and the sheet exit being faster than its entrance.
- Instant keyboard shortcuts and an instant ⌘K. Reduced motion turns everything off. Both verified.
- Honest states: grey "Not checked off", orange only for now/next, warn only for real problems.
- Copy and voice: plain verbs, student vocabulary, empty states that give direction.

## References (Mobbin)
- [Gemini Notebook — flashcards](https://mobbin.com/screens/34c51558-a1fa-4db3-a2c6-2ec7ef560b06): a card that flips, ✕/✓ counters, prev/next arrows. Borrow the counters and the card motion for the review deck.
- [Duolingo — lesson question](https://mobbin.com/screens/0c9e3e44-84fe-4feb-92bc-baa1f2f333d6): a thin progress bar on top and number-key hints on the answers. Borrow both.
- [Babbel — speaking card](https://mobbin.com/screens/b60c1efc-e38e-46cd-82e1-04e9540c61c1): "1/10" plus a hairline progress bar. Borrow it for "Term 1 of 9".
- [Vapi — command palette](https://mobbin.com/screens/593d7acd-2e16-4365-bcd6-02ce52f48f3b): one-line rows with an icon and "— section" meta, plus a result count in the footer.
- [Juicebox — command palette](https://mobbin.com/screens/84169c57-5cd6-4495-bb71-93d37266f4c4): a left accent on the selected row, type icons, and a trailing ↗ for external links.
- [Remote — command palette](https://mobbin.com/screens/2c863fcf-aab8-4a14-a85d-c6839d1b40f8): a "Select ↵" hint on the selected row only.
- [Magnific — command palette](https://mobbin.com/screens/14ceb943-f04a-460f-b4f5-2ebd78d74aff): shortcut chips right-aligned per action.
- [Uxcel — lesson complete](https://mobbin.com/screens/079d1b0e-d73a-46cf-9c46-0c138b025d6f): a short stat row plus one primary Continue.
- [Unity — tutorial complete](https://mobbin.com/screens/fe650398-23a4-4ff8-b76c-2aead134d25c): a "Next up" card with its duration, and a rating inline.
- [Cleo AI — rating sheet](https://mobbin.com/screens/26d2816d-4b10-4cb3-826b-a2c70aaea3c9): a bottom sheet with 1–5 pills and end labels. The model for phone Rate.
- [Urban Company — rating sheet](https://mobbin.com/screens/cf40f67b-986a-44d4-bfee-5a81998d4b06): the selected segment carries the value label.
- [Sesame — feedback sheet](https://mobbin.com/screens/e7e08aa7-05ab-4152-92f3-fd1fc6157c80): a grabber handle and a full-width bottom sheet.
