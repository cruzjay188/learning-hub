"""Build the Eagle Hub Design System files from the hub's CSS (the source of truth)."""
import glob, json, os, re, sys
from datetime import datetime, timezone

# the hub's stylesheet: front-end/src/styles/*.css, in cascade order (01-base.css … 11-view-transitions.css)
STYLES = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "front-end", "src", "styles")
OUT = sys.argv[1] + "/project"
LOGO_BLOB = "b5bfdc9ca270b7c4691ef300997ebf1b"

def w(path, text):
    p = os.path.join(OUT, path); os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, "w").write(text)

# ---------- bundle.css: the hub's stylesheet minus its token blocks ----------
css = "".join(open(f).read() for f in sorted(glob.glob(os.path.join(STYLES, "*.css"))))
start = css.index("@media (max-width: 899px) { :root { --row: 52px; } }")
body_css = css[start:]
bundle = ('@import url("https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans+Condensed:wght@500;600&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap");\n'
          "/* Eagle Hub components. Lifted from hub/index.html; colors, fonts, radii, sizes and shadows come from tokens.css. */\n"
          + body_css.strip() + "\n"
          "/* preview helpers */\n.ds-stack { display: grid; gap: 12px; }\n.ds-row { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }\n")
assert "</style" not in bundle
# Hub variables that aren't design-system tokens (motion curves and durations, button and toast surfaces,
# the backdrop) ride along in the bundle, light and dark, so previews behave like the hub.
TOK = json.load(open(os.path.join(OUT, "tokens.json")))
tok_names = {x["name"] for g in ("color", "radius", "size", "shadow", "spacing") for x in TOK[g]["tokens"]}
def decls(block):
    return [(n, v.strip()) for n, v in re.findall(r"--([\w-]+):\s*([^;]+);", block)]
light_block = css[css.index(":root {"): css.index("color-scheme: light;")]
dark_block = css[css.index(':root[data-theme="dark"] {'): css.index("color-scheme: dark;", css.index(':root[data-theme="dark"] {'))]
extra = lambda block: " ".join(f"--{n}: {v};" for n, v in decls(block) if n not in tok_names and not n.startswith("font-"))
derived = (f":root {{ {extra(light_block)} }}\n@media (prefers-color-scheme: dark) {{ :root:not([data-theme=\"light\"]) {{ {extra(dark_block)} }} }}\n"
           f":root[data-theme=\"dark\"] {{ {extra(dark_block)} }}\n")
first_nl = bundle.index("\n") + 1
bundle = bundle[:first_nl] + "/* derived hub variables (motion, buttons, toast) */\n" + derived + bundle[first_nl:]
w("components/bundle.css", bundle)

# ---------- shared SVG snippets (same as the hub) ----------
CHECK = '<svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" pathLength="1" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
CHECK16 = CHECK.replace('width="14" height="14"', 'width="16" height="16"')
COPY = '<svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><rect x="5.5" y="5.5" width="8" height="8" rx="1.8" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M10.5 3.5v-.2A1.3 1.3 0 0 0 9.2 2H3.8A1.3 1.3 0 0 0 2.5 3.3v5.4A1.3 1.3 0 0 0 3.8 10h.2" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>'
VERIFY = '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.3" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M5.3 8.2l1.9 1.9 3.6-4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
UNDO = '<svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M5 6.5H10a3 3 0 0 1 0 6H7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M7 4L4.5 6.5 7 9" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
EXT = '<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M4.5 2.5h5v5M9.5 2.5L3 9" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>'
CHEV = '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3.5l4.5 4.5L6 12.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>'
INFO = '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.3" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 7.2v4M8 4.8v.1" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>'
CLOSE = '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>'
SEARCH = '<svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="4.8" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M10.6 10.6L14 14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
FLAG = '<svg width="13" height="13" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 14V2.5M3.5 3h8l-1.8 3 1.8 3h-8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
ST = {
 "done": '<svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="9" fill="var(--teal)"/><path d="M6 10.3l2.6 2.6L14 7.5" fill="none" stroke="var(--on-teal)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 "progress": '<svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8.2" fill="none" stroke="var(--teal)" stroke-width="1.7"/><path d="M10 1.8a8.2 8.2 0 0 1 0 16.4z" fill="var(--teal)"/></svg>',
 "now": '<svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8.2" fill="none" stroke="var(--now)" stroke-width="1.7"/><circle cx="10" cy="10" r="3.8" fill="var(--now)"/></svg>',
 "open": '<svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8.2" fill="none" stroke="var(--control)" stroke-width="1.7"/></svg>',
 "outline": '<svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8.2" fill="none" stroke="var(--control)" stroke-width="1.6" stroke-dasharray="2.6 2.4"/></svg>',
 "check": '<svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8.2" fill="none" stroke="var(--warn-mark)" stroke-width="1.7"/><path d="M10 6v4.6M10 13.4v.1" stroke="var(--warn-mark)" stroke-width="1.9" stroke-linecap="round"/></svg>',
 "quiz": '<svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><circle cx="7.5" cy="8" r="2.6" fill="none" stroke="var(--control)" stroke-width="1.6"/><circle cx="13.5" cy="8" r="2.6" fill="none" stroke="var(--control)" stroke-width="1.6"/><path d="M3 16c.6-2.4 2.4-3.6 4.5-3.6S11.4 13.6 12 16M10.8 13c.8-.4 1.7-.6 2.7-.6 2.1 0 3.9 1.2 4.5 3.6" fill="none" stroke="var(--control)" stroke-width="1.6" stroke-linecap="round"/></svg>',
}
STRENGTH = lambda s: f'<span class="strength" data-s="{s}" aria-hidden="true"><i></i><i></i><i></i></span>'

def preview(name, group, height, body, style="", script=""):
    return (f'<!-- @dsCard group="{group}" height={height} -->\n<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<title>{name} — preview</title>\n'
            f'<style>\n  html, body {{ margin: 0; }}\n  body {{ padding: 20px 24px; background: var(--bg); }}\n{style}</style>\n</head>\n<body>\n{body}\n'
            + (f"<script>\n{script}\n</script>\n" if script else "") + "</body>\n</html>\n")

C = []  # (name, group, height, readme, body, style, script)

C.append(("Button", "Actions", 96, """# Button

Buttons run one action and say exactly what it does.

**Use** `.btn` with one modifier: `.btn--primary` (the one main action in a region, `teal` fill with `on-teal` text), plain `.btn` (secondary), `.btn--quiet` (a low-key text action such as "Skip for now"), `.btn--sm` (32px, inside rows and toolbars; 40px on phones).

**The consumer provides** the label (verb first, sentence case: "Mark step done", never "Submit") and an optional 16px icon before it.

- One primary per region. Up next has one; a lecture step has one.
- Height 40px (`r-ctl` corners); 44px when it sits alone on a phone row.
- Press feedback is a `scale(.97)` over 140ms. No other motion.
- The label keeps the same words through the flow: "Mark step done" → toast "Done: <step>".
- Don't use orange buttons. Orange is for now / next marks, never actions.
""", f'''<div class="ds-row">
  <button type="button" class="btn btn--primary">{CHECK16} Mark step done</button>
  <button type="button" class="btn">Open guide</button>
  <button type="button" class="btn btn--quiet">Skip for now</button>
  <button type="button" class="btn btn--sm">Review</button>
  <button type="button" class="btn btn--primary btn--sm">{CHECK} Done</button>
</div>''', "", ""))

