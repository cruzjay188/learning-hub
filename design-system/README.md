The Eagle Learning Hub is a bootcamp student's daily home base: today's class, the next step to do, every lecture's guide, review and progress. Everything here serves one question, "what do I do now?", and keeps the rest quiet.

## Principles

1. **One next action.** Each view has a single `now`-marked action that names a step, not a page. Everything else is quieter.
2. **Finish where you see it.** Tick, copy and rate in place; Today can complete the current step without opening the guide.
3. **Close the learning loop.** Do the step, check yourself on the key terms, rate it, and it comes back for review on a schedule.
4. **Honest, not guilty.** Past work that isn't ticked is "Not checked off" in grey. Orange means now / next, never late.
5. **A ledger, not a dashboard.** Dense aligned rows on `line` hairlines, tabular numbers, few panels. No tile grids, gradients or decorative numbers.

**Craft rules (v3).**
- **Depth means something.** Rows sit flat on hairlines. Things you act on sit one level up (`shadow-raise`). Things that float sit two or three levels up (`shadow-float`, `shadow-pop`). Nothing else gets a shadow.
- **Show the change.** When a number, a ring or a list changes, you see it change: digits roll, rings close, rows rise into place. Nothing teleports, including when you come back to a page.
- **Keep the eye still.** After any action, the next thing to do lands where the eye already is. No jumps to the top, no lost scroll, no focus dropped on `<body>`.

## Voice and copy

- Plain, active, second person: "Mark what you've already finished so Up next points at the right step."
- Sentence case everywhere: headings, buttons, tabs. No uppercase eyebrows, no exclamation marks, no emoji.
- Buttons start with a verb and say what happens: "Mark step done", "Copy \"Quiz me\" prompt", "Catch up · 2 min". The same words carry through: "Mark step done" → toast "Done: <step>".
- Numbers are digits with tabular figures: "Day 10 of 67", "2 of 10 steps".
- Empty states give direction: "Rate a lecture after class. Anything you rate 1–3 comes back here when it's time to review."
- Errors say what happened and what to do, without apology: "Couldn't load the course data. Reload the page."
- Use the student's words: Stand Up, Stand Down, homework, Knowledge Check, lecture codes like AI-8.

## Color

