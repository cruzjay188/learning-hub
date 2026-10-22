# AuthForm

Log in, Create an account and Check your email: one card that changes its content, never its position. Plus the account menu in the top bar once you're in.

**Use** `.auth` (top-anchored, 24px gap) > `.auth__brand` + `.auth__card` (`surface-raised`, `shadow-raise`, `r-panel`, 32px padding; flat on phones under 600px) > `.auth__head` (h1 26/30 display, lede `ink-2`) + `.auth__fields` (Fields 16px apart; the server `.auth__alert` first) + `.auth__submit` (primary `btn--lg`, full width) + `.auth__foot` (a `line-soft` hairline, a question in `muted`, a secondary button to switch modes).

**The consumer provides** the mode and the account functions (log in, register, log out).

- One primary action. The mode switch is a footer row, not tabs: logging in is the common path.
- Server errors: `.auth__alert` (`warn-soft` + `ink` + a `warn-mark` icon, `role="alert"`) with a "do this next" action when there is one ("Log in instead"). Never say which credential was wrong.
- The logged-out note: `.auth__note` (`teal-soft`, info icon, `role="status"`).
- Busy: `aria-busy` spinner after 150ms, same width, fields read-only, never `disabled`.
- Mode switch: a view transition; the card's height glides (220ms), content cross-fades (120 out / 160 in). Focus goes to the first empty field.
- The account menu: an avatar initial (and the name on desktop) opens a `.menu` with the name and email, then Log out. Logging out is never one stray click.