C.append(("Chip", "Actions", 80, """# Chip

Chips filter a list; the pressed one shows what's on screen.

**Use** `.chip` buttons in a `.seg` group with `aria-pressed`. The pressed chip inverts (`ink` fill, `bg` text). Add a count in `.n` when it helps decide ("Not checked off 9"). A `.select` pill sits beside chips for a second axis (module).

**The consumer provides** the filter names and counts.

- 36px tall on desktop, 44px on phones; `r-pill` corners.
- On phones the chip row scrolls sideways inside its own container; the page never does.
- Filters name what needs attention ("Needs review", "Not checked off"), not data fields.
- Don't build a wall of 10 chips: move a long list into the `.select`.
""", '''<div class="toolbar" style="margin:0">
  <div class="seg" role="group" aria-label="Show">
    <button type="button" class="chip" aria-pressed="true">All</button>
    <button type="button" class="chip" aria-pressed="false">This week</button>
    <button type="button" class="chip" aria-pressed="false">Needs review <span class="n">2</span></button>
    <button type="button" class="chip" aria-pressed="false">Not checked off <span class="n">9</span></button>
  </div>
  <select class="select" aria-label="Module"><option>All modules</option><option>3 · Beyond Building</option></select>
</div>''', "", """document.querySelectorAll('.chip').forEach(function (c) { c.addEventListener('click', function () { document.querySelectorAll('.chip').forEach(function (x) { x.setAttribute('aria-pressed', x === c); }); }); });"""))

C.append(("Checkbox", "Inputs", 150, """# Checkbox

The checkbox ticks off one thing that was done: a prep step or an assignment.

**Use** `<button class="cb" role="checkbox" aria-checked>` with the check SVG inside, next to a `.check-row__text` block. A ticked row strikes its title in `muted`.

**The consumer provides** the label (as `aria-label` or visible text) and the "done when" line.

- 24px visual (26px on phones), 2px `control` border (3.2:1), 44px hit area from `::after`.
- Checked: `teal` fill, and the `on-teal` check draws itself in (`stroke-dashoffset`, 220ms, `ease-out`). The check path needs `pathLength="1"`.
- Ticking is always reversible: click again, or Undo in the toast.
- Lecture steps use the Step marker instead, not this checkbox.
""", f'''<ul class="rows" style="border-top:0;max-width:560px">
  <li class="check-row" data-done="true"><button type="button" class="cb" role="checkbox" aria-checked="true" aria-label="Skim the TMDB API docs">{CHECK}</button><div class="check-row__text"><p>Skim the TMDB API docs</p><p class="row__sub">You can name 2–3 endpoints you'll use.</p></div></li>
  <li class="check-row" data-done="false"><button type="button" class="cb" role="checkbox" aria-checked="false" aria-label="Get a TMDB API key">{CHECK}</button><div class="check-row__text"><p>Get a TMDB API key</p><p class="row__sub">It's saved in .env.local, not in git.</p></div></li>
</ul>''', "", """document.querySelectorAll('.cb').forEach(function (b) { b.addEventListener('click', function () { var on = b.getAttribute('aria-checked') !== 'true'; b.setAttribute('aria-checked', on); b.closest('.check-row').dataset.done = on; }); });"""))

STEPS_BODY = f'''<ol class="steps" style="margin:0;max-width:660px">
  <li class="step" data-done="true" data-current="false" data-open="false">
    <button type="button" class="marker" role="checkbox" aria-checked="true" aria-label="Step 1: Do Part I"><span class="n">1</span><span class="chk">{CHECK16}</span></button>
    <div><div class="step__head"><button type="button" class="step__toggle" aria-expanded="false"><span class="step__title">Do Part I: peer quiz, then FreeCodeCamp</span><span class="step__peek"></span></button><button type="button" class="step__undo">{UNDO} Undo</button></div>
    <div class="step__body"><div class="step__inner"><div class="step__pad"></div></div></div></div>
  </li>
  <li class="step" data-done="false" data-current="true" data-open="true">
    <button type="button" class="marker" role="checkbox" aria-checked="false" aria-label="Step 2: Restructure Myflix"><span class="n">2</span><span class="chk">{CHECK16}</span></button>
    <div><div class="step__head"><button type="button" class="step__toggle" aria-expanded="true"><span class="step__title">Restructure Myflix into front-end/ + supabase/</span><span class="step__peek"></span></button></div>
    <div class="step__body"><div class="step__inner"><div class="step__pad">
      <p class="step__detail">Commit first so you can roll back. Then run the restructure prompt from the Full-Stack lecture.</p>
      <div class="code" data-wrap="false"><div class="code__bar"><span>Terminal</span><button type="button" class="copy-btn">{COPY}<span>Copy</span></button></div><pre><code>git add -A &amp;&amp; git commit -m "Before full-stack"</code></pre></div>
      <p class="done-when">{VERIFY}<span><b>Done when</b>The root has front-end/, supabase/, one .claude/ and .mcp.json.</span></p>
      <div class="step__actions"><button type="button" class="btn btn--primary">{CHECK16} Mark done and continue</button><button type="button" class="btn btn--quiet">Skip for now</button></div>
    </div></div></div></div>
  </li>
  <li class="step" data-done="false" data-current="false" data-open="false">
    <button type="button" class="marker" role="checkbox" aria-checked="false" aria-label="Step 3: Paste the restructure prompt"><span class="n">3</span><span class="chk">{CHECK16}</span></button>
    <div><div class="step__head"><button type="button" class="step__toggle" aria-expanded="false"><span class="step__title">Paste the restructure prompt</span><span class="step__peek">Instructor prompt from the Full-Stack lecture, word for word.</span></button></div>
    <div class="step__body"><div class="step__inner"><div class="step__pad"></div></div></div></div>
  </li>
</ol>'''
C.append(("StepList", "Content", 430, """# StepList

A lecture guide's steps, shown one at a time: done steps fold away, the current one is open, future ones show a one-line peek.

**Use** `<ol class="steps">` of `.step` items with `data-done`, `data-current` and `data-open`. Each has a `.marker` (role="checkbox", the step number or a check), a `.step__toggle` header (`aria-expanded`), an `.step__undo` button and a `.step__body` that collapses with `grid-template-rows: 0fr → 1fr` over 240ms. Ticking a step cross-fades the number into a drawn check and fills the rail down to the next step (320ms, `ease-in-out`).

**The consumer provides** per step: `title`, `detail`, optional `code` + `codeLabel` (rendered with CodeBlock), and `doneWhen`.

- Markers are 36px circles on a 2px rail: future `control`, current `now` ring with a `now-soft` halo, done `teal` fill.
- The current step ends with "Mark done and continue" (primary) and "Skip for now" (quiet). After marking, scroll the next step 96px from the top once the collapse finishes.
- Collapsed content is `visibility: hidden` so it can't be tabbed into.
- Done titles strike through in `muted`; Undo appears on the line.
- Never show all steps expanded by default; "Expand all" is the user's choice.
""", STEPS_BODY, "", ""))

C.append(("CodeBlock", "Content", 300, """# CodeBlock

A command or Claude prompt to copy exactly, on a dark `code-bg` that reads the same in both themes.

**Use** `.code` with a `.code__bar` (label in `code-meta` mono + a Copy button) and a `<pre><code>`. Set `data-wrap="true"` for Claude prompts and prose (they wrap and stay fully readable); terminal commands and SQL keep `white-space: pre` and scroll inside the block. Over 12 lines, `data-clamp="true"` limits it to 280px with a fade and a "Show all N lines" button.

**The consumer provides** the code text and its label: `Terminal`, `Claude prompt`, `SQL`, `File`.

- Copy always copies the full text. The label switches to "Copied" for 1.6s; on phones a toast confirms too.
- If the clipboard is refused, select the text and say "Selected: press ⌘C".
- Type: `code` (13px, 1.65). Never put secrets in examples: use `YOUR_PUBLISHABLE_KEY`.
""", f'''<div class="ds-stack" style="max-width:640px">
  <div class="code" data-wrap="false"><div class="code__bar"><span>Terminal</span><button type="button" class="copy-btn">{COPY}<span>Copy</span></button></div><pre><code>cd ~/Desktop/codeplatoon/assignments/week-02/netflix &amp;&amp; npm run dev</code></pre></div>
  <div class="code" data-wrap="true"><div class="code__bar"><span>Claude prompt</span><button type="button" class="copy-btn">{COPY}<span>Copy</span></button></div><pre><code>Restructure this project into the full-stack layout below. Move files only: don't change any code. Show me the plan (what moves where) first and wait for my approval.</code></pre></div>
</div>''', "", """document.querySelectorAll('.copy-btn').forEach(function (b) { b.addEventListener('click', function () { var s = b.querySelector('span'); s.textContent = 'Copied'; b.dataset.copied = 'true'; setTimeout(function () { s.textContent = 'Copy'; b.dataset.copied = 'false'; }, 1600); }); });"""))

