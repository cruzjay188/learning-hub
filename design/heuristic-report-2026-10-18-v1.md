# Heuristic review: Eagle Learning Hub v1 (2026-10-18)

> [!summary] Verdict: a strong, clearly designed v1 on a laptop that falls short of the "experienced product designer" bar on a phone. Overall usability score is about 3/5.
> **Top 3 problems:** (1) On a phone, the actions Jeffrey needs between classes are buried. "Open guide" sits below the first screen, and rating and notes start about 8,000px down a 9,000px lecture page. (2) Key controls fall below WCAG contrast. Unticked checkboxes measure 1.39:1 in light mode and 1.34:1 in dark, and pressed buttons in dark mode measure 2.39:1. Focus also drops to `<body>` after every tick. (3) There's no fast way to get around: no search, the course map doesn't jump to "this week", and dates are hidden on the phone map.
> **Top strength:** the feedback loop works. Ticking one step immediately updates the lecture's progress ring, the Today card ("Continue guide · Next: …"), the progress meters and the weekly streak. The type, palette and day timeline already read as a designed product.

Method: I tested locally at http://127.0.0.1:4180 with `hub/qa/shoot.mjs`, plus a scratchpad copy that adds clips, measurements and a forced data-load failure. All screenshots are in `hub/design/screens-v1/`. The fake "now" is Mon 2026-10-19 11:15 ET unless noted. I also tested weekend (Sun 10-18 14:00), after class (Mon 19:30) and mid-afternoon (Mon 15:00). Every run starts with empty progress, so state was created with clicks and typing.

## Scorecard

| # | Heuristic | Score (1–5) | Worst severity | Findings |
|---|---|---|---|---|
| 1 | Visibility of system status | 3 | 3 | 6 |
| 2 | Match between system and real world | 3 | 3 | 6 |
| 3 | User control and freedom | 3 | 3 | 3 |
| 4 | Consistency and standards | 3 | 2 | 4 |
| 5 | Error prevention | 2 | 3 | 4 |
| 6 | Recognition rather than recall | 3 | 2 | 5 |
| 7 | Flexibility and efficiency of use | 2 | 3 | 4 |
| 8 | Aesthetic and minimalist design | 3 | 3 | 9 |
| 9 | Error recognition, diagnosis, recovery | 3 | 2 | 3 |
| 10 | Help and documentation | 2 | 2 | 2 |

## Task walkthroughs

### Task 1: "What do I have to do today, and what's next?" ⚠️
- **Desktop ✅** (`01-today-desktop.png`): the date headline, "Week 3 of 15", and the timeline with an orange "now" dot on *10am AI-8 Authentication*, then the "Today's lecture" card with "0 of 10 steps done · Next: Do Part I…" and an **Open guide** button. All of this is answered in about 3 seconds.
- **Phone ⚠️** (`34-today-phone-first-screen.png`): the 117px header and the 5-slot vertical timeline push the card down. **Open guide** ends at 894px on an 844px screen, so the main action needs a scroll.
- **After class ⚠️** (`06-today-afterclass-desktop.png`, 19:30): the timeline is all teal and the card still says "Today's lecture". Nothing says class is over or previews tomorrow's *AI-9 3rd Party APIs*.
- **Weekend ✅/⚠️** (`04-today-weekend-desktop.png`): a clear notice ("No class today… Next class is Monday, October 19, shown below"). The timeline itself has no "Monday" label, so it reads as today's.

### Task 2: Open today's guide, tick the first step, then undo ✅
- Tick → the checkbox fills teal, the title is struck through, the ring reads **1/10**, and "1 of 10 done" appears (`20-task2-tick-step1.png`). Back on Today, the card says **Continue guide · Next: Restructure Myflix…**, Guide steps reads 1%, and the weekly goal reads 1/4 with a "1-day streak" (`21-task2-today-after-tick.png`). This is excellent feedback.
- Undo: clicking again returned `aria-checked="false"` and 0/10 (measured).
- Hesitation points: the empty checkbox is hard to see (border at 1.39:1). After the tick, keyboard focus goes to `<body>` (measured), so a keyboard user loses their place.

### Task 3: Copy a Claude prompt from a step ✅ / ⚠️
- **Copy** changes to "Copied" for about 1.6s (measured). It works.
- You can't read the whole prompt before copying. Prompts don't wrap: lines are cut off at desktop width ("…ready to impleme", `36-lecture-scrolled-aside-cut-off.png`), and only about 30 characters per line show on a phone (`37-lecture-phone-prompt-cutoff.png`).

