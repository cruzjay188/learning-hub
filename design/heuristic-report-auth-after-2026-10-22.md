# Heuristic review (after): Log in / Create an account (2026-10-22)

> [!summary] Verdict: the redesign worked. This now reads as a sign-in flow a product designer built, not a student form.
> Average score went from **3.0 to 4.1**. Of the 35 "before" findings, **24 are fixed, 3 are partly fixed, 7 are still open (3 of those are the same forgotten-password gap, seen under H3, H9 and H10) and 1 was dropped by design**. Errors sit under their fields in amber, all at once. The busy state follows the design system. Show/Hide, Caps Lock and the password rule all work. Logging out is now a menu, and a logout with no internet still wipes this computer's copy.
> **Still open:** (1) **a forgotten password is a dead end** and the page doesn't say who to ask (Sev 3; reset was put off on purpose, so the quick fix is a help line). (2) Phones still get **116px of phantom scroll and a doubled 36px side margin** (Sev 1). (3) Small gaps between the URL and the mode, focus after log in, and copy (Sev 1).
> **Top strength:** focus management. After every error, switch, notice and logout, the cursor lands where the next keystroke belongs (measured in all 12 cases).

Scope: `views/AuthPage.jsx`, `components/Field.jsx`, `components/AccountMenu.jsx`, `lib/auth.js`, `utils/authUtils.js`, `styles/03-page.css` (`.field`), `styles/12-auth.css`, checked against `design/design-brief-auth.md`, `design-system/README.md` and the new `Field` / `AuthForm` cards.
Method: production build `front-end/dist` (built 16:31, matching the latest source save), served by `qa/serve.py` on :4180, in Playwright's Chromium at 1360×900, 390×844 and 320×568, light and dark. `qa/shoot.mjs` was used for the base views. A scratch script (same browser, same launch code) handled multi-step states and measurements. **Real Supabase calls:** sign-up, log in, log out, wrong password, "email already exists". **Mocked:** busy (token call delayed 3s), rate limit (429), server error (500) and Check your email ("Confirm email" is off). Offline used Playwright's `setOffline`. Screenshots are in `design/screens/auth-after/` (62 files), and I looked at each one.

## Scorecard

| # | Heuristic | Before | After | Worst sev (after) | What changed |
|---|---|---|---|---|---|
| 1 | Visibility of system status | 3 | **5** | 1 | Real busy state, "You're logged out" note, avatar + menu shows who you are on phones |
| 2 | Match with the real world | 4 | **4** | 1 | "One moment…" gone. Still no product line; the "Shown in the top bar" hint isn't true on phones |
| 3 | User control and freedom | 2 | **4** | 1 | Logout is a menu (Esc and click-outside close it). Mode switch and Back are still out of sync |
| 4 | Consistency and standards (incl. DS) | 3 | **4** | 1 | Amber errors, DS loading, 44/48px phone targets, global focus ring, Field + AuthForm cards added. Note fill and phone gutter drift |
| 5 | Error prevention | 2 | **5** | 0 | Show/Hide, Caps Lock hint, live rule check, blur validation, no layout jump |
| 6 | Recognition rather than recall | 4 | **5** | 0 | Tab title per mode; rule visible before typing |
| 7 | Flexibility and efficiency | 4 | **4** | 1 | `#register` deep link, desktop autofocus. Switching modes doesn't update the URL |
| 8 | Aesthetic and minimalist design | 4 | **4** | 1 | Card no longer jumps. Phantom scroll remains; address breaks at a hyphen |
| 9 | Recognize, diagnose, recover from errors | 2 | **3** | **3** | Field errors, banner, "Log in instead", safe offline logout all fixed. **No password recovery path** |
| 10 | Help and documentation | 2 | **3** | 2 | Spam-folder hint, privacy line. Still nothing about who to ask |
| | **Average** | **3.0** | **4.1** | | |

## Before → after: status of every "before" finding