C.append(("UpNext", "Content", 360, """# UpNext

The one card on Today: the exact next step, with everything needed to finish it in place.

**Use** `.upnext` (the only element with the 4px `now` left rule) containing an eyebrow (`now-ink`: why it's next · lecture link · step n of N), the step title in `title`, a 2-line `detail`, an optional CodeBlock, the Done when line, and actions: "Mark step done" (primary), "Open guide" (secondary) and the time left.

**The consumer provides** the lecture, the step and the reason it's next: today's lecture, "Tonight's homework" after 6:30pm, "Pick up where you left off", "Still open from <date>", or "Prep for <date>".

- One per page. When nothing is open: "You're caught up" with a pointer to Review.
- After "Mark step done" the old step fades up and out and the next one rises in (a view transition, 280ms) while a toast offers Undo.
- Surface: `surface` with `shadow-ring`, `r-panel` corners.
""", f'''<section class="upnext" style="margin:0;max-width:720px" aria-labelledby="up-h"><div class="upnext__body">
  <p class="upnext__eyebrow"><span>Up next</span><span>·</span><a href="#">AI-8 Authentication</a><span>·</span><span>step 2 of 10</span></p>
  <h2 class="upnext__title" id="up-h">Restructure Myflix into front-end/ + supabase/</h2>
  <p class="upnext__detail">Commit first so you can roll back. Then run the restructure prompt from the Full-Stack lecture.</p>
  <div class="code" data-wrap="false"><div class="code__bar"><span>Terminal</span><button type="button" class="copy-btn">{COPY}<span>Copy</span></button></div><pre><code>git add -A &amp;&amp; git commit -m "Before full-stack"</code></pre></div>
  <p class="done-when">{VERIFY}<span><b>Done when</b>The root has front-end/, supabase/, one .claude/ and .mcp.json.</span></p>
  <div class="upnext__actions"><button type="button" class="btn btn--primary">{CHECK16} Mark step done</button><a class="btn" href="#">Open guide</a><span class="upnext__left">About 4.5 hrs left in this guide</span></div>
</div></section>''', "", ""))

C.append(("Row", "Content", 260, """# Row

Rows are the hub's main unit: one item per line on a hairline, never a grid of cards.

**Use** `.rows` with `.row` items (status icon · `.row__main` with `.row__title` and `.row__sub` · `.row__end`). The Course map uses `.lrow`, a link row with fixed columns: status, code (`mono-label`), title, date, progress mini-bar, confidence, chevron.

**The consumer provides** the title, sub-line, status and end meta.

- Min height `row` (40px; 52px on phones). Titles in `row-title`, sub-lines in `meta` + `muted`.
- External links end with the ↗ icon; internal ones don't.
- One status signal per row (the icon), not an icon plus a pill saying the same thing.
- Hover tints the row `surface-2`; the chevron nudges 2px.
""", f'''<div style="max-width:720px">
<ul class="rows">
  <li class="row"><span class="st">{ST["progress"]}</span><div class="row__main"><p class="row__title"><a href="#">agentic-netflix-clone III · full stack merge {EXT}</a></p><p class="row__sub">In progress · Connected to Supabase; still needs front-end/ + supabase/</p></div><div class="row__end"><a class="code-tag" href="#">AI-7</a></div></li>
  <li class="row"><span class="st">{ST["open"]}</span><div class="row__main"><p class="row__title">agentic-netflix-clone IV · Auth</p><p class="row__sub">To do · lines up with AI-8 Authentication</p></div><div class="row__end"><a class="code-tag" href="#">AI-8</a></div></li>
</ul>
<div style="margin-top:12px">
  <a class="lrow" href="#" data-status="now"><span class="st">{ST["now"]}</span><span class="code-tag lrow__code">AI-8</span><span class="lrow__title">Authentication</span><span class="lrow__date">Mon Oct 19</span><span class="lrow__prog"><span class="mini"><span style="--w:20%"></span></span><span>2/10</span></span><span class="lrow__conf"></span><span class="lrow__go">{CHEV}</span></a>
  <a class="lrow" href="#" data-status="outline"><span class="st">{ST["outline"]}</span><span class="code-tag lrow__code"></span><span class="lrow__title">Git + GitHub</span><span class="lrow__date">Fri Oct 23</span><span class="lrow__prog">prep 4</span><span class="lrow__conf"></span><span class="lrow__go">{CHEV}</span></a>
</div></div>''', "", ""))

C.append(("StatusIcon", "Status", 170, """# StatusIcon

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
""", "<div class=\"kbd-list\" style=\"grid-template-columns:auto 1fr auto 1fr;max-width:640px\">" + "".join(f'<span class="st">{ST[k]}</span><span>{t}</span>' for k, t in [("done", "Done"), ("progress", "In progress"), ("now", "Today / now"), ("open", "Not checked off · upcoming"), ("outline", "Prep outline"), ("check", "Ask instructor"), ("quiz", "Team quiz")]) + "</div>", "", ""))

C.append(("StrengthMeter", "Status", 96, """# StrengthMeter

Three dashes that show how well a lecture is understood, always with its word beside it.

**Use** `<span class="strength" data-s="weak|medium|strong">` with three `<i>`. Weak (ratings 1–2) = one `warn-mark` dash, Medium (3) = two `teal`, Strong (4–5) = three `teal`. Always followed by the rating word ("Shaky").

- 12×3px dashes, 3px apart. Decorative (`aria-hidden`); the word carries the meaning.
""", f'''<div class="ds-stack" style="font-size:14px">
  <span>{STRENGTH("weak")} Shaky</span>
  <span>{STRENGTH("medium")} Getting it</span>
  <span>{STRENGTH("strong")} Could teach it</span>
</div>''', "", ""))

C.append(("ConfidenceRating", "Inputs", 150, """# ConfidenceRating

A 1–5 rating of how well a lecture is understood; ratings 1–4 schedule its next review.

**Use** `.rating` as `role="radiogroup"` with five `role="radio"` buttons (44px tall, `control` border, `r-ctl` corners), `.rating__ends` ("Lost" … "Could teach it") and `.rating__help`, a live line that says what happens next.

**The consumer provides** the lecture and its current rating.

- Scale: 1 Lost · 2 Shaky · 3 Getting it · 4 Solid · 5 Could teach it. Review comes back after: next class day · 2 days · 4 days · 10 days · never.
- Arrow keys move and select. Pressing the selected value again does not clear it; "Clear" is a separate link.
- Disabled before the lecture's date: "You can rate this after class on Mon Oct 19."
""", '''<div style="max-width:300px">
  <div class="rating" role="radiogroup" aria-label="Confidence, 1 to 5">
    <button type="button" role="radio" aria-checked="false" aria-label="1 of 5, Lost">1</button>
    <button type="button" role="radio" aria-checked="true" aria-label="2 of 5, Shaky">2</button>
    <button type="button" role="radio" aria-checked="false" aria-label="3 of 5, Getting it">3</button>
    <button type="button" role="radio" aria-checked="false" aria-label="4 of 5, Solid">4</button>
    <button type="button" role="radio" aria-checked="false" aria-label="5 of 5, Could teach it">5</button>
  </div>
  <div class="rating__ends"><span>Lost</span><span>Could teach it</span></div>
  <p class="rating__help" aria-live="polite">Shaky. It comes back for review on Wed Oct 21.</p>
</div>''', "", """var L = ['Lost', 'Shaky', 'Getting it', 'Solid', 'Could teach it'], A = ['next class day', 'on Wed Oct 21', 'on Fri Oct 23', 'on Thu Oct 29'];
document.querySelectorAll('[role=radio]').forEach(function (b, i) { b.addEventListener('click', function () { document.querySelectorAll('[role=radio]').forEach(function (x) { x.setAttribute('aria-checked', x === b); }); document.querySelector('.rating__help').textContent = L[i] + '. ' + (i === 4 ? "It won't come back for review." : 'It comes back for review ' + A[i] + '.'); }); });"""))

