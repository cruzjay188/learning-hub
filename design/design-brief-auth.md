# Eagle Learning Hub: Log in and Create an account

**For:** the front-end engineer working on `learning-hub/front-end/` (React + Vite, plain CSS)
**Author:** ui-designer agent · Oct 22, 2026
**Files this touches:** `src/views/AuthPage.jsx`, `src/styles/12-auth.css`, `src/styles/03-page.css` (new shared `.field`), `src/utils/authUtils.js` (+ tests), `design-system/` (new AuthForm card)
**Read first:** `design-system/README.md` and `tokens.json`, `src/styles/01-base.css`, `design/design-brief-v3-premium.md` (tone and craft rules)

> [!summary] In one paragraph
> Keep the one quiet card under the logo. Anchor it to the top so switching modes never moves it. Show errors **next to the field they belong to**, in amber (`warn`), never orange. Show server errors in a small amber banner at the top of the form that tells you what to do next. Add a "Show" password toggle, a live "At least 6 characters" check, a Caps Lock hint and a real busy state. On phones the card goes away and the form sits on the page with 16px inputs, so iOS doesn't zoom. After you create an account you land straight on Today. There is no welcome screen, just a toast.

**Out of scope (flagged as later in §11):** password reset, resending the confirmation email, GitHub/Google sign-in, magic links, bringing progress saved in this browser before accounts existed into a new account.

---

## 0. What's there now (screenshots: desktop 1360 light, phone 390 dark)

What works, and what we keep: a single card under the brand mark, three fields at most, one teal primary button, plain copy ("Pick up where you left off."), `surface-raised` + `shadow-raise`, the right `autocomplete` values on the password field, and error messages that never say whether the email or the password was wrong.

What to fix:

1. **Errors are orange.** `.auth__error` uses `--now-ink`. Orange means *now / next* only. A form error is a real problem, so it should be `warn` (amber).
2. **Only one error shows at a time, and it isn't tied to a field.** `authFormError` returns only the first problem. It shows above the button with `role="alert"`, isn't linked to any input, and the field itself doesn't change. A screen-reader user hears the message but can't tell which field it means.
3. **The card is centred vertically.** "Create account" is about 100px taller than "Log in", so switching modes moves the title, the fields and the button. That breaks "keep the eye still".
4. **There's no password visibility toggle, no Caps Lock hint, and the rule sits in the label.** "Password (at least 6 characters)" puts a hint in the field's accessible name, so it gets read out on every focus.
5. **The busy state is weak.** "One moment…" plus `disabled` turns the button grey. That reads as "you can't do this", not "working on it". The design system already has `.btn[aria-busy]` with a spinner that keeps the button's width.
6. **Phones:** inputs are 15px, so iOS Safari zooms in when you focus one. The card's 24px padding inside a 16px gutter squeezes the fields.
7. **Off-token values:** the 28px title, 14px gaps, 28/24px padding, a 10px brand gap and a 1px focus offset aren't tokens. Use `display-sm`, `space-*` and the global focus ring.

---

## 1. Design principles for these two screens

1. **Two fields between you and Today.** A returning student types email and password and lands on Up next. Nothing else on the page asks for attention: no marketing, no illustrations, no "or continue with".
2. **The error sits where the fix is.** A field problem shows under that field. A server problem shows once, at the top of the form, and says what to do. Nothing is red, nothing shakes, and nothing says sorry.
3. **The form never jumps.** The card is anchored to the top. Switching modes, showing an error or going busy only adds height below, and focus always lands in the field you need next.
4. **Honest about privacy.** Never say which half of the login was wrong. Do tell students their progress is theirs ("Only you can see it"). Row-level security makes that true.
5. **Same hub, same tokens.** Teal is the action and "done" (the password check). Amber is the problem. Orange doesn't appear on these screens at all, except in the brand mark.

---

## 2. Research: what to borrow and what not to copy

