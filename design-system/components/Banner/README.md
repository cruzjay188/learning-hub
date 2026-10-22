# Banner

A one-time or situational message above the main content: the catch-up offer, or a no-class notice.

**Use** `.banner` (`teal-soft` fill, `r-panel`) for an offer with actions (primary + quiet "Not now"), and `.notice` (`surface-2`, info icon) for plain information.

**The consumer provides** one or two sentences and, for `.banner`, the actions.

- Say what to do and why in plain words: "Mark what you've already finished so Up next points at the right step."
- Never stack more than one banner. Never use orange here.
- **Warn variant** (`.auth__alert`: `warn-soft` fill, `ink` text, `warn-mark` alert icon, `role="alert"`) is only for a problem the reader must act on, such as a failed log in, with the next step as a link-button.