### Task 4: Find an assignment's GitHub repo ⚠️
- Today › Open work: the rows aren't clickable (`01`).
- Assignments: titles *are* repo links, but they're styled as plain bold ink with no underline or ↗, so I had to hover to find out (`09-assignments-desktop.png`). 9 of 18 assignments have no repo link at all, including Netflix Clone II–V, even though My work › Repos lists `netflix` (`11-work-desktop.png`). It took three views and some guessing.

### Task 5: Find a lecture 3 weeks away (FE-3) and see how to prep ⚠️
- There's no search. On the Course map, FE-3 sits 1,786px down on desktop and 2,717px down on a phone (measured). The map opens at Week 1, not the current week, which is 814px or 1,254px down.
- On a phone, map rows hide the date and code, so you can't confirm "3 weeks away" (`19-map-phone-crop.png`).
- Once there, the lecture page does this job well: a "prep outline" note, 4 prep steps with **Done when**, Key terms and links (`16-lecture-fe3-desktop.png`).

### Task 6: Rate a lecture "Shaky" and find it again later ✅
- Pressing 2 shows "You picked: Shaky" (`22-task6-rated-shaky.png`). It appears in Today › **Review next** ("Authentication · AI-8 · rated Shaky", `23-task6-today-review-list.png`) and as "Shaky" on the map row (`24-task6-map-after-rating.png`).
- ⚠️ Pressing 2 again silently clears the rating (measured: the label resets to "Rate it after class…") and there's no undo. The button labels are cut to "Getting" and "Could".

### Task 7: Write a note, leave, come back, confirm it saved ✅ / ⚠️
- While typing, the status shows "Saved in this browser" (`26-task7-notes-saved-status.png`). After going Map → back, the text is intact (`25-task7-notes-after-return.png`).
- ⚠️ After coming back there's no "saved at…" line. Nothing on the map or Today shows that a lecture has notes, and there's no list of all notes.

### Task 8: Use it on a phone between classes ❌
- The header takes 117px, or 14% of an 844px screen, on every view (measured).
- Today: the main action is below the fold (Task 1).
- Lecture: the first checkbox is at y = 1,020 (`35-lecture-phone-first-screen.png`). The progress ring, rating and notes start at **y = 7,976 of a 9,000px page** (measured) because the side panel stacks under all 10 steps (`14-lecture-ai8-phone.png`).
- Targets measure 32–38px (below 44px). Prompts can't be read.
- The day's core "between classes" jobs (tick a step, rate, jot a note) each take long scrolls.

## Findings by heuristic

### 1. Visibility of system status: score 3/5
- **[Sev 3] The page never says how fresh its data is.** Assignment status, commits and schedule come from `/sync` (`hub-data.json` `generatedAt` = Sun 10-18 9:16pm), but that time appears nowhere (header in `01`). Jeffrey can't tell whether "To do" is current. Fix: show "Synced Sun 9:16pm" next to the save chip, and turn it amber after 24h.
- **[Sev 2] Nothing marks the end of the day.** At 19:30 the hub still says "Today's lecture" and doesn't preview tomorrow (`06`). Fix: after Stand Down, switch the card to "Class is over · Tomorrow 10am: AI-9 3rd Party APIs · Prep steps".
- **[Sev 2] Finishing a lecture gets no acknowledgement.** After all 10 steps are ticked, the Today card silently swaps to "Still open from Fri Oct 16: AI-7" (`32-all-steps-done-today.png`). The lecture shows a small "Done" pill (`33`). Fix: show a brief "AI-8 complete" state with a link to rate it and a link to the next item.
- **[Sev 2] The error state contradicts itself.** The header shows "Loading…" right beside "Couldn't load the course data" (`30-error-data-load-failed.png`). Fix: set the chip to the error state.
- **[Sev 1] Notes lose their saved status on return.** The status line is empty after navigating back (`25`). Fix: "Saved · 2 min ago" from `updatedAt`.
- **[Sev 1] "Saved in this browser" doesn't say what that means.** It doesn't warn that phone and laptop won't sync in local mode (`01`). Fix: add a tooltip or "(this device only)". Live mode says "Saved to your account", which is fine.
- ✅ Strengths: the live "now" dot and progress line on the timeline, the save chip with `aria-live`, and instant progress feedback across views (`21`).

