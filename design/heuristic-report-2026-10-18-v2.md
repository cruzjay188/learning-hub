# Heuristic review: Eagle Learning Hub v2 (2026-10-18)

> [!summary] Verdict: v2 clears the "experienced product designer" bar on a laptop and comes close on a phone. Overall usability is about **4/5, up from 3/5**. Every v1 Sev 3 problem is fixed or mostly fixed. The phone lecture page is 3,386px instead of 9,000px, its actions sit in a sticky bar, controls pass contrast, and the ⌘K palette and shortcuts work.
> **Top 3 remaining problems:** (1) The core "Mark done and continue" move overshoots. It leaves the next step's title 113px (desktop) or 279px (phone) above the viewport, so you land mid-step at the code block. (2) After 6:30pm and on weekends, *Up next* jumps to a week-old lecture (AI-4, AI-3) instead of tonight's AI-8 homework. (3) Several changes still can't be undone in place or drop focus: Today's "Mark step done" has no Undo, a status change makes the row vanish into the collapsed Done group with no toast, and Undo, Clear rating, Clear filter and the status menu all send focus to `<body>`.
> **Top strength:** the act-where-you-see-it loop. On Today, one tap ticks the step, swaps the card to step 2, says "Step done", checks Monday's goal dot and moves the course bar to 1 of 116, all without leaving the page (`tasks/04`).

Method: tested locally at http://127.0.0.1:4180 with `hub/qa/shoot.mjs` (baseline captures) and a scratchpad Playwright harness for viewport shots, clips, measurements and multi-step flows. Screens are in `hub/design/screens-v2-audit/`: `mon1115/` (Mon 10-19 11:15 ET, every view at 1360 and 390, plus dark for Today, Course and Lecture), `weekend/` (Sun 10-18 14:00), `evening/` (Mon 19:30) and `tasks/` (numbered interaction shots 01–40). Each run starts with empty progress. Review scheduling was re-checked with Playwright's clock set to the fake date, because `ratedAt` uses the real clock while "today" uses `hub:debug-now`. Tests that mix the two show false "Due today" results, and those are not reported.

## v1 → v2 scorecard

| # | Heuristic | v1 | v2 | Worst sev v1 → v2 | What moved it |
|---|---|---|---|---|---|
| 1 | Visibility of system status | 3 | 4 | 3 → 3 | After-class and weekend states, live region and toast on ticks, sync date in tooltip. New: scroll overshoot after "Mark done and continue" |
| 2 | Match with the real world | 3 | 4 | 3 → 3 | Neutral "Not checked off" grey, no "Day 1" chips, full rating labels. New: evening and weekend *Up next* points at old lectures |
| 3 | User control and freedom | 3 | 4 | 3 → 2 | Rating no longer clears on re-press, Clear link, Undo on done steps, Not now on catch-up |
| 4 | Consistency and standards | 3 | 4 | 2 → 2 | One status vocabulary, ↗ on every external link, orange kept for now and next |
| 5 | Error prevention | 2 | 4 | 3 → 2 | Control borders ≥ 3:1, rating locked before the lecture date, goal stepper instead of 5 loose buttons |
| 6 | Recognition rather than recall | 3 | 4 | 2 → 2 | Icon key popover, dates on phone rows, note dot on rows, labelled goal |
| 7 | Flexibility and efficiency | 2 | 4 | 3 → 2 | ⌘K / "/" palette across lectures, terms and assignments; g-t/c/r/w, j/k/x/c/n/e/1–5; "Continue" action |
| 8 | Aesthetic and minimalist design | 3 | 4 | 3 → 2 | Phone lecture 9,000 → 3,386px, focus mode, one Up next card, wrapped prompts, compact heatmap |
| 9 | Error recognition and recovery | 3 | 4 | 2 → 2 | Cached last-good data, Reload button, header dot turns amber |
| 10 | Help and documentation | 2 | 4 | 2 → 2 | "How this hub works" sheet with statuses, saving, sync date and shortcuts; catch-up banner |

### Re-measured v1 issues