C.append(("WeekGoal", "Inputs", 190, """# WeekGoal

A weekly study goal: Mon–Fri circles, quieter weekend dots, a stepper and a streak counted in weeks.

**Use** `.goal-days` with `.gd` items (`data-on`, `data-today`; `.gd--we` for Sat/Sun), `.goal-text`, and a `.stepper` (− n days +) in `.goal-foot`.

**The consumer provides** the target (1–7 days, default 4) and the days studied.

- Ticking a step, rating or writing notes logs the day; "I studied off the hub" logs it by hand.
- The streak counts weeks in a row that met the goal, so weekends never break it.
- Today gets a `now` ring. No flames, no guilt copy: "2 more days this week keeps your 3-week streak."
""", f'''<div style="max-width:300px">
  <div class="goal-days">
    <span class="gd" data-on="true"><i>{CHECK.replace('14', '12')}</i>M</span><span class="gd" data-on="true"><i>{CHECK.replace('14', '12')}</i>T</span><span class="gd" data-on="false" data-today="true"><i></i>W</span><span class="gd"><i></i>T</span><span class="gd"><i></i>F</span>
    <span class="goal-sep" aria-hidden="true"></span><span class="gd gd--we"><i></i>S</span><span class="gd gd--we"><i></i>S</span>
  </div>
  <p class="goal-text"><b>2 more days</b> this week keeps your 3-week streak.</p>
  <div class="goal-foot"><span class="stepper" role="group" aria-label="Weekly goal"><button type="button" aria-label="Fewer days">−</button><output>4 days</output><button type="button" aria-label="More days">+</button></span><button type="button" class="link-btn">I studied off the hub</button></div>
</div>''', "", ""))

C.append(("DayTimeline", "Time", 140, """# DayTimeline

Today's class day as time-proportional blocks from 9:30am to 6:30pm ET, with a hairline marking now.

**Use** `<ol class="track">` of `.block` items (`--m` = minutes, `min-width` 96px) with `data-state` past / now / next, each holding a `.block__bar`, `.block__time` (`mono-label`) and `.block__label`. A `.nowline` (2px `now`, time label in `now-ink`) is placed by script at the current minute.

**The consumer provides** the day's items (time, title, lecture link).

- Past bars fill with tinted `teal`; the current bar gets a 2px `now` outline; future bars are `surface-2` with a `line` ring.
- On phones it collapses to one Now / Next row that expands to a vertical list.
- The now-line moves once a minute with no animation. Before 9:30: "Class starts at 9:30 ET".
- Expose the order as a list with `aria-current="time"` on the current block.
""", '''<div class="timeline" style="margin:24px 0 0;max-width:820px"><ol class="track" id="track">
  <li class="block" data-state="past" data-kind="routine" style="--m:30" data-start="570" data-end="600"><div class="block__bar"></div><p class="block__time">9:30am</p><p class="block__label">Stand Up</p></li>
  <li class="block" data-state="now" data-kind="lecture" style="--m:270" data-start="600" data-end="870" aria-current="time"><div class="block__bar"></div><p class="block__time">10am</p><p class="block__label"><a href="#">AI-8 Authentication</a></p></li>
  <li class="block" data-state="next" data-kind="work" style="--m:180" data-start="870" data-end="1050"><div class="block__bar"></div><p class="block__time">2:30pm</p><p class="block__label">Work time</p></li>
  <li class="block" data-state="next" data-kind="routine" style="--m:30" data-start="1050" data-end="1080"><div class="block__bar"></div><p class="block__time">5:30pm</p><p class="block__label">Team Meet</p></li>
  <li class="block" data-state="next" data-kind="routine" style="--m:30" data-start="1080" data-end="1110"><div class="block__bar"></div><p class="block__time">6pm</p><p class="block__label">Stand Down</p></li>
</ol></div>''', "", """var t = document.getElementById('track'), b = t.children[1], m = 675;
var x = b.offsetLeft + ((m - 600) / 270) * b.offsetWidth, n = document.createElement('div');
n.className = 'nowline'; n.style.left = (x - 1) + 'px'; n.innerHTML = '<span>11:15</span>'; t.appendChild(n);"""))

ticks = []
for i in range(75):
    p = "past" if i < 9 else "today" if i == 9 else "future"
    off = i in (5, 26, 37, 38, 59, 60, 64, 65)
    ticks.append(f'<i data-p="{p}" data-off="{str(off).lower()}"></i>')
C.append(("CourseRuler", "Time", 84, """# CourseRuler

The whole bootcamp as one row of ticks, one per weekday, so time passing never masquerades as progress.

**Use** `.ruler` with `.ruler__ticks` (one `<i>` per weekday: `data-p` past / today / future, `data-off` for no-class days) and `.ruler__weeks` labels underneath.

- Past ticks are `ink-2` at 45% over `surface-2`, today is `now`, no-class days are hollow.
- It replaces "% elapsed" meters. Learning progress uses `teal` bars, never the ruler.
- `role="img"` with a label: "Bootcamp timeline: class day 10 of 67".
""", f'<div class="ruler" style="margin:0;max-width:820px" role="img" aria-label="Bootcamp timeline: class day 10 of 67"><div class="ruler__ticks">{"".join(ticks)}</div><div class="ruler__weeks">' + "".join(f'<span style="--n:5">{"W" + str(k) if k % 2 else ""}</span>' for k in range(1, 16)) + "</div></div>", "", ""))

heat = []
labels = ["Mon", "", "Wed", "", "Fri", "", "Sun"]
sample = {(0, 0): 1, (1, 0): 2, (2, 0): 1, (3, 0): 2, (0, 1): 1, (2, 1): 3, (3, 1): 1, (4, 1): 2, (5, 1): 3, (0, 2): 1}
for r in range(7):
    heat.append(f'<span class="lbl">{labels[r]}</span>')
    for wk in range(15):
        future = wk > 2 or (wk == 2 and r > 0)
        lvl = sample.get((r, wk), 0)
        heat.append(f'<i class="cell" data-l="{lvl}" data-f="{str(future).lower()}" data-today="{str(wk == 2 and r == 0).lower()}"></i>')
C.append(("Heatmap", "Time", 200, """# Heatmap

Activity across the 15 weeks: commits plus study days, one 13px cell per day.

**Use** `.heat__grid` (a label column + 15 week columns, 7 rows Mon–Sun) of `.cell` items with `data-l` 0–3, `data-f` for future days (outlined, no fill), `data-off` for no-class days (hatched) and `data-today` (`now` ring). Add the `.legend` "Fewer … More".

- Levels are `teal` at 35%, 65% and 100% over `surface-2`.
- `role="img"` with a summary label ("14 commits and 2 study days so far"); each cell has a `title`.
- The preview shows example data.
""", '<div class="heat"><div class="heat__grid" role="img" aria-label="Example: 14 commits and 2 study days so far">' + '<span></span>' + "".join(f'<span class="lbl" style="text-align:center">{k if k % 2 else ""}</span>' for k in range(1, 16)) + "".join(heat) + '</div></div><p class="legend"><span>Fewer</span><i class="cell"></i><i class="cell" data-l="1"></i><i class="cell" data-l="2"></i><i class="cell" data-l="3"></i><span>More</span></p>', "", ""))

