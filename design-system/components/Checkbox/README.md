# Checkbox

The checkbox ticks off one thing that was done: a prep step or an assignment.

**Use** `<button class="cb" role="checkbox" aria-checked>` with the check SVG inside, next to a `.check-row__text` block. A ticked row strikes its title in `muted`.

**The consumer provides** the label (as `aria-label` or visible text) and the "done when" line.

- 24px visual (26px on phones), 2px `control` border (3.2:1), 44px hit area from `::after`.
- Checked: `teal` fill, and the `on-teal` check draws itself in (`stroke-dashoffset`, 220ms, `ease-out`). The check path needs `pathLength="1"`.
- Ticking is always reversible: click again, or Undo in the toast.
- Lecture steps use the Step marker instead, not this checkbox.