| v1 issue | v1 measurement | v2 measurement | Status |
|---|---|---|---|
| Unticked checkbox / step marker border | 1.39:1 light, 1.34:1 dark | **3.17:1** light, **4.07:1** dark (marker, rating group, notes border, goal circles) | ✅ Fixed (light is just over 3:1) |
| Dark pressed-button text | white on `#5ab6b2` = 2.39:1 | `#04201f` on teal = **7.12:1** | ✅ Fixed |
| Orange text | — | eyebrow `#a8400a` 6.17:1, "Today" 5.68:1; dark `#ff9b62` 8.4–9.0:1 | ✅ |
| Focus after a toggle | `BODY` after every tick, rate or goal change | Kept on: step marker tick, `x`, rating, Mark step done (moves to the next button), Mark done and continue (moves to next step), week toggle, filter chip. **Still lost (`BODY`):** step Undo, Clear rating, Clear filter, status-menu choice | ⚠️ Mostly fixed |
| Touch targets at 390 | checkbox 32, goal 32, Copy 23, chips 32, tabs 38, inline links 19 | Step markers 36 + `::after` = 44 ✅, status icon 28 + 8 = 44 ✅, chips 44 ✅, tabs 57 ✅, stepper 44 ✅, rating 44 ✅, Copy 40, Undo 32, segmented control 34, **code tags 29×15, inline row links 19–21, breadcrumb "Course" 17, save dot 7×15** | ⚠️ Mostly fixed |
| Phone lecture length | 9,000px; rating and notes at y = 7,976 | **3,386px**; Rate, Notes and Done in a sticky bar at y = 735–788 on every scroll position | ✅ Fixed |
| Phone Today main action | Open guide ended at 894 on an 844 screen | **Mark step done** at 678–722 (above the 787px tab bar) | ✅ Fixed (not true after class, see 8) |
| Header height on phone | 117px | 49px top + 57px bottom tab bar | ✅ |
| Horizontal overflow at 390 | 0px | 0px on all 20 baseline runs | ✅ |
| Data freshness visible | nowhere | save-chip tooltip "Course data updated Oct 18" and the help sheet; not visible on the page | ⚠️ Partial |

## Task walkthroughs

### Task 1: "What do I have to do today, and what's next?" ✅ (⚠️ after class)
- **Desktop, 11:15 ✅** (`mon1115/today-1360-light.png`): date, "Week 3 of 15 · Day 10 of 67", a proportional timeline with an orange 11:15 now-line inside the AI-8 block, then **one** Up next card naming a *step* ("Do Part I: peer quiz, then FreeCodeCamp", step 1 of 10, Done when…, about 5 hrs left). Answered in about 2 seconds.
- **Phone, 11:15 ✅** (`tasks/01-today-phone-first-screen.png`): one-line "10am · AI-8 Authentication / Next: 2:30pm Work time" row, and Mark step done is in the first screen. Tapping the row expands the 5-slot day (`tasks/38`).
- **After class, 19:30 ⚠️** (`evening/today-1360-light.png`, `evening/today-390-light.png`): "Class is over for today" and an all-teal timeline are good. But Up next says **"Still open from Tue Oct 13 · AI-4 Committing your Progress · step 1 of 9"** while today's AI-8 is untouched and Netflix IV (AI-8 homework) is "To do". On the phone, the Claude-prompt block pushes Mark step done below the tab bar.
- **Weekend ⚠️** (`weekend/today-1360-light.png`): a clear notice ("No class today. Next class: Monday, October 19 · AI-8 Authentication.") and "Prep for tomorrow · AI-8". Up next, though, is **AI-3 from Fri Oct 9**.

### Task 2: Tick the first step in today's guide, then undo ✅ / ⚠️
- From Today, **Mark step done** ticks it, the card swaps to step 2, a "Step done" toast shows, and the live region says "Step 1 done. 1 of 10. Next: Restructure Myflix…" (`tasks/04`). Focus moves to the new Mark step done button. **There's no Undo** on Today (0 undo controls, and the toast has no button). You have to open the guide to reverse it.
- In the guide, **Mark done and continue** collapses step 1 into a struck-through line with an always-visible "Undo", and opens step 2. But the page scrolls to where step 2 *was* before step 1 collapsed: step 2's top ends at **−113px** on desktop and **−279px** on phone (`tasks/05`, `tasks/23`). You land on a code block without its title. With `prefers-reduced-motion` the same action lands at exactly +96px, so the 220ms collapse animation is the cause.
- **Undo** reverts to 0 of 10 and announces "Step 1 marked not done". Focus drops to `BODY`, and step 1 (now current again) stays collapsed while step 2 stays open (measured).

### Task 3: Copy a Claude prompt ✅
- Copy shows "Copied" plus the toast "Copied: Terminal". Prompts wrap (`evening/today-1360-light.png`). `c` copies the current step's code from the keyboard. Long blocks clamp with "Show all N lines".

