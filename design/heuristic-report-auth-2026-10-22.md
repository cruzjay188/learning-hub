# Heuristic review: Log in / Create an account (2026-10-22)

> [!summary] Verdict: a calm, on-brand form with solid basics. It is not yet a finished sign-in flow.
> The card is quiet and readable in both themes. Every text pair passes AA. Labels, `autocomplete`, Enter-to-submit and the copy are all right, and a deep link survives logging in. It holds up on the happy path and breaks down on the unhappy ones.
> **Top 3 problems:** (1) a student who forgets their password has **no way to recover** it (Sev 3). (2) The top bar's **"Name · Log out" is one button**: tap your own name and you are logged out at once, with no confirmation and no undo. If that logout fails offline, it looks like it worked but leaves your progress in the browser (Sev 3). (3) **Errors are not tied to fields.** There is one message at a time, in orange (a design-system color violation), and focus drops to `<body>` after a clicked submit (Sev 2).
> **Top strength:** the plumbing and voice. Correct `autocomplete` tokens, labels that wrap their inputs, `role="alert"` on errors, a privacy-safe "Wrong email or password.", and the password rule shown before you type.

Scope: `front-end/src/views/AuthPage.jsx`, `src/styles/12-auth.css`, `src/utils/authUtils.js`, the auth gate in `src/App.jsx`, the account button in `src/components/TopBar.jsx`, all measured against `design-system/README.md`.
Method: production build (`front-end/dist`, served on :4182) in Playwright's Chromium at 1360 and 390 (plus 320), light and dark. The "wrong password", "bad email", "short password" and "offline" states are real. Busy, sign-up confirmation, "email exists", rate limit, signed-in and logout use network mocks, so **no accounts were created** (see the end of the report). Screenshots are in `design/screens/auth-before/` (34 files). Each one was looked at.

## Scorecard

| # | Heuristic | Score (1–5) | Worst severity | Findings |
|---|---|---|---|---|
| 1 | Visibility of system status | 3 | 2 | Busy state vague and silent; no "Logged out" feedback; phone hides who is signed in |
| 2 | Match with the real world | 4 | 1 | "One moment…"; page never says it's for Eagle Platoon / Code Platoon |
| 3 | User control and freedom | 2 | **3** | One-tap logout on your own name, no undo; no exit from a forgotten password |
| 4 | Consistency and standards (incl. design system) | 3 | 2 | Orange errors; loading pattern, phone button height, input focus ring and notice style drift from the DS; no Input/Auth component in the DS |
| 5 | Error prevention | 2 | 2 | No show-password, no Caps Lock hint, logout target next to search on phone |
| 6 | Recognition rather than recall | 4 | 1 | Email not remembered after logout; tab title never changes |
| 7 | Flexibility and efficiency | 4 | 1 | Strong basics; no `#register` deep link, no autofocus |
| 8 | Aesthetic and minimalist design | 4 | 1 | Clean; card jumps on mode switch; 104–116px of phantom scroll |
| 9 | Recognize, diagnose, recover from errors | 2 | **3** | No password reset; errors not tied to fields, one at a time; "Log in instead" with no action; silent failed logout |
| 10 | Help and documentation | 2 | 2 | No help line, no reset, nothing about who to ask |

## Task walkthroughs

### Task 1: A new student creates an account ⚠️
1. Lands on **Log in** (`01-login-empty-1360-light.png`). The only way in for a newcomer is the small "New here? Create an account" link at the bottom of the card (120×34px).
2. Clicks it. The card grows and re-centres, so the brand jumps up 53px and the **Create account** button lands exactly where the pointer was (`02-register-empty-1360-light.png`, which shows the button in its hover state under the cursor). A double-click would submit the empty form.
3. The password rule is in the label before typing ("Password (at least 6 characters)"). Good.
4. Submits with everything empty and gets **only "Enter your name."** (`03-register-submit-empty-1360-light.png`). Fixing that reveals the next error, then the next: three round trips to find three problems.
5. If the email already has an account: "That email already has an account. Log in instead." The form stays on Create, and the only way to log in is the small link below (`15-register-email-exists-1360-light.png`).
6. With "Confirm email" on: the form switches to Log in with a teal notice, and email and password are kept (`14-register-confirm-email-notice-390-light.png`). Clear. Focus goes to `<body>`.
7. Success lands in the hub (mocked, `09-signed-in-topbar-1360-light.png`). Fine.