### 2. Match between system and the real world: score 3/5
- **[Sev 3] Lectures Jeffrey attended read as failures.** With a fresh state, every taught lecture on the map shows an amber dashed ring labelled "Not started" (`18-map-desktop-top-crop.png`), and Progress says "Lectures finished 0/10" (`01`). Status only counts ticked guide steps, not being in class. Fix: call it "Guide not started" in neutral grey, and save amber for genuinely overdue work.
- **[Sev 2] Wrong "Day 1" label.** *Git + GitHub, Intro to Docker, Python + JS, TDD, GitHub Actions* all show a `Day 1` code chip (`07-map-desktop.png`, `24`) because the fallback text for lectures without a code is "Day 1". Fix: show no chip when `code` is empty.
- **[Sev 2] "Check with instructor" doesn't say what to do** (`01`, `09`). Fix: an action label such as "Ask Kevin if it's graded", or a tooltip.
- **[Sev 1] Confidence labels are cut to "Getting" and "Could"** (`22`). Fix: use full labels, or short forms that still make sense ("Getting it", "Can teach").
- **[Sev 1] Work-log summaries show raw Markdown,** for example `[mattpocock/skills](https://…)` and "1. Review… 2. Fix #1…" run together (`11-work-desktop.png`). Fix: render basic Markdown or strip it.
- **[Sev 1] The afternoon slot repeats "Work time / Work time"** (`01`). Fix: drop the kind line when it equals the title.
- ✅ Strengths: it uses the cohort's own words (Stand Up, Team Meet, Stand Down, `#eagle_questions`), every time is labelled "ET", and the **Done when** criteria are concrete.

### 3. User control and freedom: score 3/5
- **[Sev 3] Focus is lost after every toggle.** Ticking a step, rating or setting the goal re-renders the whole view, and `document.activeElement` becomes `BODY` (measured). Keyboard and screen-reader users have to start again from the top. Fix: after rendering, re-focus the same control (`[data-step="s1"]`), or update the item in place instead of replacing `#view`.
- **[Sev 2] A second press clears the rating, with no undo** (measured). Fix: make re-pressing do nothing, add a small "Clear" link, or show an "Undo" toast.
- **[Sev 1] Ratings are allowed before a lecture happens.** FE-3 (Nov 10) offers "Rate it after class" (`16`). Fix: disable the rating until the lecture date.
- ✅ Strengths: ticks undo with one press, the browser Back button works (hash routes), and every lecture has breadcrumbs plus Previous/Next.

### 4. Consistency and standards: score 3/5
- **[Sev 2] One icon has two meanings.** The amber dashed ring means "Not started" on the map legend (`18`) but "Check with instructor" in Today › Open work (`01`). Fix: a separate icon, or reuse the pill only.
- **[Sev 2] Links don't look like links.** Assignment titles, repo names on My work and timeline lecture titles are links shown as plain ink (`09`, `11`, `01`). The lecture Links panel uses underlined teal with ↗ (`13b-lecture-ai8-desktop-top.png`). Fix: one link style, with ↗ for every external link.
- **[Sev 1] Orange is overloaded.** The CSS says orange marks only "now/next", but it's also used for the focus ring, the "What's required" bullets and the "Week 3" label (`13b`, `27`). Fix: use teal or ink bullets for "required".
- **[Sev 1] The "Course map" tab is highlighted on a lecture you opened from Today** (`13b`). This is acceptable given the breadcrumb, but it's surprising when you came from Today.
- ✅ Strengths: one checkbox component for steps and assignments, and one pill system for status.

### 5. Error prevention: score 2/5
- **[Sev 3] Unticked checkboxes are nearly invisible.** The border (`--line`) measures 1.39:1 on white and 1.27:1 on the page background in light mode, and 1.34:1 in dark (`28-dark-unticked-checks.png`). That fails WCAG 1.4.11 (3:1), so steps look like plain text. The "Upcoming" status ring uses the same color (1.27:1). Fix: a control-border token of about `#8a9c9e` in light and `#4f6a70` in dark.
- **[Sev 2] Phone targets are under 44px** (measured at 390px): step checkbox 32×32, goal picker 34×32 with 4px gaps, Copy 48×23, Log today 84×34, filter chips 32px tall, tabs 38px tall, inline links 19px tall. Fix: hit areas of at least 44px (padding or `::after`). Make the whole step header a tap target for its checkbox.
- **[Sev 2] The weekly goal changes with one unlabeled tap.** The "3 4 5 6 7" buttons sit right above the day dots (`01`), so a stray tap changes the target. Fix: put the picker behind "Edit goal", as Coursera does (see References).
- **[Sev 1] An early rating can add a false item to Review next** (see 3).