### Task 4: Find an assignment's GitHub repo ✅ / ⚠️
- Today › Open assignments and Work rows now show a ↗ on titles that link to repos (`mon1115/work-1360-light.png`). The palette finds "netflix" (5 assignments).
- ⚠️ Netflix IV and V still have no repo (data). In a desktop lecture, the Links block (where "Netflix clone IV · To do" lives) is hidden inside the sticky rail's own scroll area: rail `scrollHeight` 1,294 vs `clientHeight` 800, with all 10 AI-8 links below its fold and no fade or visible scrollbar (`tasks/03`). On FE-3 the last link is cut mid-word (`mon1115/lecture-fe-3-1360-light.png`).

### Task 5: Find FE-3, three weeks away, and see how to prep ✅
- ⌘K → "fe 3" → *FE 3 React and React Hooks*, Enter opens it. "hooks" also finds it. **But "fe-3" (the URL id, and how AI-8 is written) returns "No match"** (measured).
- Course opens with Week 3 expanded and the rest collapsed, and phone rows now show dates (`mon1115/course-390-light.png`). FE-3 shows a prep outline note, 4 prep steps, 40 min, and rating locked with "You can rate this after class on Tue Nov 10" (`mon1115/lecture-fe-3-1360-light.png`).

### Task 6: Rate a lecture "Shaky" and find it again ✅
- Rail or sheet: tap 2 → "Shaky. It comes back for review on Wed Oct 21." Re-pressing 2 keeps it, and Clear is a separate link. The progress line under the H1 shows "· Shaky".
- With the clock on Wed: Review shows "1 due today", the Review tab carries a count badge, Today shows a "Review due" section (`tasks/16`, `tasks/17`). **Review** runs 9 term cards (front → Show meaning → Not yet / Got it, `tasks/18`, `tasks/19`), then "6 of 9 terms recalled. Still shaky on: …" and a re-rate (`tasks/20`). Re-rating 4 moves it to Strong, "Next Sat Oct 31" (measured). This is a real spaced-repetition loop and the best new feature.

### Task 7: Write a note, leave, come back ✅
- Phone Notes sheet → typing → "Saved in this browser" (`tasks/26`). Course row gets a note dot (`tasks/27`). Back on the lecture, the sheet shows the text and "Saved just now" (`tasks/28`). Focus returns to the Notes button on close.

### Task 8: Use it on a phone between classes ✅
- First screen of Today = the next action (`tasks/01`). The lecture's sticky bar ("0/10 steps · Rate · Notes · ✓ Done") is always in reach (`tasks/02`). Rate and Notes open dialogs with 44px targets (`tasks/25`, `tasks/26`). Top and bottom chrome take 159px of 844 (19%) on the lecture page, which is acceptable.

### New in v2: catch-up, Work status menu, Course filters
- **Catch-up ✅** (`tasks/31`, `tasks/32`): 9 past lectures with Done / Partly / Not yet. Saving says "Saved. Up next is updated." and Up next moves to AI-8. "Partly" lectures then show as "Not checked off 0/10" under that filter (`tasks/34`). That's explained in the sheet copy, but it reads oddly.
- **Status menu ⚠️** (`tasks/29`): click the status icon → 4 options with icons and a ✓, focus lands on the current option, arrows work. After a choice, focus → `BODY`, there's no toast, and choosing Done moves the row into the **collapsed** Done group, so it simply vanishes.
- **Course filters ✅**: "Not checked off 3" (`tasks/34`), an empty "Needs review" state with "Show all lectures" (`tasks/35`), a module select, and the icon-key popover (`tasks/36`).

## Findings by heuristic

### 1. Visibility of system status: score 4/5
- **[Sev 3] "Mark done and continue" scrolls past the next step.** Lecture page, desktop and phone (the sticky bar's ✓ Done too). Evidence: `tasks/05`, `tasks/23`; step 2 top −113px desktop, −279px phone; +96px with reduced motion. Fix: compute the scroll target after the collapse finishes (listen for `transitionend` on step 1's body, or measure step 2's position minus step 1's body height), or scroll first and then collapse.
- **[Sev 2] Cached-data mode is announced only by a 2.2s toast.** With `hub-data.json` failing, the page silently shows the last copy, and the toast "Showing your last saved copy…" disappears (`tasks/39`). Fix: a persistent one-line notice, "Offline copy from Sun Oct 18 · Retry".
- **[Sev 2] Status changes on Work give no visible confirmation** beyond the row moving (and vanishing when Done is collapsed). Evidence: `tasks/30`, measured toast empty. Fix: "Netflix IV → Done · Undo" toast (see References: Todoist, ClickUp).
- **[Sev 1] Data freshness lives only in a tooltip and the help sheet** ("Course data updated Oct 18"). Fix: show "Synced Sun" next to the save state on desktop.
- ✅ Strengths: "Class is over for today", the weekend notice, the 11:15 now-line, polite live-region messages on every tick, the "Step done" toast, the Review badge, and the amber header dot on load failure (`tasks/40`).

