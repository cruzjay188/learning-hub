# Eagle Learning Hub v2: design brief

**For:** the front-end engineer rebuilding `hub/index.html`
**Author:** ui-designer agent · Oct 18, 2026
**Inputs read:** `hub/index.html` (v1), `hub/hub-data.json`, `hub/guides/README.md`, `hub/README.md`, the v1 screenshots in `hub/design/screens-v1/` (01–26), and my own captures in `hub/design/screens-design/` (fake time Mon Oct 19, 11:15 ET).
**Constraints (unchanged):** one static HTML page, vanilla JS, no build step. Fonts from Google Fonts only. Works at 390px, light and dark. Brand stays: Code Platoon teal for progress, orange only for "now / next", IBM Plex family. Progress saves to the artifact database (`lectures/<id>`, `assignments/<id>`, `meta/goal`, `meta/activity`) with a localStorage fallback.

---

## 0. What v1 gets right, and where it breaks

v1 has a solid base: a calm palette, honest copy, real data, a status-icon vocabulary and an accessible save indicator. Keep all of that. The problems come from structure, not looks.

| # | What I saw | Where | Why it matters |
|---|---|---|---|
| 1 | Today's "next" card points at a **lecture**, not an **action**. To do anything he has to open the guide, scroll and find step 1. | `today-1360-light.png` | The page tracks his work but doesn't move him forward. |
| 2 | Every past lecture shows as a dashed amber "Not started" (weeks 1–2: 9 lectures). He went to those classes. He just hasn't ticked anything in a hub that didn't exist yet. | `map-1360-light.png`, `07-map-desktop.png` | This reads as guilt, and it's false. The map should show what to do, not blame him. |
| 3 | The lecture page is **5,600px on desktop and 9,000px on a phone**. All 10 steps are open at once, long Claude prompts are cut off on the right of their code blocks, and on a phone the rating and notes sit at the very bottom. | `lecture-ai-8-1360-dark.png`, `lecture-ai-8-390-light.png` | The core learning surface is the hardest one to use. |
| 4 | Three progress meters all read 0% (steps 0%, lectures 0/10, elapsed 15%), and the elapsed bar is styled like progress. | Today, right rail | Three numbers that don't change and don't lead to any action. |
| 5 | The review loop is a dead end. Rating something "Shaky" adds it to a list, and then the page just says "ask the tutor agent". | `23-task6-today-review-list.png` | This is the most valuable learning feature and it has no next step. |
| 6 | The weekly goal offers 3–7 days and Mon–Sun dots, and the streak breaks on weekends, but class runs Mon–Fri. | Weekly goal panel | The goal punishes him for the schedule he's on. |
| 7 | The map shows 58 rows with "prep outline" repeated 45 times, a two-line wall of module filter chips, and a legend floating away from the rows it explains. | `map-1360-light.png`, `08-map-phone.png` | Hard to scan, and the filters are the wrong ones. Nobody filters by module. You filter by "what needs me". |
| 8 | On Assignments, the checkbox *and* a status pill both say "Done". Knowledge-check rows have empty checkboxes next to a "Team quiz" pill, which makes them look unfinished. | `assignments-1360-light.png` | Two signals for one fact, and they disagree. |
| 9 | My work: the heatmap cells are 64px squares, ~95% of them empty future days. | `work-1360-light.png` | A large block of nothing. |
| 10 | On a phone the top bar takes three rows (brand, tabs, meta) before any content. | `today-390-dark.png` | Content starts about 140px down. |

---

## 1. Design principles

1. **One next action, always one click away.** Every view answers "what do I do now?" with a single orange-marked action that names a *step*, not a page. Everything else is quieter.
2. **Finish a step where you see it.** Tick, copy and rate inline. Today can complete the current step without opening the guide. The guide can rate without scrolling to the bottom.
3. **Close the learning loop.** Do the step → check yourself (key terms) → rate confidence → it comes back for review on a schedule. The hub schedules review, not just storage.
4. **Honest, not guilty.** Never shows "missed" for something he attended. Unticked past work is "Not checked off", in neutral grey. Orange means only "now / next", never "late".
5. **A ledger, not a dashboard.** Dense, aligned rows, tabular numbers and hairline dividers, like Linear and GitHub. No tile grids, no gradient washes, no big numbers that sit there doing nothing.

---

## 2. Information architecture

### Navigation (4 destinations, down from 4 tabs + an orphan lecture view)

| Tab | Contains | Replaces |
|---|---|---|
| **Today** | Up next (step-level) · Day timeline · Review due · Prep for tomorrow · Open assignments (top 3) · Week goal and streak | v1 Today |
| **Course** | 15-week ledger with per-week progress · filters · catch-up · links to each **Lecture** page | v1 Course map (+ lecture as child) |
| **Review** *(new)* | Confidence buckets (Weak / Medium / Strong) · "Due today" queue · recall cards from key terms · "Quiz me" tutor prompt | v1 "Review next" panel |
| **Work** | Segmented control: **Assignments** · **Activity** (heatmap, commits, work logs, repos) | v1 Assignments + My work |

The Lecture page is a child of Course. Breadcrumb: `Course / Week 3 / AI-8`.

- **Desktop (≥ 900px):** a sticky 56px top bar with the brand mark, the 4 tabs, a ⌘K search field and the save status.
- **Phone (< 900px):** a slim 48px top bar (page title + search icon + save dot) and a **bottom tab bar** (4 items, 56px + safe area). The Review tab carries a count badge when lectures are due, as Babbel's iOS Review tab does ([Babbel learning plan](https://mobbin.com/screens/fdaa7267-a4f1-4088-a90a-d1a9611fa63a)).
- **Command palette (⌘K / `/`):** search across all 58 lectures, 332 key terms, 18 assignments and a few actions. See §3.6.

### Priority on each view (top to bottom)

- **Today:** Up next → Timeline → Review due (if any) → Prep for tomorrow → Open assignments → (rail) Week goal → Course position.
- **Course:** Header with course position → filter bar → catch-up banner (first run only) → weeks (current one expanded).
- **Lecture:** Header + goal → What's required → Steps (focus mode) → Check yourself (key terms) → Rate + notes (sticky rail on desktop, sheet on phone) → Links → Prev / next.
- **Review:** Due today → Weak → Medium → Strong (collapsed) → Unrated taught lectures.
- **Work:** Assignments grouped by status → Activity.

---

## 3. Surfaces

### 3.1 Today

