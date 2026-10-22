# v3 component cards (premium craft, flow and motion). Exec'd by ds_build.py with its globals
# (C, CHECK, CHECK16, COPY, VERIFY, CLOSE, SEARCH, ST, LOGO_BLOB). Replaces cards whose markup changed in v3
# and adds the new primitives. Markup mirrors hub/index.html.

def ringw(p, size, sw=None, label=None, cls="", disc=True):
    sw = sw or (1.8 if size >= 48 else 2.3 if size >= 26 else 2.6)
    r = 10 - sw / 2
    done = disc and p >= 100
    chk = CHECK.replace('width="14" height="14"', f'width="{max(10, round(size * .5))}" height="{max(10, round(size * .5))}"')
    return (f'<span class="ringw {cls}" style="width:{size}px;height:{size}px" data-done="{str(done).lower()}" aria-hidden="true">'
            f'<svg class="ring" viewBox="0 0 20 20" data-zero="{str(p <= 0).lower()}"><circle class="ring__track" cx="10" cy="10" r="{r}" stroke-width="{sw}" pathLength="100"/>'
            f'<circle class="ring__fill" cx="10" cy="10" r="{r}" stroke-width="{sw}" pathLength="100" style="--p:{p}"/></svg>'
            + (f'<span class="ringw__label">{label}</span>' if label is not None else "")
            + f'<span class="ringw__disc">{chk}</span></span>')

def tick(n):
    s = str(n)
    return '<span class="tick" aria-hidden="true">' + "".join(
        f'<span class="d" style="--d:{c}">' + "".join(f"<i>{x}</i>" for x in "0123456789") + "</span>" if c.isdigit() else f"<i>{c}</i>" for c in s) + f'</span><span class="sr-only">{s}</span>'

ICO_CHECK = CHECK16.replace("<svg", '<svg class="ico-check"')
DROP = {"Chip", "Button", "UpNext", "ConfidenceRating", "WeekGoal", "Toast", "EmptyState", "RecallCard", "CommandPalette", "Sheet", "Menu"}
C[:] = [c for c in C if c[0] not in DROP]

C.insert(0, ("Button", "Actions", 150, """# Button

Buttons run one action and say exactly what it does.

**Use** `.btn` with one modifier: `.btn--primary` (the one main action in a region), plain `.btn` (secondary), `.btn--quiet` (text actions such as "Open guide" or "Skip for now"). Sizes: `.btn--sm` 32px, default 40px, `.btn--lg` 44px (every button on phones).

**The consumer provides** the label (verb first, sentence case) and an optional 16px leading icon.

- Depth: the primary has an inner top highlight, a darker bottom edge and lifts 1px on hover; the secondary sits on `ring-strong` with a 1px shadow. Hover tints and hover shadows live on `::before` / `::after`, so only `opacity` and `transform` ever animate.
- Press: `scale(.98)` in 90ms, release 160ms. The pressed primary looks pushed in (inner shadow).
- Loading: `aria-busy="true"` hides the label behind a 16px spinner without changing the width.
- Done morph (only "Mark step done"): the check draws and the label swaps to "Done" for 300ms before the card moves on.
- One primary per region. Never orange: orange marks now / next, not actions.
""", f'''<div class="ds-stack">
  <div class="ds-row">
    <button type="button" class="btn btn--primary">{ICO_CHECK}<span class="lbl"><span class="lbl__idle">Mark step done</span><span class="lbl__done" aria-hidden="true">Done</span></span></button>
    <button type="button" class="btn">Catch up · 2 min</button>
    <button type="button" class="btn btn--quiet">Open guide</button>
    <button type="button" class="btn btn--sm">Review</button>
    <button type="button" class="btn btn--primary btn--sm">Mark done and continue <kbd>X</kbd></button>
  </div>
  <div class="ds-row">
    <button type="button" class="btn btn--primary is-done">{ICO_CHECK}<span class="lbl"><span class="lbl__idle">Mark step done</span><span class="lbl__done">Done</span></span></button>
    <button type="button" class="btn btn--primary" aria-busy="true"><span>Saving</span><svg class="spin" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-opacity=".25" stroke-width="2"/><path d="M8 2a6 6 0 0 1 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
    <button type="button" class="btn" disabled>Rate after class</button>
  </div>
</div>''', "", """document.querySelector('.btn--primary').addEventListener('click', function (e) { var b = e.currentTarget; b.classList.add('is-done'); setTimeout(function () { b.classList.remove('is-done'); }, 1200); });"""))