### 2. Match between system and the real world: score 4/5
- **[Sev 3] After class and on weekends, *Up next* points at an old lecture instead of tonight's homework.** Today, 19:30 → "Still open from Tue Oct 13 · AI-4" (`evening/today-1360-light.png`). Sunday → "Still open from Fri Oct 9 · AI-3" (`weekend/today-1360-light.png`). Cause: rule (1) "today's lecture" stops at 18:30, and rule (3) picks the *earliest* open lecture of the last 5 class days. Fix: before rule 3, use the most recent class day's lecture until the next class starts. On weekends, prefer "Prep for Monday" over a 9-day-old guide, or offer catch-up.
- **[Sev 1] Some content still shows raw markup.** Work-log summaries show `[mattpocock/skills](https://…)` and bare URLs (`mon1115/work-activity-1360-light.png`). BE-7 step detail shows backticks (`tasks/12`). The AI-4 block labelled "Claude prompt" holds terminal commands (`evening/today-1360-light.png`). Fix: strip or render inline Markdown, and correct the label in the guide JSON.
- **[Sev 1] Review dates can land on weekends** ("Next Sat Oct 31", measured). Fix: snap due dates to the next class day.
- ✅ Strengths: "Not checked off" in neutral grey, no false "Day 1" chips, full labels (Lost … Could teach it), and the course's own words (Stand Up, Team Meet, `#eagle_questions`).

### 3. User control and freedom: score 4/5
- **[Sev 2] No Undo after "Mark step done" on Today.** The step disappears from the card (`tasks/04`; 0 undo controls, and the toast has no action). Fix: "Step 1 done · Undo" toast for 5s.
- **[Sev 2] Status changes can't be undone, and Done rows disappear into a collapsed group** (`tasks/30`). Fix: Undo toast, or keep the row in place, struck through, until the next render.
- **[Sev 1] Undo restores the step but leaves it collapsed while the next one stays open** (measured `data-open`). Fix: on Undo, re-open the undone step as current.
- ✅ Strengths: Undo on every done step, a rating Clear link, rating no longer toggles off, Esc closes every sheet, Cancel and "Not now" on catch-up, and Back works across all hash routes.

### 4. Consistency and standards: score 4/5
- **[Sev 2] The help sheet contradicts the header.** It says "Ticks, ratings, notes and your weekly goal save to your claude.ai account" while the chip says "Saved in this browser only" (`tasks/12`). Fix: make that sentence follow the current save mode.
- **[Sev 1] Assessment rows use the To-do circle but can't be clicked** (`mon1115/work-1360-light.png`). Fix: a neutral "calendar" or "locked" icon.
- **[Sev 1] Phone Course rows drop the lecture code** that every other view uses ("Authentication / Mon Oct 19", `mon1115/course-390-light.png`). Fix: "AI-8 · Mon Oct 19" on the sub-line, as in the brief.
- **[Sev 1] Disabled rating (before the lecture date) looks almost like the enabled one**: white segments, grey numbers, opacity 1 (`mon1115/lecture-fe-3-1360-light.png`). Fix: `--surface-2` fill and a lock icon in the label.
- ✅ Strengths: one status vocabulary on Course, Work, Today and the help key; ↗ on every external link; orange only for now, next and "This week"; teal 2px focus ring everywhere.

### 5. Error prevention: score 4/5
- **[Sev 2] A few phone targets are still small**: lecture code tags in rows 29×15px (Today, Work), inline title links 19–21px tall, breadcrumb "Course" 17px, the save dot 7×15 (it opens help), Undo 32px, Work segmented control 34px (measured at 390). Fix: give code tags and inline links 44px hit areas via padding or `::after` (markers already do this), and make the whole save chip tappable.
- ✅ Strengths: control borders ≥ 3:1, rating locked before class (also blocks `1–5` keys: 0 ratings set on FE-3), the goal stepper replaces the mis-tap-prone 3–7 buttons, and double-clicking Mark step done did not tick two steps (measured).