- Text: `ink` for titles and primary text, `ink-2` for body copy, `muted` for meta. All on `bg`, `surface` or `surface-2`.
- Structure: rows sit on `bg` divided by `line`; they hover with a `row-hover` pill. Raised panels (`surface` + `shadow-raise`) are rare: Up next, the recall deck, pager links. Floating layers use `surface-raised`.
- Empty parts of bars, rings, rails and segment strips use `track` (teal at low alpha), so value and track read as one hue.
- **Teal means progress and done**: checks, done icons, progress bars, the primary button, links (`teal-strong`), focus.
- **Orange means now / next only**: the Up next rule, the now-line, the current step ring, today's tick (`now` for marks, `now-ink` for text). Never for actions, saving, focus, warnings or deadlines.
- **Warn (amber) means a real problem**: "Ask instructor", save errors, the Weak strength dash, and form errors (field and server). Never for "past and not ticked".
- Controls carry a `control` border (3.2:1 or better). `line` is decoration only.
- Code sits on `code-bg` in both themes with `code-ink` text and a `code-meta` label.
- Both themes are first-class; every pair is checked in light and dark (see each token's note).

## Type

IBM Plex in three widths, loaded from Google Fonts:
- `display` family (Plex Sans Condensed 600) for titles only: `display` (view title), `lecture-title`, `title` (Up next step), `section`, `step-title`, `panel-title`. Balance-wrap headings.
- `body` family (Plex Sans) for reading: `body` (15/24), `body-lg` for the lecture summary, `row-title`, `meta`, `caption`. Keep lines under 68ch.
- `mono` family (Plex Mono) only for real code (`code`) and identifiers: lecture codes, times, step numbers, counts (`mono-label`). Never as decoration.

## Space and layout

- Spacing steps: `space-1` 4 · `space-2` 8 · `space-3` 12 · `space-4` 16 · `space-5` 20 · `space-6` 24 · `space-8` 32 · `space-10` 40 · `space-12` 48. Use `gap`, not margins between siblings.
- Desktop: a 56px sticky top bar (`bar-h`), content up to `content-max`, a main column up to `main-max` and a sticky side panel `rail-w` wide, `space-12` apart.
- Phones (under 900px): a 48px top bar with the page title, a bottom tab bar, one column, a `space-4` gutter, and every target at least `tap` (44px).
- Rows are `row` tall (52px on phones).

## Shape and elevation

- Corners: `r-xs` 4 (key caps, badges) · `r-item` 6 (thumbs, tiles) · `r-ctl` 8 (buttons, inputs, segments) · `r-code` 10 · `r-panel` 12 (cards, menus, toast) · `r-dialog` 16 (palette, dialogs, phone sheets) · `r-pill`. Nesting: inner = outer − inset, rounded down to a token.
- Elevation: `shadow-ring` (framed) → `shadow-raise` (acted on) → `shadow-float` (menus, toast, phone pill) → `shadow-pop` (palette, dialogs). Edges are box-shadow rings, never borders, so states never shift layout. In dark mode depth comes from the ring, a 1px top `highlight` and `surface-raised`.
- Never animate `box-shadow`. A hover shadow lives on a `::after` at opacity 0 and fades in. No gradients.

## Motion

Motion explains what changed: feedback for a tick, where a lecture came from, what replaced Up next. It never decorates. Rules (after Emil Kowalski and Jakub Krehel): under 300ms in the UI, `transform`, `opacity`, `clip-path` and small blurs only, exits faster and smaller than entrances, nothing on keyboard shortcuts, and `prefers-reduced-motion: reduce` turns all of it off.

**Curves and times** (CSS variables from `front-end/src/styles/`, copied into `bundle.css`):

| Variable | Value | Use |
|---|---|---|
| `--ease-out` | `cubic-bezier(.23, 1, .32, 1)` | anything arriving or leaving |
| `--ease-in-out` | `cubic-bezier(.645, .045, .355, 1)` | anything moving while on screen (rings, bars, rails, underline) |
| `--ease-in` | `cubic-bezier(.32, 0, .67, 0)` | exits that leave the screen (a card tilting away, a sheet going down) |
| `--ease-drawer` | `cubic-bezier(.32, .72, 0, 1)` | phone sheets (the iOS drawer curve) |
| `--spring-pop` | `linear(…)`, 8% overshoot | small confirmations: tick press, done disc, goal day |
| `--spring-soft` | `linear(…)`, 4% overshoot | sliding thumbs, the next card coming forward |
| `--dur-instant` / `press` / `micro` / `ui` / `move` / `celebrate` | 90 / 120 / 160 / 220 / 280 / 560ms | press down, release, small swaps, panels, movement, the two celebrations |

| What | How | Time |
|---|---|---|
| Button | press `scale(.98)`; hover tint and lift on pseudo-elements; primary lifts 1px | 90ms down, 160ms up |
| "Mark step done" | the check draws and the label swaps to "Done"; holds, then the card moves on | 160ms + 300ms hold |
| Up next swap | view transition: old content out (up, blur), new in from `scale(.97)`; the card's height and every section under it glide | 140ms out, 240ms in, 260ms glide |
| Tick a step | spring press, the number blurs out as the check draws, the rail fills to the next step | 240ms, rail 280ms +60ms |
| Mark done and continue | tick where you can see it, hold, then this step folds while the next opens; scroll only if the next is off screen | 360ms hold, 220ms fold |
| Lecture complete | the header ring closes into the done disc, the finished panel rises, the rating segments rise 30ms apart, focus moves to the rating | about 560ms, once |
| Ring and bar fills | `stroke-dashoffset` / `clip-path`, only when the value changes (including when you come back) | 280ms |
| Ticker | digits roll, right-most first, 30ms apart | 220ms |
| Auth mode switch | view transition: the card's height glides, content cross-fades | 120ms out, 160ms in, 220ms glide |
| Field error | the message rises 2px into place; the edge turns `warn-mark` | 160ms, edge 120ms |
| Rating | the thumb slides to the choice; the word swaps with a rise | 200ms / 160ms |
| Recall deck | flip `rotateY`; answer tilts away ±48px ±3°; the next card comes forward | 280 / 200 / 220ms |
| Segmented control | the thumb slides (`clip-path`) | 220ms `--spring-soft` |
| Tabs | the page slides 12px in the tab's direction; the underline slides; on phones a pill slides behind the icon | 120ms out, 220ms in; 240ms |
| Course row → lecture | the page slides 24px forward, the row's title flies into the heading; the new page fades in late so the title lands in clear space | 280ms |
| Back to Course | mirror slide, the title flies home, scroll and open weeks are restored, the origin row glows and takes focus | 280ms; glow 300ms + 600ms fade |
| Filter change, week open | rows rise 4px into place, 20–24ms apart (capped at 8–10) | 200–220ms |
| Toast | rises out of a 2px blur; leaves with a 6px drop; text swaps in place | 240ms in, 150ms out |
| Menu | from its trigger corner, `scale(.96)` + fade | 150ms in, 100ms out |
| Sheet | desktop: `translateY(8px) scale(.96)` + fade; phone: slides up, drag down to close | 220 / 280ms in, 150 / 200ms out |
| Phone tab bar | hides while scrolling down a lecture; the lecture pill drops into its place | 220ms |
| First paint | the page arrives in 4 pieces, 40ms apart | 280ms, once per load |
| ⌘K palette, keyboard shortcuts, now-line | no animation | none |

Browsers without View Transitions (or `@starting-style`) just switch instantly; nothing breaks.

## Iconography

Inline SVG on a 16px or 20px grid, 1.5–1.7px strokes, round caps, colored with `currentColor` or a token. No emoji anywhere, including text that comes from data. The seven state icons are in StatusIcon; utility icons are check, chevron, copy, external (↗ for links that leave the hub), undo, search, info, close, flag (milestones), calendar-check and notes. The brand mark (teal square, two orange chevrons) is in Assets › Logos. Accounts add `alert` (circle with !), `caps lock` (an up arrow on a bar) and `envelope` (Check your email).

## Accessibility floor

- Text 4.5:1 on its grounds; controls, focus rings and meaningful marks 3:1, in both themes.
- Focus: a solid 2px `focus` ring at a 2px offset, and focus stays on the control that was used (or the next logical one) after any change.
- Touch targets at least 44px on phones; small visuals extend their hit area.
- Meaning never relies on color alone: icons carry labels, strength dashes carry words.
- Dialogs trap focus and return it; Esc closes; keyboard shortcuts (⌘K, /, g t/c/r/w, j/k, x, c, 1–5, n, e, ?) are ignored while typing.
- Collapsed content is hidden from the tab order.

## Components

Actions: Button, SegmentedControl. Inputs: Field, Checkbox, ConfidenceRating, WeekGoal. Content: UpNext, StepList, CodeBlock, Row, RecallDeck, AuthForm. Status: StatusIcon, StrengthMeter, Ring, Ticker. Time: DayTimeline, CourseRuler, Heatmap. Feedback: Banner, Toast, EmptyState. Navigation: Navigation, FloatingBar. Overlays: CommandPalette, Sheet, Menu. Each card's guidelines say what to provide and when to use it.

## Do and don't

- Do give each view one orange-marked thing. Don't use orange for buttons or warnings.
- Do put progress inside the list (rings, mini-bars). Don't add summary tiles that read 0%.
- Do offer Undo after every change from a summary view. Don't use `confirm()` dialogs.
- Do write direction in empty states. Don't leave a view blank or apologize.