C.insert(1, ("SegmentedControl", "Actions", 90, """# SegmentedControl

One choice from a short set: list filters (Course, Review) and sub-views (Work).

**Use** `.segc` (`surface-2` track, 3px padding, `r-ctl`) holding one `.segc__thumb` and `.segc__i` buttons with `aria-pressed` (or links with `aria-current="page"`). Counts go in `.n` (mono 12px).

- One thumb slides under the chosen item. Items differ in width, so the thumb spans the track and is cut to the item with `clip-path: inset(0 R 0 L)`; only the clip-path animates (220ms, `--spring-soft`).
- The thumb is `surface` with an inset ring and highlight, so it reads as a raised key without an outer shadow.
- On phones the track scrolls sideways inside the toolbar; the page never does.
- Replaces the v2 black-filled chips. Long lists (modules) go in a `.select`.
""", '''<div class="toolbar" style="margin:0">
  <div class="segc" role="group" aria-label="Show"><span class="segc__thumb" aria-hidden="true"></span>
    <button type="button" class="segc__i" aria-pressed="true">All</button>
    <button type="button" class="segc__i" aria-pressed="false">This week</button>
    <button type="button" class="segc__i" aria-pressed="false">Needs review <span class="n">2</span></button>
    <button type="button" class="segc__i" aria-pressed="false">Not checked off <span class="n">9</span></button>
  </div>
  <select class="select" aria-label="Module"><option>All modules</option><option>3 · Beyond Building</option></select>
</div>''', "", """var g = document.querySelector('.segc'), th = g.querySelector('.segc__thumb');
function place(sel, anim) { var w = g.clientWidth - 6, l = sel.offsetLeft - 3, r = w - l - sel.offsetWidth; th.dataset.ready = anim ? 'true' : 'false'; th.style.setProperty('--tl', l + 'px'); th.style.setProperty('--tr', r + 'px'); }
g.querySelectorAll('.segc__i').forEach(function (b) { b.addEventListener('click', function () { g.querySelectorAll('.segc__i').forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); place(b, true); }); });
place(g.querySelector('[aria-pressed=true]'), false);"""))

segs = "".join(f'<i data-s="{"done" if i < 1 else "now" if i == 1 else ""}"></i>' for i in range(10))
C.append(("UpNext", "Content", 400, """# UpNext

The one card on Today: the exact next step, with everything needed to finish it in place.

**Use** `.upnext` (`surface`, `shadow-raise`, `r-panel`; a 3px `now` mark inset 16px from top and bottom) containing the eyebrow (why it's next · lecture link) with a ring and a rolling "Step n of N" at the right, `.segs` (one 3px segment per step: done `teal`, current `now`, future `track`), the step title in `title`, a 2-line detail, an optional CodeBlock, the Done when line, and actions: "Mark step done" (primary, with the Done morph), "Open guide" (quiet), time left.

**The consumer provides** the lecture, the step and the reason it's next: today's lecture, "Tonight's homework" after 6:30pm, "Pick up where you left off", "Still open from <date>", or "Prep for <date>".

- `.upnext__back` peeks 6px under the card when another step waits; it comes forward as the next card.
- After "Mark step done": the button says Done for 300ms, then a view transition swaps the content (out 140ms, in 240ms on `--spring-soft`) while the card's height and everything under it glide (260ms). A toast offers Undo.
- When nothing is open: "You're caught up" without the orange mark.
""", f'''<section class="upnext" style="margin:0 0 8px;max-width:720px" aria-labelledby="up-h"><span class="upnext__back" aria-hidden="true"></span><div class="upnext__body">
  <p class="upnext__eyebrow"><span>Up next</span><span aria-hidden="true">·</span><a href="#">AI-8 Authentication</a><span class="upnext__step">{ringw(10, 18, disc=False)}<span>Step {tick(2)} of 10</span></span></p>
  <div class="segs" style="--n:10" aria-hidden="true">{segs}</div>
  <h2 class="upnext__title" id="up-h">Restructure Myflix into front-end/ + supabase/</h2>
  <p class="upnext__detail">Commit first so you can roll back. Then run the restructure prompt from the Full-Stack lecture.</p>
  <p class="done-when">{VERIFY}<span><b>Done when</b>The root has front-end/, supabase/, one .claude/ and .mcp.json.</span></p>
  <div class="upnext__actions"><button type="button" class="btn btn--primary">{ICO_CHECK}<span class="lbl"><span class="lbl__idle">Mark step done</span><span class="lbl__done" aria-hidden="true">Done</span></span></button><a class="btn btn--quiet" href="#">Open guide</a><span class="upnext__left">About 4.5 hrs left in this guide</span></div>
</div></section>''', "", """document.querySelector('.btn--primary').addEventListener('click', function (e) { var b = e.currentTarget; b.classList.add('is-done'); setTimeout(function () { b.classList.remove('is-done'); }, 1200); });"""))