### 6. Recognition rather than recall: score 4/5
- **[Sev 2] The Work status icon is the only way to change status, and nothing says it's a button**: no border, chevron or tooltip (`title=""`), 28px (`mon1115/work-1360-light.png`). Fix: show a chevron or a hover state, or add the status label as a small dropdown at row end (see References: Jira).
- ✅ Strengths: icon key popover on Course (`tasks/36`), "Next: …" lines on the timeline, the note dot on rows, "Done when" on every step, "1–3 brings it back for review on a schedule" under the rating.

### 7. Flexibility and efficiency of use: score 4/5
- **[Sev 2] Palette misses dashed codes for codes that contain spaces.** "fe-3" → "No match" while "fe 3" works. "AI-8" works because its code has a dash (measured). The no-match hint itself suggests "AI-8", so Jeffrey will type "FE-3". Fix: normalise `-`, `_` and spaces in both the query and the keys, and index the lecture id too.
- **[Sev 1] Shortcuts are only discoverable through `?`.** The only on-screen hint is ⌘K. Review cards have no keys (Space to reveal, 1/2 for Not yet / Got it). Fix: a small "? Shortcuts" link in the lecture header, and keys on review cards.
- ✅ Strengths: the palette with Actions ("Continue: <step>", "Copy the next command"), grouped results with subtitles and a footer key legend (`tasks/09`, `tasks/10`); g-t/c/r/w; j/k move and focus steps; x, c, n and 1–5 all work (measured).

### 8. Aesthetic and minimalist design: score 4/5
- **[Sev 2] The desktop lecture rail hides Links and "Quiz me" in a nested scroller.** On AI-8, all 10 links sit below the rail's 800px fold with no affordance, even at page bottom (`tasks/03`). On FE-3 a link is cut mid-word. Fix: make only Steps + rating sticky and let Notes and Links flow, or collapse the Steps outline to the current ±2 steps.
- **[Sev 1] Check yourself takes 1,062px of the 3,386px phone lecture page** (9 full-width cards, `mon1115/lecture-ai-8-390-light.png`). Fix: a single "Check yourself (9) · Start" row that launches the same review sheet.
- **[Sev 1] Empty tracks are invisible**: lecture progress, course bar, mini bars and future timeline blocks are 1.07:1 light / 1.18:1 dark (measured). Fine as decoration, but the Course rail bar reads as "nothing here". Show "Not started yet" text (already done) and drop the empty bar.
- ✅ Strengths: confident Plex Condensed hierarchy; one orange-ruled Up next card; a ledger-style Course with collapsed weeks, per-week rings and milestone flags; a compact heatmap that now shows the Sunday commits; a polished dark theme (`mon1115/lecture-ai-8-1360-dark.png`).

### 9. Help users recognize, diagnose, and recover from errors: score 4/5
- **[Sev 2] Offline / cached state is transient** (see 1).
- ✅ Strengths: a plain-language failure message with **Reload** and an amber dot (`tasks/40`), last-good data reused automatically (`tasks/39`), and a clipboard fallback that selects the text and says "press ⌘C".

### 10. Help and documentation: score 4/5
- **[Sev 2] The saving explanation is wrong in local mode** (see 4).
- ✅ Strengths: the "How this hub works" sheet (status key, saving, sync date, shortcuts; `tasks/12`), the first-run catch-up banner, the "How it works" line on Review, and the prep-outline note.

## Accessibility & quality floor

| Check | Result | Evidence |
|---|---|---|
| Text contrast | ✅ Muted 5.32:1 light / 7.34:1 dark; orange-ink text 5.68–6.17:1; dark orange 8.4–9.0:1; code label 6.96:1 | computed (`t9`) |
| Non-text contrast (1.4.11) | ✅ Step marker, rating group, notes, goal circles 3.17:1 light / 4.07:1 dark. ⚠️ Chip and stepper borders 1.27:1 (their text labels carry the meaning, so they pass); empty tracks 1.07:1 (decorative) | computed |
| Visible focus | ✅ 2px teal outline; no stray ring on the H1 after mouse navigation (`:focus-visible` false). ⚠️ Focus lost after Undo, Clear rating, Clear filter, status-menu choice | measured |
| Dialogs | ✅ Native `<dialog>`; focus to first control; returns to trigger (Rate, Notes, palette Esc → previous element) | measured |
| Touch targets ≥ 44px at 390 | ⚠️ Mostly; misses listed in 5 | measured |
| `prefers-reduced-motion` | ✅ Transitions off, and *with* it the step scroll lands correctly (+96px) | measured |
| No horizontal scroll at 390 | ✅ 0px on all views | shoot output |
| Line length | ✅ Step detail capped about 68ch | screenshots |
| Document mode | ⚠️ No `<!doctype>` and no `<meta name="viewport">`: `document.compatMode` = **BackCompat** (quirks). Under mobile emulation the page laid out at 980px. The claude.ai artifact host probably supplies a wrapper, but served locally or through Live Server on a real phone it would render zoomed out. Fix: add `<!doctype html>` and `<meta name="viewport" content="width=device-width, initial-scale=1">` | measured |