| # | Before finding (sev) | Status | Evidence |
|---|---|---|---|
| H1 | Busy state vague and silent (2) | ✅ Fixed | `07-login-busy-button-zoom-1360-light.png`: still teal `rgb(27,107,109)`, `aria-busy="true"`, not `disabled`, width 336 → 336. Spinner opacity 0 at 60ms and 1 at 560ms (no flash). sr-only status "Logging in" |
| H1 | Phone hides who is signed in (2) | ✅ Fixed | `09-signed-in-topbar-390-dark.png`: 44×44 initial button. `21-account-menu-open-390-light.png`: name + email header |
| H1 | No feedback after logout (1) | ✅ Fixed | `17-after-logout-note-1360-light.png`: teal note, `role="status"`, focus on Email. Gone after reload (one-time, measured) |
| H2 | "One moment…" (1) | ✅ Fixed | Spinner + "Logging in" / "Creating your account" for screen readers |
| H2 | Page never says what it's for (1) | ❌ Open | `01-login-empty-1360-light.png`: still "Eagle Learning Hub / Log in / Pick up where you left off." |
| H3 | Your name is a one-tap Log out (3) | ✅ Fixed | `21-account-menu-open-1360-light.png`. Click → menu, focus on "Log out". Esc closes and returns focus to the button. Click outside closes it |
| H3 | No escape from a forgotten password (3) | ❌ Open (deferred on purpose) | See H9 |
| H4 | Errors are orange (2) | ✅ Fixed | `03-register-all-errors-1360-light.png`: `warn` text, `warn-mark` edge + icon. On these screens orange appears only in the brand chevron |
| H4 | Loading doesn't follow DS Button (2) | ✅ Fixed | As H1 |
| H4 | Phone button height drifts (2) | ✅ Fixed | At 390: submit 318×48, switch 157×44, account button 44×44, Log out item 232×44 |
| H4 | Input focus ring drifts (1) | ✅ Fixed | Measured `solid 2px rgb(18,87,90) offset 2px` = global `--focus` ring |
| H4 | Confirmation notice uses Banner fill (1) | ⚠️ Partly | Now documented in the AuthForm card, but the Banner card still says plain information uses `.notice` (`surface-2`). The two cards disagree |
| H4 | Pattern not in the DS (1) | ✅ Fixed | `design-system/components/Field/`, `AuthForm/`; README lists them, Motion table has the rows, Warn covers form errors |
| H5 | No show-password (2) | ✅ Fixed | `13-show-password-390-dark.png`. Caret kept (typed "X" at position 6 → `hunterX22`). Focus stays in the field. `aria-pressed`, Space toggles |
| H5 | No Caps Lock warning (2) | ✅ Fixed | `12-caps-lock-hint-1360-light.png`, `…-390-dark.png`. Hides on blur. *Triggered with a synthetic `keydown` with `modifierCapsLock: true`; headless Chromium doesn't toggle a real Caps Lock state* |
| H5 | Errors only after submit, generic email hint (1) | ✅ Fixed | `04-login-bad-email-blur-390-light.png`: on blur, "Enter an email address like name@example.com." An empty field left alone shows nothing (measured 0) |
| H5 | Mode switch moves the button under the pointer (1) | ✅ Fixed | Brand `[593,140]` and h1 `[512,224]` are identical before and after. Submit moves 498 → 660, away from the click at y≈602 |
| H6 | Email forgotten after logout (1) | ➖ Dropped by design | The brief keeps Email empty for shared lab computers. That's a fair trade-off |
| H6 | Static tab title (1) | ✅ Fixed | "Log in · …", "Create an account · …", "Check your email · …" |
| H7 | No `#register` URL (1) | ⚠️ Partly | Opening `#register` works. Switching modes leaves the hash alone (new finding N1) |
| H7 | No autofocus on desktop (1) | ✅ Fixed | `activeElement = #auth-email` on load (`pointer: fine`) |
| H8 | Phantom vertical scroll (1) | ❌ Open | Measured scrollHeight 1004/900 (+104) at 1360, 960/844 (+116) at 390, 694/568 (+126) at 320. `main.page` still adds `20px 16px 96px` padding |
| H8 | Errors push the button down (1) | ✅ Fixed (by design) | The card is top-anchored and grows downward only, so nothing above the error moves |
| H9 | No password recovery (3) | ❌ **Open, Sev 3** | No "forgot / reset / recover" text anywhere (measured), as the brief asked. But there is no help line either, so a locked-out student has no path |
| H9 | Errors not tied to fields, one at a time (2) | ✅ Fixed | aria snapshot: `textbox "Name" [invalid]` + "Enter your name.", the same for Email and Password, all three at once. Focus goes to the first invalid field |
| H9 | Focus dropped to `<body>` (2) | ✅ Fixed in the form | Wrong password → Password with its text selected `[0,9]`. Exists → "Log in instead". Check email → h1. Logout → Email. *After a successful log in, focus is on `<body>` (N2)* |
| H9 | "Log in instead" not actionable (2) | ✅ Fixed | `15-register-email-exists-1360-light.png` → `15b-login-instead-…`: switches mode, keeps email + password, focuses Log in |
| H9 | Failed logout silent, data left behind (2) | ✅ Fixed | Offline: `eagle-hub:v1:<id>` and the `sb-…-auth-token` are removed (keys before/after). Note "You're logged out on this computer." (`18-logout-offline-note-390-light.png`). No page error |
| H9 | Catch-all blames the connection (1) | ❌ Open | A mocked 500 shows "Couldn't reach the hub's server. Check your connection and try again." (`16b-login-server-500-390-dark.png`), but the server *did* answer |
| H10 | No help anywhere (2) | ❌ Open | See H9 |
| H10 | Log in side doesn't say what an account is for (1) | ⚠️ Partly | The Create lede says it ("Only you can see them"). Log in doesn't |
| Floor | Input font 15px → iOS zoom | ✅ Fixed | 16px below 900px (measured) |
| Floor | Repeat error not re-announced | ✅ Fixed | The retry replaces the alert node (`sameNode = false`) |
| Floor | Busy not announced | ✅ Fixed | `role="status"` "Logging in" |
| Floor | Favicon 404 | ❌ Open | Console 404 on every load; no `<link rel="icon">` |

