# StatusIcon

Seven 20px icons that carry state everywhere: lectures, steps, assignments, the timeline.

| Icon | Meaning | Color |
|---|---|---|
| Solid circle with check | Done | `teal` + `on-teal` |
| Half circle | In progress | `teal` |
| Ring with dot | Today / now | `now` |
| Empty ring | Not checked off, or upcoming | `control` |
| Dashed ring | Prep outline (full guide not published yet) | `control` |
| Ring with ! | Ask instructor | `warn-mark` |
| Two people | Team quiz (nothing to submit) | `control` |

**Use** inline SVG inside `.st` with a `title` and an sr-only label; meaning never depends on color alone.

- Past work that isn't ticked uses the empty ring in grey. Never amber, never "missed".
- Don't invent new icons for states that already exist.