C.append(("ConfidenceRating", "Inputs", 190, """# ConfidenceRating

A 1–5 rating of how well a lecture is understood; ratings 1–4 schedule its next review.

**Use** `.rating` (`role="radiogroup"`, `--c` = the chosen value, `data-on`) with one `.rating__thumb` and five separate `role="radio"` segments (44px, 6px gaps, 1.5px `control` border, `r-ctl`). Above it `.rating__top` shows the question and the chosen word (`.rating__word`); below, `.rating__help` names the real date it comes back.

- The teal thumb slides to the chosen segment (`translateX`, 200ms, `--spring-soft`); the word swaps with a 160ms rise.
- Scale: 1 Lost · 2 Shaky · 3 Getting it · 4 Solid · 5 Could teach it. Review comes back after: next class day · 2 · 4 · 10 days · never.
- A toast confirms with Undo ("Rated Shaky · back Thu Oct 22"). Arrow keys and 1–5 act instantly.
- Disabled before the lecture's date. "Clear rating" is a quiet button that appears only when rated.
""", '''<div style="max-width:320px">
  <div class="rating__top"><h2>How well do you get it?</h2><span class="rating__word">Shaky</span></div>
  <div class="rating" role="radiogroup" aria-label="Confidence, 1 to 5" style="--c:2" data-on="true"><span class="rating__thumb" aria-hidden="true"></span>
    <button type="button" role="radio" aria-checked="false" aria-label="1 of 5, Lost">1</button>
    <button type="button" role="radio" aria-checked="true" aria-label="2 of 5, Shaky">2</button>
    <button type="button" role="radio" aria-checked="false" aria-label="3 of 5, Getting it">3</button>
    <button type="button" role="radio" aria-checked="false" aria-label="4 of 5, Solid">4</button>
    <button type="button" role="radio" aria-checked="false" aria-label="5 of 5, Could teach it">5</button>
  </div>
  <div class="rating__ends"><span>Lost</span><span>Could teach it</span></div>
  <p class="rating__help" aria-live="polite">Comes back for review on Thu Oct 22.</p>
</div>''', "", """var L = ['Lost', 'Shaky', 'Getting it', 'Solid', 'Could teach it'], A = ['tomorrow, Tue Oct 20', 'on Wed Oct 21', 'on Fri Oct 23', 'on Thu Oct 29'];
var g = document.querySelector('.rating'), w = document.querySelector('.rating__word'), h = document.querySelector('.rating__help');
function swap(el, t) { el.textContent = t; el.classList.remove('is-swapping'); void el.offsetWidth; el.classList.add('is-swapping'); }
document.querySelectorAll('[role=radio]').forEach(function (b, i) { b.addEventListener('click', function () { document.querySelectorAll('[role=radio]').forEach(function (x) { x.setAttribute('aria-checked', x === b); }); g.style.setProperty('--c', i + 1); g.dataset.on = 'true'; swap(w, L[i]); swap(h, i === 4 ? "It won't come back for review." : 'Comes back for review ' + A[i] + '.'); }); });"""))