C.append(("Banner", "Feedback", 170, """# Banner

A one-time or situational message above the main content: the catch-up offer, or a no-class notice.

**Use** `.banner` (`teal-soft` fill, `r-panel`) for an offer with actions (primary + quiet "Not now"), and `.notice` (`surface-2`, info icon) for plain information.

**The consumer provides** one or two sentences and, for `.banner`, the actions.

- Say what to do and why in plain words: "Mark what you've already finished so Up next points at the right step."
- Never stack more than one banner. Never use orange or warn colors here.
""", f'''<div class="ds-stack" style="max-width:720px">
  <div class="banner" style="margin:0"><p>You've had 9 lectures with guides so far. Mark what you've already finished so <b>Up next</b> points at the right step.</p><div class="banner__actions"><button type="button" class="btn btn--primary btn--sm">Catch up · 2 min</button><button type="button" class="btn btn--quiet btn--sm">Not now</button></div></div>
  <p class="notice" style="margin:0">{INFO}<span>No class today. Next class: <strong>Monday, October 19</strong> · AI-8 Authentication.</span></p>
</div>''', "", ""))

C.append(("Toast", "Feedback", 90, """# Toast

A short confirmation at the bottom of the screen, with Undo when the action changed data.

**Use** `.toast` (`ink` fill, `bg` text, `shadow-pop`), shown for 2.2s, or 6s when it carries an action button. It sits above the tab bar on phones. It rises 16px into place (260ms) and leaves with a smaller 6px drop (150ms); a second message swaps its text in place, and the timer waits while the pointer or focus is on it.

**The consumer provides** the message (past tense, specific: "Done: Do Part I") and an optional action ("Undo").

- Every tick, status change or rating from a summary view gets a toast with Undo.
- `role="status"` so screen readers hear it. Don't use toasts for errors that need a decision.
""", '<div class="toast" data-show="true" style="position:static;transform:none;opacity:1;display:inline-flex"><span>Done: Do Part I: peer quiz, then FreeCodeCamp</span><button type="button">Undo</button></div>', "", ""))

C.append(("EmptyState", "Feedback", 120, """# EmptyState

What a list shows when it has nothing: what will appear here, and the one action that fills it.

**Use** `.empty` with a sentence and, when there's a next move, one button.

- Write it as direction, not mood: "Rate a lecture after class. Anything you rate 1–3 comes back here when it's time to review."
- Loading uses skeleton bars (`.sk`, `surface-2`, `r-code`) shaped like the final rows, never a spinner sentence.
""", '<div class="empty" style="padding:0"><p>Rate a lecture after class. Anything you rate 1–3 comes back here when it\'s time to review.</p><button type="button" class="btn btn--sm btn--primary">Rate AI-8</button></div><div class="ds-stack" style="margin-top:16px;max-width:420px"><div class="sk" style="height:14px;width:70%"></div><div class="sk" style="height:14px;width:45%"></div></div>', "", ""))

C.append(("RecallCard", "Content", 190, """# RecallCard

Active recall for a key term: say it from memory, reveal, then mark Got it or Not yet.

**Use** `.card` (`surface` + `shadow-ring`, `r-panel`) with `.card__term`, a "Show meaning" button, then `.card__meaning` and the two answers. `data-result="got|missed"` rings the card in `teal` or `warn-mark`.

**The consumer provides** the term and its one-sentence meaning (from the guide's `concepts`).

- 2 columns on desktop, 1 on phones. "Not yet" terms feed the "Quiz me" prompt and the Review tab.
""", '''<div class="recall__grid" style="margin:0;max-width:640px">
  <div class="card"><p class="card__term">JWT</p><div class="card__actions"><button type="button" class="btn btn--sm">Show meaning</button></div></div>
  <div class="card" data-result="got"><p class="card__term">RLS (Row Level Security)<small>Got it</small></p><p class="card__meaning">Database rules that filter every request by who is asking.</p><div class="card__actions"><button type="button" class="btn btn--sm">Not yet</button><button type="button" class="btn btn--sm">Got it</button></div></div>
</div>''', "", ""))

C.append(("Navigation", "Navigation", 190, """# Navigation

Four destinations: Today, Course, Review and Work. A top bar on desktop, a bottom tab bar on phones.

**Use** `.bar` (sticky, 56px, translucent `surface` with blur) with the brand mark, `.tabs` (the current one gets a 2px `teal` underline and `aria-current="page"`), the ⌘K `.search-btn` and the `.save` status. Under 900px the top bar shrinks to 48px with the page title, and `.tabbar` (56px + safe area) carries the tabs with icons and a Review `.badge`.

- Save status words: "Saved" (`teal` dot), "Saving…" (pulsing grey), "Saved in this browser only", "Not saving: reload" (`warn-mark` dot). The save dot is never orange.
- A lecture page is a child of Course: breadcrumb "Course / Week 3 / AI-8" plus previous / next.
""", f'''<header class="bar" style="position:static;border:1px solid var(--line);border-radius:10px"><div class="bar__inner" style="height:56px">
  <a class="brand" href="#"><img src="/_blob/{LOGO_BLOB}" width="28" height="28" alt=""><span class="brand__name">Eagle Learning Hub</span></a>
  <nav class="tabs" aria-label="Sections"><a class="tab" href="#" aria-current="page">Today</a><a class="tab" href="#">Course</a><a class="tab" href="#">Review<span class="badge">2</span></a><a class="tab" href="#">Work</a></nav>
  <div class="bar__right"><button type="button" class="search-btn" style="min-width:200px">{SEARCH}<span>Search lectures, terms…</span><kbd>⌘K</kbd></button><span class="save" data-mode="cloud"><span class="save__dot"></span><span class="save__text">Saved</span></span></div>
</div></header>
<nav class="tabbar" style="position:static;display:block;margin-top:14px;max-width:390px;border:1px solid var(--line);border-radius:10px" aria-label="Sections (phone)"><div class="tabbar__inner">
  <a href="#" aria-current="page"><svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true"><rect x="3" y="4.5" width="16" height="14" rx="3" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M3 9h16M7.5 2.5v4M14.5 2.5v4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>Today</a>
  <a href="#"><svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true"><path d="M5 5.5h12M5 11h12M5 16.5h8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>Course</a>
  <a href="#"><svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true"><path d="M4.5 11a6.5 6.5 0 1 0 2-4.7" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M4 3.5v3.6h3.6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>Review<span class="badge">2</span></a>
  <a href="#"><svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true"><rect x="3.5" y="6.5" width="15" height="11" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 6.5V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 14 5v1.5" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>Work</a>
</div></nav>''', "", ""))

C.append(("CommandPalette", "Overlays", 330, """# CommandPalette

⌘K, Ctrl-K or / opens search across lectures, key terms and assignments, plus a few actions.

**Use** a `<dialog class="palette">` (640px, 12px from the top on phones) with a 52px input, a `role="listbox"` of `.pal-item` options grouped under `.pal-group` labels (Actions, Lectures, Assignments, Key terms), and a footer of key hints.

**The consumer provides** the index: each item's title, a muted sub-line (breadcrumb or the term's meaning) and its target.

- Matching is case-insensitive and ignores punctuation ("fe-3" finds "FE 3"); prefix matches rank first.
- Empty query shows Actions and Recent. No results: "No match for “jwtt”. Try a lecture code like AI-8."
- Arrow keys move `aria-selected`; Enter opens; Esc closes and returns focus.
""", f'''<dialog open class="palette" style="position:static;margin:0;width:100%;max-width:640px">
  <div class="palette__input">{SEARCH}<input type="text" value="rls" aria-label="Search"><span class="kbd">esc</span></div>
  <div class="palette__list" role="listbox"><p class="pal-group">Key terms</p>
    <button type="button" class="pal-item" role="option" aria-selected="true"><span class="pal-item__text"><span class="pal-item__title" style="display:block">RLS (Row Level Security)</span><span class="pal-item__sub" style="display:block">AI-6 · Database rules that decide which rows each request may read or change.</span></span></button>
    <button type="button" class="pal-item" role="option" aria-selected="false"><span class="pal-item__text"><span class="pal-item__title" style="display:block">RLS (Row Level Security)</span><span class="pal-item__sub" style="display:block">AI-8 · Database rules that filter every request by who is asking.</span></span></button>
  </div>
  <div class="palette__foot"><span>↑↓ to move</span><span>↵ to open</span><span>esc to close</span></div>
</dialog>''', "", ""))

