# Learning Hub heuristic review — 2026-10-19

> [!summary] Code-based review; live task walkthroughs could not run in this session.
> The Hub has strong fundamentals for daily use: contextual progress, undo paths, keyboard navigation, live announcements, and reduced-motion handling. The main opportunity is making save failures and browser-only persistence easier to diagnose. I added a quiet page-entry transition for route changes. Visual density, mobile reachability, color contrast, and the live feel of the interactions still need a browser pass.

## Scope and evidence

Reviewed `hub/index.html`, `hub/hub-data.json`, `hub/guides/README.md`, and the 58 guide records. The local QA harness could not be launched because this environment denied binding to `127.0.0.1:4180`, and no browser surface was available. Findings below cite inspectable implementation details; task outcomes and visual quality are marked unverified rather than assumed.

## Scorecard

Scores reflect the implementation evidence, not live usability observations. 1 = weak, 5 = strong.

| # | Heuristic | Score | Worst severity | Evidence / note |
|---|---|---:|---:|---|
| 1 | Visibility of system status | 4 | 2 | Step changes announce progress; notes show save state; sync failure path could explain recovery better. |
| 2 | Match with real world | 4 | 1 | Hub uses course vocabulary and labels class times in ET. |
| 3 | User control and freedom | 4 | 1 | Step and assignment actions expose undo; hash routes preserve browser back/forward. |
| 4 | Consistency and standards | 4 | 2 | Shared status labels and controls; visual consistency needs screenshot review. |
| 5 | Error prevention | 3 | 2 | Ratings are labelled; a second rating click can clear it, and touch behavior needs live check. |
| 6 | Recognition rather than recall | 4 | 1 | Filter labels, help sheet, step counts, and lecture breadcrumbs provide context. |
| 7 | Flexibility and efficiency | 5 | 0 | Search palette, route shortcuts, and lecture-step shortcuts are present. |
| 8 | Aesthetic and minimalist design | 3 | 2 | Strong hierarchy in code; page density and motion balance remain unverified visually. |
| 9 | Error recovery | 3 | 2 | Data-load fallback offers reload and `/sync`; save failure needs a more explanatory recovery path. |
| 10 | Help and documentation | 4 | 1 | In-app keyboard/help sheet and course guide explain terms and actions. |

## Core task walkthroughs

These are implementation walkthroughs, not browser-executed tests.

1. **See today's work and what's next — provisionally supported.** Today view derives the current day, timeline, next action, due reviews, prep, and assignments (`vToday`). Confirm hierarchy and scan time at desktop and phone widths.
2. **Open a guide, check a step, undo — supported in code.** Step completion updates a live announcement; completed steps reveal Undo (`toggleStep`, `.step__undo`). Verify focus and scroll remain comfortable after use.
3. **Copy a prompt or code block — supported in code.** Guide code blocks include a labelled Copy button (`codeBlock`). Clipboard permission and copied feedback need a live check.
4. **Find an assignment repository — supported in data and UI.** Assignment rows include repo links when present. Verify missing-link rows explain what to do.
5. **Find a future lecture and prep — supported in code.** Course filters and lecture routes expose guide status and prep steps. Verify mobile scrolling and deep-link behavior.
6. **Rate a lecture and find it later — supported in code.** Rating text explains review timing, and the Review view groups lectures. Verify removing a rating is discoverable.
7. **Write a note, leave, and return — partially verified.** Notes are saved through the state layer and have status text. Persistence across reload/account is dependent on the connected backend and needs a live session check.
8. **Use on phone — implementation has responsive layout and 44px compact buttons in some areas.** Overall 44px target coverage and horizontal overflow were not measurable without a browser.

## Findings by heuristic

### 1. Visibility of system status — 4/5

- **[Sev 2] Save failure needs a recovery explanation.** The save control reloads on error (`hub/index.html`, save click handler near line 1834). Users may not know whether changes were saved. Show the failed operation and offer retry/sync guidance before reloading.
- **Strength:** Step completion announces its new count and next step (near line 1527); notes show “Typing…” and saved state.

### 2. Match with the real world — 4/5

- **Strength:** The schedule uses familiar course terms such as Stand Up, lectures, projects, and ET times. The guide spec asks for plain-English steps and observable completion cues.
- **[Sev 1] Validate date/time on weekend and after-class states.** The project has a fake-time QA harness, but this pass could not run it. Confirm that “today,” “next class,” and review timing remain clear outside class hours.

### 3. User control and freedom — 4/5

