# Ring

The one progress circle: lecture progress, week rings, the week goal and the phone lecture pill.

**Use** `.ringw` (sized inline) holding an SVG `.ring` with a `--track` circle and a teal `.ring__fill` circle (`pathLength="100"`, `--p` 0–100, `stroke-dashoffset: calc(100 - var(--p))`), an optional `.ringw__label`, and `.ringw__disc`.

- Sizes 16, 18, 20, 26, 28, 56. Stroke 2.6 / 2.3 / 1.8 viewBox units.
- When the value changes the fill moves (280ms `ease-in-out`). At 100% the ring becomes the done disc: the disc pops from `scale(.7)` on the 8% spring and its check draws.
- At 0 the fill hides, so there's no stray round-cap dot.
- Values animate across re-renders through the continuity layer (`data-k` + `data-var="--p"`): you see progress land when you come back to a page.
