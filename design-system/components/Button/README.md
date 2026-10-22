# Button

Buttons run one action and say exactly what it does.

**Use** `.btn` with one modifier: `.btn--primary` (the one main action in a region), plain `.btn` (secondary), `.btn--quiet` (text actions such as "Open guide" or "Skip for now"). Sizes: `.btn--sm` 32px, default 40px, `.btn--lg` 44px (every button on phones).

**The consumer provides** the label (verb first, sentence case) and an optional 16px leading icon.

- Depth: the primary has an inner top highlight, a darker bottom edge and lifts 1px on hover; the secondary sits on `ring-strong` with a 1px shadow. Hover tints and hover shadows live on `::before` / `::after`, so only `opacity` and `transform` ever animate.
- Press: `scale(.98)` in 90ms, release 160ms. The pressed primary looks pushed in (inner shadow).
- Loading: `aria-busy="true"` hides the label behind a 16px spinner without changing the width.
- Done morph (only "Mark step done"): the check draws and the label swaps to "Done" for 300ms before the card moves on.
- One primary per region. Never orange: orange marks now / next, not actions.