C.append(("Sheet", "Overlays", 300, """# Sheet

A focused dialog for one task: rate a lecture, write notes, catch up, review terms, or read the help.

**Use** `<dialog class="sheet">` (520px, 12px radius, `shadow-pop`) with `.sheet__head` (title + close), `.sheet__body` and an optional `.sheet__foot` for the final action. Opened with `showModal()`: focus moves inside, Esc and the backdrop close it, and focus returns to the trigger.

- One task per sheet; the primary action sits bottom-right.
- On phones the lecture page's Rate and Notes open as sheets from the sticky bar.
""", f'''<dialog open class="sheet" style="position:static;margin:0;max-width:520px" aria-labelledby="sh-t">
  <div class="sheet__head"><h2 id="sh-t">Rate AI-8</h2><button type="button" class="icon-btn" aria-label="Close">{CLOSE}</button></div>
  <div class="sheet__body"><p class="row__sub" style="font-size:14px">Authentication</p>
    <div><div class="rating" role="radiogroup" aria-label="Confidence"><button type="button" role="radio" aria-checked="false">1</button><button type="button" role="radio" aria-checked="false">2</button><button type="button" role="radio" aria-checked="true">3</button><button type="button" role="radio" aria-checked="false">4</button><button type="button" role="radio" aria-checked="false">5</button></div><div class="rating__ends"><span>Lost</span><span>Could teach it</span></div><p class="rating__help">Getting it. It comes back for review on Fri Oct 23.</p></div></div>
  <div class="sheet__foot"><button type="button" class="btn btn--primary">Done</button></div>
</dialog>''', "", ""))

C.append(("Menu", "Overlays", 230, """# Menu

A small list of choices anchored to the control that opened it, such as an assignment's status.

**Use** `.menu` (`role="menu"`, `surface`, `shadow-pop`, `r-panel`) of 40px `menuitemradio` buttons, each with its StatusIcon. The current choice shows a `teal-strong` check.

- Opens below its trigger, or above when there's no room; arrow keys move, Esc closes and focus returns.
- After a choice, a toast confirms with Undo ("… moved to Done").
""", f'''<div class="menu" role="menu" style="position:static;max-width:240px">
  <button type="button" role="menuitemradio" aria-checked="false">{ST["open"]}To do</button>
  <button type="button" role="menuitemradio" aria-checked="true">{ST["progress"]}In progress</button>
  <button type="button" role="menuitemradio" aria-checked="false">{ST["check"]}Ask instructor</button>
  <button type="button" role="menuitemradio" aria-checked="false">{ST["done"]}Done</button>
</div>''', "", ""))

C.append(("Motion", "Motion", 330, """# Motion

The hub's motion vocabulary in one place: press Replay to see each piece at its real speed.

**Use** the curves and times in the README's Motion table. Each animation answers "what changed?": a tick confirms, the rail shows progress flowing to the next step, a swap shows what replaced what. Nothing loops, nothing runs on keyboard shortcuts, and `prefers-reduced-motion: reduce` turns it all off (this card too).

- Arriving or leaving: `--ease-out`. Moving on screen: `--ease-in-out`. Spring overshoot only for tiny confirmations.
- Exits are faster and smaller than entrances.
- Animate `transform`, `opacity`, `clip-path`, `stroke-dashoffset`; never width, height or margins.
""", f'''<div class="ds-stack" style="max-width:640px">
  <div class="ds-row"><button type="button" class="btn btn--primary btn--sm" id="replay">Replay</button><span class="row__sub">tick → rail fill → Up next swap → progress → toast</span></div>
  <ol class="steps" style="margin:0">
    <li class="step" id="s1" data-done="false" data-current="true" data-open="false"><button type="button" class="marker" role="checkbox" aria-checked="false" aria-label="Step 1"><span class="n">1</span><span class="chk">{CHECK16}</span></button><div><div class="step__head" style="padding-bottom:14px"><span class="step__title">Get a TMDB API key</span></div></div></li>
    <li class="step" id="s2" data-done="false" data-current="false" data-open="false"><button type="button" class="marker" role="checkbox" aria-checked="false" aria-label="Step 2"><span class="n">2</span><span class="chk">{CHECK16}</span></button><div><div class="step__head"><span class="step__title">Fetch trending shows</span></div></div></li>
  </ol>
  <section class="upnext" style="margin-top:0;padding:14px 18px 14px 22px"><div class="upnext__body" id="un"><p class="upnext__eyebrow">Up next · AI-9 · step 1 of 9</p><h2 class="upnext__title" style="font-size:19px;line-height:24px">Get a TMDB API key</h2></div></section>
  <div class="course-bar" style="margin:0"><span id="bar" style="--w:10%"></span></div>
</div>
<div class="toast" id="toast" role="status"><span>Done: Get a TMDB API key</span><button type="button">Undo</button></div>''', ".toast { position: absolute; }", """var s1 = document.getElementById('s1'), s2 = document.getElementById('s2'), un = document.getElementById('un'), bar = document.getElementById('bar'), t = document.getElementById('toast');
var titles = ['Get a TMDB API key', 'Fetch trending shows'], timers = [];
function reset() {
  timers.forEach(clearTimeout); timers = [];
  document.documentElement.classList.add('instant');
  s1.dataset.done = 'false'; s1.dataset.current = 'true'; s1.classList.remove('is-new'); s2.dataset.current = 'false';
  s1.querySelector('.marker').setAttribute('aria-checked', 'false');
  un.querySelector('h2').textContent = titles[0]; un.querySelector('p').textContent = 'Up next · AI-9 · step 1 of 9';
  bar.style.setProperty('--w', '10%'); t.dataset.show = 'false';
  void document.body.offsetWidth; document.documentElement.classList.remove('instant');
}
function play() {
  reset();
  timers.push(setTimeout(function () { s1.classList.add('is-new'); s1.dataset.done = 'true'; s1.dataset.current = 'false'; s2.dataset.current = 'true'; s1.querySelector('.marker').setAttribute('aria-checked', 'true'); }, 250));
  timers.push(setTimeout(function () { un.querySelector('h2').textContent = titles[1]; un.querySelector('p').textContent = 'Up next · AI-9 · step 2 of 9'; un.parentNode.classList.remove('is-swapping'); void un.offsetWidth; un.parentNode.classList.add('is-swapping'); bar.style.setProperty('--w', '22%'); }, 750));
  timers.push(setTimeout(function () { t.classList.add('is-from'); void t.offsetWidth; t.classList.remove('is-from'); t.dataset.show = 'true'; }, 850));
  timers.push(setTimeout(function () { t.dataset.show = 'false'; }, 3200));
}
document.getElementById('replay').addEventListener('click', play);
setTimeout(play, 400);"""))

exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "ds_cards_v3.py")).read())

for name, group, height, readme, body, style, script in C:
    w(f"components/{name}/README.md", readme.strip() + "\n")
    w(f"components/{name}/preview.html", preview(name, group, height, body, style, script))