- **Strength:** Step completion has a visible Undo control, and assignment status changes use an Undo toast. Hash-based links preserve browser history.
- **[Sev 1] Verify that full-page rerenders preserve focus and text selection.** The renderer explicitly captures/restores focus on same-route updates; confirm with notes and keyboard use in a browser.

### 4. Consistency and standards — 4/5

- **Strength:** Buttons, chips, status labels, and guide steps use shared markup and color tokens. Reduced-motion support is global.
- **[Sev 2] Review visual consistency across all five views.** A code-only pass cannot confirm spacing, contrast, or active-state appearance between Today, Course, Review, Work, and a guide.

### 5. Error prevention — 3/5

- **[Sev 2] Make rating removal explicit.** Ratings 1–5 are clearly named, but rating behavior includes clearing a rating; ensure the clear action cannot be triggered accidentally on phone.
- **Strength:** Destructive-looking progress changes have undo affordances, and progress rows expose a status menu rather than silently cycling without explanation.

### 6. Recognition rather than recall — 4/5

- **Strength:** Course filters are labelled; an icon-help action exists; guide pages show course breadcrumbs, step counts, and a persistent step outline.
- **[Sev 1] Keep state labels visible at narrow widths.** Some compact status indicators rely on accessible text or a `title`; verify that sighted phone users can identify each state without hovering.

### 7. Flexibility and efficiency — 5/5

- **Strength:** Search opens with ⌘K or `/`; keyboard help lists route shortcuts and guide actions. The palette stores recent items.
- **[Sev 0] No implementation issue found.** Validate shortcut discoverability with a first-run user.

### 8. Aesthetic and minimalist design — 3/5

- **[Sev 2] Review information density in the live page.** There are multiple Today sections and a progress rail, plus dense Course and Work lists. The source shows responsive layouts, but a screenshot is needed to determine whether the visual hierarchy stays calm.
- **Change made:** Route changes now fade and rise 7px over 240ms; state-only updates do not animate. Existing step completion, progress bar, accordion, and dialog motion remain, with `prefers-reduced-motion` support.

### 9. Error recovery — 3/5

- **[Sev 2] Distinguish “course data failed to load” from “my progress failed to save.”** The load fallback recommends reload and `/sync`; those are different recovery actions. Explain whether local changes are safe before recommending reload.
- **Strength:** A cached course-data fallback exists when the latest JSON cannot be fetched.

### 10. Help and documentation — 4/5

- **Strength:** The in-app help sheet lists keyboard shortcuts; guide records define `doneWhen`, sources, and plain-language terms. The Learning Hub README describes how the data is built.
- **[Sev 1] Add a compact first-use cue for persistence.** Explain whether progress is browser-local or account-synced and how to tell. Confirm the current connected state with a live account.

## Accessibility and quality floor

- **Reduced motion:** Present in CSS at `hub/index.html` around line 626; new route motion follows that rule.
- **Keyboard access:** Visible focus styling, skip link, search shortcuts, radio arrow-key handling, and guide shortcuts are present in source.
- **Touch targets, color contrast, line lengths, and horizontal overflow:** Not measured in this session. Capture 390px light/dark pages and check all interactive targets against 44×44px.
- **Live screen-reader and browser behavior:** Not verified.

## Prioritized next steps

| Priority | Fix | Heuristics | Severity | Effort |
|---|---|---|---:|---|
| 1 | Explain save errors and offer safe retry/sync guidance before reload | 1, 9 | 2 | S |
| 2 | Clarify browser-local vs account-synced progress in first-use/help and save state | 1, 10 | 2 | S |
| 3 | Run the provided desktop/phone/dark-mode screenshots and task walkthroughs | 2–8 | 2 | M |
| 4 | Verify phone status labels, 44px targets, contrast, and no horizontal scroll | 4–8 | 2 | M |

## References

- [Supabase Agent Skills](https://github.com/supabase/agent-skills): official Supabase skill set for database, Auth, RLS, migrations, and Postgres best practices; useful if the Hub is connected to Supabase.
- [Microsoft Playwright MCP](https://github.com/microsoft/playwright-mcp): browser automation for repeatable interaction and screenshot reviews. A Playwright-based screenshot script already exists in `hub/qa/`; a reachable local server is needed to use it.
- [axe-core](https://github.com/dequelabs/axe-core): automated accessibility checks to add alongside the existing browser review.
- [Motion](https://github.com/motiondivision/motion): a richer animation library for React/JS. The Hub is standalone HTML/CSS/JS, so its current CSS animations are a better fit than adding this dependency.