days = "".join(f'<span class="gd" data-on="{str(on).lower()}" {"data-today=\"true\"" if t else ""}>{ringw(100 if on else 0, 26, sw=2.4)}<span>{d}</span></span>' for d, on, t in [("M", True, False), ("T", True, False), ("W", False, True), ("T", False, False), ("F", False, False)])
we = "".join(f'<span class="gd gd--we" data-on="false">{ringw(0, 12, sw=3.4)}<span>S</span></span>' for _ in range(2))
C.append(("WeekGoal", "Inputs", 210, """# WeekGoal

A weekly study goal: a ring per class day, smaller weekend rings, one week ring, and a streak counted in weeks.

**Use** `.goal-row` with `.goal-days` (`.gd` items holding a 26px Ring; `.gd--we` 12px; `data-on`, `data-today`) and a 56px `.week-ring` labelled "2/4", then `.goal-text` and `.goal-ctl` ("Goal 4 days a week" with − and + icon buttons; the number ticks).

- A logged day fills its ring and turns into the done disc (spring pop). Meeting the goal sends a wave through the filled days, 45ms apart, and closes the week ring.
- Today is marked by a 4px `now` dot under its letter, not an orange outline.
- Ticking a step, rating or writing notes logs the day; "I studied off the hub" logs it by hand.
- The streak counts weeks in a row that met the goal, so weekends never break it. No flames, no guilt copy.
""", f'''<div style="max-width:320px">
  <div class="goal-row"><div class="goal-days">{days}<span class="goal-sep" aria-hidden="true"></span>{we}</div>{ringw(50, 56, sw=2, label="2/4", cls="week-ring")}</div>
  <p class="goal-text"><b>2 more days</b> keeps your 3-week streak.</p>
  <div class="goal-foot"><span class="goal-ctl">Goal <b>{tick(4)}</b> days a week <button type="button" class="icon-btn" aria-label="Fewer days">−</button><button type="button" class="icon-btn" aria-label="More days">+</button></span></div>
</div>''', "", ""))

C.append(("Ring", "Status", 120, """# Ring

The one progress circle: lecture progress, week rings, the week goal and the phone lecture pill.

**Use** `.ringw` (sized inline) holding an SVG `.ring` with a `--track` circle and a teal `.ring__fill` circle (`pathLength="100"`, `--p` 0–100, `stroke-dashoffset: calc(100 - var(--p))`), an optional `.ringw__label`, and `.ringw__disc`.

- Sizes 16, 18, 20, 26, 28, 56. Stroke 2.6 / 2.3 / 1.8 viewBox units.
- When the value changes the fill moves (280ms `ease-in-out`). At 100% the ring becomes the done disc: the disc pops from `scale(.7)` on the 8% spring and its check draws.
- At 0 the fill hides, so there's no stray round-cap dot.
- Values animate across re-renders through the continuity layer (`data-k` + `data-var="--p"`): you see progress land when you come back to a page.
""", '<div class="ds-row" style="gap:18px">' + ringw(0, 28) + ringw(30, 28) + ringw(70, 28) + ringw(100, 28) + ringw(60, 56, sw=2, label="3/5", cls="week-ring") + '<button type="button" class="btn btn--sm" id="go">Fill</button></div>', "",
"""var rs = document.querySelectorAll('.ringw'); document.getElementById('go').addEventListener('click', function () { rs.forEach(function (r) { var f = r.querySelector('.ring__fill'), p = +f.style.getPropertyValue('--p'); p = p >= 100 ? 0 : Math.min(100, p + 30); f.style.setProperty('--p', p); r.querySelector('.ring').dataset.zero = p <= 0; r.dataset.done = p >= 100 && !r.classList.contains('week-ring'); }); });"""))