# ---------- Cover ----------
w("components/Cover/preview.html", """<!-- @dsCard height=320 -->
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Eagle Hub Design System</title>
<style>
  html, body { margin: 0; height: 100%; }
  body { background: var(--bg); color: var(--ink); font-family: var(--font-display); overflow: hidden; }
  .cover { position: relative; width: 960px; height: 320px; overflow: hidden; }
  .band { position: absolute; top: 0; left: 0; width: 960px; height: 112px; }
  .band svg { display: block; }
  .past { fill: var(--teal); }
  .deep { fill: var(--teal-strong); }
  .now { fill: var(--now); }
  .tint { fill: var(--teal-soft); }
  .rest { fill: var(--control); }
  .dot { fill: var(--on-teal); }
  .blk { rx: var(--r-ctl); }
  .words { position: absolute; left: 48px; bottom: 32px; max-width: 440px; }
  .name { margin: 0; font-size: 64px; line-height: .95; font-weight: 600; letter-spacing: -0.015em; color: var(--ink); }
  .tag { margin: 8px 0 0 2px; font-family: var(--font-body); font-size: 14px; line-height: 20px; color: var(--muted); }
</style>
</head>
<body>
<div class="cover">
<div class="band" aria-hidden="true">
<svg viewBox="0 0 960 112" width="960" height="112">
<!--
  blocks      control 64 (Stand Up) · teal 400 (the lecture, the brand's main hue) · now 120 (the one orange, the current block) · teal-strong 200 (work time) · teal-soft 64 (Team Meet) · control bleeding off the right edge (Stand Down); about 35% of 960×320
  arrangement a strip of unequal bands sized by the class day's minutes, like DayTimeline: the brand composes in horizontal rows on hairlines
  pattern     dot grid, from "a ledger, not a dashboard … tabular numbers, IBM Plex Mono": 10 × 5 dots at a space-4 pitch in on-teal, cut into the lecture block
  scales      gaps space-1; block corners r-ctl; dot pitch space-4 (16px); band 112 tall, the name a space-8 step below it
-->
<rect class="rest blk" x="0" y="0" width="64" height="112" rx="6"/>
<rect class="past blk" x="68" y="0" width="400" height="112" rx="6"/>
<rect class="now blk" x="472" y="0" width="120" height="112" rx="6"/>
<rect class="deep blk" x="596" y="0" width="200" height="112" rx="6"/>
<rect class="tint blk" x="800" y="0" width="64" height="112" rx="6"/>
<rect class="rest blk" x="868" y="0" width="120" height="112" rx="6"/>
""" + "\n".join(f'<circle class="dot" cx="{92 + c * 16}" cy="{24 + r * 16}" r="1.6"/>' for r in range(5) for c in range(10)) + """
</svg>
</div>
<div class="words">
<h1 class="name">Eagle Hub<br>Design System</h1>
<p class="tag">Calm teal for progress, one orange for now. Rows on hairlines.</p>
</div>
</div>
</body>
</html>
""")

