# Eagle Learning Hub v3: premium craft, flow and motion

**For:** the front-end engineer working on `hub/index.html`
**Author:** ui-designer agent · Oct 20, 2026
**Why v3:** Jeffrey on v2: "the components don't feel premium, the flow needs more work, some of the animation and motion is lacking."
**Read first:** `hub/design-system/README.md` and `tokens.json`, `hub/design/design-brief-v2.md`, the screenshots in `hub/design/screens-v2-audit/mon1115/` and `hub/design/screens-motion/`.

**What stays from v2:** the IA (Today, Course, Review, Work, Lecture as a child of Course), the five principles, the copy voice, the status vocabulary, the review schedule, and the data model. v3 changes how things are made and how they move, not what they are.

**Constraints (unchanged):** one static HTML file, vanilla JS, no build step, Google Fonts only, works at 390px, light and dark. Teal means progress, orange means now / next only, IBM Plex family. UI motion under 300ms (one rare celebration may reach about 600ms). Animate `transform`, `opacity`, `clip-path` and `filter` only, plus SVG `stroke-dashoffset` for drawing checks and rings. No animation on keyboard shortcuts or ⌘K. `prefers-reduced-motion: reduce` turns all of it off.

**Three craft rules for v3** (add them to the design system README under Principles):
1. **Depth means something.** Rows sit flat on hairlines. Things you act on sit one level up. Things that float sit two or three levels up. Nothing else gets a shadow.
2. **Show the change.** When a number, a ring or a list changes, the user sees it change: digits roll, rings close, rows move to their new group. Nothing teleports.
3. **Keep the eye still.** After any action, the next thing to do lands where the eye already is. No jumps to the top, no lost scroll, no focus dropped on `<body>`.

---

## 1. Diagnosis: why v2 doesn't feel premium

1. **Everything has the same depth.** Up next, recall cards, pager links, the rating control and inputs all use the same 1px `line` ring. The most important card on the page only stands out because of its orange stripe (`today-1360-light.png`). In dark mode, `#111c1f` on `#0b1416` with a `#22343a` ring barely separates (`today-1360-dark.png`).
2. **Buttons are flat blocks.** The primary is a solid teal rectangle, the secondary is white with a 1px grey line, and the press state is only `scale(.97)`. There's no hover depth, no inner highlight, no loading state. The banner's "Catch up · 2 min" is a third look.
3. **Controls look like wireframes.** The rating is a joined 5-cell table with grey dividers. The goal stepper reads as a form field. Filter chips are outline pills with a heavy black selected fill that has nothing to do with the brand. "All modules" is a 245px pill (`course-1360-light.png`).
4. **Progress, the reward, is nearly invisible.** The rail's course bar is an empty 6px track. Per-lecture "0/10" bars are hairlines. Week rings at 14px look dotted and broken. No number ever visibly changes; it just swaps.
5. **Long pages have no rhythm.** The lecture page shows 10 steps at equal weight, then 9 identical "Show meaning" boxes: a wall of the same button (`lecture-ai-8-1360-light.png`). Work is a stack of identical grey group bars.
6. **Motion is generic or broken.** Every tab change is the same 6px fade. Tabs have no direction. The drill-in title morph flies over the old summary text mid-flight (`drill-in-160.png`). Review cards swap instantly inside the sheet. Rows never enter, leave or move. A status change teleports a row to another group.
7. **The flow drops your place.** Back from a lecture always scrolls Course to the top and focuses the page title. On desktop, "Rate" opens a modal that duplicates the rail's own rating control (`sheet-in-70.png`). Review reopens a sheet per card with no sense of moving through a deck.
8. **Phone fights for space.** The catch-up banner and the full date header push Up next to about 425px down (`today-390-dark.png`). On a lecture, the sticky step bar plus the tab bar take 112px of a 844px screen. Sheets are centered dialogs, not bottom sheets you can swipe away.
9. **Small details read as unfinished.** Lecture codes are underlined like 2005 links ("AI-5"). The "✓" in the status menu is a text glyph, not an icon. The timeline's past block is pale teal, which says "progress" when it only means "time passed".

---

## 2. Token refinements

Add these to `hub/index.html` `:root`, both dark blocks, and `tokens.json`. Existing colour tokens stay.

### 2.1 Surfaces and hairlines

```css
:root {
  /* new */
  --surface-raised: #ffffff;                 /* menus, palette, sheets, toast in dark */
  --ring: rgb(15 36 39 / .10);               /* the 1px edge of raised things; adapts on tints */
  --ring-strong: rgb(15 36 39 / .16);        /* secondary button edge, hovered cards */
  --line-soft: rgb(15 36 39 / .07);          /* dividers inside a card or dialog */
  --highlight: rgb(255 255 255 / 0);         /* top inner highlight; on in dark only */
  --track: color-mix(in srgb, var(--teal) 16%, transparent);   /* empty part of any bar or ring */
  --row-hover: rgb(15 36 39 / .035);
  --row-sel: color-mix(in srgb, var(--teal) 8%, transparent);
}
/* dark (both the prefers-color-scheme block and [data-theme="dark"]) */
  --surface-raised: #142226;
  --ring: rgb(255 255 255 / .08);
  --ring-strong: rgb(255 255 255 / .13);
  --line-soft: rgb(255 255 255 / .06);
  --highlight: rgb(255 255 255 / .05);
  --track: color-mix(in srgb, var(--teal) 20%, transparent);
  --row-hover: rgb(255 255 255 / .035);
  --row-sel: color-mix(in srgb, var(--teal) 10%, transparent);
```

Rules:
- Row dividers keep `line` (1px, full opacity). It's the ledger.
- Raised things use `--ring` through `box-shadow`, never `border`, so states never shift layout.
- Inside a card or dialog, dividers use `--line-soft`. The sheet header and footer lose their full `line` borders.
- Inputs, checkboxes, step markers and rating segments keep a real `control` border (3:1 floor). Text buttons drop it: their label identifies them, so WCAG 1.4.11 asks for no boundary. Their edge is `--ring-strong` plus shadow.
- Checked contrast: teal fill on `--track` is 4.9:1 (light), so a ring's value is readable against its own track.

### 2.2 Elevation (three levels plus flat)

