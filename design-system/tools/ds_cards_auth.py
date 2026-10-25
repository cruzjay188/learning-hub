# Field and AuthForm cards (accounts, Oct 22 2026). Spec: design/design-brief-auth.md §13.
# exec'd by ds_build.py after ds_cards_v3.py; markup mirrors front-end/src/components/Field.jsx and views/AuthPage.jsx.

A_ALERT = '<svg class="field__ico" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="8" cy="8" r="6.25"/><path d="M8 4.75v3.75"/><circle cx="8" cy="11" r=".9" fill="currentColor" stroke="none"/></svg>'
A_OPEN = '<svg class="field__ico" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="8" cy="8" r="6.25"/></svg>'
A_MET = '<svg class="field__ico" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="8" cy="8" r="7" fill="var(--teal)"/><path d="M5 8.2l2 2 4-4.2" stroke="var(--on-teal)"/></svg>'

C.append(("Field", "Inputs", 300, """# Field

A labelled text input, for the few places the hub asks you to type a value (accounts today).

**Use** `.field` > `.field__label` + `.field__control` (the input, optionally a `.field__toggle`) + `.field__msg` lines. The label sits above and is always visible; no placeholders.

**The consumer provides** the label, the input's `id`, `type` and `autocomplete`, and any hint or error text.

- Edge: 1px `control` (3:1). Hover `muted`. Invalid (`aria-invalid="true"`) `warn-mark`. Focus: the global 2px `focus` ring at a 2px offset; focus is never amber.
- Messages: a hint in `muted`; an error in `warn` 500 with a 16px alert icon. Link each with `aria-describedby`, error first.
- Validate on blur and on submit; clear an error the moment the value is valid; on submit focus the first invalid field.
- Password fields get a "Show" / "Hide" text toggle (`aria-pressed`) that keeps focus and the caret, and a Caps Lock hint.
- A rule line ("At least 6 characters") turns into a teal check when met; it's a hint, not an error.
- Phones: 48px tall, 16px text (stops iOS zooming in on focus).
- Never orange, never red, never a shake.
""", f'''<div class="ds-stack" style="max-width:360px">
  <div class="field"><label class="field__label" for="ds-f1">Email</label><div class="field__control"><input id="ds-f1" type="email" value="jeffrey@example.com"></div></div>
  <div class="field" data-invalid="true"><label class="field__label" for="ds-f2">Email</label><div class="field__control"><input id="ds-f2" type="email" value="jay@exmaple" aria-invalid="true" aria-describedby="ds-f2e"></div><p class="field__msg field__msg--err" id="ds-f2e">{A_ALERT}Enter an email address like name@example.com.</p></div>
  <div class="field field--password"><label class="field__label" for="ds-f3">Password</label><div class="field__control"><input id="ds-f3" type="password" value="secret12"><button type="button" class="field__toggle" aria-pressed="false">Show</button></div><p class="field__msg field__rule" data-met="true">{A_MET}At least 6 characters</p></div>
  <div class="field field--password"><label class="field__label" for="ds-f4">Password</label><div class="field__control"><input id="ds-f4" type="password" value="abc"><button type="button" class="field__toggle" aria-pressed="false">Show</button></div><p class="field__msg field__rule" data-met="false">{A_OPEN}At least 6 characters</p></div>
</div>''', "", ""))

C.append(("AuthForm", "Content", 560, """# AuthForm

Log in, Create an account and Check your email: one card that changes its content, never its position. Plus the account menu in the top bar once you're in.

**Use** `.auth` (top-anchored, 24px gap) > `.auth__brand` + `.auth__card` (`surface-raised`, `shadow-raise`, `r-panel`, 32px padding; flat on phones under 600px) > `.auth__head` (h1 26/30 display, lede `ink-2`) + `.auth__fields` (Fields 16px apart; the server `.auth__alert` first) + `.auth__submit` (primary `btn--lg`, full width) + `.auth__foot` (a `line-soft` hairline, a question in `muted`, a secondary button to switch modes).

**The consumer provides** the mode and the account functions (log in, register, log out).

- One primary action. The mode switch is a footer row, not tabs: logging in is the common path.
- Server errors: `.auth__alert` (`warn-soft` + `ink` + a `warn-mark` icon, `role="alert"`) with a "do this next" action when there is one ("Log in instead"). Never say which credential was wrong.
- The logged-out note: `.auth__note` (`teal-soft`, info icon, `role="status"`).
- Busy: `aria-busy` spinner after 150ms, same width, fields read-only, never `disabled`.
- Mode switch: a view transition; the card's height glides (220ms), content cross-fades (120 out / 160 in). Focus goes to the first empty field.
- The account menu: an avatar initial (and the name on desktop) opens a `.menu` with the name and email, then Log out. Logging out is never one stray click.
""", f'''<div style="display:grid;grid-template-columns:400px 260px;gap:32px;align-items:start">
  <div class="auth__card" style="view-transition-name:none">
    <div class="auth__head"><h1 class="display auth__title">Log in</h1><p class="auth__lede">Pick up where you left off.</p></div>
    <div class="auth__fields">
      <div class="auth__alert" role="alert">{A_ALERT}<p>Wrong email or password. Check both and try again.</p></div>
      <div class="field"><label class="field__label" for="ds-a1">Email</label><div class="field__control"><input id="ds-a1" type="email" value="jeffrey@example.com"></div></div>
      <div class="field field--password"><label class="field__label" for="ds-a2">Password</label><div class="field__control"><input id="ds-a2" type="password" value="password"><button type="button" class="field__toggle">Show</button></div></div>
    </div>
    <button type="button" class="btn btn--primary btn--lg auth__submit"><span>Log in</span></button>
    <div class="auth__foot"><span>New to the hub?</span><button type="button" class="btn btn--sm">Create an account</button></div>
  </div>
  <div class="ds-stack">
    <button type="button" class="account-btn" aria-expanded="true"><span class="account-btn__avatar">J</span><span class="account-btn__name">Jeffrey</span></button>
    <div class="menu account-menu" role="menu" style="position:static"><div class="account-menu__who"><b>Jeffrey</b><span>jeffrey@example.com</span></div><button type="button" role="menuitem">Log out</button></div>
  </div>
</div>''', "", ""))