| Surface | Borrow | From | Don't copy |
|---|---|---|---|
| Overall layout | Brand mark above a compact form, **anchored to the top** (not centred), with the "new here?" switch set apart from the form | [GitHub sign in](https://mobbin.com/screens/47b632f3-f178-479e-9669-9e1c7b6f52e1), [Height log in](https://mobbin.com/screens/4f3f26f9-526d-43eb-b5e0-42ff19212e11) | GitHub's green button and second boxed card. We use one card with a footer row |
| Mode switch | A footer row on a hairline: question on the left, a **secondary button** on the right (a real target, not a tiny link) | [Relume log in](https://mobbin.com/screens/8993959c-edfd-493b-bbbe-716010895cc8) | Segmented "Log in / Sign up" tabs ([Firecrawl](https://mobbin.com/screens/ddfdedcb-1a3c-4932-bd53-ceebecf62291), [Kit](https://mobbin.com/screens/b770dfd1-113c-40f2-b9d6-2845c0436c08)). See the decision in §4.4 |
| Create account | Exactly three fields (name, email, password) with nothing else on the form | [Ghost](https://mobbin.com/screens/da622210-897c-40c7-a1fd-ffc5314b9e8f), [Aboard](https://mobbin.com/screens/096b2694-c2d4-4ab1-afa5-0f274c27a281) | Terms checkboxes and newsletter opt-ins ([Rows](https://mobbin.com/screens/5e832a1f-b89c-4e0b-89ad-71612d1dc119)), first and last name split |
| Password rule | One quiet hint under the field that **turns into a check** when met | [Kraken](https://mobbin.com/screens/33b676f0-2710-45bb-826a-955bef431ce2), [Coinbase](https://mobbin.com/screens/29c5568f-49fd-471e-996a-bbe0d0d952b4), [Faire](https://mobbin.com/screens/9435af96-1fb6-46c7-9b67-3fd456ccc485) | Strength bars and four-rule lists ([Uvodo](https://mobbin.com/screens/def5adc4-4a05-4a8b-a234-66fbb4a1dcec), [Loom](https://mobbin.com/screens/389204de-eb10-45c0-a7ea-a609c63f582c)). We have one rule, so show one line |
| Show / hide | A **text** toggle, "Show" / "Hide", inside the right edge of the field | [The New York Times](https://mobbin.com/screens/15b41898-4c9a-4c12-b822-3667b0753f0f), [Wise](https://mobbin.com/screens/0ed9c325-1e3b-49a6-95ea-c8553696612d) | A lone eye icon. It's ambiguous ("is it shown now, or will it show?") |
| Field errors | The field's edge changes colour, and the message sits right under the field with an icon | [Webflow](https://mobbin.com/screens/6dedeb12-e86d-476a-a140-7537ef28c98f), [Skillshare](https://mobbin.com/screens/75a1cf21-07e4-4719-a332-7b8f2ab5a2eb) (its message also gives direction) | Red. Marking **both** fields invalid for one server error ([Uxcel](https://mobbin.com/screens/48cd19bb-5466-444d-92dc-6e95fd730497)) |
| Server error | A tinted banner at the top of the form with an icon. **Amber, not red**, and it can carry a link | [Tana](https://mobbin.com/screens/b27499c8-03d4-4894-a25d-4d7f5c6630b6), [Basecamp](https://mobbin.com/screens/fc4b09cc-c993-4de6-9504-a641640313bc) | An error under a greyed-out button ([Cloudflare](https://mobbin.com/screens/b9278f30-6fbc-443f-8379-6bfd0012dc9a)). A toast in the far corner, away from the form ([Bloom](https://mobbin.com/screens/627a008b-3d74-4783-b26a-63ed3a6a4eae)) |
| Check your email | It **replaces the form inside the same card**, shows the address in bold, keeps a way back, and adds a spam-folder hint | [Loops](https://mobbin.com/screens/af9e25a6-7b26-4685-b382-ead38ad551ad), [Clay](https://mobbin.com/screens/485165f6-9f54-4b79-a352-944f1c66bb40), [Gamma](https://mobbin.com/screens/e11baee7-6f23-411b-bd54-2343653c3ae8) | "Open Gmail / Outlook" buttons, "Congratulations!" ([Babbel](https://mobbin.com/screens/3d16987d-0446-42b4-b92b-6cf70cfd8f54)), illustrations, emoji |
| After sign-up | Nothing new. Land on Today; Up next and the existing catch-up banner do the onboarding. Borrow only the tone of a short, personal first line | [Basecamp welcome](https://mobbin.com/screens/c49b7f66-c644-4930-b74b-b7a13b7645e5) | Setup checklists and welcome dashboards ([Productboard](https://mobbin.com/screens/6ac03b69-2d30-49c7-a8e1-14c48a2d542f), [SchoolAI](https://mobbin.com/screens/875c7dee-41c0-499c-8c76-f6dbb969ba47)). They're the tile-grid trope the hub avoids |
| Phone | No card: a left-aligned title and full-width fields straight on the page, with the button right under the last field | [Betterment](https://mobbin.com/screens/5679673c-2cd2-493b-9b5c-600c64d1036e), [Kit iOS](https://mobbin.com/screens/55bd26f0-0750-46a4-92e2-75b99a002d45) | Buttons pinned to the bottom of the screen ([Centr](https://mobbin.com/screens/50e95024-f4fd-4fbc-8534-79a988c3f66c)). On the mobile web the keyboard covers them or makes them jump |
| Later idea | "You used email to log in last time" | [Linear](https://mobbin.com/screens/3997d60f-bea7-4068-af79-3942a664072e) | Not now: we only have one method |

---

## 3. Information architecture

Signed-out students see one view with three states. It isn't a router page: `App.jsx` shows `AuthPage` whenever `auth.status === 'signedOut'`.

| State | Reached by | Main action | Way out |
|---|---|---|---|
| **Log in** (default) | Opening the hub signed out; logging out; "Log in" in the footer; "Back to log in" | Log in → Today | "Create an account" |
| **Create account** | "Create an account"; a shared link ending in `#register` | Create account → Today (+ toast) | "Log in" |
| **Check your email** | Create account when Supabase "Confirm email" is on (it's off today) | None. The student opens their inbox | "Back to log in" (email filled in) |

- **Deep link:** if `location.hash === '#register'` on load, open in Create account. That lets Jeffrey paste `…#register` in `#eagle` for classmates. After a successful log in or sign-up, `history.replaceState(null, '', '#today')` so the hub doesn't try to route to "register".
- **Document title:** "Log in · Eagle Learning Hub", "Create an account · Eagle Learning Hub", "Check your email · Eagle Learning Hub".
- **Checking for a saved session** (`status === 'checking'`): keep today's Today skeleton. Most visitors are already logged in, so a skeleton (not a flash of the log-in form) is the right guess.
- **What carries across a mode switch:** the email always does. The password does too (a student who typed it on the wrong form shouldn't have to type it again). The name is kept in state but only shown on Create account. Field errors and the server banner clear.

---

## 4. Layout

### 4.1 Desktop, 1360 (light; dark uses the same layout)

The page is `bg`. The block is centred horizontally and anchored to the top at `clamp(40px, 12vh, 112px)`, with no vertical centring.

```
                                   ┌──┐
                                   │>>│ Eagle Learning Hub            ← brand row, panel-title, 28px mark
                                   └──┘
                                       │ space-6 (24)
        ┌──────────────────────────────────────────────┐  ← card 400 wide, surface-raised, r-panel, shadow-raise
        │                                              │     padding space-8 (32)
        │  Log in                                      │  ← h1 display-sm 26/30
        │  Pick up where you left off.                 │  ← body 15/24 ink-2
        │                                   space-6    │
        │ ┌──────────────────────────────────────────┐ │
        │ │ (!) Wrong email or password. Check both  │ │  ← server banner (only after an error)
        │ │     and try again.                       │ │     warn-soft, r-ctl, then space-4 gap
        │ └──────────────────────────────────────────┘ │
        │  Email                                       │  ← label meta 13/18 600 ink-2
        │ ┌──────────────────────────────────────────┐ │
        │ │ jeffrey@example.com                      │ │  ← input 44 tall, surface, 1px control
        │ └──────────────────────────────────────────┘ │
        │                                   space-4    │
        │  Password                                    │
        │ ┌──────────────────────────────────┬───────┐ │
        │ │ ••••••••••                       │ Show  │ │  ← quiet text toggle inside the field
        │ └──────────────────────────────────┴───────┘ │
        │  ⇪ Caps Lock is on.                          │  ← only while focused and Caps is on
        │                                   space-6    │
        │ ┌──────────────────────────────────────────┐ │
        │ │                 Log in                   │ │  ← btn btn--primary btn--lg, full width
        │ └──────────────────────────────────────────┘ │
        │ ─────────────────────────────────────────────│  ← 1px line-soft, margin-top space-6
        │  New to the hub?          [ Create an account ]│ ← muted 14 + btn btn--sm (secondary)
        └──────────────────────────────────────────────┘
```

**Create account**, same frame. The card grows **downward only**:

```
        ┌──────────────────────────────────────────────┐
        │  Create your account                         │
        │  Your checkmarks, ratings and notes save to  │
        │  your account. Only you can see them.        │
        │                                              │
        │  Name                                        │
        │ ┌──────────────────────────────────────────┐ │
        │ │ Jeffrey                                  │ │
        │ └──────────────────────────────────────────┘ │
        │  Shown in the top bar.                       │  ← hint, meta muted
        │  Email                                       │
        │ ┌──────────────────────────────────────────┐ │
        │ │ jeffrey@exmaple                          │ │  ← edge: warn-mark
        │ └──────────────────────────────────────────┘ │
        │  (!) Enter an email address like             │  ← field error, warn 13/18 500
        │      name@example.com.                       │
        │  Password                                    │
        │ ┌──────────────────────────────────┬───────┐ │
        │ │ ••••                             │ Show  │ │
        │ └──────────────────────────────────┴───────┘ │
        │  ○ At least 6 characters                     │  ← becomes a teal ✓ when met
        │                                              │
        │ ┌──────────────────────────────────────────┐ │
        │ │              Create account              │ │
        │ └──────────────────────────────────────────┘ │
        │ ─────────────────────────────────────────────│
        │  Already have an account?          [ Log in ]│
        └──────────────────────────────────────────────┘
```

**Check your email** replaces the card's body. The header and footer frame stay:

```
        ┌──────────────────────────────────────────────┐
        │  [envelope 20, teal]                         │
        │  Check your email                            │  ← h1 display-sm, takes focus
        │  We sent a link to jeffrey@example.com.      │  ← address in 600 ink
        │  Open it to confirm your account, then come  │
        │  back and log in.                            │
        │                                              │
        │ ┌──────────────────────────────────────────┐ │
        │ │              Back to log in              │ │  ← btn btn--lg (secondary), full width
        │ └──────────────────────────────────────────┘ │
        │  Can't find it? Check your spam folder.      │  ← meta muted
        │  Wrong address? Create the account again.    │  ← "Create the account again" = link-btn
        └──────────────────────────────────────────────┘
```

### 4.2 Phone, 390 (dark shown; light uses the same layout)

Under 600px the card **goes flat**: transparent background, no shadow, no side padding. The form sits on `bg` inside the page gutter. The brand row is left-aligned and the title is left-aligned. The button sits right under the last field and is never pinned to the bottom.

```
┌──────────────────────────────────┐ 390
│ [>>] Eagle Learning Hub          │  ← brand row, 48 tall, padding-inline space-5 (20)
│                                  │    space-6
│ Log in                           │  ← display-sm 26/30
│ Pick up where you left off.      │
│                                  │    space-6
│ Email                            │
│ ┌──────────────────────────────┐ │
│ │ jeffrey@example.com          │ │  ← 48 tall, font 16 (no iOS zoom)
│ └──────────────────────────────┘ │
│ Password                         │
│ ┌────────────────────────┬─────┐ │
│ │ ••••••••••             │Show │ │  ← toggle 40 tall + 44px hit area
│ └────────────────────────┴─────┘ │
│                                  │    space-6
│ ┌──────────────────────────────┐ │
│ │            Log in            │ │  ← btn--lg 44 → 48 on phone, full width
│ └──────────────────────────────┘ │
│ ──────────────────────────────── │  ← line-soft
│ New to the hub?                  │
│ ┌──────────────────────────────┐ │
│ │      Create an account       │ │  ← stacks under 380px; otherwise one row
│ └──────────────────────────────┘ │
│                                  │
│ (keyboard opens here: the form   │
│  scrolls; the button stays just  │
│  under the password field)       │
└──────────────────────────────────┘
```

- Gutter: `space-5` (20) plus `env(safe-area-inset-*)`, matching `.page`.
- Top padding: `space-4` (16), because the brand row acts as the top bar.
- When the keyboard opens, `scrollIntoView({block:'nearest'})` on focus is enough. Nothing is fixed.

### 4.3 Light and dark

Every value below is a token, so both themes come from `01-base.css`. Pairs checked (WCAG ratios):

| Pair | Light | Dark |
|---|---|---|
| `warn` text on `surface-raised` (field error) | 6.85 | 9.25 |
| `ink` on `warn-soft` (banner text) | 13.81 | 11.87 |
| `warn-mark` input edge on `surface` (non-text, needs 3:1) | 3.63 | 8.87 |
| `control` input edge on `surface` / `surface-raised` | 3.44 | 3.78 / 3.56 |
| `muted` hint on `surface-raised` | 5.78 | 6.42 |
| `teal` check icon on `surface-raised` | 6.23 | 6.82 |
| `teal-strong` Show toggle on `surface` | 8.28 | 9.56 |
| `on-teal` on `teal` (primary) | 6.23 | 7.12 |
| `ink` on `teal-soft` (notice) | 12.91 | 10.23 |

In dark mode the inputs use `surface` (#111c1f), a step **darker** than the card's `surface-raised` (#142226), so they read as recessed wells. That's correct; don't lift them.

### 4.4 Decision: link row, not segmented tabs

A segmented "Log in | Create account" control (Firecrawl, Kit, Bloom) would reuse `.segc` and give both modes equal weight. We don't do that, because:
- Ninety-nine visits out of a hundred are "Log in". Equal weight makes the common path compete with a once-only path ("one next action").
- Tabs above an `h1` that says the same thing is two labels for one state.
- The footer row (Relume, GitHub) keeps the switch reachable without crowding the form, and its secondary button is a real 44px target on phones. Today's inline text link is 32px.

---

## 5. Components and exact specs

New shared control: **Field** (`.field`, in `03-page.css`; the hub has no text-input component yet). Auth-only pieces live in `12-auth.css`.

### 5.1 Page and card

| Element | Spec |
|---|---|
| `.auth` | `display:grid; justify-items:center; align-content:start; gap: var(--space-6, 24px); padding-block: clamp(40px, 12vh, 112px) 48px; min-height: 100dvh` |
| `.auth__brand` | `display:flex; align-items:center; gap:8px` (`space-2`); mark 28×28 (the existing SVG at `viewBox 0 0 28 28`, `rx 7`); text `600 17px/22px var(--font-display)` (`panel-title`), `ink`. Not a link. |
| `.auth__card` | `width:min(400px,100%); display:grid; gap:0; padding:32px` (`space-8`); `background:var(--surface-raised); border-radius:var(--r-panel); box-shadow:var(--shadow-raise)` |
| `.auth__head` | `display:grid; gap:8px` (`space-2`); `margin-bottom:24px` (`space-6`) |
| `h1#auth-title` | `.display` at the `display-sm` size: `600 26px/30px var(--font-display); letter-spacing:-0.012em`, `ink`, `tabindex="-1"` (for programmatic focus), no outline when focused by script (`:focus:not(:focus-visible){outline:none}`) |
| `.auth__lede` | `body`: `400 15px/24px`, `ink-2`, `max-width: 34ch` |
| `.auth__fields` | `display:grid; gap:16px` (`space-4`) |
| `.auth__submit` | `btn btn--primary btn--lg`, `width:100%`, `margin-top:24px` (`space-6`) |
| `.auth__foot` | `margin-top:24px; padding-top:20px` (`space-6` / `space-5`); `box-shadow: inset 0 1px 0 var(--line-soft)` (a hairline that never shifts layout); `display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap`; text `14px/20px muted` |
| Footer button | `btn btn--sm` (secondary, 32px) on desktop; `btn--lg` 44px on phones |
| Under 600px | `.auth { justify-items:stretch; padding: 16px max(20px, env(safe-area-inset-right)) 40px max(20px, env(safe-area-inset-left)); gap: 24px }` · `.auth__brand { justify-content:flex-start; height:48px }` · `.auth__card { width:auto; padding:0; background:none; box-shadow:none; border-radius:0 }` |
| Under 380px | `.auth__foot { flex-direction:column; align-items:stretch }` and its button goes full width |

### 5.2 Field (`.field`)

Markup (one per input; ids are stable so password managers and tests can find them):

```html
<div class="field" data-invalid="true">
  <label class="field__label" for="auth-email">Email</label>
  <div class="field__control">
    <input id="auth-email" name="email" type="email" autocomplete="username"
           inputmode="email" autocapitalize="none" autocorrect="off" spellcheck="false"
           aria-invalid="true" aria-describedby="auth-email-err" />
  </div>
  <p class="field__msg field__msg--err" id="auth-email-err">
    <svg class="field__ico" …alert…/> Enter an email address like name@example.com.
  </p>
</div>
```

| Part | Spec |
|---|---|
| `.field` | `display:grid; gap:8px` (`space-2`) |
| `.field__label` | `600 13px/18px var(--font-body)` (`meta` size at 600), `ink-2`. Sentence case, no colon, no asterisk (every field is required, and the button says so by failing kindly) |
| `.field__control` | `position:relative` (holds the toggle) |
| `input` | `width:100%; height:44px; padding:0 12px` (`space-3`); `font:400 15px/1 var(--font-body)`; `color:var(--ink); background:var(--surface); border:1px solid var(--control); border-radius:var(--r-ctl)`; `transition: border-color 120ms var(--ease-out)`. **No placeholders**: labels do that job, and placeholder text looks like a value. |
| hover (`@media (hover:hover)`) | `border-color: var(--muted)` |
| focus | the global `:focus-visible` ring: `2px solid var(--focus)`, `outline-offset:2px`, `border-radius` inherits `r-ctl`. Delete the auth-only 1px-offset rule. |
| invalid `[aria-invalid="true"]` | `border-color: var(--warn-mark)`. The focus ring stays `focus` teal (focus is never amber). |
| read-only while busy | `cursor:progress`; nothing fades (fading reads as disabled) |
| autofill | `input:-webkit-autofill { -webkit-text-fill-color: var(--ink); -webkit-box-shadow: 0 0 0 40px var(--surface) inset; box-shadow: 0 0 0 40px var(--surface) inset; caret-color: var(--ink) }`. This stops Chrome's yellow/blue wash, which looks broken in dark mode. Put the `-webkit-` properties **before** the standard one (see the CSS gotcha in CLAUDE.md). |
| password input | `padding-right: 64px` to make room for the toggle |
| `.field__msg` | `display:flex; gap:8px; align-items:flex-start; font: 400 13px/18px var(--font-body); color: var(--muted)` |
| `.field__msg--err` | `color: var(--warn); font-weight:500`; icon `warn-mark` |
| `.field__ico` | 16×16 inline SVG, `flex:none; margin-top:1px`, `stroke-width:1.6`, round caps, `currentColor` or a token |
| Phone (<900px) | `input { height:48px; font-size:16px }` (16px stops iOS zoom on focus) |

### 5.3 Show / Hide password toggle (`.field__toggle`)

| | Spec |
|---|---|
| Element | `<button type="button" class="field__toggle" aria-controls="auth-password" aria-pressed="false">Show</button>` |
| Accessible name | Visible text "Show" / "Hide" plus `aria-label="Show password"` / `"Hide password"` |
| Position | `position:absolute; right:4px; top:4px; height:36px` (desktop; inside a 44px input); `padding:0 10px; border-radius:var(--r-item)` (8 − 4 inset ≈ 6, i.e. `r-item`) |
| Type | `600 13px/1 var(--font-body)`, `teal-strong` |
| Hover / press | the `.btn--quiet` tint: `color-mix(in srgb, var(--teal) 9%, transparent)` hover, 15% press, on `::before` opacity |
| Phone | `height:40px; top:4px` in a 48px input; `::after { content:""; position:absolute; inset:-2px -4px }` so the hit area is at least 44×44 |
| Behaviour | Switches `type` between `password` and `text`. **Keeps focus and caret position**: run `onMouseDown={e => e.preventDefault()}` so focus stays in the input when clicked, and restore `selectionStart/End` after the type change. Resets to hidden after a successful submit and on mode switch. |

### 5.4 Password rule check (Create account only)

`<p class="field__msg field__rule" id="auth-password-rule" data-met="false">`

| | Not met | Met |
|---|---|---|
| Icon (16) | open circle, `stroke: var(--control)` | teal disc with a white check: `fill: var(--teal)`, check `stroke: var(--on-teal)` |
| Text | "At least 6 characters", `muted` | the same words, `ink-2` |
| Screen reader | sr-only suffix ", not yet" | sr-only suffix ", done" |

- It updates on every keystroke (it's a hint, so live feedback is welcome).
- It is **not** an error. If the student submits with fewer than 6 characters, this line swaps to the error style (§6) with the error wording.
- The rule comes from `PASSWORD_MIN`. Never hard-code 6 in the JSX copy.

### 5.5 Caps Lock hint

- Reads `e.getModifierState('CapsLock')` on `keydown`/`keyup` in the **password** field only, and hides on blur.
- `.field__msg` (muted) with a 16px caps arrow icon: "Caps Lock is on."
- Order under the password field: error (if any) → Caps hint → rule.
- Put it in a polite live region (`aria-live="polite"` on a wrapper that's always rendered) so it's announced once when it appears.

### 5.6 Server banner (`.auth__alert`, the warn variant of Banner)

```html
<div class="auth__alert" role="alert" tabindex="-1" id="auth-alert">
  <svg class="field__ico" …alert…/>
  <p>That email already has an account. <button type="button" class="link-btn">Log in instead</button></p>
</div>
```

| | Spec |
|---|---|
| Box | `display:flex; gap:8px; align-items:flex-start; padding:12px 16px` (`space-3`/`space-4`); `border-radius:var(--r-ctl); background:var(--warn-soft); color:var(--ink); font:400 14px/20px var(--font-body); margin-bottom:16px` |
| Icon | 16px alert circle, `warn-mark` |
| Action inside | `.link-btn` (`teal-strong`, underlined on hover), `min-height:32px` desktop / 44px phone |
| Where | first child of `.auth__fields`, so it sits right above the first input |
| Teal notice variant (`.auth__note`) | the same box with `teal-soft` + a teal info icon and `role="status"`. Used for "You're logged out…" (§6) |

### 5.7 Primary button (busy)

Reuse the design system's loading pattern, which already lives in `03-page.css`:

```html
<button type="submit" class="btn btn--primary btn--lg auth__submit" aria-busy="true">
  <span>Log in</span>
  <svg class="spin" aria-hidden="true" …/>
</button>
<span class="sr-only" role="status">Logging in</span>
```

- **Not `disabled`** while busy: `disabled` turns it grey and drops focus. `aria-busy` + `pointer-events:none` already stop double submits; also guard `if (busy) return` in `submit`.
- The spinner fades in after a **150ms delay** (`transition: opacity 120ms var(--ease-out) 150ms`), so fast answers never flash it. The label hides at the same moment. The width never changes.
- Never disable the button for an invalid form. Pressing it is how the student finds out what's missing.

### 5.8 Icons (inline SVG, 16px grid, `stroke-width` 1.6, round caps and joins, `fill="none"` unless noted)

| Icon | Path (viewBox `0 0 16 16`) |
|---|---|
| alert | `<circle cx="8" cy="8" r="6.25"/><path d="M8 4.75v3.75"/><circle cx="8" cy="11" r=".9" fill="currentColor" stroke="none"/>` |
| rule (open) | `<circle cx="8" cy="8" r="6.25"/>` |
| rule (met) | `<circle cx="8" cy="8" r="7" fill="var(--teal)" stroke="none"/><path d="M5 8.2l2 2 4-4.2" stroke="var(--on-teal)"/>` |
| caps lock | `<path d="M8 2.75L3.25 7.5H5.5v3h5v-3h2.25z"/><path d="M5.5 13.25h5"/>` |
| info (logged-out note) | `<circle cx="8" cy="8" r="6.25"/><path d="M8 7.25v4"/><circle cx="8" cy="5" r=".9" fill="currentColor" stroke="none"/>` |
| envelope (20px, `viewBox 0 0 20 20`) | `<rect x="2.75" y="4.5" width="14.5" height="11" rx="2"/><path d="M3.5 5.5l6.5 5 6.5-5"/>` |

All icons are `aria-hidden="true"`. The words carry the meaning, so it never relies on colour alone.

---

## 6. States

Rule for timing (borrowed from "reward early, punish late"): **validate a field on blur and on submit. Clear its error the moment it becomes valid while typing.** Never show an error on a field the student hasn't left yet, except right after a submit.

| State | What the student sees | Focus | Announced |
|---|---|---|---|
| **Empty (first load)** | The Log in form, no messages. On desktop with `(pointer: fine)` the email field is autofocused; on touch it isn't (the keyboard would cover the page). | Email (desktop) / none (phone) | Page title, h1 |
| **Typing** | Nothing changes except the password rule check (Create account). Hover/focus edges as specced. | Stays | — |
| **Field left invalid (blur)** | Edge `warn-mark`, message under the field with the alert icon. Only if the field isn't empty; an empty field only complains on submit. | Moves on normally | Read when the field is next focused (via `aria-describedby`) |
| **Fixed while typing** | The error disappears on the keystroke that makes it valid; the edge goes back to `control`. | Stays | — |
| **Submit with problems** | **All** invalid fields show their messages at once. No banner. | The **first** invalid field | Its label + error (it's focused, so `aria-describedby` reads) |
| **Busy** | The button shows the spinner (after 150ms), fields are read-only, the footer button is `aria-disabled`, the Show toggle still works. | Stays on the button | sr-only status "Logging in" / "Creating your account" |
| **Server error (banner)** | An amber banner above the first field. The fields keep their values. | See the table below | `role="alert"` |
| **Server error on a field** | `email_address_invalid` → the email field error; `weak_password` → the password field error. No banner. | That field | Its error |
| **Same error again** | The banner text re-enters (the 160ms swap in §7), so a retry visibly registered. | As below | `role="alert"` re-fires (re-render the node with a `key` that changes) |
| **Show password** | Text visible, button reads "Hide", `aria-pressed="true"`. | Stays in the input, caret unchanged | "Hide password, toggle button, pressed" |
| **Caps Lock on** | Muted hint under the password field. | — | Once, politely |
| **Success: log in** | Nothing extra on this page. The hub replaces it and plays its normal **first paint** (4 pieces, 40ms apart). | The hub's usual landing focus (`#v-title` on Today) | The Today title |
| **Success: create account** | The same, plus a toast with a check icon: "Account created. Your progress now saves to it." | Today title | Toast text (the toast is already a live region) |
| **Check your email** | §4.1 frame; the form is gone. | `#auth-title` ("Check your email") | The h1, then the paragraph (put it in `aria-describedby` on the h1's region) |
| **Logged out** | The Log in form with a teal note above the fields: "You're logged out. Your progress is saved to your account." Email empty (shared-computer safety). | Email (desktop) | `role="status"` |
| **Offline (`navigator.onLine === false`) on submit** | The banner says "You're offline. Connect to the internet, then try again." Skip the request. | The submit button stays focused | `role="alert"` |

**Server banner focus rules** (keep the eye still):

| Supabase code | Banner copy | Focus goes to |
|---|---|---|
| `invalid_credentials` | Wrong email or password. Check both and try again. | Password field, **its text selected**, so retyping replaces it |
| `user_already_exists`, `email_exists` | That email already has an account. **Log in instead** (link-button: switches to Log in, keeps email and password, focuses the submit button) | The "Log in instead" button |
| `email_not_confirmed` | Confirm your email first. Open the link we sent to **{email}**, then log in. | Stays on submit |
| `over_request_rate_limit`, `over_email_send_rate_limit` | Too many tries. Wait a minute, then try again. | Stays on submit |
| default / network | Couldn't reach the hub's server. Check your connection and try again. | Stays on submit |

> [!warning] Privacy rule stays
> No message ever says "no account with that email" or "wrong password". "That email already has an account" on **Create account** is Supabase's own behaviour when "Confirm email" is off. It's a known trade-off for a class app, so keep it; it's already in `authUtils.js`. If "Confirm email" is turned on, Supabase hides this and the student lands on Check your email instead.

---

## 7. Motion

Follows the design system's Motion section: under 300ms, only `transform`, `opacity`, `clip-path` and SVG `stroke-dashoffset`, exits faster than entrances, never animate `box-shadow`, and `prefers-reduced-motion: reduce` turns all of it off. The global rule in `11-view-transitions.css` already covers CSS. In JS, skip `startViewTransition` when `reducedMotion()` is true.

| What | How | Time / curve | Why |
|---|---|---|---|
| Switch Log in ⇄ Create account | `document.startViewTransition(() => flushSync(() => setMode(m)))`. `view-transition-name: auth-card` on the card. The group glides to its new height; old content fades out with a 4px rise, new content fades in from 4px below. The Name field arrives with it. | old 120ms `--ease-out`, new 160ms `--ease-out`, group 220ms `--ease-in-out` | Shows that the same card changed, not that a new page loaded. The card is top-anchored, so only its bottom edge moves. |
| Field error appears | `opacity 0→1`, `translateY(-2px)→0` | 160ms `--ease-out`; leaves with 90ms opacity | Draws the eye to the line without moving the field |
| Input edge colour | `border-color` | 120ms `--ease-out` | Colour transitions are cheap and calm |
| Server banner appears | Toast-style: `opacity`, `translateY(4px)→0`, `filter: blur(2px)→none` | 220ms `--ease-out` | It arrives from the form, not from the screen edge |
| Same banner again | Text swap with a rise (the toast's `is-swapping` keyframes) | 160ms | Proves the retry happened |
| Rule met | Circle → teal disc: disc `scale(.7)→1` with `--spring-pop`, check draws (`stroke-dashoffset 1→0`) | disc 200ms, check 160ms +60ms | A tiny "done" moment, the same language as the step tick |
| Rule un-met | Instant | 0 | Exits are faster; don't celebrate going backwards |
| Busy spinner | Fades in after 150ms; label `opacity 0` | 120ms, 150ms delay | No flash on fast responses |
| Show / Hide | Instant label and type swap | 0 | It's a state toggle; motion would slow typing |
| Caps hint | `opacity` | 120ms in, 90ms out | — |
| Check your email | The same view transition as a mode switch; the envelope doesn't bounce | 220ms | Same card, new content |
| Leaving for the hub | No exit animation on the card. The hub's first paint is the arrival. | 280ms (existing) | One movement, not two |
| **Never** | Shake on a wrong password, a pulsing button, a confetti burst on sign-up | — | A calm product; an error isn't a punishment, and sign-up isn't an achievement |

Browsers without View Transitions just switch instantly.

---

## 8. Accessibility

**Structure**
- `<main id="main">` (already in `App.jsx`) → `.auth` → brand (decorative SVG `aria-hidden`, text not a heading) → `<form aria-labelledby="auth-title" noValidate method="post">`.
- One `h1` (`#auth-title`) per state.
- **Keep the same `<form>` element across modes** (don't remount it), so password managers track it.

**Labels and descriptions**
- Every input has a visible `<label for>`. No placeholder-as-label.
- `aria-describedby` lists, in order: the error id (if any), the Caps hint id (if shown), then the hint/rule id. For example, the password field on Create account: `aria-describedby="auth-password-err auth-password-rule"`.
- `aria-invalid="true"` only while a field error shows.
- Don't use `aria-errormessage` (support is patchy); `aria-describedby` is enough.
- The rule line has sr-only ", not yet" / ", done", so its state isn't colour-only.

**Autocomplete and input hints**

| Field | Attributes |
|---|---|
| Name | `id="auth-name" name="name" type="text" autocomplete="name" autocapitalize="words" maxlength="50"` |
| Email | `id="auth-email" name="email" type="email" autocomplete="username" inputmode="email" autocapitalize="none" autocorrect="off" spellcheck="false"` (`username` is what password managers pair with a password; `type="email"` still gives the @ keyboard) |
| Password (log in) | `id="auth-password" name="password" type="password" autocomplete="current-password"` |
| Password (create) | `… autocomplete="new-password" minlength="6" passwordrules="minlength: 6;"` (`minlength` from `PASSWORD_MIN`; `passwordrules` lets Safari generate a valid password) |

**Focus order**
- Log in: Email → Password → Show → Log in → Create an account.
- Create account: Name → Email → Password → Show → Create account → Log in.
- Check your email: (h1, programmatic) → Back to log in → Create the account again.
- Mode switch: focus goes to the **first empty field** of the new mode (Name on Create account; Email, or Password if the email is filled, on Log in). This replaces today's behaviour, where focus stays on a button that no longer exists.

**Keyboard**
- Enter submits from any field. Space/Enter toggles Show.
- No hub shortcuts (⌘K, g t, j/k…) are bound on this screen. Make sure the global key handler isn't mounted while signed out, or ignores everything while `AuthPage` is shown.
- The focus ring is the global 2px `focus` at a 2px offset, on everything, including the in-field toggle.

**Screen-reader announcements**
- Field errors: read when the field is focused, and the first one is focused on submit.
- Server banner: `role="alert"`. Busy: sr-only `role="status"`. Logged-out note: `role="status"`. Caps Lock: polite live region.
- `document.title` changes with each state (§3).

**Touch and contrast:** every target is at least 44px on phones (inputs 48, buttons 44, the Show toggle's hit area 44). Contrast pairs are in §4.3; all pass (text ≥ 4.5:1, edges and icons ≥ 3:1).

**Reduced motion:** no view transition, no fades. States switch instantly. Focus behaviour is unchanged.

---

## 9. Copy

Plain, active and second person, in sentence case, with no exclamation marks and no apologies. "Log in" (verb) and "log-in" never appear as a noun on screen.

| Where | Log in | Create account |
|---|---|---|
| Document title | Log in · Eagle Learning Hub | Create an account · Eagle Learning Hub |
| h1 | Log in | Create your account |
| Lede | Pick up where you left off. | Your checkmarks, ratings and notes save to your account. Only you can see them. |
| Labels | Email · Password | Name · Email · Password |
| Hints | — | Name: "Shown in the top bar." · Password: "At least 6 characters" (from `PASSWORD_MIN`) |
| Toggle | Show / Hide (`aria-label` "Show password" / "Hide password") | same |
| Button | Log in | Create account |
| Busy (sr-only) | Logging in | Creating your account |
| Footer | New to the hub? **Create an account** | Already have an account? **Log in** |

**Field errors** (replace `authFormError`'s strings; same voice):

| Field | Condition | Message |
|---|---|---|
| Name | empty (create) | Enter your name. |
| Email | empty | Enter your email address. |
| Email | not an address | Enter an email address like name@example.com. |
| Email | server `email_address_invalid` | That email address can't be used. Check it for typos. |
| Password | empty | Enter your password. |
| Password | too short (create) | Use at least 6 characters. |
| Password | server `weak_password` | Use at least 6 characters. |

**Banners and notes:** see §6. Also:
- Caps Lock: "Caps Lock is on."
- Logged out: "You're logged out. Your progress is saved to your account."
- Toast after sign-up: "Account created. Your progress now saves to it."
- Check your email: "Check your email" / "We sent a link to **{email}**. Open it to confirm your account, then come back and log in." / button "Back to log in" / "Can't find it? Check your spam folder." / "Wrong address? **Create the account again**."

**Words to stop using:** "One moment…" (use the spinner and the sr-only status), "(at least 6 characters)" in the label, "Something went wrong" (say what to check).

---

## 10. What to remove

- [ ] The orange error colour (`.auth__error { color: var(--now-ink) }`) and the single error paragraph above the button.
- [ ] `disabled={busy}` on the submit button (use `aria-busy`).
- [ ] `place-content: center` on `.auth` (vertical centring; this is what makes the form jump).
- [ ] The rule inside the password label.
- [ ] The off-token values: `font-size: 28px`, `gap: 14px`, `padding: 28px 24px`, `gap: 10px`, `outline-offset: 1px`, `font-size: 14px` on the lede.
- [ ] The inline "New here? Create an account" text link, replaced by the footer row and its button.
- [ ] Don't add: a hero, an illustration, testimonials, "or continue with", a remember-me checkbox (Supabase already keeps the session), a terms checkbox, required-field asterisks, a password strength meter, a welcome or onboarding screen.

---

## 11. Later (not in this build; flagged on purpose)

1. **Password reset.** This is the first thing students will need. It needs "Forgot password?" on Log in, `auth.resetPasswordForEmail` with `redirectTo`, a "Set a new password" state that handles the `PASSWORD_RECOVERY` event, and an email template. Until then, **don't** show a "Forgot password?" link that goes nowhere. Jeffrey can send a reset from the Supabase dashboard.
2. **Resend the confirmation email** (`auth.resend({ type: 'signup', email })`), but only once "Confirm email" is on. Show "Send it again" on Check your email, with a 60-second cooldown shown in mono digits.
3. **Continue with GitHub.** Every student already has a GitHub account, so it fits better than Google. It's an OAuth app plus a Supabase provider. Put a secondary button above the fields with a hairline "or" divider.
4. **Bring this browser's progress into a new account.** Progress saved under the old un-keyed `localStorage` key (from before accounts) isn't moved into the new account today. Offer a one-time "Bring over progress from this browser" on Today after the first sign-up.
5. **Magic link / one-time code** (Linear-style). Only worth it if passwords become the main support problem.

---

## 12. Build notes for the engineer

- **Pure helpers** (`utils/authUtils.js`, with tests in `src/test/`):
  - `authFieldErrors(form, mode) → { name?, email?, password? }`, which returns **every** problem. Keep `authFormError` as a thin wrapper (the first value) if anything else still uses it.
  - `authErrorTarget(error) → 'banner' | 'email' | 'password'` and `authErrorAction(error) → 'login' | null` (for "Log in instead").
  - Give `authErrorMessage` the new strings from §6 and §9. Update its existing tests to match.
- **AuthPage state:** `mode: 'login' | 'register' | 'checkEmail'`, `form`, `touched` (a set of field names), `fieldErrors`, `serverError: { message, code, n }` (`n` increments, so the banner re-announces), `busy`, `showPassword`, `caps`, `notice`. These are page-local `useState` values, which is fine: they aren't copies of a store.
- **Logged-out note:** `auth.logOut` can set a one-shot flag (for example `sessionStorage['hub:loggedOut'] = '1'`) that AuthPage reads and clears on mount.
- **CSS placement:** `.field*` goes in `03-page.css` (a shared control). `.auth*` stays in `12-auth.css`. Phone rules go in the same files under `@media (max-width: 599px)` and `(max-width: 899px)`.
- **Tests (RTL):**
  - Submitting empty shows every error and focuses the first field.
  - Each input's `aria-describedby` points at an element with the error text.
  - `invalid_credentials` shows the banner, and focus lands on the password field with its text selected.
  - "Log in instead" switches mode and keeps the email.
  - The toggle flips `type` and keeps focus.
  - `#register` opens Create account.
- **QA:** with `python3 -I qa/serve.py front-end/dist &` running, shoot:
  - desktop 1360 light: Log in, Create account, Create account with errors;
  - phone 390 dark: Log in, Create account with errors, the busy button.
  Also check `node qa/accounts.mjs` still passes (it fills the fields by selector, so update those selectors to the new ids), and `node qa/motion.mjs` 20/20.

---

## 13. Add to the design system: "AuthForm" (and "Field")

Follow `design-system/HOW-TO-UPDATE.md`: change `src/styles/` first, then rebuild the cards with `tools/ds_build.py`.

### `components/Field/README.md`

> **Field.** A labelled text input for the few places the hub asks you to type a value (accounts today).
> **Use** `.field` > `.field__label` + `.field__control` (input, optional `.field__toggle`) + `.field__msg` lines. Labels sit above, are always visible, and use no placeholder.
> - Edge: 1px `control` (3:1). Hover `muted`. Invalid `warn-mark`. Focus: the global 2px `focus` ring at a 2px offset.
> - Messages: hint in `muted`, error in `warn` 500 with a 16px alert icon. Link each one with `aria-describedby`, error first.
> - Validate on blur and on submit. Clear an error as soon as the value is valid. Focus the first invalid field on submit.
> - Phones: 48px tall, 16px text (stops iOS zoom).
> - Never orange, never red, never a shake.
>
> **Tokens:** `surface`, `surface-raised`, `ink`, `ink-2`, `muted`, `control`, `warn`, `warn-mark`, `teal`, `teal-strong`, `on-teal`, `focus`, `r-ctl`, `r-item`, `space-2`, `space-3`, `--ease-out`, `--spring-pop`, `--dur-press`, `--dur-micro`; type `meta`, `body`.

### `components/AuthForm/README.md`

> **AuthForm.** Log in, Create account and Check your email: one card that changes its content, never its position.
> **Use** `.auth` (top-anchored, `space-6` gap) > `.auth__brand` + `.auth__card` (`surface-raised`, `shadow-raise`, `r-panel`, `space-8` padding; flat on phones under 600px) > `.auth__head` (h1 `display-sm`, lede `body`) + `.auth__fields` (Fields, `space-4` apart; server `.auth__alert` first) + `.auth__submit` (primary `btn--lg`, full width) + `.auth__foot` (a `line-soft` hairline, a question in `muted`, a secondary button to switch modes).
> - One primary action. The mode switch is a footer row, not tabs: log in is the common path.
> - Server errors: `.auth__alert`, `warn-soft` + `ink` + a `warn-mark` icon, `role="alert"`, with a "do this next" action when there is one. Never say which credential was wrong.
> - Busy: `aria-busy` spinner after 150ms, same width, fields read-only, never `disabled`.
> - Mode switch: a view transition, the card's height glides (220ms), content cross-fades (120 out / 160 in). Focus goes to the first empty field.
> - Password: a "Show" text toggle (`aria-pressed`), a Caps Lock hint, and on Create account one rule line that draws a teal check when met.
>
> **Tokens:** everything in Field, plus `bg`, `warn-soft`, `teal-soft`, `line-soft`, `shadow-raise`, `r-panel`, `space-4`, `space-5`, `space-6`, `space-8`, `--ease-in-out`, `--dur-ui`; type `display-sm`, `panel-title`.

**Also update in the design system:**
- [ ] README › Components: add **Field** under Inputs and **AuthForm** under Content.
- [ ] README › Motion table: a row "Auth mode switch | view transition, height glide, content cross-fade | 120 out / 160 in, 220 glide".
- [ ] README › Color › Warn: add "form errors (field and server)" to its uses.
- [ ] README › Iconography: add `alert`, `caps lock` and `envelope` to the utility icons.
- [ ] `Banner`: document the `warn` variant (`warn-soft`) next to the teal one.
- [ ] `tokens.json`: no new tokens needed. Field's phone size (48 / 16px) goes in `size` as the note "input height on phones".