C.append(("Ticker", "Status", 96, """# Ticker

A number that rolls to its new value instead of swapping: step counters, "1 of 116", the goal, recall tallies.

**Use** `.tick` (aria-hidden) with one `.d` column of 0–9 per digit (`--d` = the digit) followed by an `.sr-only` copy of the number. Each column moves `translateY(calc(var(--d) * -1.3em))` in 220ms `ease-out`, right-most digit first, 30ms apart. A soft mask fades the digits in and out at the edges.

- Only for numbers that change while you watch. Static counts stay plain text.
- Screen readers get the number once; changes are announced in words by the live region.
""", f'<div class="ds-row" style="font:600 28px var(--font-mono);color:var(--ink);gap:16px"><span>Step {tick(2)} of 10</span><button type="button" class="btn btn--sm" id="up">+1</button></div>', "",
"""var n = 2; document.getElementById('up').addEventListener('click', function () { n = n >= 9 ? 1 : n + 1; document.querySelector('.tick .d').style.setProperty('--d', n); document.querySelector('.tick + .sr-only').textContent = n; });"""))

C.append(("Toast", "Feedback", 110, """# Toast

A short confirmation at the bottom of the screen, with Undo when the action changed data.

**Use** `.toast` (`toast-bg` / `toast-ink`: ink in light, a raised `#1d2c30` in dark, never inverted white; `shadow-float`, `r-panel`, 44px) with a 16px leading icon (check, copy, or `warn-mark` alert), the message, and a contained action button ("Undo ⌘Z").

- In: rises 12px out of a 2px blur (240ms). Out: fades with a 6px drop (150ms). A second message swaps its text in place.
- ⌘Z / Ctrl+Z runs the Undo while the toast shows, instantly, and the text swaps to "Undone".
- Shows 2.2s, or 6s with an action; waits while hovered or focused. `role="status"`.
""", f'<div class="toast" data-show="true" style="position:static;transform:none;opacity:1;display:inline-flex;max-width:440px"><span class="toast__ico" aria-hidden="true">{CHECK16}</span><span>Done: Do Part I: peer quiz, then FreeCodeCamp</span><button type="button">Undo <kbd>⌘Z</kbd></button></div>', "", ""))

C.append(("EmptyState", "Feedback", 150, """# EmptyState

What a list shows when it has nothing: what will appear here, and the one action that fills it.

**Use** `.empty` with a 32px `.empty__tile` (icon, `surface` + `shadow-ring`), a `.empty__title`, one line in `muted`, and at most one button. Left-aligned and top-aligned, never floating in a big empty area. It enters with a 4px rise (200ms).

- Write it as direction, not mood: "Nothing due today" + "Next review: AI-5 on Thu Oct 22."
- Review's empty Due list still shows the next due lecture as a normal row below it, so the view is never blank.
""", f'<div class="empty" style="padding:0"><span class="empty__tile">{VERIFY}</span><p class="empty__title">Nothing due today</p><p>Next review: AI-5 on Thu Oct 22.</p><button type="button" class="btn btn--sm">Open AI-5</button></div>', "", ""))