# ---------- README (the brand book) ----------
w("README.md", """The Eagle Learning Hub is a bootcamp student's daily home base: today's class, the next step to do, every lecture's guide, review and progress. Everything here serves one question, "what do I do now?", and keeps the rest quiet.

## Principles

1. **One next action.** Each view has a single `now`-marked action that names a step, not a page. Everything else is quieter.
2. **Finish where you see it.** Tick, copy and rate in place; Today can complete the current step without opening the guide.
3. **Close the learning loop.** Do the step, check yourself on the key terms, rate it, and it comes back for review on a schedule.
4. **Honest, not guilty.** Past work that isn't ticked is "Not checked off" in grey. Orange means now / next, never late.
5. **A ledger, not a dashboard.** Dense aligned rows on `line` hairlines, tabular numbers, few panels. No tile grids, gradients or decorative numbers.

**Craft rules (v3).**
- **Depth means something.** Rows sit flat on hairlines. Things you act on sit one level up (`shadow-raise`). Things that float sit two or three levels up (`shadow-float`, `shadow-pop`). Nothing else gets a shadow.
- **Show the change.** When a number, a ring or a list changes, you see it change: digits roll, rings close, rows rise into place. Nothing teleports, including when you come back to a page.
- **Keep the eye still.** After any action, the next thing to do lands where the eye already is. No jumps to the top, no lost scroll, no focus dropped on `<body>`.

## Voice and copy

- Plain, active, second person: "Mark what you've already finished so Up next points at the right step."
- Sentence case everywhere: headings, buttons, tabs. No uppercase eyebrows, no exclamation marks, no emoji.
- Buttons start with a verb and say what happens: "Mark step done", "Copy \\"Quiz me\\" prompt", "Catch up · 2 min". The same words carry through: "Mark step done" → toast "Done: <step>".
- Numbers are digits with tabular figures: "Day 10 of 67", "2 of 10 steps".
- Empty states give direction: "Rate a lecture after class. Anything you rate 1–3 comes back here when it's time to review."
- Errors say what happened and what to do, without apology: "Couldn't load the course data. Reload the page."
- Use the student's words: Stand Up, Stand Down, homework, Knowledge Check, lecture codes like AI-8.

## Color

- Text: `ink` for titles and primary text, `ink-2` for body copy, `muted` for meta. All on `bg`, `surface` or `surface-2`.
- Structure: rows sit on `bg` divided by `line`; they hover with a `row-hover` pill. Raised panels (`surface` + `shadow-raise`) are rare: Up next, the recall deck, pager links. Floating layers use `surface-raised`.
- Empty parts of bars, rings, rails and segment strips use `track` (teal at low alpha), so value and track read as one hue.
- **Teal means progress and done**: checks, done icons, progress bars, the primary button, links (`teal-strong`), focus.
- **Orange means now / next only**: the Up next rule, the now-line, the current step ring, today's tick (`now` for marks, `now-ink` for text). Never for actions, saving, focus, warnings or deadlines.
- **Warn (amber) means a real problem**: "Ask instructor", save errors, the Weak strength dash. Never for "past and not ticked".
- Controls carry a `control` border (3.2:1 or better). `line` is decoration only.
- Code sits on `code-bg` in both themes with `code-ink` text and a `code-meta` label.
- Both themes are first-class; every pair is checked in light and dark (see each token's note).

## Type

IBM Plex in three widths, loaded from Google Fonts:
- `display` family (Plex Sans Condensed 600) for titles only: `display` (view title), `lecture-title`, `title` (Up next step), `section`, `step-title`, `panel-title`. Balance-wrap headings.
- `body` family (Plex Sans) for reading: `body` (15/24), `body-lg` for the lecture summary, `row-title`, `meta`, `caption`. Keep lines under 68ch.
- `mono` family (Plex Mono) only for real code (`code`) and identifiers: lecture codes, times, step numbers, counts (`mono-label`). Never as decoration.

## Space and layout

- Spacing steps: `space-1` 4 · `space-2` 8 · `space-3` 12 · `space-4` 16 · `space-5` 20 · `space-6` 24 · `space-8` 32 · `space-10` 40 · `space-12` 48. Use `gap`, not margins between siblings.
- Desktop: a 56px sticky top bar (`bar-h`), content up to `content-max`, a main column up to `main-max` and a sticky side panel `rail-w` wide, `space-12` apart.
- Phones (under 900px): a 48px top bar with the page title, a bottom tab bar, one column, a `space-4` gutter, and every target at least `tap` (44px).
- Rows are `row` tall (52px on phones).

## Shape and elevation

- Corners: `r-xs` 4 (key caps, badges) · `r-item` 6 (thumbs, tiles) · `r-ctl` 8 (buttons, inputs, segments) · `r-code` 10 · `r-panel` 12 (cards, menus, toast) · `r-dialog` 16 (palette, dialogs, phone sheets) · `r-pill`. Nesting: inner = outer − inset, rounded down to a token.
- Elevation: `shadow-ring` (framed) → `shadow-raise` (acted on) → `shadow-float` (menus, toast, phone pill) → `shadow-pop` (palette, dialogs). Edges are box-shadow rings, never borders, so states never shift layout. In dark mode depth comes from the ring, a 1px top `highlight` and `surface-raised`.
- Never animate `box-shadow`. A hover shadow lives on a `::after` at opacity 0 and fades in. No gradients.

## Motion

Motion explains what changed: feedback for a tick, where a lecture came from, what replaced Up next. It never decorates. Rules (after Emil Kowalski and Jakub Krehel): under 300ms in the UI, `transform`, `opacity`, `clip-path` and small blurs only, exits faster and smaller than entrances, nothing on keyboard shortcuts, and `prefers-reduced-motion: reduce` turns all of it off.

**Curves and times** (CSS variables lifted from `hub/index.html` into `bundle.css`):

| Variable | Value | Use |
|---|---|---|
| `--ease-out` | `cubic-bezier(.23, 1, .32, 1)` | anything arriving or leaving |
| `--ease-in-out` | `cubic-bezier(.645, .045, .355, 1)` | anything moving while on screen (rings, bars, rails, underline) |
| `--ease-in` | `cubic-bezier(.32, 0, .67, 0)` | exits that leave the screen (a card tilting away, a sheet going down) |
| `--ease-drawer` | `cubic-bezier(.32, .72, 0, 1)` | phone sheets (the iOS drawer curve) |
| `--spring-pop` | `linear(…)`, 8% overshoot | small confirmations: tick press, done disc, goal day |
| `--spring-soft` | `linear(…)`, 4% overshoot | sliding thumbs, the next card coming forward |
| `--dur-instant` / `press` / `micro` / `ui` / `move` / `celebrate` | 90 / 120 / 160 / 220 / 280 / 560ms | press down, release, small swaps, panels, movement, the two celebrations |

| What | How | Time |
|---|---|---|
| Button | press `scale(.98)`; hover tint and lift on pseudo-elements; primary lifts 1px | 90ms down, 160ms up |
| "Mark step done" | the check draws and the label swaps to "Done"; holds, then the card moves on | 160ms + 300ms hold |
| Up next swap | view transition: old content out (up, blur), new in from `scale(.97)`; the card's height and every section under it glide | 140ms out, 240ms in, 260ms glide |
| Tick a step | spring press, the number blurs out as the check draws, the rail fills to the next step | 240ms, rail 280ms +60ms |
| Mark done and continue | tick where you can see it, hold, then this step folds while the next opens; scroll only if the next is off screen | 360ms hold, 220ms fold |
| Lecture complete | the header ring closes into the done disc, the finished panel rises, the rating segments rise 30ms apart, focus moves to the rating | about 560ms, once |
| Ring and bar fills | `stroke-dashoffset` / `clip-path`, only when the value changes (including when you come back) | 280ms |
| Ticker | digits roll, right-most first, 30ms apart | 220ms |
| Rating | the thumb slides to the choice; the word swaps with a rise | 200ms / 160ms |
| Recall deck | flip `rotateY`; answer tilts away ±48px ±3°; the next card comes forward | 280 / 200 / 220ms |
| Segmented control | the thumb slides (`clip-path`) | 220ms `--spring-soft` |
| Tabs | the page slides 12px in the tab's direction; the underline slides; on phones a pill slides behind the icon | 120ms out, 220ms in; 240ms |
| Course row → lecture | the page slides 24px forward, the row's title flies into the heading; the new page fades in late so the title lands in clear space | 280ms |
| Back to Course | mirror slide, the title flies home, scroll and open weeks are restored, the origin row glows and takes focus | 280ms; glow 300ms + 600ms fade |
| Filter change, week open | rows rise 4px into place, 20–24ms apart (capped at 8–10) | 200–220ms |
| Toast | rises out of a 2px blur; leaves with a 6px drop; text swaps in place | 240ms in, 150ms out |
| Menu | from its trigger corner, `scale(.96)` + fade | 150ms in, 100ms out |
| Sheet | desktop: `translateY(8px) scale(.96)` + fade; phone: slides up, drag down to close | 220 / 280ms in, 150 / 200ms out |
| Phone tab bar | hides while scrolling down a lecture; the lecture pill drops into its place | 220ms |
| First paint | the page arrives in 4 pieces, 40ms apart | 280ms, once per load |
| ⌘K palette, keyboard shortcuts, now-line | no animation | none |

Browsers without View Transitions (or `@starting-style`) just switch instantly; nothing breaks.

## Iconography

Inline SVG on a 16px or 20px grid, 1.5–1.7px strokes, round caps, colored with `currentColor` or a token. No emoji anywhere, including text that comes from data. The seven state icons are in StatusIcon; utility icons are check, chevron, copy, external (↗ for links that leave the hub), undo, search, info, close, flag (milestones), calendar-check and notes. The brand mark (teal square, two orange chevrons) is in Assets › Logos.

## Accessibility floor

- Text 4.5:1 on its grounds; controls, focus rings and meaningful marks 3:1, in both themes.
- Focus: a solid 2px `focus` ring at a 2px offset, and focus stays on the control that was used (or the next logical one) after any change.
- Touch targets at least 44px on phones; small visuals extend their hit area.
- Meaning never relies on color alone: icons carry labels, strength dashes carry words.
- Dialogs trap focus and return it; Esc closes; keyboard shortcuts (⌘K, /, g t/c/r/w, j/k, x, c, 1–5, n, e, ?) are ignored while typing.
- Collapsed content is hidden from the tab order.

## Components

Actions: Button, SegmentedControl. Inputs: Checkbox, ConfidenceRating, WeekGoal. Content: UpNext, StepList, CodeBlock, Row, RecallDeck. Status: StatusIcon, StrengthMeter, Ring, Ticker. Time: DayTimeline, CourseRuler, Heatmap. Feedback: Banner, Toast, EmptyState. Navigation: Navigation, FloatingBar. Overlays: CommandPalette, Sheet, Menu. Each card's guidelines say what to provide and when to use it.

## Do and don't

- Do give each view one orange-marked thing. Don't use orange for buttons or warnings.
- Do put progress inside the list (rings, mini-bars). Don't add summary tiles that read 0%.
- Do offer Undo after every change from a summary view. Don't use `confirm()` dialogs.
- Do write direction in empty states. Don't leave a view blank or apologize.
""")

w("assets/Logos/README.md", "The Eagle Learning Hub mark: a teal (`teal`) rounded square with two orange (`now`) chevrons, 28×28. Use it at 24–32px in the top bar beside the name in `panel-title`. It's an image, so its colors are fixed to the light-theme values; on dark grounds it keeps the same teal square.\n")

now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
index = {
    "v": 3, "layout": "files", "createdOnFiles": {"v": 1, "at": now},
    "title": "Eagle Hub Design System", "namespace": "EagleHub", "libraries": [],
    "sections": {}, "groups": ["Logos"],
    "assetGroups": {"Logos": {"name": "Logos", "tile": "l", "order": ["eagle-mark.svg"],
                              "files": {"eagle-mark.svg": {"name": "eagle-mark.svg", "blob": LOGO_BLOB, "size": 307, "type": "image/svg+xml"}}}},
    "blobs": {}, "docs": {"sections": []},
    "lastChange": {"by": "Jeffrey", "at": now, "via": "Claude Code", "note": "v3 premium: elevation, radius and ring tokens; button system; Ring, Ticker, SegmentedControl, RecallDeck and FloatingBar; motion v3 (from hub/index.html)"},
}
w("design-system.json", json.dumps(index, indent=2) + "\n")
files = []
for root, _, fs in os.walk(OUT):
    for f in fs:
        files.append(os.path.relpath(os.path.join(root, f), os.path.dirname(OUT)))
print(len(C), "components;", len(files), "files")
print("\n".join(sorted(files)))