## Task walkthroughs

### Task 1: A new student creates an account ✅
1. Lands on Log in. "New to the hub? **Create an account**" is now a real 132×32 button (157×44 on phones) in a footer row (`01-login-empty-1360-light.png`).
2. Clicks it. The card stays put and grows downward. Focus lands in **Name**, the email and password typed so far are kept, and the tab title changes (`11-switch-to-register-kept-values-1360-light.png`). Mid-transition the content cross-fades with no jump (`11-switch-mid-transition-1360-light.png`).
3. Submits empty: **all three errors at once**, each under its field with an amber edge and icon, and focus on Name (`03-register-all-errors-1360-light.png`, `…-390-dark.png`). Typing in Name clears its error right away.
4. Types a short password: the rule line becomes "Use at least 6 characters." At 6 characters it turns into a teal check with "done" for screen readers (`05b-register-rule-met-390-dark.png`).
5. Creates the account and lands on Today with the toast "Account created. Your progress now saves to it." (`20-after-register-toast-1360-light.png`). The `#register` hash becomes `#today`. *Hesitation:* focus is on `<body>`, not the Today title (N2).

### Task 2: A returning student logs in ✅
Email is autofocused on desktop. Enter submits. `autocomplete="username"` / `current-password` are set. A deep link to `#lecture-ai-8` survives the login (measured hash and title "Authentication · Eagle Learning Hub").

### Task 3: A student mistypes the password, then realizes they forgot it ⚠️
- Wrong password: an amber banner above the fields says "Wrong email or password. Check both and try again." Focus goes back to Password with the text selected, so retyping replaces it (`06-login-wrong-password-1360-light.png`, `…-1360-dark.png`, `…-390-light.png`). Show/Hide lets you check what you typed. Caps Lock is flagged.
- **Forgot it entirely: still a dead end.** Nothing on the page tells you what to do or who to ask. It's the one Sev 3 left.

### Task 4: A student logs in on a phone between classes ✅ (with polish left)
- 16px inputs (no iOS zoom), 48px fields and submit, 44px switch, and Show with a 56×44 hit area. No horizontal scroll at 390 or 320 (`01-login-empty-390-dark.png`, `19-login-empty-320-light.png`).
- At 320 the footer stacks, with the switch full width (`19-login-empty-320-light.png`).
- **Still** 116px of empty scroll on a 390×844 phone. The side margin is 36px (16 from `.page` + 20 from `.auth`), so fields are 318px wide at 390 and 248px at 320. The brief and the rest of the hub use one 16–20px gutter.

### Task 5: A keyboard-only user ✅
Tab order on Log in: Email → Password → Show → Log in → Create an account. On Create: Name → Email → Password → Show → Create account → Log in (measured). Every stop has the 2px ring (`10-keyboard-focus-show-toggle-1360-light.png`, `10c-keyboard-focus-switch-1360-light.png`). Enter on the switch moves focus to the first empty field: Name, or Password when Email is filled (`11b-keyboard-switch-from-*.png`). Enter pressed 4× while busy sent 0 extra requests. Hub shortcuts (⌘K, g t) do nothing while logged out (measured).

