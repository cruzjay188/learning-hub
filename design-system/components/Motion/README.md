# Motion

The hub's motion vocabulary in one place: press Replay to see each piece at its real speed.

**Use** the curves and times in the README's Motion table. Each animation answers "what changed?": a tick confirms, the rail shows progress flowing to the next step, a swap shows what replaced what. Nothing loops, nothing runs on keyboard shortcuts, and `prefers-reduced-motion: reduce` turns it all off (this card too).

- Arriving or leaving: `--ease-out`. Moving on screen: `--ease-in-out`. Spring overshoot only for tiny confirmations.
- Exits are faster and smaller than entrances.
- Animate `transform`, `opacity`, `clip-path`, `stroke-dashoffset`; never width, height or margins.
