# Field

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