### Task 6: A screen-reader user ✅
After an empty submit the tree reads `textbox "Name" [invalid]` → "Enter your name." → "Shown in the top bar.", and the same for each field. Each input's `aria-describedby` lists the error first, then the hint or rule. The banner is `role="alert"` and re-fires on a retry. Busy and the logged-out note are `role="status"`. Check your email focuses its h1.

### Task 7: A student logs out (online and offline) ✅
Avatar/name → menu (name, email, a hairline, then Log out) → Log out. This lands on Log in with "You're logged out. Your progress is saved to your account." and focus in Email (`21-account-menu-open-1360-light.png` → `17-after-logout-note-1360-light.png`). **Offline**, it still logs out on this computer, removes the progress copy and the session token, and says so (`18-logout-offline-note-390-light.png`). The "Logging out…" label was never visible, because both online and offline logouts finished in under 150ms.

### Task 8: "That email already has an account" ✅
On Create, an existing email shows the banner with an inline **Log in instead** link-button, and focus goes to it (`15-register-email-exists-1360-light.png`, `…-390-dark.png`, 44px tall on phones). Activating it switches to Log in with email and password kept and focus on Log in (`15b-login-instead-*.png`). *Slip:* the URL still ends in `#register`, so a reload reopens Create (N1).

## Findings by heuristic (open and new only; fixed items are in the table above)

### 1. Visibility of system status: 5/5
- Strengths to keep: the busy button (same width, same teal, delayed spinner), the one-time logged-out note in two wordings (online/offline), and the avatar initial that tells phone users who they are.

### 2. Match between system and the real world: 4/5
- **[Sev 1] The Name hint "Shown in the top bar." isn't true on phones.** Below 900px the top bar shows only the initial "A" (`09-signed-in-topbar-390-dark.png`). Fix: "Shown on your account menu." or just "What classmates and instructors call you."
- **[Sev 1, carried] No product context on Log in.** Fix: one `muted` line under the brand, e.g. "Your Eagle Platoon course, steps and notes."

### 3. User control and freedom: 4/5
- **[Sev 1, new N1] The URL and the mode drift apart.** Switching to Create leaves `#today`. "Log in instead" leaves `#register` (measured), so a reload or a shared link reopens the wrong form, and Back doesn't undo a switch. Fix: in `switchMode`, `history.replaceState(null, '', next === 'register' ? '#register' : '#login')` (or `#today`), and let the existing success path rewrite it.
- **[Sev 1, new] Tab inside the account menu closes it and keeps focus on the account button** instead of moving on (`menu-tab`, measured). The WAI-ARIA menu-button pattern closes the menu and lets Tab continue. Fix: on Tab, `close(false)` without `preventDefault`.
- Strength: the menu is the right safety step without a `confirm()`. Keyboard users get Enter → Log out → Enter, which is deliberate, not accidental.

### 4. Consistency and standards (design system): 4/5
- **[Sev 1, partly fixed] Two DS cards disagree about the logged-out note.** `AuthForm` says `.auth__note` = `teal-soft`. `Banner` says `teal-soft` is for offers *with actions* and plain information uses `.notice` (`surface-2` + info icon). Evidence: `17-after-logout-note-1360-light.png`. Fix: pick one. Either use `.notice` here, or amend the Banner card to say "teal-soft also for a one-time confirmation on the auth card".
- **[Sev 1, new] Phone gutter is doubled.** Measured fields at x=36 on 390 and 320 (16px `.page` + 20px `.auth`). The DS says phones use a `space-4` gutter, and the brief asked for 20. Fix: `main.page:has(> .auth) { padding: 0 }`. That also removes the phantom scroll (H8).
- **[Sev 1, new] The in-field Show button's focus ring collides with the input's right border** (`10-keyboard-focus-show-toggle-1360-light.png`: the 2px ring at a 2px offset sits on the input edge). Fix: `.field__toggle:focus-visible { outline-offset: -2px }`. Inset rings are the usual exception for controls inside a field.
- Strengths: every color on these screens is a token. Orange appears only in the brand mark, so the "orange = now/next" rule holds. Amber means a problem, teal means action and done. Field and AuthForm cards exist, with motion rows in the README.

### 5. Error prevention: 5/5
- Strengths: validate on blur, never on an untouched empty field, clear on the fixing keystroke. Show/Hide keeps the caret. Caps Lock hint in a polite live region. The rule check reads "done" for screen readers. `passwordrules` lets Safari generate a valid password.