| Token | Use | Light | Dark |
|---|---|---|---|
| `shadow-ring` (e0.5) | quiet framed things: code blocks, empty-state tiles | `0 0 0 1px var(--ring)` | same |
| `shadow-raise` (e1) | things you act on at rest: Up next, recall deck, pager, secondary button | `0 0 0 1px var(--ring), 0 1px 2px rgb(15 36 39 / .05), 0 2px 6px -2px rgb(15 36 39 / .06)` | `0 0 0 1px var(--ring), inset 0 1px 0 var(--highlight), 0 1px 2px rgb(0 0 0 / .4)` |
| `shadow-raise-hover` | the same things on hover (desktop only) | `0 0 0 1px var(--ring-strong), 0 2px 4px rgb(15 36 39 / .06), 0 8px 16px -6px rgb(15 36 39 / .12)` | `0 0 0 1px var(--ring-strong), inset 0 1px 0 var(--highlight), 0 6px 16px -4px rgb(0 0 0 / .55)` |
| `shadow-float` (e2) | menus, toast, tooltips, the phone lecture bar | `0 0 0 1px var(--ring), 0 4px 8px -2px rgb(15 36 39 / .08), 0 12px 24px -6px rgb(15 36 39 / .16)` | `0 0 0 1px rgb(255 255 255 / .09), inset 0 1px 0 rgb(255 255 255 / .06), 0 8px 24px -4px rgb(0 0 0 / .6)` |
| `shadow-pop` (e3) | palette, dialogs, sheets (replaces today's `shadow-pop`) | `0 0 0 1px var(--ring), 0 8px 16px -4px rgb(15 36 39 / .10), 0 24px 48px -12px rgb(15 36 39 / .24)` | `0 0 0 1px rgb(255 255 255 / .10), inset 0 1px 0 rgb(255 255 255 / .07), 0 24px 64px -12px rgb(0 0 0 / .7)` |

- In dark mode, depth comes from the ring, the top highlight and `--surface-raised`, not from shadow (shadows vanish on near-black).
- e2 and e3 surfaces use `--surface-raised`.
- Backdrop for e3: `rgb(8 20 22 / .32)` light, `rgb(0 0 0 / .55)` dark, plus `backdrop-filter: blur(2px)` (static, not animated).
- **Never animate `box-shadow`.** A hover shadow lives on a `::after` with the bigger shadow at `opacity: 0`, and only its opacity animates (§3.1).

### 2.3 Radius scale

| Token | Was | Now | Use |
|---|---|---|---|
| `r-xs` | (new) | 4px | kbd caps, badges, code chips, the now-line time pill |
| `r-item` | (new) | 6px | menu items, palette rows, the segmented thumb |
| `r-ctl` | 6px | **8px** | buttons, inputs, rating segments, chips in a track |
| `r-code` | 8px | **10px** | code blocks |
| `r-panel` | 10px | **12px** | Up next, recall deck, banners, pager, menus |
| `r-dialog` | 12px (unnamed) | **16px** | palette, dialogs, phone sheet top corners |
| `r-pill` | 999px | 999px | badges, the phone lecture bar |

**Nesting rule:** inner radius = outer radius − inset, rounded down to the nearest token. A 12px menu with 4px padding gets 8px items. The 16px palette with 6px padding gets 8px rows (10 rounds down to `r-ctl`). Write it in the README so nobody eyeballs it.

### 2.4 Buttons

Three variants, three sizes. Every state change is `transform` or a pseudo-element's `opacity`.

| Size | Height | Padding | Font | Icon | Use |
|---|---|---|---|---|---|
| `sm` | 32px | 0 12px | 600 13px | 14px | rows, rail, sheet footers |
| `md` | 40px | 0 16px | 600 14px | 16px | default on desktop |
| `lg` | 44px | 0 18px | 600 15px | 18px | every button on phones (`< 900px`), full width in Up next |

```css
.btn {
  position: relative; isolation: isolate; display: inline-flex; align-items: center; justify-content: center;
  gap: 8px; height: 40px; padding: 0 16px; border: 0; border-radius: var(--r-ctl);
  font: 600 14px/1 var(--font-body); letter-spacing: -.003em; white-space: nowrap; text-decoration: none;
  -webkit-tap-highlight-color: transparent; touch-action: manipulation;
  transition: transform 160ms var(--ease-out);
}
.btn::before, .btn::after { content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none; opacity: 0;
  transition: opacity 140ms var(--ease-out); }
.btn::before { z-index: -1; background: var(--btn-state); }        /* hover / press tint */
.btn::after  { z-index: -2; box-shadow: var(--btn-lift); }          /* hover shadow */
@media (hover: hover) { .btn:hover::before, .btn:hover::after { opacity: 1; } }
.btn:active { transform: scale(.98); transition-duration: 90ms; }
.btn:active::before { opacity: 1; background: var(--btn-press); }
.btn:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
```

**Primary** (teal, one per view region):
```css
.btn--primary {
  background: var(--teal); color: var(--on-teal);
  --btn-state: rgb(0 0 0 / .08); --btn-press: rgb(0 0 0 / .14);
  --btn-lift: 0 4px 10px -2px rgb(18 87 90 / .35);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / .14), inset 0 -1px 0 rgb(0 0 0 / .14),
              0 0 0 1px var(--teal-strong), 0 1px 2px rgb(15 36 39 / .18);
}
@media (hover: hover) { .btn--primary:hover { transform: translateY(-1px); } }
.btn--primary:active { transform: translateY(0) scale(.98);
  box-shadow: inset 0 1px 2px rgb(0 0 0 / .25), 0 0 0 1px var(--teal-strong); }   /* pressed in: swaps instantly */
/* dark */
  --btn-state: rgb(255 255 255 / .10); --btn-press: rgb(0 0 0 / .10);
  --btn-lift: 0 4px 12px -2px rgb(90 182 178 / .28);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / .28), inset 0 -1px 0 rgb(0 0 0 / .18),
              0 0 0 1px rgb(0 0 0 / .4), 0 1px 2px rgb(0 0 0 / .5);
```
White on the hover tint (teal + 8% black) is 7.5:1.

**Secondary** (white, quiet edge, no lift):
```css
.btn--secondary {
  background: var(--surface); color: var(--ink);
  --btn-state: var(--row-hover); --btn-press: rgb(15 36 39 / .07);
  --btn-lift: 0 0 0 1px var(--ring-strong), 0 2px 6px -1px rgb(15 36 39 / .10);
  box-shadow: 0 0 0 1px var(--ring-strong), 0 1px 2px rgb(15 36 39 / .06), inset 0 -1px 0 rgb(15 36 39 / .05);
}
/* dark */ background: var(--surface-raised);
  box-shadow: 0 0 0 1px var(--ring-strong), inset 0 1px 0 var(--highlight), 0 1px 2px rgb(0 0 0 / .4);
  --btn-press: rgb(255 255 255 / .06);
```

**Quiet** (text button, for "Open guide", "Skip for now", "Not now"):
```css
.btn--quiet { background: transparent; color: var(--teal-strong); padding: 0 10px; box-shadow: none;
  --btn-state: color-mix(in srgb, var(--teal) 9%, transparent);
  --btn-press: color-mix(in srgb, var(--teal) 15%, transparent); --btn-lift: none; }
```

**Disabled** (all variants): `background: var(--surface-2); color: var(--muted); box-shadow: 0 0 0 1px var(--line); cursor: not-allowed;` and no pseudo-elements, no transform. Use `aria-disabled="true"` when the button must stay focusable to explain why.

**Loading** (`aria-busy="true"`): JS locks `min-width` to the current width first, so the button never changes size. The label gets `opacity: 0`. A 16px spinner sits centred: an SVG circle, 2px stroke, `currentColor` at 25% for the track and a 90° arc at 100%, rotating 700ms linear. Pointer events off. Under reduced motion, no spinner: the label changes to "Saving…".

**Done morph** (only on "Mark step done" and "Mark done and continue"): on click the leading check icon draws in (`stroke-dashoffset`, 160ms) and the label crossfades to "Done" (opacity, 120ms), holds 240ms, then the card swaps (§5). Under reduced motion: instant swap.

**Keyboard hint inside a button** (desktop only, lecture page): `<kbd>X</kbd>` at the right of "Mark done and continue": 18px tall, `r-xs`, `font: 500 11px var(--font-mono)`, `background: rgb(255 255 255 / .16)`, `color: inherit`. Teaches the shortcut without a help page (Superhuman does this in its command list: [Superhuman Command](https://mobbin.com/screens/85dc5994-9360-428d-9092-7425e070ed7f)).

References: [Vercel projects](https://mobbin.com/screens/8bd7da13-fd91-4197-b8c3-f49a21d026bc) (dark primary with a crisp edge, white secondaries with ring plus 1px shadow) · [Stripe overview](https://mobbin.com/screens/673e89af-fe9e-4ab9-ac27-435dedf21888) (small "+ Add" secondaries next to one filled action) · [Brilliant home](https://mobbin.com/screens/69ca0993-5784-44b6-b0c2-de41614a91fb) (tactile primary with a darker bottom edge; we borrow the edge as `inset 0 -1px`, not the 4px lip).

### 2.5 Motion tokens (retuned)

| Variable | v2 | v3 | Use |
|---|---|---|---|
| `--ease-out` | `cubic-bezier(.23, 1, .32, 1)` | same | arriving, leaving |
| `--ease-in-out` | `cubic-bezier(.645, .045, .355, 1)` | same | moving on screen |
| `--ease-in` | (new) | `cubic-bezier(.32, 0, .67, 0)` | exits that leave the screen (sheet down) |
| `--ease-drawer` | (new) | `cubic-bezier(.32, .72, 0, 1)` | sheets and drawers (the iOS sheet curve) |
| `--ease-spring` | `linear(…)` 8% | keep, rename `--spring-pop` | tick press, check pop, day dots |
| `--spring-soft` | (new) | `linear(0, 0.065, 0.211, 0.387, 0.559, 0.708, 0.827, 0.914, 0.974, 1.011, 1.03, 1.038, 1.038, 1.033, 1.027, 1.02, 1.014, 1.008, 1.005, 1.002, 1, 0.999, 0.999, 0.999, 1)` (4% overshoot) | sliding thumbs, the next step coming forward |
| `--dur-instant` | (new) | 90ms | press down |
| `--dur-press` | 140ms | **120ms** | release, small swaps |
| `--dur-micro` | 180ms | **160ms** | icon and label swaps, menu in |
| `--dur-ui` | 240ms | **220ms** | panels, rows, sheets on desktop |
| `--dur-move` | 320ms | **280ms** | movement and fills (was over the 300ms rule) |
| `--dur-celebrate` | (new) | 560ms | the lecture-complete and goal-met moments only |

Progress bars were 480ms and the step rail 320ms in v2. Both break the rule. They become 280ms.

---

## 3. Component upgrades

Each entry: what changes, exact values, and the reference it borrows from. "Tokens" lists what it uses.

### 3.1 Button
Covered in §2.4. Also:
- One primary per region. On Today's Up next: "Mark step done" (primary) + "Open guide" (**quiet**, not secondary). In the catch-up banner: "Catch up · 2 min" (secondary, it's not progress) + "Not now" (quiet).
- On phones, Up next's primary is full width `lg`; "Open guide" sits under it as a 44px quiet link.
- Copy buttons in code blocks: the icon morphs copy → check (crossfade + scale .8 → 1, 160ms `--spring-pop`), the label reads "Copied" for 1.6s, then morphs back.
- Tokens: `teal`, `teal-strong`, `on-teal`, `surface`, `surface-raised`, `ring-strong`, `row-hover`, `focus`, `r-ctl`, `dur-instant`, `dur-press`.
- Reference: [Vercel projects](https://mobbin.com/screens/8bd7da13-fd91-4197-b8c3-f49a21d026bc), [Stripe overview](https://mobbin.com/screens/673e89af-fe9e-4ab9-ac27-435dedf21888).

### 3.2 Checkbox and step marker
- **Checkbox** (prep rows, catch-up): 20px visual (was 24), `r-xs` + 1px = 5px corners, 1.5px `control` border, 44px hit area via `::after { inset: -12px }`. Checked: teal fill, `on-teal` check (2px stroke, round caps). Hover (desktop): border `teal`, and a 3px `--row-sel` halo via `::before` opacity.
- **Tick sequence:** press scales to .9 (`--dur-instant`), release springs to 1 (`--spring-pop`, 240ms); fill appears at 0ms (instant colour swap, no colour animation); check draws `stroke-dashoffset 1 → 0` in 200ms `--ease-out`, 40ms delay. The row's text then dims to `muted` and gets a 1px strike that draws left to right (`clip-path: inset(0 100% 0 0)` → `inset(0)`, 200ms, on a `::after` line, not `text-decoration`).
- **Step marker** (lecture): 28px circle (was 36px column with a 36px marker; keep the 36px column, 28px marker). States:
  - future: 1.5px `control` ring, mono 12px number in `muted`.
  - current: 2px `now` ring, mono number in `now-ink`, a 4px `now-soft` halo.
  - done: teal disc, check draws in, the number blurs out (keep v2's number → check morph, retuned to 140ms).
  - hover (future or current): the ring thickens to 2px via an inset `::before` at opacity 1.
- **Rail line:** 2px wide (was 2px `line`), track `--track` (tinted, not grey), fill teal via `transform: scaleY()` from the top, 280ms `--ease-in-out`, 60ms after the tick.
- Tokens: `control`, `teal`, `on-teal`, `now`, `now-ink`, `now-soft`, `track`, `row-sel`, `spring-pop`.
- Reference: [Things 3 Today](https://mobbin.com/screens/724087de-2e95-47ec-926c-efbdab249a23) (ticked items stay in place, dimmed, before they move) · [Superlist completed row](https://mobbin.com/screens/06b73426-c2d1-4d45-a3e4-7a797cacf91d) (strike plus dimmed meta, row stays selected) · [Langdock checklist](https://mobbin.com/screens/c69db9e3-a938-4c5f-9c86-652c6efc28a7) (dashed ring for not-started vs filled check).

### 3.3 UpNext card
```
┌──────────────────────────────────────────────────────────────┐  e1, r-panel 12, padding 24
▌ Up next · AI-8 Authentication          ◔ Step 2 of 10        │  ▌ = 3px orange rule, inset 16px top/bottom, r 0 2 2 0
▌ ▬▬▬▭▭▭▭▭▭▭                                                   │  10 step segments, 3px tall, 2px gaps
│ Restructure Myflix into front-end/ + supabase/               │  title 26/32 Condensed 600, -0.01em
│ Different for you: the auth prompts point at front-end/…     │  2-line clamp, "More" quiet link expands it
│ ┌ Terminal ─────────────────────────────── [⧉ Copy] ┐       │
│ │ git add -A && git commit -m "Before full-stack"   │       │
│ └────────────────────────────────────────────────────┘       │
│ ✓ Done when  The root has front-end/, supabase/ …            │
│ [✓ Mark step done]  Open guide                 4.5 hrs left  │
└──────────────────────────────────────────────────────────────┘
  └────────────────────────────────────────────────────────┘     back layer: next step peeks 6px, scale .97
```
- Elevation `shadow-raise`. On hover anywhere in the card (desktop): `shadow-raise-hover` via `::after` opacity. No lift: the card isn't a link.
- The orange rule becomes a 3px bar inset 16px from top and bottom, rounded `0 2px 2px 0`. It reads as a mark, not as a clipped border.
- **Step meter** next to the eyebrow: a 20px progress ring for the lecture (§3.16) and "Step 2 of 10" in `mono-label`. Below the eyebrow, 10 segments (3px tall, 2px gaps, `r-pill`): done = teal, current = `now`, future = `--track`. This replaces "step 1 of 10" text alone and shows the whole lecture at a glance.
- **Back layer:** when another unticked step exists, a `::before` card sits behind: `inset: auto 12px -6px 12px; height: 24px; background: var(--surface); box-shadow: 0 0 0 1px var(--ring); border-radius: 0 0 12px 12px; z-index: -1`. It says "there's a next one" and becomes the next card on swap (§5, "Up next swap"). Hidden on the last step.
- Detail clamp "More": expands with `grid-template-rows: 0fr → 1fr`, 220ms.
- States: **default** as above. **Swapping** (§5). **Last step**: no back layer; primary reads "Finish AI-8". **Caught up**: the card keeps its frame but drops the orange rule; title "You're caught up", one line "Next: prep for AI-9 · 2 steps · 25 min", primary "Start prep". **Error saving**: the tick reverts, an inline `warn` line "Couldn't save. Try again." with a quiet "Retry".
- Phone: padding 16 16 16 20, title 21/27, primary full width, "Open guide" as quiet link under it, remaining time in the meta line under the eyebrow.
- Tokens: `surface`, `ring`, `shadow-raise`, `shadow-raise-hover`, `now`, `now-ink`, `teal`, `track`, `r-panel`, `space-6`.
- Reference: [Brilliant home](https://mobbin.com/screens/69ca0993-5784-44b6-b0c2-de41614a91fb) (the stacked-card hint that more lessons wait behind the current one; we use one layer, no illustration) · [Uxcel completing a lesson](https://mobbin.com/flows/0faf91f9-2b61-4c3f-8e0f-3ddf43b60944) (segmented lesson progress at the top that fills per step).

### 3.4 StepList
- Steps sit on the page (no card). Each step header is a full-bleed hover target: `margin-inline: -8px; padding-inline: 8px; border-radius: 8px`, hover tint `--row-hover` via `::before` opacity, 120ms.
- **Done steps** collapse to one 36px line: check marker, title in `muted` with the drawn strike, "Undo" as a quiet `sm` button revealed on hover or focus (opacity 0 → 1, 120ms; always visible on touch).
- **Current step** opens. Its body has the detail (`body`, max 68ch), code, "Done when", and the action row: "Mark done and continue `X`" (primary) + "Skip for now" (quiet).
- **Future steps** show title + one-line peek in `ink-2`.
- **No scroll jump after "Mark done and continue".** The current step's body collapses while the next one expands, in the same 220ms frame. Because the done line is about the same height as the old header, the next header slides up into the spot the eye is already on. Only call `scrollIntoView({block: "nearest"})` if the next step's action row ends below the viewport (§4, loop A).
- "Expand all" becomes a quiet `sm` button with a chevron icon that rotates 180° (200ms).
- Desktop rail outline: 28px rows, 16px markers that mirror the step states (§3.2), the current row tinted `--row-sel`, click to jump (instant scroll, then the step's header pulses its hover tint once: opacity 0 → 1 → 0 over 2 × 160ms).
- Tokens: `row-hover`, `row-sel`, `track`, `teal`, `now`, `muted`, `ink-2`, `dur-ui`.
- Reference: [Magnific course flow](https://mobbin.com/flows/64b5db2a-0af4-4788-b41a-876e6a634f9a) (the current lesson row tinted with an inline mini progress, checks filling as you go) · [Superlist](https://mobbin.com/screens/06b73426-c2d1-4d45-a3e4-7a797cacf91d).

### 3.5 Row (hover, selection, focus)
- Height: `row` 44px desktop (was 40), 56px phone. Status icon column 24px, code column 56px.
- **Lecture codes are not underlined.** Mono 12px `muted`, in their own column, like Linear's issue IDs. The whole row is the link.
- **Hover** (desktop): a pill behind the row (`::before`, `inset: 0 -8px`, `r-ctl`, `--row-hover`, opacity 120ms). The hairlines above and below the hovered row hide (`.row:hover, .row:hover + .row { border-color: transparent }`), so the pill floats clean. A trailing chevron fades in and moves 4px right (opacity + `translateX(-4px → 0)`, 160ms).
- **Hover actions** (Work rows, Review rows): quiet icon buttons (32px) fade in at the right edge: "Open repo ↗", "Copy path", status. Always visible on touch.
- **Selected / current** (the row you came back to, the palette row, j/k focus): `--row-sel` fill and a 2px teal bar inset at the left (`::after`, `inset: 8px auto 8px -8px; width: 2px; r 1px`). Teal here means focus, which the system already gives to teal.
- **Focus-visible:** `outline: 2px solid var(--focus); outline-offset: -2px; border-radius: var(--r-ctl)`.
- **Pressed:** `scale(.995)` 90ms on the row's content (not the hairline).
- **Group headers** (Work, Course weeks): drop the grey filled bars. A header is a 36px row: chevron, status icon, label 13/600, count in mono `muted`, and the group's ring on the right. Sticky under the top bar while its group scrolls (`position: sticky; top: var(--bar-h)`, `--surface` 92% + `backdrop-filter: blur(8px)`).
- Tokens: `row`, `line`, `row-hover`, `row-sel`, `teal`, `focus`, `r-ctl`, `mono-label`.
- Reference: [Linear grouped issues](https://mobbin.com/screens/610d34b6-6ad8-45ab-80fb-2107b31ed01e) (mono IDs in a column, quiet status icons, collapsed counts like "2 / 3": [Linear project issues](https://mobbin.com/screens/6d0577b3-4b12-44bb-a816-39997cc4a080)) · [Todoist Today](https://mobbin.com/screens/e7709972-7aca-4910-948e-e849e971518f) (actions appear on the hovered row only) · [Juicebox palette](https://mobbin.com/screens/2af813bf-0129-45d1-81ed-069edee76e16) (2px left bar on the selected row).

### 3.6 Chip, filter and segmented control
One **SegmentedControl** replaces the Course chips, the Review bucket chips and the Work tabs.
```
 ┌──────────────────────────────────────────────────────────┐   track: surface-2, r-ctl 8, padding 3
 │ (All)  This week  Needs review 2  Not checked off 9      │   thumb: surface + inset ring, r-item 6
 └──────────────────────────────────────────────────────────┘
```
- Track 36px tall (44px phone), `surface-2`, `r-ctl`, 3px padding. Items 30px, padding 0 12px, 13px/500 `muted`; selected `ink`. Counts in mono 12px; selected count `ink-2`.
- **One thumb** (a single absolutely positioned element) slides under the selected item. Items differ in width, so the thumb spans the whole track and is cut to the selected item with `clip-path: inset(0 R 0 L round 6px)`; only the clip-path animates, 220ms `--spring-soft` (the same technique as the v2 tab underline). A clip-path also clips outer shadows, so the thumb's edge is inset only: `background: var(--surface); box-shadow: inset 0 0 0 1px var(--ring-strong), inset 0 -1px 0 var(--ring)` (dark: `background: var(--surface-raised)` plus `inset 0 1px 0 var(--highlight)`).
- Hover on an unselected item: text to `ink`, no fill.
- Phone: the track scrolls horizontally with 16px fade masks at both ends (`mask-image: linear-gradient(90deg, transparent, #000 16px, #000 calc(100% - 16px), transparent)`). The selected item scrolls into view (`scrollIntoView({inline: "nearest"})`).
- The black `ink` selected fill goes away. It's heavy and off-brand.
- **Module filter** becomes a quiet `sm` button "Module" with a chevron that opens a Menu (§3.9). When set, it shows "Module: Front End ×" as a removable chip: 28px, `r-pill`, `surface`, `shadow-ring`, × is a 20px icon button with a 44px hit area.
- Tokens: `surface-2`, `surface`, `surface-raised`, `ring`, `ring-strong`, `highlight`, `muted`, `ink`, `r-ctl`, `r-item`, `spring-soft`.
- Reference: [Visitors](https://mobbin.com/screens/a99cade3-b46a-4e45-8f9e-ac84d6a9c878) (removable filter chips with a quiet ring) · [Linear filter menu](https://mobbin.com/screens/ed670cda-0527-4716-a1a6-0159f12c4f42) (filters live in a menu, not a chip wall).

### 3.7 Toast
```
 ┌──────────────────────────────────────────────┐
 │ ✓  Done: Do Part I: peer quiz      [ Undo ]  │   e2, r-panel 12, 44px tall
 └──────────────────────────────────────────────┘
```
- Light: `background: var(--ink); color: var(--bg)`. Dark: `background: #1d2c30; color: var(--ink)` with `shadow-float` (ink-on-#1d2c30 is 12:1). An inverted white toast in dark mode was the loudest thing on the page.
- 44px tall, padding 0 6px 0 14px, gap 12px, `r-panel`, max-width 440px.
- A 16px leading icon: check for done (teal-light `#8fe0c9` on dark ink), copy for copied, alert for errors (`warn` on `warn-soft` pill).
- **Undo is a contained button**, not underlined text: 32px, padding 0 10px, `r-ctl`, `background: rgb(255 255 255 / .12)` (light toast) / `rgb(255 255 255 / .08)` (dark), hover +.06 via `::before`. `⌘Z` / `Ctrl+Z` also undoes while the toast shows (no animation; the toast text swaps to "Undone").
- Waits on hover and focus (keep). Shows 6s with an action, 2.2s without.
- Position: bottom centre, 24px up on desktop; on phone 12px above the floating lecture bar or tab bar.
- Tokens: `ink`, `bg`, `shadow-float`, `r-panel`, `r-ctl`.
- Reference: [Zoom toast](https://mobbin.com/screens/3975bc50-be6e-41d6-9bf6-eb7b8d3eaea3) (dark toast with a contained Undo) · [Todoist undo](https://mobbin.com/screens/75c4093b-73e7-4344-b2e7-54e90d94e58c) (short past-tense message plus Undo).

### 3.8 Sheet
Two shapes, one component.
- **Phone (< 900px): bottom sheet.** Full width, top corners `r-dialog` 16px, `--surface-raised`, `shadow-pop`. A grabber (36 × 4px, `r-pill`, `control` at 50%) centred 8px from the top. Max height `88dvh`; body scrolls; footer sticks with `padding-bottom: max(16px, env(safe-area-inset-bottom))`. **Drag to dismiss:** pointer events on the grabber and header; the sheet follows the finger 1:1 (transform only); upward drag rubber-bands at 0.3×; release past 30% of its height or faster than 0.5px/ms closes, else it springs back (240ms `--ease-drawer`).
- **Desktop: centred dialog** (Rate on phone only, Review session, Help) 520px, `r-dialog`, `shadow-pop`. **Side drawer** for the catch-up list: 440px wide, floating 8px from the top, right and bottom edges, `r-dialog`, so it reads as a layer, not a page.
- Header: 56px, title `panel-title`, close as a 36px icon button; header divider `--line-soft` only when the body is scrolled (scroll-driven opacity, §5).
- Footer: actions right-aligned on desktop; on phone the primary is full width `lg` and the secondary sits above it as quiet.
- **Content changes inside an open sheet animate in place.** Never close and reopen to change cards (today's review does this).
- Desktop "Rate" dialog on the lecture page is **removed**: the rail already has the control.
- Tokens: `surface-raised`, `shadow-pop`, `line-soft`, `r-dialog`, `control`, `ease-drawer`.
- Reference: [Deel asset drawer](https://mobbin.com/screens/d4e5f55c-6b48-4ac3-abdd-86d2082721f2) (floating inset drawer with Close + one primary) · [Unify person drawer](https://mobbin.com/screens/e767e613-3036-4a56-95e2-51e091162f73) (prev / next arrows in the drawer header; we use them in the review session) · [Mindvalley lesson complete](https://mobbin.com/screens/5ad65ef9-cdc5-4773-aedf-9900f5dc1fce) (a grabbered bottom sheet asking for the rating at the moment of completion).

### 3.9 Menu
- `--surface-raised`, `shadow-float`, `r-panel` 12px, padding 4px, min-width 220px.
- Items 32px desktop / 44px phone, `r-ctl` 8px, padding 0 8px, gap 10px, 16px icon, 14px label, and a right-aligned shortcut in mono 11px `muted`. Status menu shortcuts: `1` To do · `2` In progress · `3` Ask instructor · `4` Done.
- The selected item shows a 16px SVG check in `teal-strong` (replace the "✓" glyph).
- Highlight follows pointer and arrow keys **instantly** (no transition). Typeahead jumps to the first matching label.
- Group separators: 1px `--line-soft` with 4px margin. Group labels 12px/500 `muted`.
- Opens from the trigger's corner (`transform-origin` set from the trigger rect).
- Tokens: `surface-raised`, `shadow-float`, `line-soft`, `r-panel`, `r-ctl`, `teal-strong`, `muted`.
- Reference: [Linear document menu](https://mobbin.com/screens/f71cec1e-a119-485b-9164-969169030e1a) (icons, right-aligned shortcuts, quiet separators) · [Amie task menu](https://mobbin.com/screens/a54a24d3-c92b-404b-8145-c2649ba0b79c) (status actions with single-key shortcuts) · [Vercel card menu](https://mobbin.com/screens/e2a9b3a7-e0e6-485f-925a-2de04392aeb0).

### 3.10 CommandPalette
- 640px, `r-dialog`, `--surface-raised`, `shadow-pop`, pinned at 12vh (phone: 8px from top, full width minus 16px).
- Input row 56px: 18px search icon, 16px text, and a trailing `esc` kbd cap.
- **Fixed list height** (400px desktop, `60dvh` phone), so the box never jumps as results change.
- Rows 40px, `r-ctl`, 6px list padding. A 24px icon tile at the left per kind (lecture = book, term = text, assignment = repo, action = bolt): `r-item`, `surface-2`, 14px icon `muted`. Title 14/500, a muted breadcrumb after an en dash on the same line ("AI-8 Authentication – Week 3 · Mon Oct 19"). Term matches show the meaning as a second line.
- Selected row: `surface-2` fill + 2px teal left bar (§3.5) + a `↵` kbd at the right. Only the selected row shows `↵`.
- Footer 36px: key caps for `↑ ↓` move · `↵` open · `esc` close, and the result count right-aligned. Key caps: 18px, `r-xs`, `surface`, `box-shadow: 0 0 0 1px var(--ring-strong), inset 0 -1px 0 var(--ring-strong)` (a real key's bottom edge).
- **No animation:** not on open, not on close, not when results change, not when the selection moves. It's opened from the keyboard many times a day.
- Tokens: `surface-raised`, `shadow-pop`, `surface-2`, `ring-strong`, `teal`, `r-dialog`, `r-ctl`, `r-item`, `r-xs`.
- Reference: [Mintlify search](https://mobbin.com/screens/7c7ad31f-9dfe-4be7-83d7-6002fe31d4d0) (esc cap in the input, snippet line) · [Juicebox palette](https://mobbin.com/screens/2af813bf-0129-45d1-81ed-069edee76e16) (left bar on the selected row, key-cap footer) · [Vapi palette](https://mobbin.com/screens/593d7acd-2e16-4365-bcd6-02ce52f48f3b) (title – breadcrumb on one line, result count).

### 3.11 Tabs and navigation
- **Desktop top bar:** 56px, `background: color-mix(in srgb, var(--surface) 82%, transparent); backdrop-filter: saturate(1.5) blur(12px)`. The bottom hairline appears only once the page scrolls (a `::after` 1px `line`, opacity driven by `animation-timeline: scroll(root)` over the first 24px; without support, a JS class at `scrollY > 0`).
- Tabs: 32px tall pills inside the 56px bar, padding 0 12px, 14px/500. Hover: `--row-hover` pill (opacity, 120ms). Active: `ink` text plus the teal underline, now 2px, inset to the **text width** (not the padding), `r-pill`, sliding 240ms `--ease-in-out` via `clip-path` (keep v2 technique).
- Search field: 220px, 32px, `surface-2` fill, no border, `r-ctl`, `⌘K` cap at the right. Hover: `ring` appears via `::after`.
- Save status: keep words. The dot is 6px; "Saved" fades out after 2s to just the dot, and comes back on change (opacity 160ms). Less text in the bar.
- **Phone tab bar:** 56px + safe area, `surface` 90% + blur. Icons 22px, labels 11px/500. The active tab gets a 56 × 28px `teal-soft` pill behind its icon that slides between tabs (`translateX`, 240ms `--spring-soft`) and a filled icon variant. Review's count badge ticks (§3.16).
- **Phone lecture bar** (`lecbar`) becomes a floating pill: 52px, inset 12px from the sides, 12px above the tab bar, `r-pill`, `--surface-raised`, `shadow-float`. Contents: a 28px progress ring with the count, "Rate", "Notes", and "Done" (primary `sm`, 40px). On the lecture view, **the tab bar hides when scrolling down** (`translateY(100%)`, 220ms) and returns on scroll up or at the page end; the pill drops into its place. That gives back 56px while reading.
- Tokens: `surface`, `surface-raised`, `line`, `teal`, `teal-soft`, `row-hover`, `shadow-float`, `bar-h`, `r-pill`.
- Reference: [Vercel overview](https://mobbin.com/screens/e356ab80-77ca-433e-8bc5-b047fb419e69) (quiet filled search with an `Esc` cap) · [Visitors](https://mobbin.com/screens/a99cade3-b46a-4e45-8f9e-ac84d6a9c878) (a floating dock pill instead of a full-width bar).

### 3.12 WeekGoal
```
 This week                              ╭───╮
 ◯ ◯ ◯ ◯ ◯   · ·                        │2/4│  56px ring, 5px stroke
 M T W T F   S S                        ╰───╯
 •  ← orange 4px dot under today
 2 more days keeps your 3-week streak.
 Goal  4 days a week   [−] [+]
```
- **Day rings** (Mon–Fri): 28px SVG rings, 3px stroke, track `--track`, fill teal. A logged day fills the ring completely and shows a 12px check inside in `teal-strong`. Weekend days: 12px rings, same logic. **Today** is marked by a 4px `now` dot under the ring (not an orange outline around it). The weekday letter for today is `now-ink` 600.
- **Week ring:** 56px, 5px stroke, `days logged / weeklyTarget` with "2/4" inside in mono 15/600 tabular. At goal, the ring turns into a solid teal disc with a check (§5, "Goal met").
- Copy below in `body`: "2 more days keeps your 3-week streak." Streak number is a ticker.
- **Goal control:** inline text "Goal 4 days a week" with two 32px quiet icon buttons (`−`, `+`; 44px on phone). Replaces the bordered stepper field. The number ticks.
- "I studied off the hub" stays a quiet `sm` button, shown only when today isn't logged.
- Tokens: `track`, `teal`, `teal-strong`, `now`, `now-ink`, `ink-2`, `mono-label`.
- Reference: [Apple Fitness week row](https://mobbin.com/screens/2745a5a7-c443-46cf-80bb-a3e7b72ff8f7) (a row of small day rings above one main ring, today marked with a dot, track in the same hue at low alpha) · [Uxcel streak](https://mobbin.com/screens/eb81f319-39a8-4dc3-8827-a883dab91de1) (today's column gently set apart) · [Brilliant streak, empty](https://mobbin.com/screens/63fd936e-b834-41ee-a6f5-52a18b038494) ("Solve 3 problems to start a streak": the empty state says what to do). Skip: flames, leagues, gradients.

### 3.13 ConfidenceRating
```
 How well do you get it?                    Shaky
 ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐
 │ 1 │ │▓2▓│ │ 3 │ │ 4 │ │ 5 │      5 separate segments, 6px gaps
 └───┘ └───┘ └───┘ └───┘ └───┘
 Lost                       Could teach it
 Comes back Wed, Oct 21.
```
- Five **separate** segments (not a joined table): 44px tall, `r-ctl`, 6px gaps, 1.5px `control` border, `surface`. Numbers in Condensed 600 16px `ink-2`.
- **One teal thumb** sits behind the segments and slides to the chosen one (`translateX`, 200ms `--spring-soft`). The chosen number turns `on-teal`. The thumb carries the primary button's inner highlight (`inset 0 1px 0 rgb(255 255 255 / .14)`).
- **The word appears top right** ("Shaky", "Getting it"…) in `panel-title`, swapping with a 160ms rise (§5). The helper line names the real date: "Comes back Wed, Oct 21." or "Won't come back for review." for 5.
- Hover (desktop): border `teal`, `--row-sel` fill via `::before`.
- Keyboard: arrows move, `1`–`5` set. Both are instant.
- "Clear rating" becomes a quiet `sm` button that appears only when rated.
- Tokens: `control`, `surface`, `teal`, `on-teal`, `row-sel`, `ink-2`, `r-ctl`, `spring-soft`.
- Reference: [15Five survey](https://mobbin.com/screens/9e2a6d7a-a14d-494e-a6ab-5b303a104b47) (separate segments, the chosen label goes bold) · [inDrive rating](https://mobbin.com/screens/26d2816d-4b10-4cb3-826b-a2c70aaea3c9) (the headline word changes with the choice).

### 3.14 RecallCard (becomes a deck)
The 9-box grid of "Show meaning" buttons becomes one deck, on the lecture page and in the review session.
```
 Check yourself · 9 key terms                    ✕ 1   ✓ 3
 ▬▬▬▬▭▭▭▭▭                                       term 4 of 9
 ┌──────────────────────────────────────────────┐
 │                                              │
 │                     JWT                      │   front: term, Condensed 600 28px
 │                                              │
 │            [ Show meaning  Space ]           │
 └──────────────────────────────────────────────┘
   └──────────────────────────────────────────┘     next card peeks 6px
 [← Not yet]                          [Got it →]    (after flip)
 Show all terms ▾
```
- Card: 220px min height, `r-panel`, `surface`, `shadow-raise`, centred content, padding 24. One card peeks behind it (same back-layer recipe as Up next).
- **Flip** on "Show meaning": `rotateY(0 → 180deg)` on a wrapper with `perspective: 900px`, front and back with `backface-visibility: hidden`, 280ms `--ease-in-out`. Back: the meaning in `body-lg`, max 46ch.
- After the flip, "Not yet" (secondary) and "Got it" (primary) appear under the card (opacity + 4px rise, 160ms).
- **Answer:** the card leaves sideways: Got it → `translateX(48px) rotate(3deg)`, Not yet → `translateX(-48px) rotate(-3deg)`, with opacity to 0, 200ms `--ease-in`. A tint overlay flashes on it as it leaves (`teal-soft` or `warn-soft`, opacity .0 → 1, 80ms). The back card comes forward (`scale(.97) translateY(6px)` → none, 220ms `--spring-soft`). The tally (`✕ 1  ✓ 3`, mono tabular) ticks.
- **Keys:** `Space` flips, `←` Not yet, `→` Got it. Keys act **instantly** (no flip, no swipe).
- A segmented progress line (one 3px segment per term) sits above the deck: answered = teal, missed = `warn-mark`, current = `ink-2`.
- **End card:** "7 of 9 recalled" (ticker), the missed terms as quiet chips, the ConfidenceRating, and actions "Copy "Quiz me" prompt" (secondary) and, in the review session, "Next due: AI-5 →" (primary) to chain reviews.
- "Show all terms" (quiet) expands a plain two-column glossary list for scanning, collapsed by default.
- Tokens: `surface`, `shadow-raise`, `teal`, `teal-soft`, `warn-mark`, `warn-soft`, `r-panel`, `body-lg`, `spring-soft`, `ease-in`.
- Reference: [Gemini Notebook flashcards](https://mobbin.com/screens/7dc4f9af-e719-46e1-8376-667390c7bb68) ("Press Space to flip, ←/→", ✕ and ✓ tallies, one card at a time) and [its "Got it" exit](https://mobbin.com/screens/34c51558-a1fa-4db3-a2c6-2ec7ef560b06) (the card tilts away tinted) · [Babbel review card](https://mobbin.com/screens/6b0d26ea-3bec-49b3-a394-2b22f05f8ec0) ("Did you remember it correctly?" with key hints on the two answers).

### 3.15 DayTimeline
- Track 10px (was 8), blocks `r-pill`, 4px gaps.
- **Past blocks are not teal.** Time passing isn't progress. Past = `color-mix(in srgb, var(--ink-2) 28%, var(--surface-2))`, the same tone as the Course ruler's past ticks.
- **Now block:** `surface` with a 2px `now` inset ring, and the elapsed part filled with `now-soft` (a `clip-path` inset up to the now-line). It reads "you're 1h15 into AI-8".
- **Now-line:** 2px `now`, extending 6px above and below the track, with a 6px `now` dot on top. The time sits in a pill above it: `background: var(--now-ink); color: #fff` (6.2:1) in light, `background: var(--now-ink); color: var(--bg)` (9.0:1) in dark; `font: 600 11px var(--font-mono)`, padding 1px 5px, `r-xs`. No animation; it repositions every 60s.
- Labels: time in `mono-label` `muted`, title 14/600; the current block's title in `ink`, past titles `muted`.
- Hover a block (desktop): a tooltip with `shadow-float`, `r-ctl`: full title, start–end time, and "Open AI-8 →" for lectures.
- Phone: the "now / next" row gets a 3px elapsed bar under the current item (same `now-soft` fill, `now` edge).
- Tokens: `now`, `now-ink`, `now-soft`, `ink-2`, `surface-2`, `surface`, `shadow-float`, `r-pill`, `r-xs`.
- Reference: [ClickUp planner](https://mobbin.com/screens/98725157-dec0-46de-a5d8-3e929a80e05e) (the time in a filled pill on the now-line, with a dot) · [Clockwise day](https://mobbin.com/screens/eb1f6f40-bd78-4605-9e0b-aac96b483533) (a thin full-width now-line that doesn't compete with blocks).

### 3.16 Progress: bars, rings and counters
**Ring** (one SVG component, sizes 16, 20, 28, 56):
```html
<svg class="ring" viewBox="0 0 20 20" aria-hidden="true">
  <circle class="ring__track" cx="10" cy="10" r="8.5" pathLength="100"/>
  <circle class="ring__fill"  cx="10" cy="10" r="8.5" pathLength="100" style="--p:30"/>
</svg>
```
```css
.ring { rotate: -90deg; }
.ring circle { fill: none; stroke-width: 2.5; }            /* 2 @16, 2.5 @20, 3 @28, 5 @56 */
.ring__track { stroke: var(--track); }
.ring__fill { stroke: var(--teal); stroke-linecap: round; stroke-dasharray: 100;
  stroke-dashoffset: calc(100 - var(--p)); transition: stroke-dashoffset var(--dur-move) var(--ease-in-out); }
.ring[data-p="0"] .ring__fill { opacity: 0; }               /* no stray round-cap dot at 0 */
```
- At 100% the ring becomes the `done` status icon: a teal disc with an `on-teal` check (disc `scale .7 → 1` with `--spring-pop` 240ms, check draws 200ms).
- At 0 the ring shows only its track. The dotted 14px rings on Course go away.

**Bar:** 6px rail / 4px in rows, `r-pill`, track `--track` (no inner border), fill teal via `clip-path: inset(0 calc(100% - var(--w)) 0 0 round 999px)`, 280ms `--ease-in-out`, **only when the value changes**. Never animate on first paint.

**Counter (ticker):** every count that can change while you watch (step n of m, "2/4", streak, Review badge, segmented counts, recall tally, "4 of 18 done").
```html
<span class="num-tick" aria-hidden="true"><span class="d" style="--d:2"><i>0</i><i>1</i>…<i>9</i></span></span><span class="sr-only">2</span>
```
```css
.num-tick { display: inline-flex; height: 1lh; overflow: hidden; font-variant-numeric: tabular-nums;
  mask-image: linear-gradient(transparent, #000 18%, #000 82%, transparent); }
.num-tick .d { display: flex; flex-direction: column; transform: translateY(calc(var(--d) * -1lh));
  transition: transform 220ms var(--ease-out); }
.num-tick .d:nth-last-child(2) { transition-delay: 30ms; }  /* right-to-left stagger, 30ms per digit */
```
- Only re-render digits that changed. A new leading digit fades in (opacity 120ms).
- Screen readers get the final number once; live regions announce changes in words ("Step 2 done. 2 of 10.").

- Tokens: `teal`, `track`, `on-teal`, `dur-move`, `ease-in-out`, `spring-pop`.
- Reference: [Literal reading goal](https://mobbin.com/screens/9dc5d924-3f46-4160-b3a8-adbace774828) (thin ring, big number inside, track in the same hue) · [Revolut "1/4" setup ring](https://mobbin.com/screens/ce9dd6a2-e3ca-4044-8d0d-d27496d2c146) (count inside the ring) · [Langdock](https://mobbin.com/screens/c69db9e3-a938-4c5f-9c86-652c6efc28a7) ("7 / 12" in group headers with a small ring and "58% done").

### 3.17 EmptyState
```
 ┌────┐
 │ ⟲  │   32px tile: surface, shadow-ring, r-ctl; 18px icon in muted
 └────┘
 Nothing due today                       15/600 ink
 Next review: AI-5 on Thu, Oct 22.       14/20 muted, max 52ch
 [Rate AI-8]                             one action: secondary sm (primary only if it's the view's one next action)
```
- Left-aligned in the content column, top-aligned (not centred in a huge empty area). Centred only when it fills a filtered list.
- Review "nothing due" also shows the next due lecture as a normal row below, so the view is never blank.
- Enters with opacity + 4px rise, 200ms.
- Copy keeps v2's direction rule. New lines: "Nothing matches these filters." + "Clear filters"; "No commits yet. Your first push shows up here."
- Tokens: `surface`, `shadow-ring`, `muted`, `ink`, `r-ctl`.
- Reference: [Copilot helpdesk empty](https://mobbin.com/screens/bf4b8506-2424-470f-9620-c286480f53dd) (icon tile, title, one sentence, one dark action, left-aligned) · [ElevenLabs empty](https://mobbin.com/screens/2a84bded-0960-4255-8482-5b55e2e175e9) (icon in a bordered tile) · [Tana empty](https://mobbin.com/screens/d94e0560-b097-4d6c-8959-edf8a8c2aaad).

---

## 4. Flow fixes

### Loop A: finish a step and move on (Today and Lecture)

| # | Step | v3 behaviour | Focus | Scroll |
|---|---|---|---|---|
| 1 | Click "Mark step done" | Button morphs to "✓ Done" (§2.4); the step segment fills; the lecture ring advances; the week's day ring fills if it's the first activity today | stays on the button | none |
| 2 | Card swaps | Old content exits up; the back layer comes forward as the new step; "Step 2 → 3" ticks | stays on the primary (now for step 3) | none |
| 3 | Toast | "Done: Restructure Myflix" with Undo and `⌘Z` | not moved (polite live region announces) | none |
| 4 | Undo | Reverse swap: the old step comes back from above (same curves, reversed) | primary | none |

On the **lecture page**, "Mark done and continue": tick → rail fill → this step collapses while the next expands in the same frame (§3.4). The next header lands where the old one was. Focus moves to the next step's header toggle. Scroll only if its action row is below the fold (`block: "nearest"`).

**Remove:** the `scrollToStepSoon()` 240ms delayed smooth scroll; "Open guide" as a bordered button; the separate "is-swapping" class path (one view-transition path only).

**Last step → lecture-complete moment** (§5): header ring closes into the done disc, the finished panel rises in place of the empty space under the steps, the rating gets focus. After rating, the panel's primary becomes the next thing: "Prep for AI-9 · 2 steps" or "Back to Today".

### Loop B: Course → lecture → rate → back

1. **Course row click.** The row presses (`scale(.995)`). A forward view transition: the page slides 24px, **two shared elements** fly: the row title → the H1, and the row's progress ring → the header ring. Fix the v2 overlap: the old page fades out in 90ms (not 120), the new page's content (except the title and ring) waits 100ms before fading in, so the title lands in clear space. Title snapshots use `width: fit-content` and `object-position: left center`.
2. **Lecture.** One header line replaces breadcrumb + pager arrows: `‹ Course` (quiet, 32px) · `Week 3` muted · and on the right `‹ AI-7  AI-9 ›` as 32px icon buttons with tooltips. Focus lands on the H1.
3. **Rate.** Desktop: the rail control, in place (no dialog). Phone: the pill's "Rate" opens the bottom sheet; choosing a number auto-closes it after 400ms showing the word and the date, and focus returns to "Rate", which now reads "Shaky · 2".
4. **Back** (`‹ Course`, browser back, or `Esc` on the lecture page when nothing is open). A back view transition: the H1 flies home into its row, the ring flies into the row's ring. Course restores **its scroll position** (keep `{course: y, work: y, review: y}` in `sessionStorage`) and **the expanded weeks**. Focus goes to the row you came from, which shows the selected style (§3.5) for 600ms (overlay opacity: hold 300ms, fade 300ms).
5. **Progress lands.** If steps were ticked inside, the row's bar and the week header's ring animate from the old value to the new one after the transition ends (280ms delay). The strength meter appears if the lecture was rated. This is the payoff of the round trip: you see what you just did.

**Remove:** `window.scrollTo(0, 0)` on every route change for back navigation; focusing `#v-title` on back; the desktop "Rate" dialog.

### Loop C: review weak lectures

1. Today's "Review due · 2" rows each have "Start review" (secondary `sm`). The Review tab badge shows the same count.
2. **One session sheet** (desktop centred 560px; phone bottom sheet at 88dvh). Header: "Review AI-6 · 1 of 2 lectures" with `‹ ›` to move between due lectures. Body: the deck (§3.14).
3. Each answer animates inside the sheet. The sheet never closes and reopens.
4. End card: tally, missed terms, rating, then primary "Next due: AI-5 →", which slides the next lecture's deck in from the right (220ms) inside the same sheet. On the last one: "Done for today" (primary) closes it.
5. On close, focus returns to the row that started it. That row leaves the "Due" list: it collapses (`grid-template-rows 1fr → 0fr`, 220ms) and fades; the rows below FLIP up (§5). The badge and segmented counts tick down.

**Remove:** `startReview` → `drawReview` re-opening `openSheet` for every card; the lecture page's 9 separate "Show meaning" buttons.

### Loop D: phone between classes

1. **First screen shows the action.** Today on phone: date as `display-sm` 24/28 (was 30/34) with "Week 3 · Day 10" on one meta line; the timeline is the one-line now/next row; the catch-up banner becomes a single 52px row ("Mark finished lectures · 2 min ›") after the first visit. Up next starts above 260px on a 390 × 844 screen.
2. **One thumb, one tap.** "Mark step done" is full width `lg` at the bottom of the card. Code "Copy" buttons are 44px tall.
3. **Lecture reading.** The floating pill replaces the full-width lecbar; the tab bar hides on scroll down (§3.11). Usable height goes from about 620px to about 730px.
4. **Sheets** are bottom sheets with a grabber and swipe-down (§3.8). The notes sheet opens at full height with the keyboard; the textarea gets focus.
5. **Touch feedback.** All hover lifts sit in `@media (hover: hover)`, so nothing sticks after a tap. Press states (`scale(.98)`, tint) are what the finger feels.

---

## 5. Motion spec v3

Rules (unchanged, now enforced): UI motion ≤ 300ms; one celebration may reach 560ms; only `transform`, `opacity`, `clip-path`, `filter` (≤ 4px blur) and SVG `stroke-dashoffset` animate; exits are faster and smaller than entrances; keyboard shortcuts, ⌘K and the now-line never animate; `html.instant` (set for one frame by any shortcut) kills transitions; reduced motion turns everything off (fallback column).

| # | Moment | Trigger | Properties and values | Duration | Easing | Stagger | Reduced motion |
|---|---|---|---|---|---|---|---|
| 1 | Button press | pointer down / up | `scale(.98)`; state tint `::before` opacity | 90ms down, 160ms up | `--ease-out` | — | tint only, no scale |
| 2 | Button hover (desktop) | pointer enter | primary `translateY(-1px)`; `::before` and `::after` opacity 0 → 1 | 140ms | `--ease-out` | — | tint only |
| 3 | Done morph on button | click "Mark step done" | check icon `stroke-dashoffset 1 → 0`; label crossfade | 160ms + 120ms, hold 240ms | `--ease-out` | — | instant |
| 4 | Checkbox tick | click | box `scale(.9 → 1)`; check draw; strike `clip-path inset(0 100% 0 0) → inset(0)` | 240ms press, 200ms draw (+40ms), 200ms strike (+80ms) | `--spring-pop`, `--ease-out` | — | instant |
| 5 | Step marker number → check | step done | number opacity 1 → 0, `scale(.6)`, `blur(2px)`; check draws | 140ms | `--ease-out` | — | instant |
| 6 | Step rail fill | step done | `scaleY(0 → 1)`, origin top | 280ms, +60ms | `--ease-in-out` | — | instant |
| 7 | Step collapse + next expand | "Mark done and continue" | `grid-template-rows 1fr ↔ 0fr` (layout, allowed for disclosure); inner content opacity and `translateY(-4px)` | 220ms, both at once | `--ease-out` | next step +0ms | instant |
| 8 | Up next swap | step done from Today | VT: old `upnext-body` opacity → 0, `translateY(-8px)`, `blur(2px)`; new from `scale(.97) translateY(6px)` → none; back layer fades out and in | 140ms out; 240ms in (+40ms) | `--ease-out` / `--spring-soft` | — | instant swap |
| 9 | Step counter / any ticker | value changes | digit strip `translateY(-n × 1lh)`; new leading digit opacity | 220ms | `--ease-out` | 30ms per digit, right to left | instant |
| 10 | Ring fill | value changes | `stroke-dashoffset` | 280ms | `--ease-in-out` | — | instant |
| 11 | Ring → done disc | reaches 100% | ring opacity → 0; disc `scale(.7 → 1)`; check draw | 240ms (+200ms) | `--spring-pop` | — | instant |
| 12 | Bar fill | value changes (never first paint) | `clip-path: inset()` | 280ms | `--ease-in-out` | — | instant |
| 13 | **Lecture complete** (once per lecture, flag `celebratedAt`) | last step ticked | (a) header ring closes (#10) at 0ms; (b) ring → disc (#11) at 200ms; (c) finished panel opacity 0 → 1, `translateY(12px)`, `blur(4px)` → 0 at 160ms for 280ms; (d) rating segments rise 4px in at 320ms | 560ms total | `--ease-out`, `--spring-pop` | (d) 30ms per segment | panel appears, focus moves |
| 14 | Week goal: day logged | first activity today | day ring fills (#10); check `scale(.7 → 1)` | 280ms | `--spring-pop` | — | instant |
| 15 | **Week goal met** (once per week) | target reached | week ring closes → disc (#10, #11); day rings pop `scale(.85 → 1)`; streak ticks | 560ms total | `--spring-pop` | 45ms per day ring | instant |
| 16 | Rating selection | click a segment | thumb `translateX` to segment; on first choice `scale(.9 → 1)` + opacity | 200ms / 160ms | `--spring-soft` | — | instant |
| 17 | Rating word swap | rating changes | old word opacity → 0, `translateY(-4px)`; new from `translateY(4px)` | 120ms out, 160ms in | `--ease-out` | — | instant |
| 18 | Recall card flip | click "Show meaning" | wrapper `rotateY(0 → 180deg)`, `perspective: 900px` | 280ms | `--ease-in-out` | — | instant swap |
| 19 | Recall answer exit | click Got it / Not yet | card `translateX(±48px) rotate(±3deg)`, opacity → 0; tint overlay opacity | 200ms; tint 80ms | `--ease-in` | — | instant |
| 20 | Next recall card forward | after #19 | back card `scale(.97) translateY(6px)` → none | 220ms (+60ms) | `--spring-soft` | — | instant |
| 21 | Tab change (top-level) | click a tab | VT on `root` only (bars excluded): old opacity → 0, `translateX(∓12px)`; new from `translateX(±12px)`, opacity 0 → 1. Direction = tab order | 120ms out, 220ms in (+40ms) | `--ease-out` | — | instant |
| 22 | Tab underline | tab change | `clip-path: inset()` slide | 240ms | `--ease-in-out` | — | instant |
| 23 | Phone tab pill | tab change | `translateX` | 240ms | `--spring-soft` | — | instant |
| 24 | Drill into lecture | row click | VT: old root opacity → 0 (90ms), `translateX(-24px)`; new root from `translateX(24px)`, opacity in after 100ms; shared `lec-title` and `lec-ring` groups | 280ms | `--ease-in-out` | — | instant, focus H1 |
| 25 | Back to Course | back | mirror of #24; then row "you were here" overlay opacity 1 → 0 | 280ms; overlay hold 300ms, fade 300ms | `--ease-in-out` / `--ease-out` | — | instant, focus row |
| 26 | Progress lands after back | values differ from last visit | #10 and #12 on the changed row and its week ring | 280ms (+280ms) | `--ease-in-out` | 40ms between row and week | instant |
| 27 | List filter change (Course, Review) | segment change | VT with `view-transition-name: r-<id>` per visible row: leavers opacity → 0, `scale(.98)`; stayers move (VT group); new rows opacity + `translateY(4px)` | 150ms out; 260ms move; 180ms in | `--ease-in`, `--ease-in-out`, `--ease-out` | entering rows 20ms, cap 8 | instant |
| 28 | Row moves group (Work status, Review done) | status menu / review finished | same VT recipe; the moved row's overlay flashes `--row-sel` (hold 300, fade 300) | 260ms | `--ease-in-out` | — | instant |
| 29 | Row leaves a list | review cleared | `grid-template-rows 1fr → 0fr` + opacity → 0 | 220ms | `--ease-out` | — | instant |
| 30 | Week / group expand | click header | `grid-template-rows 0fr → 1fr`; chevron `rotate(90deg)`; rows opacity + `translateY(4px)` | 220ms; chevron 200ms | `--ease-out` | 24ms per row, cap 8 | instant |
| 31 | Card expand ("More" in Up next, a Review row's terms) | click | `grid-template-rows`; content opacity | 220ms | `--ease-out` | — | instant |
| 32 | Segmented thumb | segment change | `translateX` (or `clip-path` if widths differ) | 220ms | `--spring-soft` | — | instant |
| 33 | Menu in / out | open / close | in: opacity 0 → 1, `scale(.96 → 1)` from the trigger corner; out: opacity only | 150ms / 100ms | `--ease-out` | — | none |
| 34 | Toast in / out / swap | show / hide / new text | in: `translateY(12px) scale(.96)`, `blur(2px)` → none; out: opacity → 0, `translateY(6px)`; swap: text rises 4px | 240ms / 150ms / 160ms | `--ease-out` | — | none |
| 35 | Sheet, phone | open / close | `translateY(100%) → 0`; backdrop opacity | 280ms in; 200ms out | `--ease-drawer` / `--ease-in` | — | none |
| 36 | Sheet drag | finger | follows 1:1 (`transform`), rubber band 0.3× upward; release snaps back | 240ms on release | `--ease-drawer` | — | drag still works, no snap animation |
| 37 | Sheet / dialog, desktop centre | open / close | in: opacity, `translateY(8px) scale(.96)` → none; out: opacity, `scale(.98)` | 220ms / 150ms | `--ease-out` | — | none |
| 38 | Side drawer, desktop | open / close | `translateX(24px)` + opacity | 220ms / 150ms | `--ease-out` | — | none |
| 39 | Content change inside a sheet (next lecture's deck) | "Next due" | old `translateX(-24px)` + opacity; new from `translateX(24px)` | 120ms / 220ms | `--ease-out` | — | instant |
| 40 | Phone tab bar hide / show | scroll down / up on lecture | `translateY(100%)` | 220ms | `--ease-out` | — | instant |
| 41 | Top bar edge on scroll | scroll 0–24px | `::after` hairline opacity (scroll-driven) | scroll-linked | linear | — | always shown |
| 42 | Row hover pill, chevron | pointer enter | `::before` opacity; chevron opacity + `translateX(-4px → 0)` | 120ms / 160ms | `--ease-out` | — | instant |
| 43 | Copy → Copied | click Copy | icon crossfade + `scale(.8 → 1)`; label swap | 160ms | `--spring-pop` | — | instant |
| 44 | First paint (once per load) | boot | 4 pieces opacity + `translateY(6px)` | 280ms | `--ease-out` | 40ms | none |
| 45 | Empty state in | list becomes empty | opacity + `translateY(4px)` | 200ms | `--ease-out` | — | none |
| 46 | Skeleton | loading | opacity .6 ↔ 1 loop | 1.2s | `--ease-in-out` | — | static |
| 47 | Command palette | open, close, results, selection | **none** | — | — | — | — |
| 48 | Keyboard shortcuts (`x`, `j/k`, `1–5`, `Space`, `←/→`, `g t` …) | key | **none**; `html.instant` for one frame | — | — | — | — |
| 49 | Now-line | every 60s | **none**; repositioned | — | — | — | — |

Implementation notes:
- **View Transitions** carry #8, #21, #24, #25, #27 and #28. Exclude the top bar, tab bar and floating lecture pill with their own `view-transition-name` and `animation: none`. Browsers without the API switch instantly.
- **Per-row names** (#27, #28): set `view-transition-name: r-<id>` on visible rows only for the duration of the transition, then remove. Use `view-transition-class: row` (where supported) to style them as a group.
- **FLIP fallback is not needed.** If VT is missing, the list changes instantly. Nothing breaks.
- **Never stack celebrations.** If #13 and #15 fire together, run #13, then #15's ring part only (no second day-ring pop).
- **Motion QA** (`hub/qa/motion.mjs`): add frames for #3 at 120ms, #8 at 140ms, #13 at 200/400ms, #16 at 100ms, #18 at 140ms, #21 at 100ms, #24 at 140ms (assert the old summary isn't visible under the flying title), #27 at 130ms, #35 at 140ms. Keep the asserts that shortcuts and reduced motion produce no animation.

---

## 6. Build order (biggest premium gain first)

1. **Tokens and buttons** (½ day). Elevation, rings, radius, retuned durations (fixes the >300ms ones), the button system with pseudo-element states. Every screen improves at once, with low risk.
2. **Progress primitives** (½ day). Ring, tinted bar track, number ticker. Apply to Up next, Course week headers and rows, the rail, the phone pill, the Review badge. Progress finally shows.
3. **Up next and the step loop** (1 day). The card with step segments and back layer, the done morph, the swap, the no-scroll "continue", the lecture-complete moment.
4. **Rows, segmented control, menu, toast** (1 day). Hover pill, selection style, un-underlined codes, the sliding thumb replacing chips and tabs, menu shortcuts and SVG check, the contained Undo plus `⌘Z`.
5. **Navigation continuity** (1 day). Scroll and expansion restore, focus on the origin row, the fixed title morph plus ring morph, progress landing, directional tab transitions.
6. **Recall deck and review session** (1 day). One deck component on the lecture page and in a single review sheet, flip, answer exits, chaining "Next due", the rating thumb and live date.
7. **Phone** (1 day). Bottom sheets with drag, the floating lecture pill, tab bar hide on scroll, the compact Today header and collapsed banner.
8. **Week goal rings, timeline, empty states** (½ day).
9. **QA and system update** (½ day). Run `shoot.mjs` at 1360 and 390 in both themes and `motion.mjs` with the new frames. Check contrast for every new pair (§2.1 numbers). Update `hub/design-system/README.md` (craft rules, elevation, radius, the new Motion table) and `tokens.json` (`surface-raised`, `ring`, `ring-strong`, `line-soft`, `highlight`, `track`, `row-hover`, `row-sel`, the shadow family, radius scale). Add new component cards: Ring, Ticker, SegmentedControl, RecallDeck, FloatingBar.

## 7. What to remove

- [ ] Underlined lecture codes in rows.
- [ ] Filled grey group-header bars on Work and the dotted 14px week rings on Course.
- [ ] The black `ink` fill on selected chips, the 245px "All modules" pill, the joined-table rating.
- [ ] The bordered `− 4 days +` stepper field.
- [ ] The desktop "Rate AI-7" dialog on the lecture page.
- [ ] Nine "Show meaning" buttons in a grid; per-card sheet reopening in review.
- [ ] `scrollTo(0, 0)` on back navigation and the delayed smooth scroll after "continue".
- [ ] Teal on past timeline blocks.
- [ ] The text "✓" in menus; the white inverted toast in dark mode.
- [ ] Every animation over 300ms that isn't one of the two celebrations (rail 320ms, bars 480ms, first paint 360ms, finished panel 420ms).

## Reference index

| Area | References |
|---|---|
| Rows, groups, menus | [Linear grouped](https://mobbin.com/screens/610d34b6-6ad8-45ab-80fb-2107b31ed01e) · [Linear project](https://mobbin.com/screens/6d0577b3-4b12-44bb-a816-39997cc4a080) · [Linear menu](https://mobbin.com/screens/f71cec1e-a119-485b-9164-969169030e1a) · [Linear filters](https://mobbin.com/screens/ed670cda-0527-4716-a1a6-0159f12c4f42) · [Todoist hover](https://mobbin.com/screens/e7709972-7aca-4910-948e-e849e971518f) · [Amie menu](https://mobbin.com/screens/a54a24d3-c92b-404b-8145-c2649ba0b79c) |
| Completion | [Things 3 Today](https://mobbin.com/screens/724087de-2e95-47ec-926c-efbdab249a23) · [Things 3 Logbook](https://mobbin.com/screens/627a2d8f-f5bb-408e-a724-c46b9e40a769) · [Superlist](https://mobbin.com/screens/06b73426-c2d1-4d45-a3e4-7a797cacf91d) · [Langdock](https://mobbin.com/screens/c69db9e3-a938-4c5f-9c86-652c6efc28a7) |
| Palette | [Mintlify](https://mobbin.com/screens/7c7ad31f-9dfe-4be7-83d7-6002fe31d4d0) · [Juicebox](https://mobbin.com/screens/2af813bf-0129-45d1-81ed-069edee76e16) · [Vapi](https://mobbin.com/screens/593d7acd-2e16-4365-bcd6-02ce52f48f3b) · [Superhuman](https://mobbin.com/screens/85dc5994-9360-428d-9092-7425e070ed7f) |
| Cards, buttons, elevation | [Vercel projects](https://mobbin.com/screens/8bd7da13-fd91-4197-b8c3-f49a21d026bc) · [Vercel search](https://mobbin.com/screens/e356ab80-77ca-433e-8bc5-b047fb419e69) · [Vercel menu](https://mobbin.com/screens/e2a9b3a7-e0e6-485f-925a-2de04392aeb0) · [Stripe overview](https://mobbin.com/screens/673e89af-fe9e-4ab9-ac27-435dedf21888) · [Brilliant home](https://mobbin.com/screens/69ca0993-5784-44b6-b0c2-de41614a91fb) |
| Progress, rings, streak | [Apple Fitness](https://mobbin.com/screens/2745a5a7-c443-46cf-80bb-a3e7b72ff8f7) · [Literal](https://mobbin.com/screens/9dc5d924-3f46-4160-b3a8-adbace774828) · [Revolut](https://mobbin.com/screens/ce9dd6a2-e3ca-4044-8d0d-d27496d2c146) · [Uxcel streak](https://mobbin.com/screens/eb81f319-39a8-4dc3-8827-a883dab91de1) · [Brilliant streak](https://mobbin.com/screens/63fd936e-b834-41ee-a6f5-52a18b038494) · [Duolingo streak](https://mobbin.com/screens/7aa10b76-548e-4f22-b5b8-e65e7abba53b) |
| Lesson complete | [Brilliant](https://mobbin.com/screens/859877f8-362f-4efd-834c-9792e5bbc3c2) · [Uxcel](https://mobbin.com/screens/079d1b0e-d73a-46cf-9c46-0c138b025d6f) · [Uxcel flow](https://mobbin.com/flows/0faf91f9-2b61-4c3f-8e0f-3ddf43b60944) · [Circle flow](https://mobbin.com/flows/97fe850a-4633-4a4d-95d9-efed837ffbed) · [Magnific flow](https://mobbin.com/flows/64b5db2a-0af4-4788-b41a-876e6a634f9a) · [Mindvalley sheet](https://mobbin.com/screens/5ad65ef9-cdc5-4773-aedf-9900f5dc1fce) |
| Recall, rating | [Gemini flashcards](https://mobbin.com/screens/7dc4f9af-e719-46e1-8376-667390c7bb68) · [Gemini "Got it"](https://mobbin.com/screens/34c51558-a1fa-4db3-a2c6-2ec7ef560b06) · [Babbel card](https://mobbin.com/screens/6b0d26ea-3bec-49b3-a394-2b22f05f8ec0) · [15Five](https://mobbin.com/screens/9e2a6d7a-a14d-494e-a6ab-5b303a104b47) · [inDrive](https://mobbin.com/screens/26d2816d-4b10-4cb3-826b-a2c70aaea3c9) |
| Toast, sheet, drawer | [Zoom](https://mobbin.com/screens/3975bc50-be6e-41d6-9bf6-eb7b8d3eaea3) · [Todoist](https://mobbin.com/screens/75c4093b-73e7-4344-b2e7-54e90d94e58c) · [Deel](https://mobbin.com/screens/d4e5f55c-6b48-4ac3-abdd-86d2082721f2) · [Unify](https://mobbin.com/screens/e767e613-3036-4a56-95e2-51e091162f73) · [Visitors](https://mobbin.com/screens/a99cade3-b46a-4e45-8f9e-ac84d6a9c878) |
| Timeline, empty | [ClickUp](https://mobbin.com/screens/98725157-dec0-46de-a5d8-3e929a80e05e) · [Clockwise](https://mobbin.com/screens/eb1f6f40-bd78-4605-9e0b-aac96b483533) · [Copilot](https://mobbin.com/screens/bf4b8506-2424-470f-9620-c286480f53dd) · [ElevenLabs](https://mobbin.com/screens/2a84bded-0960-4255-8482-5b55e2e175e9) · [Tana](https://mobbin.com/screens/d94e0560-b097-4d6c-8959-edf8a8c2aaad) |

Mobbin searches run (22): Linear issue rows with hover · command palette with grouped results · to-do completion with strikethrough · Vercel cards and buttons · lesson complete celebration · progress rings · toast with undo · flashcard flip · side drawer · now-line (two queries) · 1–5 rating selection · weekly streak dots · Things 3 (iOS) · Apple Fitness rings (iOS) · empty state with one action · segmented filters · lesson-completion flows · Stripe dashboard · Linear menus · Brilliant / Headspace home · bottom sheet rating (iOS).