C.append(("RecallDeck", "Content", 330, """# RecallDeck

Active recall, one card at a time: say the term's meaning, flip, then answer Got it or Not yet.

**Use** `.deck` (with a `.deck__back` card peeking 7px under it) holding `.flip` (two `.face`s, `backface-visibility: hidden`, `perspective: 900px`), then `.deck__acts` with "Not yet ←" (secondary) and "Got it →" (primary). Above it, `.deck__segs` (one 3px segment per term: got `teal`, missed `warn-mark`, current `ink-2`) and an ✕ / ✓ tally of Tickers.

- Flip: `rotateY(180deg)` in 280ms `ease-in-out`. Answer: the card tilts away (±48px, ±3°) and fades in 200ms `--ease-in`; the next card comes forward from `scale(.97)` on `--spring-soft`.
- Keys act instantly with no motion: Space flips, ← Not yet, → Got it. After a flip, focus goes to Not yet, so pressing Enter repeatedly can't mark terms as known by accident.
- The end card shows "7 of 9 recalled", the missed terms as chips, and "Go through again". The same deck runs inside the Review session sheet, which chains every due lecture.
""", '''<div style="max-width:560px">
  <div class="section__head" style="margin:0"><h2 class="section__title">Check yourself <span class="count">9 key terms</span></h2><span class="deck__meta"><span class="x">✕ 1</span><span class="v">✓ 3</span></span></div>
  <div class="deck__segs" style="--n:9" aria-hidden="true"><i data-s="got"></i><i data-s="got"></i><i data-s="missed"></i><i data-s="got"></i><i data-s="now"></i><i></i><i></i><i></i><i></i></div>
  <div class="deck"><span class="deck__back" aria-hidden="true"></span>
    <div class="flip" data-flipped="false" role="button" tabindex="0" aria-label="Show the meaning">
      <div class="face"><p class="row__sub">Term 5 of 9</p><p class="face__term">JWT</p><p class="face__hint">Say it out loud, then flip <span class="kbd">Space</span></p></div>
      <div class="face face--back"><p class="row__sub">JWT</p><p class="face__meaning">A signed token that proves who you are on every request, so the server doesn't need to look you up.</p></div>
    </div></div>
  <div class="deck__acts" data-show="false"><button type="button" class="btn"><kbd>←</kbd> Not yet</button><button type="button" class="btn btn--primary">Got it <kbd>→</kbd></button></div>
</div>''', "", """var f = document.querySelector('.flip'), a = document.querySelector('.deck__acts');
f.addEventListener('click', function () { var on = f.dataset.flipped !== 'true'; f.dataset.flipped = on; a.dataset.show = on; });
a.querySelectorAll('button').forEach(function (b, i) { b.addEventListener('click', function () { f.classList.add(i ? 'is-got' : 'is-missed'); a.dataset.show = 'false'; setTimeout(function () { f.classList.remove('is-got', 'is-missed'); f.dataset.flipped = 'false'; f.classList.remove('is-next'); void f.offsetWidth; f.classList.add('is-next'); }, 220); }); });"""))

C.append(("FloatingBar", "Navigation", 120, """# FloatingBar

The phone lecture pill: progress and the three actions you need while reading a guide.

**Use** `.lecbar` (fixed, 12px from the sides and above the tab bar, `r-pill`, `surface-raised` at 94% with blur, `shadow-float`) holding a 28px Ring with the step count, quiet "Rate" and "Notes" buttons (Rate shows the rating once set, "2 · Shaky"), and a primary "Done" that runs "Mark done and continue".

- While you scroll down a lecture, the tab bar slides away (220ms) and the pill drops into its place; scrolling up or reaching the end brings it back. About 56px more reading space.
- "Done" scrolls the current step into view first, so the tick plays where you can see it.
""", f'<div class="lecbar" style="position:static;display:block;max-width:390px"><div class="lecbar__inner"><div class="lecbar__prog">{ringw(30, 28)}<span>3/10</span></div><button type="button" class="btn btn--quiet btn--sm">2 · Shaky</button><button type="button" class="btn btn--quiet btn--sm">Notes</button><button type="button" class="btn btn--primary btn--sm">{CHECK} Done</button></div></div>', "", ""))

C.append(("CommandPalette", "Overlays", 340, """# CommandPalette

⌘K, Ctrl-K or / opens search across lectures, key terms and assignments, plus a few actions.

**Use** a `<dialog class="palette">` (640px, `r-dialog`, `surface-raised`, `shadow-pop`) with a 56px input and an `esc` key cap, a fixed-height `role="listbox"` (so the box never jumps), and a footer of key caps plus the result count.

- Rows are one line, 40px: a 24px kind tile (action, lecture, term, assignment, recent), the title with the match highlighted in `teal-strong`, and a muted breadcrumb after it. The selected row gets `surface-2`, a 2px teal bar and a ↵ cap.
- No animation at all: not on open, close, results or selection. It's opened from the keyboard many times a day.
- Matching ignores case and punctuation ("fe-3" finds "FE 3"); prefix matches rank first.
""", f'''<dialog open class="palette" style="position:static;margin:0;width:100%;max-width:640px">
  <div class="palette__input">{SEARCH}<input type="text" value="rls" aria-label="Search"><span class="kbd">esc</span></div>
  <div class="palette__list" role="listbox" style="height:150px"><p class="pal-group">Key terms</p>
    <button type="button" class="pal-item" role="option" aria-selected="true"><span class="pal-item__tile">Aa</span><span class="pal-item__text"><span class="pal-item__title"><mark>RLS</mark> (Row Level Security)</span><span class="pal-item__sub">AI-6 · Database rules that decide which rows each request may read or change.</span></span><span class="kbd pal-item__go">↵</span></button>
    <button type="button" class="pal-item" role="option" aria-selected="false"><span class="pal-item__tile">Aa</span><span class="pal-item__text"><span class="pal-item__title"><mark>RLS</mark> (Row Level Security)</span><span class="pal-item__sub">AI-8 · Database rules that filter every request by who is asking.</span></span><span class="kbd pal-item__go">↵</span></button>
  </div>
  <div class="palette__foot"><span><span class="kbd">↑</span><span class="kbd">↓</span>move</span><span><span class="kbd">↵</span>open</span><span><span class="kbd">esc</span>close</span><span style="margin-left:auto">2 results</span></div>
</dialog>''', "", ""))