### Task 2: A returning student logs in ✅
Email, password, Enter, hub. `autocomplete="email"` / `current-password` let password managers fill both. Opening `#lecture-ai-8` while signed out and logging in **lands on that lecture** (measured: hash `#lecture-ai-8`, title "Authentication · Eagle Learning Hub"). Minor costs: nothing has focus on load (measured `activeElement = body`), and after a logout the email field is empty again (`17-after-logout-1360-light.png`).

### Task 3: A student mistypes their password, then realizes they forgot it ❌
- Wrong password → "Wrong email or password." under the password field (`06-login-wrong-password-1360-light.png`). Plain and safe. But after a **click** on Log in, focus ends on `<body>` (measured), the password field isn't marked, and there's no show-password toggle to check what was typed.
- With Caps Lock on and "WRONGPASS" typed, nothing warns (`12-keyboard-login-enter-1360-light.png`). There is no `getModifierState` handling anywhere in the source.
- If they've actually **forgotten** it, this is a dead end: no "Forgot password?" link and no help line. The only way back in is someone resetting the account in the Supabase dashboard.

### Task 4: A student logs in on a phone between classes ⚠️
- Fits 390 and 320 with no horizontal scroll (`01-login-empty-390-light.png`, `19-login-empty-320-light.png`). Inputs are 310×44. Good.
- **Log in** button is 310×**40** and "Create an account" is 120×**34** (measured): both below 44px.
- Inputs use `font-size: 15px` (measured). iOS Safari zooms the page when an input under 16px gets focus. This is known platform behavior; it can't be reproduced in Chromium.
- No show-password, which matters most on a phone keyboard.
- The page scrolls 116px vertically for no reason (scrollHeight 960 vs 844 viewport). `main` keeps its 96px bottom padding for a tab bar that isn't on this page.
- After login, the phone top bar shows only "• Log out". The name is hidden below 900px, and the Save dot reads as a bullet for Log out. Log out is 60×**40**, right beside Search (`09-signed-in-topbar-390-light.png`).

### Task 5: A keyboard-only user logs in and creates an account ✅
Tab order is Email → Password → Log in → Create an account (measured). Every stop has a visible 2px ring (`10-keyboard-focus-email-1360-light.png`, `11-keyboard-switch-mode-1360-light.png`). Enter submits and **keeps focus on the password field** after an error (`12-…`, `16-login-rate-limited-390-dark.png`). Pressing Enter 4× while busy sent only 1 request (measured). Good.

### Task 6: A screen-reader user does both ⚠️
Accessibility tree after an error (Playwright `ariaSnapshot`):
```
- heading "Log in" [level=1]
- textbox "Email": jeff.delacruz@gmail
- textbox "Password": whatever1
- alert: Enter a valid email address.
- button "Log in"
```
- Fields are named by their labels and the error is an `alert`. Good.
- The email field has no `aria-invalid` and no `aria-describedby`, so moving back to it gives no hint that it's the problem.
- Submitting the same mistake twice reuses the **same alert node** (measured `true`), so the second attempt is silent.
- Activating Log in with VoiceOver (a click) drops focus to `<body>` after the response, so the user loses their place.
- Switching Log in ⇄ Create only renames the focused button. The heading change and the new Name field aren't announced, and `document.title` stays "Eagle Learning Hub" in both modes.
- The busy state has no `aria-busy` or live region (measured), so the wait is silent.

### Task 7: A student logs out ⚠️
One click anywhere on "Jeffrey Dela Cruz · Log out" (176×32 on desktop) logs out immediately. There's no confirmation, no toast, and focus goes to `<body>` (`17-after-logout-1360-light.png`). **With the network down**, the logout request fails and supabase-js clears the session. The screen looks identical to a successful logout (`18-logout-offline-390-light.png`), but the page throws an uncaught "Failed to fetch". `forgetLocalData` never runs, so the student's progress copy `eagle-hub:v1:<user id>` **stays in localStorage** (measured before/after). On a shared lab computer, the next person's browser still holds it.

## Findings by heuristic

