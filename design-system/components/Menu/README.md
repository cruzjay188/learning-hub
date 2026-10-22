# Menu

A small list of choices anchored to the control that opened it, such as an assignment's status.

**Use** `.menu` (`role="menu"`, `surface-raised`, `shadow-float`, `r-panel`, 4px padding) of 34px `menuitemradio` buttons (44px on phones): StatusIcon, label, a right-aligned key in mono (`1`–`4`), and an SVG check on the current choice.

- Opens from its trigger's corner (`scale(.96)` + fade, 150ms); closes with a fade (100ms).
- The highlight follows the pointer and arrow keys instantly. 1–4 pick directly. Esc closes and focus returns.
- After a choice, a toast confirms with Undo ("… moved to Done").