### 6. Recognition rather than recall: score 3/5
- **[Sev 2] On a phone, map rows hide date and code.** Each row shows only an icon, the title and an empty grey bar (`19-map-phone-crop.png`). Fix: keep a short date ("Tue 10"), and drop the empty bar instead.
- **[Sev 2] The status legend appears only on the Course map.** Open work and lecture rows use the same icons with no key (`01`). Fix: add tooltips or visible text on first use, or a shared legend popover.
- **[Sev 2] The goal picker has no visible label.** "Study days per week" exists only in `aria-label` (`01`). Fix: "Goal: 4 days/week · Edit".
- **[Sev 2] You can't find notes again.** No indicator shows which lectures have notes, and there's no notes index (`24`, `25`). Fix: a note icon on map rows and a "My notes" list on My work.
- **[Sev 1] The weekend timeline has no day label** (`04`). Fix: add a "Monday's schedule" caption above the timeline.
- ✅ Strengths: breadcrumbs, "Next: <step title>" on the Today card, and confidence shown on the map row.

### 7. Flexibility and efficiency of use: score 2/5
- **[Sev 3] There's no search or jump, and the map doesn't open at "now".** The current week is 814px or 1,254px down and FE-3 is 1,786px or 2,717px down, on desktop and phone (measured). Fix: a ⌘K / "/" palette for lectures and assignments. Auto-scroll the map to This week, or collapse past weeks with a per-week progress summary.
- **[Sev 2] Assignments aren't ordered by urgency.** They're sorted oldest-first with no due dates, so the current Week 3 is at the bottom (`09`). Fix: put the current week first or pin "Due this week", and add due dates to the data.
- **[Sev 2] Open work can't be ticked from Today** (`01`). Fix: reuse the assignment checkbox in the Open work rows.
- **[Sev 1] There are no keyboard shortcuts** (for example j/k for next/previous step, x to tick).
- ✅ Strengths: a deep link for every lecture (`#lecture-ai-8`), working Copy buttons, the "Continue guide" resume button, and a module filter on the map.

### 8. Aesthetic and minimalist design: score 3/5
- **[Sev 3] On a phone, lecture actions sit 8,000px down.** The side panel (ring, rating, notes, links) stacks below every step at y = 7,976 of 9,000 (measured, `14`). Fix: on screens of 640px or less, add a sticky bottom bar ("3/10 · Rate · Notes") that opens a sheet. Also move a compact progress line under the H1.
- **[Sev 3] The phone Today screen leads with the timeline instead of the action.** The vertical timeline is about 330px, the header 117px, and Open guide is below the fold (`34`). Fix: on a phone, collapse the timeline to a one-line "Now: AI-8 · Next: Work time 2:30" strip that taps to expand. Fit the header into one row (brand icon + tabs, with countdown and save state in a menu).
- **[Sev 2] The desktop lecture side panel cuts off.** It's 1,003px tall and sticky in a 900px window, so the Links panel runs to y = 1,079. 5 of 9 links can't be reached until the article ends (`36-lecture-scrolled-aside-cut-off.png`). Fix: make only the ring and rating sticky, or set `max-height: calc(100vh - 92px); overflow:auto`.
- **[Sev 2] Claude prompts don't wrap.** They're prose but use `white-space: pre` (`36`, `37`). Fix: use `pre-wrap` for "Claude prompt" blocks and keep `pre` for terminal and code.
- **[Sev 2] Step bodies are dense.** They're 7–9 line paragraphs mixing paths, menu trails and advice (`36`, step 6). Fix: split into "Do" bullets, put → menu paths on their own line, and show context in a muted "Why" line.
- **[Sev 2] The My work heatmap takes too much room and misses work.** 75 cells about 64px each fill the page while nearly empty. Weekend work is invisible: the three Oct 18 commits don't appear. On a phone, weeks 13–15 hide behind a horizontal scroll (`11`, `12-work-phone.png`). Fix: cells of about 14px (GitHub style), a weekend row or "+weekend" dot, and a fixed width.
- **[Sev 1] Every map row has an empty progress bar.** The track is 1.07:1 against the background and the bars are ragged-aligned (`18`). Fix: show a bar only when progress is above 0, and right-align it in a fixed column.
- **[Sev 1] The same number appears five ways:** "Week 3 of 15", "Day 10 of 67", "Class day 10 of 67", "15% elapsed" and "88 days to graduation" (`01`). Fix: keep one in the header and one in Progress.
- **[Sev 1] The progress ring shows a teal dot at 0/10** (`13b`, round cap on a zero-length dash). Fix: hide the arc when the value is 0.
- ✅ Strengths: a confident type hierarchy (Plex Condensed headings, tabular numbers), a restrained teal/orange palette, a timeline that does real work, a complete dark theme, and **0px horizontal overflow on every view at 390px** (all 17 base runs).