**References**
- [Uxcel: Continue learning](https://mobbin.com/screens/0eaa635e-b214-4054-8db8-d7f22146ad80). **Borrow:** a resume card that names the *current lesson* plus a small bar and "7h left". **Skip:** the illustration and the upsell column.
- [Graphite: Get started](https://mobbin.com/screens/d5e25ee0-a30a-4bbe-bc78-e2fb213e811d). **Borrow:** the current step shown *with its command inline* and a copy button, so he can act without opening the guide.
- [Babbel: Today with "Time for a quick review"](https://mobbin.com/screens/5c06bda9-0458-437b-a68d-89ce396237e7). **Borrow:** a small, separate review prompt above the main lesson, so review is part of the day and not a different place.
- [Preply: Before your lesson checklist](https://mobbin.com/screens/3af9d328-5c6d-447f-b0ef-ede219101e55). **Borrow:** a prep checklist attached to the next scheduled class. That's exactly what the 45 outline guides are for.
- [Rise: day view with now-line](https://mobbin.com/screens/a17536d0-3e43-45ca-8784-b4541f4b3057) and [Clockwise](https://mobbin.com/screens/b88739ff-b05e-4a28-81dc-900ea848c736). **Borrow:** time-proportional blocks and a hairline "now" marker labelled with the time. **Skip:** the full hour grid.
- [Coursera: weekly goal tracker](https://mobbin.com/screens/5cb6eee8-7490-4661-a3f1-69bf3483825e). **Borrow:** the goal as a compact strip of day circles beside "continue learning", not its own big panel.

**Desktop wireframe (1360)**
```
┌ ▣ Eagle Learning Hub   Today  Course  Review•2  Work        [⌕ Search  ⌘K]   ● Saved ┐
├──────────────────────────────────────────────────────────────────────────────────────┤
│ Monday, October 19                                     │ THIS WEEK            2 of 4 │
│ Week 3 · Day 10 of 67 · Beyond Building, SE Fundament. │ ✓  ○  ○  ○  ○   · ·         │
│                                                        │ M  T  W  T  F   S S         │
│ 9:30   10:00            ┊11:15        2:30      5:30 6 │ 3-week streak · goal: 4     │
│ ▕Stand▏▕ AI-8 Authentication ┊ (now)  ▏▕ Work time ▏▕TM▕SD│ [Change goal]              │
│  ███████████████████████┊░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │─────────────────────────────│
│                                                        │ COURSE                       │
│ ┃ UP NEXT · AI-8 Authentication · step 2 of 10         │ ▕██░░░░░░░░░░░▏ 4 of 116 steps│
│ ┃ Restructure Myflix into front-end/ + supabase/       │ 13 guides ready · 45 outlines │
│ ┃ Commit first so you can roll back.                   │ Graduation Jan 15 · 88 days  │
│ ┃ ┌ Terminal ────────────────────────────── [Copy] ┐   │                             │
│ ┃ │ git add -A && git commit -m "Before full-stack"│   │                             │
│ ┃ └────────────────────────────────────────────────┘   │                             │
│ ┃ Done when: The root has front-end/, supabase/ …      │                             │
│ ┃ [✓ Mark step done]   Open guide →        ~5 hrs left │                             │
│                                                        │                             │
│ REVIEW DUE · 2                         Open Review →   │                             │
│  ◔ AI-6 Databases & Supabase   Shaky · rated 3 days ago  [Review]                    │
│  ◔ AI-5 Single Page Apps       Getting it · 1 week ago   [Review]                    │
│                                                        │                             │
│ PREP FOR TOMORROW · AI-9 3rd Party APIs · Tue 10am     │                             │
│  ☐ Skim the TMDB API docs ……………………………………… 15 min     │                             │
│  ☐ Get a TMDB API key (keep it in .env.local) … 10 min │                             │
│                                                        │                             │
│ OPEN ASSIGNMENTS                          All 14 →     │                             │
│  ◐ agentic-netflix-clone III   In progress   AI-7      │                             │
│  ○ agentic-netflix-clone IV    To do · Mon   AI-8      │                             │
│  ◌ Knowledge-Check-6           Ask instructor AI-3     │                             │
└────────────────────────────────────────────────────────┴─────────────────────────────┘
```
(The capitalised section labels in the wireframe only mark regions. In the build, section headings are sentence case, Plex Sans Condensed 600, 20px. See §5.)

**Phone wireframe (390)**
```
┌ Today                     ⌕   ● ┐
│ Mon, Oct 19 · Week 3 · Day 10   │
│ ● 10:00 AI-8 Authentication     │  ← one "now" row (orange dot), tap to expand the day
│   next: 2:30 Work time          │
│ ─────────────────────────────── │
│ ┃ UP NEXT · step 2 of 10        │
│ ┃ Restructure Myflix into       │
│ ┃ front-end/ + supabase/        │
│ ┃ ┌ Terminal ─────── [Copy] ┐   │
│ ┃ │ git add -A && git commit│   │  ← wraps, never scrolls sideways
│ ┃ │ -m "Before full-stack"  │   │
│ ┃ └─────────────────────────┘   │
│ ┃ [✓ Mark done]  [Open guide]   │  ← 44px tall each
│ Review due · 2            ›     │
│ Prep for tomorrow · 2     ›     │
│ Open assignments · 7      ›     │
│ This week  ✓○○○○  2 of 4        │
├─────────────────────────────────┤
│ ◉Today  ○Course  ○Review²  ○Work│  ← bottom bar
└─────────────────────────────────┘
```

**Components**
- **Day timeline (desktop):** one 8px track from 9:30 to 18:30 ET, split into blocks sized by duration (from `rhythm` plus the day's items). Past blocks are filled teal, the current block gets a 2px orange outline, future blocks are `--surface-2`. The "now" marker is a 2px orange vertical line with a mono time label above it (`11:15`). Labels sit under each block and truncate with an ellipsis. Hovering a block shows the full title in a tooltip. A lecture block is a link to that lecture.
- **Day timeline (phone):** collapsed to a single "now / next" row (orange dot plus current item, and a muted "next:" line). Tapping it expands a vertical list of the 5 slots with the now-line drawn *between* rows.
- **Up next card:** the only card on the page with an orange 3px left rule. It contains the eyebrow (`Up next · AI-8 · step 2 of 10`), the step title (Condensed 600, 24px), `detail` clamped to 2 lines, a code block if the step has one, the `doneWhen` line, and actions: **Mark step done** (primary teal), **Open guide** (text link), and remaining time (`estMinutes` × share of steps left).
- **Choosing "up next"** (replaces v1's `upNextLecture`), in order: (1) the first unticked step of today's lecture, if it's a class day and before 18:30; (2) the most recently *touched* unfinished full guide (by latest `updatedAt`); (3) the earliest full guide not checked off from the last 5 class days; (4) the first prep step for the next class day. One step, one card.
- **Review due:** up to 3 rows. Hidden completely when nothing is due. See §3.4 for the schedule.
- **Prep for tomorrow:** the next class day's lecture, with its `steps` (outline prep steps) as tickable rows showing minutes. Hidden after all are ticked, replaced by one line: "Prep done for AI-9."
- **Open assignments:** the top 3 by priority (In progress, then To do due this week or earlier, then Ask instructor), plus an "All N →" link to Work.
- **Rail: This week:** see §3.5. **Rail: Course:** one teal bar for course-wide steps done, with two lines of muted text under it. No percentage number when the value is 0 (show "Not started yet" instead).

**States**
| State | Behavior |
|---|---|
| Class day, in session | Timeline is live and the now-line moves every 60s (no animation, just repositioned). |
| Before 9:30 / after 18:30 | Timeline shows the day with no now-line. Eyebrow: "Class starts at 9:30" / "Class is over for today". |
| Weekend / no class | Timeline replaced by one line: "No class today. Next class: Monday, Oct 19 · AI-8 Authentication." Up next uses rules (2)–(4). |
| All caught up | Up next card: "You're caught up. Next: prep for AI-9 (2 steps, 25 min)." The prep checklist becomes the main action. |
| First run (nothing ticked, 2+ past lectures) | A catch-up banner above Up next. See §3.7. |
| Loading | Skeleton. See §3.7. |
| Step marked done from Today | The check fills (160ms), the card content cross-fades to the next step (200ms), and a polite live region says "Step 2 done. Next: Paste the restructure prompt." |

---

### 3.2 Course (map)

**References**
- [Codecademy: Path curriculum](https://mobbin.com/screens/63e05256-8dd3-4758-9abd-bc84176be27d). **Borrow:** a tiny progress ring per lesson and per section header (8%, 33%…), so progress lives *inside* the list instead of in a separate panel.
- [Magnific: course outline](https://mobbin.com/screens/4b0d7119-a2fc-4ddc-8291-b3cacf949237). **Borrow:** numbered sections, check-circles, the current row highlighted with an inline mini-bar, and durations right-aligned in a mono column.
- [Uxcel: syllabus with level progress](https://mobbin.com/screens/02294a41-5e3c-4db8-9234-14e08e8b3dff) and [Turo: section counts (0/2)](https://mobbin.com/screens/add69f6f-6e9a-419f-82df-729e930baa86). **Borrow:** collapsible sections that show an `n/m` count in the header while collapsed, plus "Expand all".

**Desktop wireframe**
```
Course                                                    Day 10 of 67 · Graduation Fri Jan 15
▕██████▏░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  ← 67 ticks, one per class day; today = orange tick
 W1   W2   W3 …                                                                  W15

[All] [This week] [Needs review 2] [Not checked off 9]     Module ▾      Expand all
──────────────────────────────────────────────────────────────────────────────────────────
▸ Week 1 · Oct 5–9    Agents as Tools                         ◔ 0 of 5 checked off   0/38 steps
▸ Week 2 · Oct 12–16  Building Applications                   ◔ 0 of 4               0/37 steps
▾ Week 3 · Oct 19–23  Beyond Building · SE Fundamentals       This week
   ● AI-8   Authentication                Mon 19  10am   ▕▏0/10   —           ›
   ○ AI-9   3rd Party APIs                Tue 20         ▕▏0/9    —           ›
   ○ AI-11  Stripe                        Wed 21         ▕▏0/8                ›
   ○ AI-10  DevOps                        Thu 22         ▕▏0/9                ›
   ┄ —      Git + GitHub         outline  Fri 23         prep 3                ›
▸ Week 4 · Oct 26–30  SE Fundamentals · OOP · DS              6 lectures · 6 outlines
 …
▸ Week 12 · Dec 21–25 DS                       ⚑ Dec 22 Personal project due · Dec 23 Presentations
```

**Phone wireframe**
```
┌ Course                    ⌕  ● ┐
│ Day 10 of 67 · 88 days left    │
│ ▕██▏░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ [This week][Needs review][All]→│  ← horizontal scroll chips, one row
│ ▾ Week 3 · Oct 19–23           │
│   ● Authentication       0/10 ›│  ← code shown under the title in 12px mono
│     AI-8 · Mon 10am            │
│   ○ 3rd Party APIs        0/9 ›│
│ ▸ Week 4 · 6 lectures          │
└────────────────────────────────┘
```

**Components and rules**
- **Course ruler:** 67 thin ticks (2px wide, 12px tall, 1px gaps) in one row. Ticks for days that have passed are `--ink-2` at 40% opacity, today's tick is orange, no-class days are hollow. Week labels sit under every week's first tick. This *replaces* v1's "Bootcamp elapsed" meter and the countdown in the top bar. It shows time passing without dressing it up as progress.
- **Week header row (44px):** a disclosure chevron, `Week 3 · Oct 19–23` (Condensed 600, 17px), module names (muted, ellipsis), then on the right a 14px progress ring plus `0 of 5 checked off` and a mono `0/38 steps`. The current week is expanded by default and labelled "This week" in orange-ink text (no pill). Past weeks and future weeks start collapsed.
- **Lecture row (40px desktop / 56px phone, 2 lines):** status icon (20px), code (mono 12px, fixed 56px column), title, date, a progress mini-bar with an `n/m` count, and a confidence chip (the 3-dash strength meter from §3.4) when rated.
- **Status vocabulary** (replaces v1's 5 icons):
  - `done`: solid teal circle with a check
  - `progress`: teal half circle
  - `now`: orange ring with an orange dot (today's lecture only)
  - `not-checked-off`: grey ring at `--line` (past and unticked). **No amber, no dashes.**
  - `upcoming`: grey ring at `--line` with the title in `--ink-2`
  - `outline`: dashed ring at `--muted`, and the row reads "prep N" instead of a step bar
- **Filters:** `All`, `This week`, `Needs review (n)`, `Not checked off (n)`, plus a single `Module ▾` select. The legend is gone. Every icon carries a `title` and an sr-only label, and a "?" popover next to the filters explains the icons once.
- **Milestones** (deadlines, presentations, graduation, no class) appear on the week header line with a small flag icon, not as a separate row of pills.

**States:** if a filter matches nothing, show "Nothing needs review. Rate a lecture after class and it shows up here." with a button that clears the filter. Hover: row background `--surface-2`, and the chevron slides 2px right (120ms). Focus: a 2px focus ring around the whole row.

---

### 3.3 Lecture guide

**References**
- [Graphite: one-step-at-a-time setup](https://mobbin.com/screens/d5e25ee0-a30a-4bbe-bc78-e2fb213e811d). **Borrow (the key move):** done steps collapse to a single struck-through line with a check, the current step opens with its code, and future steps show title and summary only, at reduced contrast.
- [Clerk: vertical stepper with code](https://mobbin.com/screens/15f6fc1f-bf15-42fe-9791-68a3f379bd30). **Borrow:** a numbered rail joining the steps, a code block with a filename/label header, and a "waiting" line that maps to `doneWhen`.
- [Sentry: Verify section](https://mobbin.com/screens/68401530-20c8-4f67-9ff3-e29136989fb2). **Borrow:** a clear "Verify" moment after the action. For us, `doneWhen` gets its own labelled line with a check icon.
- [Turo: sticky lesson progress bar](https://mobbin.com/screens/c1cc661e-ec5c-4d15-a781-d388cb329940) and [Unity: Mark step as complete](https://mobbin.com/screens/41483099-a471-4552-9c6a-056874835b21). **Borrow:** a sticky bottom bar with progress and the primary "next" action, so it's always within reach on a long page.
- [Uxcel: lesson with sticky right outline](https://mobbin.com/screens/790534e1-7335-4b7b-8ab2-e16f62e131d6). **Borrow:** a right rail that stays in view with the outline and a single CTA.
- [Unity: Tutorial complete](https://mobbin.com/screens/fe650398-23a4-4ff8-b76c-2aead134d25c) and [Lyssna: 1–5 scale with end labels](https://mobbin.com/screens/e3621cbc-f94f-432f-8914-827b62838eb8). **Borrow:** the rating asked *at the moment of completion*, inline, with "Next up" right below it.
- [Mistral: "copied to clipboard" toast](https://mobbin.com/screens/fd7807e2-5bb5-479e-ba9f-f4994f63ca0c). **Borrow:** quiet copy confirmation.

**Desktop wireframe**
```
Course / Week 3 / AI-8                                                    ‹ AI-7   AI-9 ›
┌────────────────────────────────────────────────────────┬─────────────────────────────┐
│ AI-8 · Mon Oct 19 · 10am ET · Today · about 5 hrs      │ ▕██░░░░░░░░▏ 1 of 10 steps  │
│ Authentication                                          │                             │
│ How logins work (authN = who you are, authZ = what you │ 1 ✓ Do Part I: peer quiz    │
│ may do)… [more]                                         │ 2 ● Restructure Myflix      │
│ ┌ Goal ───────────────────────────────────────────┐    │ 3   Paste the prompt        │
│ │ Replace Myflix's anonymous sign-in with real …  │    │ 4   Create two files        │
│ └─────────────────────────────────────────────────┘    │ …                           │
│ What's required  (5)                         [Show ▾]  │ ─────────────────────────── │
│                                                         │ How well do you get it?     │
│ Steps                                       1 of 10    │ [1][2][3][4][5]             │
│ ┆ ✓ 1  Do Part I: peer quiz, then FreeCodeCamp  ↺     │ Lost ············ Could teach│
│ ┆                                                       │ ─────────────────────────── │
│ ● 2  Restructure Myflix into front-end/ + supabase/    │ My notes          Saved     │
│ ┆    Partner up… detail text, max 68ch                 │ ┌─────────────────────────┐ │
│ ┆    ┌ Terminal ───────────────────────── [Copy] ┐     │ │                         │ │
│ ┆    │ git add -A && git commit -m "Before …"    │     │ └─────────────────────────┘ │
│ ┆    └───────────────────────────────────────────┘     │ [Copy "Quiz me" prompt]     │
│ ┆    ✓ Done when  The root has front-end/, …           │ ─────────────────────────── │
│ ┆    [✓ Mark done and continue]   Skip for now         │ Links                        │
│ ○ 3  Paste the restructure prompt                      │ To do · netflix-clone IV ↗  │
│ ┆    Instructor prompt from the Full-Stack lecture…    │ Lecture site ↗              │
│ ○ 4  Create the two files the prompts read             │                             │
│ …                                                       │                             │
│ Check yourself (9 key terms)                            │                             │
│ ┌ JWT ─────────────── [Show meaning] ┐ ┌ RLS ──── … ┐  │                             │
│ ‹ Previous: Full Stack Applications     Next: 3rd Party APIs ›                         │
└────────────────────────────────────────────────────────┴─────────────────────────────┘
```

**Phone wireframe**
```
┌ ‹ Course   AI-8           ⌕  ● ┐
│ Authentication                 │
│ Mon Oct 19 · 10am · ~5 hrs     │
│ Goal: Replace Myflix's …  more │
│ What's required (5)          ▸ │
│ ✓ 1 Do Part I: peer quiz     ↺ │
│ ● 2 Restructure Myflix into    │
│     front-end/ + supabase/     │
│     detail…                    │
│     ┌ Terminal ──── [Copy] ┐   │
│     │ git add -A && git    │   │
│     │ commit -m "Before …" │   │
│     └──────────────────────┘   │
│     ✓ Done when The root has…  │
│ ○ 3 Paste the restructure …    │
│ ○ 4 Create the two files …     │
├────────────────────────────────┤
│ ▕██░░░░▏1/10  [Rate] [Notes]  [✓ Done]│ ← sticky bar above the tab bar
├────────────────────────────────┤
│ ◉Today ○Course ○Review ○Work   │
└────────────────────────────────┘
```

**Components**
- **Step rail:** a 1px `--line` vertical line through 24px step markers. Marker states: done (teal fill + check), current (2px orange ring + mono number), future (`--line` ring + mono number in `--muted`).
- **Focus mode (default on):** only the *current* step (the first unticked one) is expanded. Done steps collapse to one 40px line: check, title struck through in `--muted`, and an "↺ Undo" icon button that appears on hover/focus. Future steps show the title plus the first line of `detail` (1-line clamp). Clicking any step header expands it; others stay as they are (no accordion snapping). An **"Expand all"** text button next to the "Steps" heading turns focus mode off, and the choice is remembered in localStorage (`hub:guide-expanded`).
- **Code block:**
  - Header: label (`Terminal`, `Claude prompt`, `SQL`, `File`) in 12px mono `#8fb1ae`, and a Copy button (icon + "Copy", 32px tall, 44px hit area via padding).
  - Body: `Claude prompt` blocks use `white-space: pre-wrap` so long instructor prompts wrap and are fully readable. `Terminal` / `SQL` keep `pre` with horizontal scroll and a right-edge fade mask.
  - Over 12 lines: clamp to 280px with a bottom fade and a "Show all 34 lines" button. Copy always copies the full text.
  - Copied: the button label becomes "Copied" with a check for 1.6s, plus a 2s toast "Copied: Terminal command" on phone, where the button can be off-screen after scroll.
- **Done when:** its own line with a check-circle outline icon, `Done when` in teal-strong 600, and the text in `--ink-2`. It sits directly above the action row.
- **Step action row:** **Mark done and continue** (primary; ticks, collapses this step, opens the next one and scrolls it to 96px from the top) and **Skip for now** (text button; opens the next step without ticking).
- **Desktop right rail (sticky, 320px):** a mini outline of the steps (click to jump), the confidence control, notes, "Quiz me" and links. It scrolls on its own if it's taller than the viewport.
- **Phone sticky bar (56px):** a progress bar with `1/10`, a **Rate** button (opens a bottom sheet with the 1–5 control), a **Notes** button (opens a full-height sheet with the textarea), and **✓ Done** (marks the current step). Sheets use `<dialog>` with a focus trap and Esc / swipe-down to close.
- **Confidence control:** a 5-segment control, 44px tall, with the numbers 1–5 inside and end labels under it ("Lost" left, "Could teach it" right). The selected segment is filled teal, and the full label shows under the control ("Shaky: it comes back for review in 2 days"). Changing it sets `confidence` and `ratedAt`.
- **Finished-lecture moment:** when the last step is ticked, an inline panel replaces the step list's last line (no modal, no confetti): "AI-8 done. How well do you get it?" with the confidence control, then "Next up: AI-9 3rd Party APIs · prep 2 steps →". If it's already rated, show the rating and "Change".
- **Check yourself (key terms):** `concepts` shown as recall cards, 2 columns on desktop and 1 on phone. Front: the term. A **Show meaning** button reveals the meaning, then **Got it** / **Not yet**. Each lecture keeps a count of "Not yet" answers and suggests "3 of 9 terms marked Not yet. Rate this lecture Shaky?" This is active recall, built from data we already have (332 terms).
- **Quiz me:** copies a tutor prompt such as `Use the tutor agent to quiz me on AI-8 Authentication. I rated it Shaky. Terms I missed: JWT, RLS, auth.uid(). My notes: …`. The hub can't run Claude, but it can hand Claude the right question.
- **Outline lectures:** the same layout. The "Steps" heading becomes "Prep (3 steps · 25 min)". A dashed note under the header reads: "Prep outline. The full step-by-step arrives after the lecture is published (`/sync`)." Ticking still works.

**States:** loading (skeleton for the header plus 4 step rows); lecture id not found ("That lecture isn't on the schedule." plus "Go to Course"); no guide; all done (described above); a save error on tick (the check reverts, and an inline error says "Couldn't save. Try again." with a retry button).

---

### 3.4 Review (new)

**References**
- [Babbel: Review with Weak / Medium / Strong](https://mobbin.com/screens/3ae95e51-e6a5-462e-80f6-03254a6c6a59). **Borrow:** strength buckets as segmented filters with a tiny 3-dash meter, and a single "Review these" CTA.
- [Babbel: result with "Correct my mistakes (14)"](https://mobbin.com/screens/bd0a42ab-2f2f-43c4-a83c-c9138522bc5c). **Borrow:** a secondary action that targets *only the misses*.
- [Babbel iOS: "Time to review" inline in the plan](https://mobbin.com/screens/fdaa7267-a4f1-4088-a90a-d1a9611fa63a). **Borrow:** review entries placed between lessons, plus a badge count on the tab.

**Schedule** (simple spaced repetition, computed client-side): `dueAt = (reviewedAt || ratedAt) + interval[confidence]`, where interval = {1: next class day, 2: 2 days, 3: 4 days, 4: 10 days, 5: never}. Doing a review (opening recall cards and re-rating) sets `reviewedAt`. Taught full-guide lectures with no rating show in an "Unrated" group with one action, "Rate".

**Wireframe (desktop; phone is the same in one column)**
```
Review                                                       2 due today
[Due 2] [Weak 1] [Medium 1] [Strong 0] [Unrated 7]
───────────────────────────────────────────────────────────────────────
AI-6  Databases & Supabase    ▬ ▭ ▭ Shaky       rated Oct 16   [Start review]
      9 key terms · 3 marked Not yet · notes: "RLS still fuzzy…"
AI-5  Single Page Apps        ▬ ▬ ▭ Getting it  rated Oct 12   [Start review]

Start review → the recall cards for that lecture, one at a time:
┌───────────────────────────────────────────┐
│ AI-6 · term 3 of 9                         │
│ Row Level Security (RLS)                   │
│            [Show meaning]                  │
│ ───────────────────────────────────────── │
│ Database rules that filter every request…  │
│ [Not yet]                       [Got it]   │
└───────────────────────────────────────────┘
End: "7 of 9. How well do you get AI-6 now?" [1–5]  → sets reviewedAt
     [Copy "Quiz me" prompt]   [Open guide]
```

**Strength meter:** 3 dashes, 12×3px, 3px gap. Weak (1–2) = 1 dash `--warn`; Medium (3) = 2 dashes `--teal`; Strong (4–5) = 3 dashes `--teal`. Always shown with a text label next to it, so meaning never depends on colour alone.

**Empty states:** No ratings yet: "Rate a lecture after class. Anything you rate 1–3 comes back here when it's time to review." with a button to "Rate AI-8" (today's lecture). Nothing due: "Nothing due today. Next review: AI-5 on Thu Oct 22."

---

### 3.5 Weekly goal and streak (Today rail, and the top of Work › Activity)

**References**
- [Codecademy: Set a weekly target](https://mobbin.com/screens/00670798-8759-43b9-9eff-9122aaac87af) and [Codecademy: weekly streak](https://mobbin.com/screens/4d1e0a51-4a2d-4b4f-8a1b-cff0eab3e41c). **Borrow:** a target of *days per week* and a **weekly** streak ("3 weeks in a row"), so a quiet Saturday never breaks anything.
- [Duolingo: streak with weekday dots](https://mobbin.com/screens/7aa10b76-548e-4f22-b5b8-e65e7abba53b). **Borrow:** a Mon–Fri row of circles with today marked, plus one line saying what's at stake. **Skip:** the flame and the threat-style copy.
- [Babbel: streak calendar with freezes](https://mobbin.com/screens/ad647d91-f092-4ed4-a039-85a60844534a) and [Todoist: goal + longest streak](https://mobbin.com/screens/a32be022-0e99-4fe7-b216-12162fbd5828). **Borrow:** "longest streak" as a quiet second line.

**Rules**
- The goal is **study days per week, 1–7, default 4**, chosen with a stepper (`−  4 days  +`), not five buttons. Mon–Fri circles are 24px. Sat/Sun are 16px dots that count toward the goal when used but never look "missed".
- **Streak = consecutive weeks where the goal was met** (the current week counts once it's met). Show it as text: "3-week streak · longest 3". Before the goal is met this week: "2 more days this week keeps your 3-week streak."
- A day counts as studied automatically when he ticks a step, rates, writes notes or does a review. The manual "Log today" toggle becomes a small text button, "I studied off the hub", shown only if today isn't logged yet.
- **No flame icon and no emoji.** The streak icon is an inline SVG calendar with a check.

---

### 3.6 Command palette

**References**
- [Vapi: Actions / Recent / All pages with key hints](https://mobbin.com/screens/593d7acd-2e16-4365-bcd6-02ce52f48f3b). **Borrow:** grouped sections and a footer of key hints.
- [Mintlify: results with breadcrumb + content snippet](https://mobbin.com/screens/7c7ad31f-9dfe-4be7-83d7-6002fe31d4d0). **Borrow:** a muted breadcrumb line under each result and a snippet for term matches.
- [Magnific: quick actions with shortcuts](https://mobbin.com/screens/e22e26e2-f813-4f1e-beda-43c9ecf26419). **Borrow:** shortcut chips aligned right.

**Spec:** `<dialog>` 640px wide (full width minus 16px on phone, pinned 12px from the top), 48px input, results list max-height 420px. Groups: **Actions** (Go to today's lecture, Continue: <step>, Copy next command, Open Review, Toggle theme), **Lectures** (code + title + `Week 3 · Mon Oct 19`), **Key terms** (term + lecture code, with the meaning as the snippet), **Assignments**. Matching is case-insensitive substring on code, title and term, ranked by prefix match first. Empty query shows Actions plus "Recent" (the last 5 lectures opened, from localStorage). No results: "No match for 'jwtt'. Try a lecture code like AI-8." Footer: `↑↓ to move · ↵ to open · esc to close`. Open with ⌘K / Ctrl-K or `/`, or the search field / icon in the top bar.

---

### 3.7 Work (Assignments + Activity)

**References**
- [Linear: issues grouped by status](https://mobbin.com/screens/be6c4ee4-aa93-42b4-89b3-dcfc8386f022) and [Linear: Done group at the bottom](https://mobbin.com/screens/94bb4d3b-a8e3-41e8-b8f1-b82d1f904b03). **Borrow:** status groups with tinted 36px header rows ("In progress 2"), compact 40px rows, status icon at the left, meta on the right, and Done collapsed last.
- [Cursor: compact activity heatmap](https://mobbin.com/screens/5e0de5f5-a660-4a26-b8fd-ec6cdda7a002). **Borrow:** small 12px cells, month/week labels and a "Fewer ▢▢▢ More" legend.

**Assignments wireframe**
```
Work                        [Assignments | Activity]          4 of 18 done
▾ In progress  2
  ◐  agentic-netflix-clone III — full stack merge   needs front-end/ + supabase/   AI-7  Wk 2  ↗
  ◐  agentic-netflix-clone I — SPA                  no Home page yet               AI-5  Wk 2  ↗
▾ To do  2
  ○  agentic-netflix-clone IV — Auth                 due with AI-8 (Mon)           AI-8  Wk 3  ↗
▾ Ask instructor  3
  ◌  Knowledge-Check-6 — More out of Claude Code    plan mode, @ refs …            AI-3  Wk 2  ↗
▾ Team quizzes  6                                   (done in class as a team; no box to tick)
▸ Done  4
Assessments
  ○  Group Project · covers everything · date not posted yet
```
- **One status signal per row.** The left status icon is the button: clicking it opens a 4-option menu (To do, In progress, Ask instructor, Done) that writes `assignments/<id>.status`. The right-side pill is removed. The `local` path moves into a hover/focus tooltip and a "Copy path" item in the row's `⋯` menu.
- Team quizzes get their own group with a neutral "Team quiz" icon and no checkbox, which fixes the "looks undone" problem.
- **Data note:** v1 stores only `{done}`. v2 stores `{status, updatedAt}` and still reads `done` (`done: true` → `status: "done"`).

**Activity**
- Heatmap: 15 columns (weeks) × 5 rows (Mon–Fri), 12px cells with a 3px gap and a 2px radius. Future cells are a 1px `--line` outline with no fill. Today has a 1.5px orange outline. Levels 0–3 as in v1. Legend: "Fewer ▢▢▢▢ More · ▨ No class".
- Below it: **Work logs** (title, date, a 2-line summary clamp, "Copy Obsidian path") on the left and **Recent commits** (date, repo chip, message; 10 shown, then "Show all 14") on the right. Repos move into a collapsed "Repos (9)" disclosure at the bottom.

---

### 3.8 Loading, empty, error and first run

**References:** [Neon: skeleton that keeps the real title and column layout](https://mobbin.com/screens/9b5b1374-c015-495b-abcb-9cce659c741b) · [Todoist: an empty state that explains the purpose plus one action](https://mobbin.com/screens/fc60338b-3c2f-4081-8a92-18de8e754cc1) · [Attio: no tasks + Create](https://mobbin.com/screens/314e2a2a-3588-4858-bdb1-47fa2b2652ca) · [Duolingo onboarding: "Find my starting place" vs "Start from scratch"](https://mobbin.com/flows/2c317632-13c2-4313-9977-98ac58c0d9d4).

- **Loading:** the top bar and real view title render right away. Content areas show skeleton bars that match the final row heights (`--surface-2` blocks, 8px radius, a 1.2s opacity pulse between 0.6 and 1; static under reduced motion). No "Loading your course…" sentence in an empty page.
- **Data failed to load:** "Couldn't load the course data. Reload the page. If it keeps happening, run `/sync` in Claude Code to republish it." plus a **Reload** button.
- **Save states** (top bar, with `role=status`): `Saved` (teal dot) · `Saving…` (pulsing muted dot, *not* orange) · `Saved in this browser only` (muted dot, tooltip: "Open the hub on claude.ai to save to your account") · `Not saving: reload` (warn dot, a click reloads). The v1 orange "saving" dot goes away to protect the orange rule.
- **First run / catch-up** (when no `meta/onboarded` doc exists and 2+ full-guide lectures are in the past): a one-time banner on Today and Course: "You've had 9 lectures so far. Mark what you've already finished so 'Up next' is accurate." with **Catch up (2 min)** and **Not now**. Catch up opens a sheet listing past lectures. Each row gets `Done` / `Partly` / `Not yet` and an optional 1–5 rating. `Done` ticks every step, `Partly` leaves the steps alone and only rates. Save writes `meta/onboarded: {at}`.

---

## 4. Interactions and motion

| What | Animation | Duration / easing | Why |
|---|---|---|---|
| Tick a step | Check scales 0.6→1 and fades in. The box fills teal. | 160ms, `cubic-bezier(.3,1.4,.5,1)` | Confirms the tap without fuss. |
| Step collapse / expand | `grid-template-rows: 0fr ↔ 1fr` on the step body | 220ms ease-out | Keeps place on the page and shows where content went. |
| "Mark done and continue" | collapse current → expand next → `scrollIntoView({block:"start"})` with a 96px offset | 220ms + smooth scroll | Moves attention to the next action. |
| Progress bars and rings | width / stroke-dasharray change | 600ms `cubic-bezier(.2,.7,.2,1)`, only on change, never on first paint | Rewards progress without replaying on every render. |
| Up next swaps to the next step | content cross-fade | 200ms | Signals that something new is the next action. |
| Now-line | no animation; repositioned every 60s | — | Motion here would pull the eye all day. |
| Palette / sheets open | fade + 8px rise (palette); slide up (sheet) | 160ms / 240ms ease-out; close 120ms | Fast in, faster out. |
| Copy | label swaps to "Copied" | 1.6s hold | Confirms where he's looking. |

`prefers-reduced-motion: reduce` turns off all transforms, scroll smoothing and pulses. State changes happen instantly.

**Re-render rule:** v1 re-renders the whole view with `innerHTML` on every tick, which resets scroll and expansion state. v2 updates the affected nodes (the step, the counts, the rail) in place, so focus, scroll and open steps survive. Keep full renders for route changes only.

---

## 5. Component specs and tokens

### Type (IBM Plex, the same Google Fonts URL plus `IBM Plex Sans Condensed 600`)
| Style | Font | Size / line | Use |
|---|---|---|---|
| Display | Plex Sans Condensed 600 | 40/44 (phone 30/34), −0.01em | View title / date |
| Title | Plex Sans Condensed 600 | 24/30 (phone 21/27) | Lecture title in Up next, lecture H1 at 36/40 |
| Section | Plex Sans Condensed 600 | 20/26 | Section headings, **sentence case, no uppercase eyebrows** |
| Row title | Plex Sans 600 | 15/22 | List rows, step titles (Condensed 600 17/24 for step titles) |
| Body | Plex Sans 400 | 15/24, max 68ch | Detail, summaries |
| Meta | Plex Sans 400 | 13/18, `--muted` | Sub-lines, dates |
| Mono | Plex Mono 500 | 12/16 (codes, times), 13/20 (code blocks) | Lecture codes, times, counts. `font-variant-numeric: tabular-nums` on every number |

### Spacing and shape
- 4px base scale: `--s1:4 --s2:8 --s3:12 --s4:16 --s5:24 --s6:32 --s7:48`. Page gutter 16px on phone, 32px on desktop. Max content width 1240px. Main column ≤ 760px when the rail is present.
- Radius: controls 6px, panels 10px, code 8px, chips 999px. **Panels are used sparingly.** Today has *one* card (Up next) and the rail. Everything else is rows on the page background divided by 1px `--line` hairlines.
- Row heights: 40px desktop list rows, 48–56px phone rows. **Every tappable target ≥ 44×44px on phone** (checkboxes are 24px visually inside a 44px hit area).
- Elevation: none on panels. One shadow token, only for the palette and sheets: `0 12px 32px rgb(15 36 39 / .18)` (dark: `/ .5`).

### Icons
Inline SVG, a 20px grid, 1.6px stroke, `currentColor`, round caps. Set: check, status circles (6 states), chevron, copy, external, search, undo, calendar-check (streak), flag (milestone), more (⋯), close, notes, star-free 1–5 segments. No emoji anywhere (this includes v1 data strings with emoji, such as the work-log summary: strip or replace those at render).

### Tokens (refinements to v1, not a new identity)
Keep every v1 colour token. Changes:

```css
:root {
  /* v1 tokens unchanged … plus: */
  --focus: var(--teal-strong);   /* was orange; orange is reserved for now/next */
  --now: var(--orange);          /* alias: use for now-line, Up next rule, current step ring, today tick */
  --now-ink: var(--orange-ink);  /* any orange TEXT (≥ 4.5:1 on surface) */
  --skeleton: var(--surface-2);
  --shadow-pop: 0 12px 32px rgb(15 36 39 / .18);
  --s1:4px; --s2:8px; --s3:12px; --s4:16px; --s5:24px; --s6:32px; --s7:48px;
  --r-code: 8px;
  --row: 40px;
}
@media (max-width: 899px) { :root { --row: 48px; } }
```
Dark mode keeps the v1 dark values. Add `--shadow-pop: 0 12px 32px rgb(0 0 0 / .5)` to both dark blocks (the `prefers-color-scheme` one and the `[data-theme="dark"]` one).

**Colour rules**
- **Teal:** progress, done, the primary button, focus ring, links.
- **Orange (`--now`):** the Up next left rule, now-line, current step ring, today's tick/cell, the "This week" label. Nothing else: not saving, not focus, not warnings, not deadlines.
- **Warn (amber):** "Ask instructor", Weak strength and save errors. Never "past and unticked".
- **Muted grey:** not checked off, upcoming, outline.

---

## 6. Accessibility

- **Contrast** (checked against v1 tokens): `--ink` on `--bg` 15:1. `--muted #5a6e71` on `--bg #f3f6f6` ≈ 5.0:1 ✓. `--teal #1b6b6d` on white ≈ 6.3:1 ✓. White text on `--teal` ✓. **`--orange #e2560a` on white is ≈ 3.6:1. Use it only for non-text marks (lines, rings, dots); orange text must be `--orange-ink #a8400a` (≈ 5.9:1).** In dark mode, `--orange-ink #ff9b62` on `#111c1f` ✓. The muted text of future steps must stay ≥ 4.5:1: use `--ink-2`, not reduced opacity.
- **Landmarks and order:** skip link ("Skip to main content") → header (nav) → main → rail as `<aside>`. On the lecture page the tab order is: breadcrumb → title → required → the current step's controls → other steps → check yourself → rail (rating, notes, links) → pager.
- **Steps:** each step is an `<li>` with a header `<button aria-expanded aria-controls>` for disclosure, and a separate checkbox (`role="checkbox" aria-checked`, label "Step 2: Restructure Myflix…, done"). Ticking announces through a polite live region: "Step 2 done. 2 of 10."
- **Confidence:** `role="radiogroup"` with 5 `role="radio"` buttons. Arrow keys move, and each label is "2 of 5, Shaky".
- **Timeline:** an `<ol>` of slots with "now" exposed as `aria-current="time"` and the sr text "Now, 11:15, during AI-8 Authentication". The visual track is `aria-hidden`.
- **Heatmap:** `role="img"` with a summary label ("14 commits and 2 study days across 10 class days"). Each cell has a `title` for mouse users.
- **Dialogs** (palette, sheets): native `<dialog>`. Focus moves to the input / first control, is trapped, and returns to the trigger on close.
- **Keyboard shortcuts** (ignored while typing in an input or textarea; a `?` overlay lists them):
  - `⌘K` / `Ctrl-K` / `/`: palette · `g t` Today · `g c` Course · `g r` Review · `g w` Work
  - Lecture: `j` / `k` next or previous step · `x` toggle the current step · `c` copy the current step's code · `1`–`5` rate · `n` focus notes · `e` expand or collapse all
- **Reduced motion:** see §4. **Zoom:** layouts hold at 200%, and nothing relies on a fixed height except the code block clamp, which has a "Show all" button.

---

## 7. Copy

| Where | v1 | v2 |
|---|---|---|
| Up next eyebrow | "Today's lecture" | "Up next · AI-8 · step 2 of 10" |
| Up next primary | "Open guide" / "Continue guide" | "Mark step done" (secondary link: "Open guide") |
| Up next, caught up | — | "You're caught up. Next: prep for AI-9 (2 steps, 25 min)." |
| Past and unticked | "Not started" (amber, dashed) | "Not checked off" (grey) |
| Outline tag | "· prep outline" ×45 | dashed status icon + "prep 3" in the count column |
| Step action | (checkbox only) | "Mark done and continue" · "Skip for now" · "Undo" |
| Done when label | "Done when" | "Done when" (kept, with a check-circle icon) |
| Rating prompt | "How well do you get it?" | Same. Helper after choosing: "Shaky: it comes back for review in 2 days." |
| Finished lecture | — | "AI-8 done. How well do you get it?" → "Next up: AI-9 3rd Party APIs" |
| Review empty | "Lectures you rate Lost or Shaky show up here." | "Rate a lecture after class. Anything you rate 1–3 comes back here when it's time to review." |
| Review nothing due | — | "Nothing due today. Next review: AI-5 on Thu, Oct 22." |
| Goal line | "Start a streak today" | "2 more days this week keeps your 3-week streak." / "Goal met. 3-week streak." |
| Manual log | "Log today" | "I studied off the hub" |
| Save | "Saved to your account" | "Saved" · "Saving…" · "Saved in this browser only" · "Not saving: reload" |
| Catch-up banner | — | "You've had 9 lectures so far. Mark what you've already finished so 'Up next' is accurate." [Catch up (2 min)] [Not now] |
| Weekend notice | "No class today, it's the weekend. Next class is…" | "No class today. Next class: Monday, Oct 19 · AI-8 Authentication." |
| Assignment status | "Check with instructor" | "Ask instructor" |
| Palette placeholder | — | "Search lectures, terms, assignments…" |

Voice: plain, active, second person, no exclamation marks, numbers as digits.

---

## 8. What to remove

- [ ] The **three 0% meters** on Today. Replace them with one course bar in the rail and the course ruler on Course.
- [ ] The **"Bootcamp elapsed" meter** (time isn't progress). It's now the ruler.
- [ ] The **"N days to graduation"** text in the top bar. It moves to the Course header.
- [ ] The **"Week N at a glance"** list on Today. It duplicates Course › This week.
- [ ] The **amber dashed "missed" status** for past lectures.
- [ ] The **module chip wall** (11 chips across two lines) and the **floating legend** on the map.
- [ ] **"· prep outline"** repeated on 45 rows.
- [ ] The **status pill + checkbox** double signal on Assignments, and the "Week 2" text repeated on every Today row.
- [ ] The **3–7 goal buttons** and the Mon–Sun daily streak.
- [ ] The **orange "saving" dot** and the **orange focus ring** (orange is only for now / next).
- [ ] The **64px heatmap cells** and the always-expanded Repos list.
- [ ] **Full-view `innerHTML` re-renders** on every tick (they reset scroll and expansion).
- [ ] Emoji coming from data (e.g. "⚠️", "📖" in work-log summaries): strip them at render.

---

## 9. Data additions (small, backward compatible)

| Doc | v1 | v2 adds | Used by |
|---|---|---|---|
| `lectures/<id>` | `steps, notes, confidence, updatedAt` | `ratedAt`, `reviewedAt`, `recall: {missed: ["JWT", …]}` | Review schedule, "Quiz me" prompt |
| `assignments/<id>` | `done, updatedAt` | `status` (`todo` / `in-progress` / `check` / `done`); still read `done` | Status menu |
| `meta/goal` | `weeklyTarget` (3–7) | same field, range 1–7 | Weekly streak |
| `meta/onboarded` | — | `{ at }` | Hides the catch-up banner |
| localStorage only | `eagle-hub:v1`, `hub:debug-now` | `hub:guide-expanded`, `hub:recent` | Per-browser conveniences |

Weekly streak and review-due are derived from these docs. Nothing else needs a new store. Keep `hub:debug-now` so `hub/qa/shoot.mjs` keeps working.

---

## 10. Build order (suggested)

1. Tokens, type, top bar / bottom bar, palette shell, skeletons, save states.
2. Lecture page: focus-mode steps, code block, sticky rail / phone bar, rating with `ratedAt`, check-yourself cards, in-place updates.
3. Today: the step-level Up next engine, proportional timeline, prep for tomorrow, review due, weekly goal.
4. Course: ruler, collapsible weeks with rings, filters, the new status vocabulary, catch-up sheet.
5. Review view and spaced schedule.
6. Work: Linear-style assignment groups with the status menu; compact Activity.
7. QA with `hub/qa/shoot.mjs` at 1360 and 390, light and dark, at `2026-10-19T11:15`, `2026-10-18T14:00` (weekend) and `2026-10-19T19:30` (after class). Check: no horizontal overflow, every control ≥ 44px on phone, and orange appears only on now / next.

---

## Reference index

| Surface | References |
|---|---|
| Home / Today | [Uxcel](https://mobbin.com/screens/0eaa635e-b214-4054-8db8-d7f22146ad80) · [Coursera](https://mobbin.com/screens/5cb6eee8-7490-4661-a3f1-69bf3483825e) · [Babbel web](https://mobbin.com/screens/5c06bda9-0458-437b-a68d-89ce396237e7) · [Brilliant](https://mobbin.com/screens/d7b78a30-c1b5-4024-9fc3-e84228de7244) · [Preply](https://mobbin.com/screens/3af9d328-5c6d-447f-b0ef-ede219101e55) · [Noom](https://mobbin.com/screens/e53b47e7-1acd-4689-bc75-909b8a6868b0) |
| Day timeline | [Rise](https://mobbin.com/screens/a17536d0-3e43-45ca-8784-b4541f4b3057) · [Clockwise](https://mobbin.com/screens/b88739ff-b05e-4a28-81dc-900ea848c736) |
| Course map | [Codecademy](https://mobbin.com/screens/63e05256-8dd3-4758-9abd-bc84176be27d) · [Magnific](https://mobbin.com/screens/4b0d7119-a2fc-4ddc-8291-b3cacf949237) · [Uxcel](https://mobbin.com/screens/02294a41-5e3c-4db8-9234-14e08e8b3dff) · [Turo](https://mobbin.com/screens/add69f6f-6e9a-419f-82df-729e930baa86) |
| Lecture guide | [Graphite](https://mobbin.com/screens/d5e25ee0-a30a-4bbe-bc78-e2fb213e811d) · [Clerk](https://mobbin.com/screens/15f6fc1f-bf15-42fe-9791-68a3f379bd30) · [Outseta](https://mobbin.com/screens/48846715-4b2f-4727-918d-9018ce505f7d) · [Sentry](https://mobbin.com/screens/68401530-20c8-4f67-9ff3-e29136989fb2) · [Turo lesson](https://mobbin.com/screens/c1cc661e-ec5c-4d15-a781-d388cb329940) · [Unity steps](https://mobbin.com/screens/41483099-a471-4552-9c6a-056874835b21) · [Unity complete](https://mobbin.com/screens/fe650398-23a4-4ff8-b76c-2aead134d25c) · [Uxcel lesson](https://mobbin.com/screens/790534e1-7335-4b7b-8ab2-e16f62e131d6) · [Lyssna](https://mobbin.com/screens/e3621cbc-f94f-432f-8914-827b62838eb8) · [Mistral](https://mobbin.com/screens/fd7807e2-5bb5-479e-ba9f-f4994f63ca0c) |
| Review | [Babbel review](https://mobbin.com/screens/3ae95e51-e6a5-462e-80f6-03254a6c6a59) · [Babbel result](https://mobbin.com/screens/bd0a42ab-2f2f-43c4-a83c-c9138522bc5c) · [Babbel iOS](https://mobbin.com/screens/fdaa7267-a4f1-4088-a90a-d1a9611fa63a) |
| Assignments | [Linear grouped](https://mobbin.com/screens/be6c4ee4-aa93-42b4-89b3-dcfc8386f022) · [Linear done](https://mobbin.com/screens/94bb4d3b-a8e3-41e8-b8f1-b82d1f904b03) |
| Goal / streak / heatmap | [Codecademy target](https://mobbin.com/screens/00670798-8759-43b9-9eff-9122aaac87af) · [Codecademy streak](https://mobbin.com/screens/4d1e0a51-4a2d-4b4f-8a1b-cff0eab3e41c) · [Duolingo](https://mobbin.com/screens/7aa10b76-548e-4f22-b5b8-e65e7abba53b) · [Babbel freezes](https://mobbin.com/screens/ad647d91-f092-4ed4-a039-85a60844534a) · [Todoist](https://mobbin.com/screens/a32be022-0e99-4fe7-b216-12162fbd5828) · [Cursor heatmap](https://mobbin.com/screens/5e0de5f5-a660-4a26-b8fd-ec6cdda7a002) |
| Command palette | [Vapi](https://mobbin.com/screens/593d7acd-2e16-4365-bcd6-02ce52f48f3b) · [Mintlify](https://mobbin.com/screens/7c7ad31f-9dfe-4be7-83d7-6002fe31d4d0) · [Magnific](https://mobbin.com/screens/e22e26e2-f813-4f1e-beda-43c9ecf26419) |
| Empty / loading / first run | [Todoist empty](https://mobbin.com/screens/fc60338b-3c2f-4081-8a92-18de8e754cc1) · [Attio empty](https://mobbin.com/screens/314e2a2a-3588-4858-bdb1-47fa2b2652ca) · [Neon skeleton](https://mobbin.com/screens/9b5b1374-c015-495b-abcb-9cce659c741b) · [Duolingo onboarding flow](https://mobbin.com/flows/2c317632-13c2-4313-9977-98ac58c0d9d4) |

Mobbin searches run (14): learning home with today/progress/streak · syllabus by module with completion · step-by-step setup guide with code + copy · Linear issue list grouped by status · weekly goal/streak/heatmap · command palette · empty state · review weak topics · today agenda with now-line · lesson complete + confidence rating · onboarding flow (flows) · skeleton loading · phone learning home with bottom tabs (iOS) · lesson reader with sticky side panel.