C.append(("Sheet", "Overlays", 320, """# Sheet

A focused dialog for one task: rate a lecture, write notes, catch up, review terms, or read the help.

**Use** `<dialog class="sheet">` (desktop: 520px centred, `r-dialog`, `surface-raised`, `shadow-pop`, a blurred backdrop) with `.sheet__grab`, `.sheet__head` (title + close), `.sheet__body` and an optional `.sheet__foot`. Opened with `showModal()`: focus moves inside, Esc and the backdrop close it, focus returns.

- Desktop: in from `translateY(8px) scale(.96)` (220ms), out with a fade and `scale(.98)` (150ms).
- Phones: a bottom sheet (top corners `r-dialog`, max 88dvh) that slides up on the iOS drawer curve (280ms) and down on `ease-in` (200ms). Drag the grabber or header down to close (past 30% or a quick flick); it rubber-bands upward.
- Content changes inside an open sheet animate in place (the review session's next lecture slides in). It never closes and reopens.
""", f'''<dialog open class="sheet" style="position:static;margin:0;max-width:520px" aria-labelledby="sh-t">
  <div class="sheet__head"><h2 id="sh-t">Review AI-6 <span class="muted" style="font:500 14px var(--font-body)">· 1 of 2</span></h2><button type="button" class="icon-btn" aria-label="Close">{CLOSE}</button></div>
  <div class="sheet__body"><div class="deck__end" style="width:100%"><h3>7 of 9 recalled</h3><div class="deck__chips"><span>RLS policy</span><span>Foreign key</span></div><button type="button" class="btn btn--primary">Next due: AI-5</button></div></div>
</dialog>''', "", ""))

C.append(("Menu", "Overlays", 230, """# Menu

A small list of choices anchored to the control that opened it, such as an assignment's status.

**Use** `.menu` (`role="menu"`, `surface-raised`, `shadow-float`, `r-panel`, 4px padding) of 34px `menuitemradio` buttons (44px on phones): StatusIcon, label, a right-aligned key in mono (`1`–`4`), and an SVG check on the current choice.

- Opens from its trigger's corner (`scale(.96)` + fade, 150ms); closes with a fade (100ms).
- The highlight follows the pointer and arrow keys instantly. 1–4 pick directly. Esc closes and focus returns.
- After a choice, a toast confirms with Undo ("… moved to Done").
""", f'''<div class="menu" role="menu" style="position:static;max-width:240px">
  <button type="button" role="menuitemradio" aria-checked="false">{ST["open"]}<span>To do</span><span class="m-key">1</span><span class="m-chk">{CHECK}</span></button>
  <button type="button" role="menuitemradio" aria-checked="true">{ST["progress"]}<span>In progress</span><span class="m-key">2</span><span class="m-chk">{CHECK}</span></button>
  <button type="button" role="menuitemradio" aria-checked="false">{ST["check"]}<span>Ask instructor</span><span class="m-key">3</span><span class="m-chk">{CHECK}</span></button>
  <button type="button" role="menuitemradio" aria-checked="false">{ST["done"]}<span>Done</span><span class="m-key">4</span><span class="m-chk">{CHECK}</span></button>
</div>''', "", ""))