### 1. Visibility of system status: 3/5
- **[Sev 2] Busy state is vague and silent.** The submit shows "One moment…" on a grey `surface-2` button that nearly vanishes into the card (bg contrast 1.16:1 light, 1.04:1 dark), with no spinner and no `aria-busy`. Evidence: `07-login-busy-1360-light.png`, `07-login-busy-390-dark.png`, measured. Fix: follow the DS Button loading pattern (`aria-busy="true"`, 16px spinner, same width, still teal) and say what's happening: "Logging in…" / "Creating your account…".
- **[Sev 2] On phones nobody can tell which account is signed in.** Below 900px the name is hidden and only "Log out" shows. Evidence: `09-signed-in-topbar-390-light.png`, `account-btn__name { display: none }`. Fix: a 44px initials/avatar button that opens the account menu (see #3).
- **[Sev 1] No feedback after logging out.** You land on an empty Log in card with no "You're logged out" message. Evidence: `17-after-logout-1360-light.png`. Fix: a `.notice` "You're logged out. Your progress is saved to your account." with the email pre-filled.
- Strength: the confirmation notice after sign-up names the exact inbox to check (`14-…`).

### 2. Match between system and the real world: 4/5
- **[Sev 1] "One moment…" doesn't say what is happening.** The DS voice rule is "buttons say what happens". Fix: "Logging in…".
- **[Sev 1] The page never says what it's for.** "Eagle Learning Hub / Log in / Pick up where you left off." A first-time student gets no "Code Platoon · Eagle Platoon" context and no reason to make an account on the Log in side. Evidence: `01-login-empty-1360-light.png`. Fix: one line under the brand, e.g. "Your Eagle Platoon course, steps and notes", in `muted`.
- Strength: plain, second-person copy throughout. "Your checkmarks, ratings and notes save to your account, so they follow you to any device." is the right promise for Jeffrey's laptop and phone use.

### 3. User control and freedom: 2/5
- **[Sev 3] Your own name is a Log out button.** "Jeffrey Dela Cruz · Log out" is a single `.btn--quiet` styled like a link. Clicking the name, the usual way to reach your account, ends the session at once. On phones the button sits right beside Search. Evidence: `09-signed-in-topbar-1360-light.png`, `09-signed-in-topbar-390-light.png`, reproduced (one click → `17-after-logout-1360-light.png`). Fix: make the name a DS **Menu** trigger. The menu shows name + email as a header, then "Log out" as the last item. The DS forbids `confirm()`, and the menu provides the second step that prevents accidents. Benchmarks: Laravel Cloud and Grok (References).
- **[Sev 3] No escape from a forgotten password.** See #9.
- Strength: switching Log in ⇄ Create keeps what you typed. Email and password carry over, so picking the wrong mode costs nothing (`14-…` keeps both).

### 4. Consistency and standards (design system): 3/5
- **[Sev 2] Errors are orange.** `.auth__error { color: var(--now-ink) }` (#a8400a light / #ff9b62 dark). The DS says orange is "now / next only… never for warnings". Real problems use **warn** (amber), and the screen already has an orange brand chevron. Evidence: `04-login-bad-email-1360-light.png`, `03-register-submit-empty-390-dark.png`. Fix: `warn` text plus an inline 16px warning icon; `warn` still passes (6.85:1 light, 9.25:1 dark, measured).
- **[Sev 2] Loading doesn't follow the DS Button.** The DS says "Loading: `aria-busy="true"` hides the label behind a 16px spinner without changing the width". AuthPage sets `disabled` and swaps the label instead. That greys the button out and is what drops focus to `<body>` (#9). Fix: `aria-busy` + `aria-disabled`, ignore repeat submits in `submit()`.
- **[Sev 2] Phone button height drifts from the DS.** The DS says `.btn--lg` 44px is for "every button on phones". The auth submit is 40px tall at 390 (measured) and the account button is 40px. Fix: `.auth__submit` uses `.btn--lg`; `.account-btn` is 44px on phones.
- **[Sev 1] Input focus ring drifts.** Inputs use `outline: 2px solid var(--teal); outline-offset: 1px`. The DS says "a solid 2px `focus` ring at a 2px offset". Measured: `solid 2px rgb(27,107,109) offset 1px`. Fix: drop the override and let `:focus-visible` in `01-base.css` apply.
- **[Sev 1] The confirmation notice uses the Banner fill.** `.auth__notice` is `teal-soft`. The DS Banner card reserves `teal-soft` for offers with actions and uses `.notice` (`surface-2` + info icon) for plain information. Evidence: `14-register-confirm-email-notice-390-light.png`.
- **[Sev 1] The pattern isn't in the design system.** `12-auth.css` says "New pattern: add an 'Auth form' card to the design system", but `design-system/components/` has no Input/TextField or Auth card. Fix: add a TextField (label, hint, error, states) and an AuthForm card, per `HOW-TO-UPDATE.md`.
- Strength: everything else is built from tokens. `r-panel`, `shadow-raise`, `surface-raised` for the card, `control` borders on inputs (3.44:1 light, 3.56:1 dark, above the 3:1 floor), teal primary, `teal-strong` links, and sentence case everywhere.

### 5. Error prevention: 2/5
- **[Sev 2] No show-password toggle.** The masked field is the only way to check a typo, and that's hardest on a phone keyboard. Evidence: every log-in screenshot. Fix: a 44px "Show" text button inside the field (`aria-pressed`, switches `type`), as in ChatGPT, Tana and PlanetScale (References).
- **[Sev 2] No Caps Lock warning.** Typing "WRONGPASS" with Caps Lock on shows nothing (`12-…`). Fix: on `keydown`/`keyup` in the password field, check `e.getModifierState('CapsLock')` and show a `muted` hint "Caps Lock is on" under the field.
- **[Sev 1] Errors only appear after submit, and email hints are generic.** "jeff.delacruz@gmail" gets "Enter a valid email address." (`04-…`) without saying what's missing. Fix: validate a field on blur once it has been touched, and say what's wrong ("Add the end of the address, like .com").
- **[Sev 1] Mode switch moves the primary button under the pointer** (Task 1, step 2). Fix: anchor the card to the top (`place-content: start center` with a fixed top offset) so it grows downward.

### 6. Recognition rather than recall: 4/5
- **[Sev 1] The email is forgotten after logout** (`17-…`), so a student on a shared computer has to recall which address they used. Fix: keep the last email (not the password) in localStorage and pre-fill it, with a "Not you?" link that clears it.
- **[Sev 1] The tab title is always "Eagle Learning Hub."** Fix: "Log in · Eagle Learning Hub" / "Create your account · Eagle Learning Hub".
- Strength: the password rule is visible before typing, not revealed by an error.

### 7. Flexibility and efficiency of use: 4/5
- **[Sev 1] Create account has no URL.** The hash stays `#today` in both modes, so an instructor can't post "make your account here" in Slack, and Back doesn't undo a mode switch. Fix: `#login` / `#register`, keeping any deep link in a `next` value.
- **[Sev 1] No autofocus on desktop.** Measured `activeElement = body` on load. Fix: focus Email on load at ≥900px only, to avoid popping the phone keyboard.
- Strengths: correct `autocomplete` tokens (`name`, `email`, `current-password`, `new-password`), Enter submits, repeat Enter while busy sends 1 request, and deep links survive login.

### 8. Aesthetic and minimalist design: 4/5
- **[Sev 1] Phantom vertical scroll.** The page scrolls 104px at 1360×900, 116px at 390×844 and 116px at 320×568 (measured) even though the card fits. Cause: `.auth { min-height: 100dvh }` inside `main.page`, which keeps its 72/96px bottom padding for a tab bar that isn't shown here. Fix: `main:has(.auth) { padding: 0 }` or `min-height: calc(100dvh - …)`.
- **[Sev 1] Errors push the button down.** A two-line error moves Log in 30px (`08-login-offline-390-light.png`). Fix: once errors move under fields (#9) this mostly goes away; reserve space for the form-level summary at the top.
- Strengths: one primary action, generous spacing on the 400px card, a brand mark that matches the top bar, and dark mode that keeps depth with the ring and `surface-raised` (`01-login-empty-1360-dark.png`). It fits the hub's quiet "ledger" voice. For a premium feel, the next step is craft (states, motion on mode switch, error shapes), not more decoration.

### 9. Help users recognize, diagnose, and recover from errors: 2/5
- **[Sev 3] No password recovery.** There's no "Forgot password?" link, flow or help line. A student who forgets their password is locked out until someone resets them in the Supabase dashboard. Evidence: `06-login-wrong-password-1360-light.png`, Task 3. Fix: a "Forgot password?" link next to the Password label that opens a one-field "Email me a reset link" state (`supabase.auth.resetPasswordForEmail`), then a "Set a new password" screen on the `PASSWORD_RECOVERY` event. Benchmarks: Tana, ChatGPT, Calendly.
- **[Sev 2] Errors aren't tied to their fields, and only the first one shows.** One `<p role="alert">` always sits under the password field, even for name or email problems. Fields get no `aria-invalid`, no `aria-describedby` and no red/amber border. An empty Create form takes three submits to find three problems. Evidence: `03-…`, `04-…`, `05-…`, aria snapshot. Fix: `authFormError` returns `{ field: message }` for every field. Render each message under its input with `id`, `aria-describedby` and `aria-invalid`, then focus the first invalid field. Server errors ("Wrong email or password.") stay as one alert at the top of the card. Benchmarks: Loops, Hootsuite.
- **[Sev 2] Focus is dropped to `<body>` after a clicked submit, the sign-up notice and logout.** Measured on `06-…`, `14-…`, `17-…`. This breaks the DS craft rule "no focus dropped on `<body>`". Fix: don't `disabled` the focused button (#4). After a server error, focus the password field and select its text. After a mode switch or notice, focus the `h1` (`tabIndex={-1}`).
- **[Sev 2] "Log in instead" isn't something you can do.** The message tells you to switch, but the form stays on Create (`15-…`). Fix: put a "Log in with this email" button in the message that switches mode and keeps the email.
- **[Sev 2] A failed logout is silent and leaves data behind.** Reproduced offline: the UI looks logged out (`18-…`), the page throws an uncaught "Failed to fetch", and `eagle-hub:v1:<id>` stays in localStorage. Cause: `logOut` in `lib/auth.js` throws before `forgetLocalData`, and `TopBar` doesn't catch it. Fix: always clear local data (`finally`), catch the error, and toast "Logged out on this device. We couldn't reach the server, so other devices stay logged in."
- **[Sev 1] The catch-all error blames the connection** ("Something went wrong. Check your connection and try again.") even for server-side failures. Fix: show that text only when `navigator.onLine === false` or the fetch failed; otherwise use "The sign-in service didn't answer. Try again in a minute."
- Strength: messages say what to do, don't apologize, and don't reveal which emails have accounts. The rate-limit copy is good: "Too many tries. Wait a minute and try again." (`16-…`).

### 10. Help and documentation: 2/5
- **[Sev 2] No help anywhere.** There's no "Trouble logging in?" line and nothing says who to ask. For this cohort the answer is concrete: `#eagle_questions` on Slack, or Jeffrey. Fix: a `muted` footer line under the card: "Trouble logging in? Ask in #eagle_questions."
- **[Sev 1] Nothing says what an account is for on the Log in side**, or that progress saved before accounts existed won't carry over. Fix: one sentence in the help line or the Create lede.

## Accessibility & quality floor

| Check | Result | Evidence |
|---|---|---|
| Text contrast AA | ✅ All pass | Light: labels/lede 10.79, link 8.28, error 6.17, button 6.23, busy label 4.97. Dark: labels 10.48, link 9.56, error 7.86, button 7.12, busy 6.20 (:1) |
| Control contrast 3:1 | ✅ Inputs pass. Busy button shape ❌ | Input border 3.44 light / 3.56 dark. Busy button bg vs card 1.16 / 1.04 |
| Visible focus | ✅ (drift from DS token/offset) | `10-…`, `11-…`. Inputs `teal`, offset 1px vs DS `focus`, 2px |
| Focus management | ❌ | `<body>` after clicked submit, after the sign-up notice, after logout |
| Touch targets ≥44px at 390 | ❌ | Submit 310×40, "Create an account" 120×34, "Log in" switch 42×34, top-bar Log out 60×40. Inputs 310×44 ✅ |
| Labels / names | ✅ | Wrapping `<label>`; aria snapshot names "Email", "Password" |
| Error association | ❌ | No `aria-invalid` / `aria-describedby`; identical repeat error not re-announced |
| Status announcements | ⚠️ | Errors `role="alert"` ✅, notice `role="status"` ✅, busy silent ❌ |
| `autocomplete` | ✅ | `name`, `email`, `current-password`, `new-password` |
| Password visibility / Caps Lock | ❌ / ❌ | None |
| Input font ≥16px on phone | ❌ | 15px, so iOS zooms on focus (platform behavior, not reproducible in Chromium) |
| No horizontal scroll (320/390) | ✅ | 0px at 320, 390 and 1360 |
| Phantom vertical scroll | ⚠️ | +104–116px |
| `prefers-reduced-motion` | ✅ n/a | Auth screen has no motion |
| Page title / `lang` | ⚠️ / ✅ | Title static; `lang="en"` |
| Line length | ✅ | Lede wraps around 50 characters at 400px |
| Console | ⚠️ | A 404 on first load: no favicon in `dist/` and no `<link rel="icon">` |

## Prioritized fix list

| Priority | Fix | Heuristics | Severity | Effort (S/M/L) |
|---|---|---|---|---|
| 1 | Add "Forgot password?" next to the Password label → "Email me a reset link" → "Set a new password" on `PASSWORD_RECOVERY` | 9, 3, 10 | 3 | M |
| 2 | Turn "Name · Log out" into a DS Menu: initials button (44px on phones) → header with name + email, "Log out" last; toast after logout | 3, 5, 1, 4 | 3 | M |
| 3 | Make logout robust: always clear local data (`finally`), catch the error, toast what happened | 9 | 2 | S |
| 4 | Per-field validation: all errors at once, under each input, `aria-invalid` + `aria-describedby`, focus first invalid; server errors as one alert at the top; re-announce repeats | 9, 5 | 2 | M |
| 5 | Busy state per the DS Button: `aria-busy` + spinner, keep teal, no `disabled`, "Logging in…"; keep focus where it was | 1, 4, 9 | 2 | S |
| 6 | Error color: `warn` + icon instead of orange `now-ink` | 4 | 2 | S |
| 7 | Show-password toggle and Caps Lock hint | 5 | 2 | S |
| 8 | Phone sizing: submit `.btn--lg` (44px), switch link `min-height: 44px`, inputs 16px below 900px | 4, floor | 2 | S |
| 9 | "Log in with this email" action inside the "already has an account" error | 9 | 2 | S |
| 10 | Mode switch: focus the `h1`, set `document.title`, use `#login` / `#register` hashes | 6, 7, floor | 2 | S |
| 11 | Help line: "Trouble logging in? Ask in #eagle_questions." plus a one-line product context under the brand | 10, 2 | 2 | S |
| 12 | Design system: add TextField + AuthForm cards; notice uses `.notice` (`surface-2` + info icon); inputs use the global focus ring | 4 | 1 | M |
| 13 | Polish: top-anchor the card (no jump on mode switch), remove phantom scroll, remember last email, add favicon, autofocus Email on desktop | 8, 6, 7 | 1 | S |

## References

- [Tana: sign in with error](https://mobbin.com/screens/b27499c8-03d4-4894-a25d-4d7f5c6630b6): borrow the server error as an icon + tinted alert **at the top of the card**, "Forgot your password?" right-aligned on the Password label row, and the eye toggle inside the field.
- [ChatGPT: enter password, wrong password](https://mobbin.com/screens/cb356d6b-8b8b-43fc-b11f-18d56a5f61d6): borrow the field-level error (border + icon + message right under the field), the show-password eye, and "Forgot password?" placed right where the failure happens.
- [Calendly: recovery email sent](https://mobbin.com/screens/c5b09a03-1415-4325-95fa-138af5c1bf03): borrow the recovery link written as a sentence ("I forgot my password. Send me a recovery email.") and the confirmation that names the inbox. The hub's sign-up notice already does this; reuse it for reset.
- [Loops: sign up with every invalid field flagged](https://mobbin.com/screens/b9afa64a-5724-45bf-83ee-b1d5726823ee): borrow showing **all** problems at once, each under its own field, on a quiet card close to the hub's.
- [Hootsuite: create account, name error](https://mobbin.com/screens/bec776e6-7393-4112-881d-7212bf7cc805): borrow the icon + text error under the field and the password rule shown as a checklist before typing.
- [Laravel Cloud: account menu](https://mobbin.com/screens/a7e6e8fb-309d-4fdd-b3c3-8658be5a7f52): borrow the initials button → menu with name + email header, then Account / Help, with **Sign out last**. This is the right shape for the hub's DS Menu.
- [Grok: account menu](https://mobbin.com/screens/0a385c2f-c64e-428e-9f96-1242851a5910): borrow the logout set apart at the bottom under a divider, so it's never the first thing you hit.

## Test accounts

**None were created.** Every sign-up request (including the `hubtest+audit-1@example.com` shown in `14-register-confirm-email-notice-390-light.png`) was intercepted by a Playwright route mock and never reached Supabase. The only real Supabase calls were log-in attempts with the made-up `nobody.audit.20261022@example.com`, which return `invalid_credentials` and store nothing. Nothing to delete.

Note: `front-end/dist` was built at 15:31 and `AuthPage.jsx` was last saved at 15:32. Every string and behavior checked matches the bundle, but rebuild before the "after" review.