### 9. Help users recognize, diagnose, and recover from errors: score 3/5
- **[Sev 2] Failed loads have no recovery.** The message is plain, but there's no Retry button and no cached copy, and it tells a phone user to run `/sync` in Claude Code (`31-error-data-load-failed-phone.png`). Fix: cache the last good `hub-data.json` in localStorage, then show "Showing data from Sun 9:16pm · Retry".
- **[Sev 2] The save-failure state couldn't be checked locally.** The code shows "Not saving: reload the page" as 13px muted text in the header. I couldn't reproduce a failure in local mode, so this is unverified. Recommendation: a visible banner that keeps unsaved notes in localStorage.
- **[Sev 1] An unknown lecture link gives a plain dead-end message** with a link back to the map. That's fine.

### 10. Help and documentation: score 2/5
- **[Sev 2] There's no first-run orientation.** Nothing explains what the statuses mean, that `/sync` updates assignments, or where progress is saved. Fix: a dismissible "How this hub works" card on Today (3 bullets plus the status key).
- **[Sev 1] Review next mentions the "tutor agent" and `/teach`** without saying where to run them (`23`). Fix: add "in Claude Code, from the codeplatoon folder".
- ✅ Strengths: good inline micro-help: "Ticking a step, rating a lecture or writing notes logs the day for you", "1–2 puts it on your review list", and the prep-outline note.

## Accessibility & quality floor

| Check | Result | Evidence |
|---|---|---|
| Text contrast (light) | Muted text passes (4.95:1 on page background, 5.38 on white, 4.63 on surface-2). **Fails:** "Check with instructor" pill text `#9a6a00` on `#f8edcc` = **4.05:1**, which is 12px and not large text | computed |
| Text contrast (dark) | **Fails:** white text on pressed teal `#5ab6b2` = **2.39:1** (pressed rating, goal picker "4", ticked checkbox) | `29-dark-goal-picker.png`, computed |
| Non-text contrast (1.4.11) | **Fails:** checkbox borders 1.39:1 (light) and 1.34:1 (dark); "Upcoming" ring 1.27:1; meter and mini-bar tracks 1.07–1.16:1 | `28`, computed |
| Visible focus | ✅ 2px orange ring with offset (`27-focus-visible-step-check.png`). ❌ Focus is lost after any toggle (goes to `BODY`) | measured |
| Touch targets ≥ 44px at 390px | ❌ checkbox 32, goal 32, Copy 23, Log today 34, chips 32, tabs 38, inline links 19. ✅ Open guide 44, rating 51, pager 72 | measured |
| `prefers-reduced-motion` | ✅ A rule disables all transitions (in the CSS; not tested visually) | code |
| No horizontal scroll at 390px | ✅ 0px on all views (heatmap and code blocks scroll inside themselves) | shoot output |
| Line length | ✅ Step text 630px at 15px (about 70ch); summary capped at 66ch | measured |
| Semantics | ✅ Landmarks, `role="checkbox"` with `aria-checked`, `aria-pressed` on toggles, sr-only status text on the map. ⚠️ Heatmap is `role="img"` with no data alternative | code + run |

## Prioritized fix list