### 6. Recognition rather than recall: 5/5
- Strength: the tab title names the state, and the password rule is visible before typing.

### 7. Flexibility and efficiency of use: 4/5
- **[Sev 1] Mode isn't in the URL after a switch.** See N1.
- Strengths: `#register` works as a Slack-able link, deep links survive login, autofocus is on desktop only (so phones don't pop the keyboard), and repeat Enter is safe.

### 8. Aesthetic and minimalist design: 4/5
- **[Sev 1, carried] Phantom vertical scroll:** +104 / +116 / +126px (1360 / 390 / 320). Same cause and fix as the gutter above.
- **[Sev 1, new] Check your email breaks the address at its hyphen:** "hubtest+audit- / mock@example.com" (`14-check-your-email-1360-light.png`, `…-390-dark.png`). Fix: `<b style="white-space:nowrap">` with `overflow-wrap:anywhere` only as a fallback for very long addresses. Or put the address on its own line.
- **[Sev 1, new] The "already has an account" banner wraps early** ("…has an / account. Log in instead") and leaves about 40% of the banner empty at 1360 (`15-register-email-exists-1360-light.png`). Cause: global `p { text-wrap: pretty }` keeping the inline button with "account.". Fix: `text-wrap: wrap` on `.auth__alert p`, or put the action on its own line at every width (as on phones).
- Strengths: a calm card, one primary action, a hairline footer. The mode switch glides instead of popping, and reduced motion switches instantly (measured: no `vt-auth` class).

### 9. Help users recognize, diagnose, and recover from errors: 3/5
- **[Sev 3, carried] A forgotten password has no way forward.** Password reset is deferred on purpose (no email service) and nothing points to a missing flow. That part is correct. But the page also gives no human fallback, and the "Log in instead" path makes it more likely: a student who forgot they already had an account is sent to Log in with the *new* password they just typed, gets "Wrong email or password", and stops there. Fix now (S): a `muted` line in the card footer or under Password, "Forgot your password? Ask in #eagle_questions and we'll send you a reset link." That turns a lockout into a 10-minute wait, and it points to a person, not a flow that doesn't exist. Then build reset per brief §11.1. Benchmark: [Mixpanel log in](https://mobbin.com/screens/79327bd4-3be5-4209-993f-e21516c111b5).
- **[Sev 1, carried] A server error is blamed on the connection.** Mocked 500 → "Couldn't reach the hub's server. Check your connection and try again." Fix: keep that copy for network failures (`TypeError: Failed to fetch` / `status === 0`). For a 5xx, use "The hub's server had a problem. Try again in a minute."
- **[Sev 1, new N2] Focus is on `<body>` after a successful log in or sign-up** (measured both times). The brief and DS say land on `#v-title`. Fix: after the hub's first paint, focus the Today h1 (`tabIndex=-1`), the same way `actions.js` already does for view changes.
- Strengths: field errors say what to type, not just what's wrong. The server banner says what to do next. Retries visibly re-announce. Offline is caught before any request ("You're offline. Connect to the internet, then try again.", `08-login-offline-390-light.png`). The rate limit reads well (`16-login-rate-limited-390-dark.png`).

### 10. Help and documentation: 3/5
- **[Sev 2, carried] Nothing says who to ask.** The same fix as H9's help line covers it. "Trouble logging in? Ask in #eagle_questions." is concrete for this cohort.
- Strengths: "Can't find it? Check your spam folder." on Check your email (`14-…`). "Only you can see them" on Create. The rule hint sits before the field is filled.

## Accessibility & quality floor

| Check | Result | Evidence |
|---|---|---|
| Text contrast AA | ✅ | Light: `warn` on card 6.85, `ink` on `warn-soft` 13.81, `ink` on `teal-soft` 12.91, `muted` hint 5.78, `teal-strong` toggle 8.28. Dark: 9.25 / 11.87 / 10.23 / 6.42 / 10.17 (:1) |
| Control / mark contrast 3:1 | ✅ | Input edge `control` 3.44 light / 3.78 dark. Invalid edge `warn-mark` 3.63 / 8.87. Busy button stays teal (was 1.16:1) |
| Visible focus | ✅ (one cosmetic collision) | Global ring measured. The Show toggle's ring overlaps the input edge (`10-keyboard-focus-show-toggle-1360-light.png`) |
| Focus management | ✅ in the form · ⚠️ after log in | 12 cases measured. `<body>` after a successful log in or sign-up |
| Touch targets ≥44px (390/320) | ✅ | Inputs 48, submit 48, switch 44, Show 56×44 hit area, "Log in instead" 44, "Create the account again" 44, account 44×44, Log out 44 |
| Labels / names / errors | ✅ | `<label for>`, `aria-invalid`, `aria-describedby` (error first), sr-only rule state |
| Status announcements | ✅ | `role="alert"` banner (re-fires), `role="status"` busy + note, polite Caps region |
| `autocomplete` | ✅ | `name`, `username` (+ `type=email`), `current-password` / `new-password`, `passwordrules` |
| Input font ≥16px on phone | ✅ | 16px measured at 390 and 320 |
| No horizontal scroll | ✅ | 0px at 320, 390, 1360 (signed out and signed in) |
| Phantom vertical scroll | ❌ | +104 / +116 / +126px |
| `prefers-reduced-motion` | ✅ | No view transition when reduced (measured) |
| Page title / `lang` | ✅ | Title per state |
| Console | ⚠️ | Favicon 404 on every load. The 400/422 errors are Supabase's expected answers to a wrong password or an existing email |

## Prioritized fix list

| Priority | Fix | Heuristics | Severity | Effort |
|---|---|---|---|---|
| 1 | Add a help line: "Forgot your password? Ask in #eagle_questions and we'll send you a reset link." (footer or under Password). Build reset later per brief §11.1 | 9, 10, 3 | **3** | S |
| 2 | `main.page:has(> .auth) { padding: 0 }`: removes the 104–126px phantom scroll and the doubled 36px phone gutter | 8, 4 | 1 | S |
| 3 | After a successful log in or sign-up, focus the Today `h1` (`#v-title`) | 9, floor | 1 | S |
| 4 | Keep the URL in step with the mode (`replaceState` to `#register` / `#login` in `switchMode`, including "Log in instead") | 3, 7 | 1 | S |
| 5 | Copy: Name hint → "Shown on your account menu."; a 5xx → "The hub's server had a problem. Try again in a minute."; a product line under the brand | 2, 9 | 1 | S |
| 6 | Check your email: don't break the address mid-word; the alert banner uses `text-wrap: wrap` | 8 | 1 | S |
| 7 | Settle the note fill in the DS (AuthForm vs Banner card) | 4 | 1 | S |
| 8 | Show toggle `:focus-visible { outline-offset: -2px }`; account menu: Tab closes and moves on | 4, 3 | 1 | S |
| 9 | Add a favicon (`<link rel="icon">` with the brand mark) | floor | 1 | S |

## References

- [Mixpanel: log in with help lines](https://mobbin.com/screens/79327bd4-3be5-4209-993f-e21516c111b5): borrow the two quiet sentences under the form, "Having trouble logging in? … If you need help contact support." This is the right interim shape for fix 1: a sentence that names a person or channel, in `muted`, below the footer row.
- [Link: log in with a quiet Help pill](https://mobbin.com/screens/eaa6e2b0-e89b-4457-950a-20ee4670bf0b): borrow keeping help out of the card entirely, as one small control under it. That way it never competes with "Log in".
- [Relume: log in with footer switch](https://mobbin.com/screens/6ddbe1d2-58b4-4084-995a-3c8c83698509): the hub's footer row already matches this. When reset ships, borrow "Forgot password?" right-aligned on the Password label row.
- Still valid from the "before" report: [Tana](https://mobbin.com/screens/b27499c8-03d4-4894-a25d-4d7f5c6630b6) and [Calendly](https://mobbin.com/screens/c5b09a03-1415-4325-95fa-138af5c1bf03) for the reset flow itself.

## Test accounts

| Email | How | State |
|---|---|---|
| `hubtest+audit-1@example.com` | **Real.** Created through `#register` ("Confirm email" is off, so it logged in at once). Used for the top bar, the menu, logout, offline logout, "already has an account" and the deep link | **Still in Supabase.** Deleting it needs a database query against the live project, and that command was blocked in this session. To remove only this one: `npx supabase db query --project-ref fhlxeswlqzdhkvtcbjym --linked "delete from auth.users where email = 'hubtest+audit-1@example.com'"` |
| `hubtest+audit-mock@example.com` | Mocked by a Playwright route for Check your email | Never reached Supabase |
| `nobody.audit.20261022@example.com` | Made-up address for wrong-password, busy, offline and rate-limit tests | No account exists; nothing stored |

No other accounts were touched. The server on :4180 was stopped afterwards.