## Prioritized fix list

| Priority | Fix | Heuristics | Severity | Effort (S/M/L) |
|---|---|---|---|---|
| 1 | Scroll to the next step **after** the collapse finishes (or subtract the collapsing body's height) for Mark done and continue, the sticky ✓ Done, Skip and `j` | 1, 8 | 3 | S |
| 2 | *Up next* rule: keep the latest class day's lecture until the next class starts; on weekends prefer Monday prep over a 9-day-old guide | 2, 1 | 3 | S |
| 3 | Undo toasts ("Step 1 done · Undo", "Netflix IV → Done · Undo") on Today and Work | 3, 1 | 2 | S |
| 4 | Restore focus after Undo, Clear rating, Clear filter and status-menu choice (re-focus the row's status button or the undone marker); on Undo, re-open the undone step | 3 | 2 | S |
| 5 | Desktop lecture rail: sticky only for Steps + rating; let Notes, Quiz me and Links flow so the repo link is reachable | 8, 6 | 2 | S |
| 6 | Palette: normalise `-` / space / `_` in queries and keys; index lecture ids | 7 | 2 | S |
| 7 | Help sheet saving sentence follows the save mode; persistent "Offline copy from <date> · Retry" notice | 4, 10, 9 | 2 | S |
| 8 | Phone targets: 44px hit areas on code tags, inline row links, breadcrumb, save chip and Undo | 5 | 2 | S |
| 9 | Status icon affordance on Work: chevron or hover state plus a `title`, or a labelled dropdown at row end | 6, 4 | 2 | S |
| 10 | Add `<!doctype html>` and a viewport meta (quirks mode today) | quality | 2 | S |
| 11 | Phone lecture: collapse Check yourself into one "Start (9 terms)" row | 8 | 1 | S |
| 12 | Content: strip Markdown in work logs and step details; fix the "Claude prompt" label on terminal commands | 2 | 1 | M |
| 13 | Show "Synced <day>" in the desktop header; snap review dates to class days; show the lecture code on phone Course rows; distinct icon for Assessments; disabled rating look | 1, 2, 4 | 1 | S |
| 14 | Shortcut discoverability: "? Shortcuts" link on lectures; Space and 1/2 on review cards | 7 | 1 | S |

## References

- [Todoist: toast with Undo](https://mobbin.com/screens/75c4093b-73e7-4344-b2e7-54e90d94e58c): a bottom-left dark toast that names what changed ("Date updated to Tomorrow 17:00"), with an **Undo** action and ×. Borrow this for fix 3: "Step 1 done · Undo" on Today, in the same spot as the current "Step done" toast.
- [ClickUp: "Moved tasks" toast with Undo](https://mobbin.com/screens/cbcd3104-a720-4b99-8515-604294b6b40c): the toast states the destination ("Moved tasks to Personal List") with an Undo icon-button. Borrow this for status changes that move a row into the collapsed Done group: "Moved to Done · Undo".
- [Jira: inline Priority field with chevron](https://mobbin.com/screens/d0bc0aa9-c933-435f-9e71-6f6a2ec78344): the editable cell shows its value plus a ⌄, so it reads as a control before you click. Borrow the chevron or hover outline for the Work status icon (fix 9).
- [ClickUp: status picker grouped by phase](https://mobbin.com/screens/e9639493-e0a6-46c9-93d1-d3189cbdc3c7): statuses grouped as Not started / Active / Done, each with its icon, plus a ✓ on the current one. v2's menu already matches; keep it, and add the toast above.
- Carried over from the v1 report and still the right model: [Optimal Workshop Academy: lesson with bottom Next bar](https://mobbin.com/screens/5751af02-f5df-41ed-8daf-38f174e89bb9) (v2's sticky bar is a faithful take) and [Mintlify: command palette](https://mobbin.com/screens/7c7ad31f-9dfe-4be7-83d7-6002fe31d4d0) (v2's palette matches its grouping and footer legend).