| Priority | Fix | Heuristics | Severity | Effort (S/M/L) |
|---|---|---|---|---|
| 1 | Phone lecture: sticky bottom bar (progress · Rate · Notes sheet) and a compact progress line under the H1 | 8, 7, 6 | 3 | M |
| 2 | Raise control contrast: checkbox and status-ring border token ≥ 3:1; dark-mode pressed text `#04201f`; darken the warn pill text to about `#7a5300` | 5, 4 | 3 | S |
| 3 | Keep focus on the toggled control after re-render (or patch the DOM in place) | 3 | 3 | S |
| 4 | Phone Today: one-line Now/Next strip instead of the 5-slot timeline; one-row header, so Open guide is above the fold | 8, 1 | 3 | M |
| 5 | ⌘K / "/" jump-to-lecture palette; map auto-scrolls to This week and collapses past weeks with per-week progress | 7, 6 | 3 | M |
| 6 | Honest status: neutral "Guide not started" for past lectures; remove the "Day 1" fallback chip | 2, 4 | 3 | S |
| 7 | Show "Synced <time>" from `generatedAt`; add after-class and lecture-complete states on Today | 1 | 3 | S |
| 8 | Claude prompts `white-space: pre-wrap` | 8 | 2 | S |
| 9 | Touch targets ≥ 44px on phone (checkboxes, Copy, chips, tabs, goal) | 5 | 2 | S |
| 10 | Desktop side panel: sticky only for ring + rating, or `max-height` + scroll | 8 | 2 | S |
| 11 | Consistent link style with ↗ on assignment and repo titles; tick Open work from Today; current week first on Assignments | 4, 7 | 2 | S |
| 12 | Rating: no clear on re-press; "Clear" link; disable before the lecture date; full labels | 3, 5, 2 | 2 | S |
| 13 | Notes: "Saved · 2 min ago", a note indicator on map rows, a My notes index | 1, 6 | 2 | M |
| 14 | Data-load error: cached last-good data + Retry; header chip shows the error state | 9, 1 | 2 | S |
| 15 | Phone map rows keep a short date; drop empty mini-bars | 6, 8 | 2 | S |
| 16 | Heatmap: GitHub-size cells, show weekend work, fits at 390px | 8 | 2 | M |
| 17 | Step bodies as "Do" bullets + "Why" line (content pass in `build_hub.py` data) | 8 | 2 | M |
| 18 | First-run "How this hub works" card + labelled goal ("Goal: 4 days/week · Edit") | 10, 6, 5 | 2 | S |
| 19 | Cosmetic: Markdown in work logs, "Work time" duplicate, 0/10 ring dot, one place for the day count, separate icon for "Check with instructor" | 2, 8, 4 | 1 | S |

## References

- [Uxcel: Home "Continue learning"](https://mobbin.com/screens/3f6070b2-4df4-4bca-b57c-03f4362fd147): one resume card showing progress % **and time left** ("6% · 7h left") with a single **Resume** button. Borrow the "time left" line for the Today card (`estMinutes` is already in the data) and the compact labelled streak row.
- [Coursera: Home with weekly goal tracker](https://mobbin.com/screens/18683325-d982-4756-b06e-4ed52c933b06): the goal is a sentence ("I'm committed to learning 3 days a week") with an **Edit my goal** link, not exposed number buttons. Borrow this for the Weekly goal panel (fixes the unlabeled 3–7 picker and the accidental taps).
- [Coursera: lesson page](https://mobbin.com/screens/a0f3ab22-1eb7-4f73-b0a9-c390a520ccf2): breadcrumb plus **Previous / Next at the top**, the syllabus rail with the current item highlighted, and one clear "Mark as completed" action. Borrow the top-right prev/next, and a short in-guide outline of the steps.
- [Optimal Workshop Academy: lesson with outline](https://mobbin.com/screens/5751af02-f5df-41ed-8daf-38f174e89bb9): checkmarks per lesson in the outline, the current lesson in a tinted block, and a persistent bottom **Next lesson** bar. Borrow the bottom bar idea for the phone lecture view (fix 1).
- [Whop: course progress + Notes tab](https://mobbin.com/screens/4d015c93-854e-42b3-a5a0-ac25fb45dc66): a progress card and a Notes tab right beside the content. Borrow "Notes" as a tab or sheet on phone instead of a panel 8,000px down.
- [Uxcel: Syllabus with levels](https://mobbin.com/screens/02294a41-5e3c-4db8-9234-14e08e8b3dff): per-level progress bar and %, "Expand all" or collapsed levels, and a **Start** marker on the current item. Borrow this for the Course map: collapse past weeks, put a progress bar on the week header (not on every row), and add a "You are here" marker.
- [Codecademy: Path curriculum](https://mobbin.com/screens/63e05256-8dd3-4758-9abd-bc84176be27d): small % rings per module, with assessments as their own rows and a clear action button. Borrow per-week rings, and give Assessments a "date not posted" row with an action.
- [Mintlify: command palette](https://mobbin.com/screens/7c7ad31f-9dfe-4be7-83d7-6002fe31d4d0): grouped results (Dashboard / Pages), a subtitle per result, ESC, and footer key hints. Borrow the structure for the ⌘K jump: groups for Lectures, Assignments and Work logs, with the code and date as subtitle.
- [Juicebox: command palette](https://mobbin.com/screens/84169c57-5cd6-4495-bb71-93d37266f4c4): a footer legend (↵ select, ↑↓ navigate, ⌘K toggle). Borrow it so the shortcut can be found on its own.
