import json, sys

D = sys.argv[1]
L = {"bg": "#f3f6f6", "surface": "#ffffff", "surface-2": "#e9efef", "ink": "#0f2427", "ink-2": "#2c4144", "muted": "#56696c", "line": "#d3dddd", "control": "#7a8e90", "teal": "#1b6b6d", "teal-strong": "#12575a", "teal-soft": "#d6eae9", "on-teal": "#ffffff", "now": "#e2560a", "now-ink": "#a8400a", "now-soft": "#fde6d6", "warn": "#7a5300", "warn-mark": "#b07d12", "warn-soft": "#f8edcc", "code-bg": "#0f2427", "code-ink": "#dcecea", "code-meta": "#8fb1ae", "focus": "#12575a"}
DK = {"bg": "#0b1416", "surface": "#111c1f", "surface-2": "#172529", "ink": "#e2ecec", "ink-2": "#c3d2d3", "muted": "#93a6a8", "line": "#22343a", "control": "#5f7a7f", "teal": "#5ab6b2", "teal-strong": "#8ad3cf", "teal-soft": "#173a3b", "on-teal": "#04201f", "now": "#ff7a33", "now-ink": "#ff9b62", "now-soft": "#3a2316", "warn": "#e9bd5b", "warn-mark": "#e3b24a", "warn-soft": "#34290f", "code-bg": "#071012", "code-ink": "#d5e6e4", "code-meta": "#84a8a5", "focus": "#8ad3cf"}
USAGE = {
    "bg": "Page background behind every view. Rows and sections sit directly on it, divided by `line` hairlines.",
    "surface": "Areas that read as one object: the Up next card, dialogs, sheets, inputs, and the top and tab bars (92–94% over `bg`).",
    "surface-2": "Quiet fills: chips at rest, skeletons, hover rows, Work group headers, empty progress tracks.",
    "ink": "Primary text and titles on `bg`, `surface`, `surface-2` and `teal-soft` (14.8:1 / 15.5:1 on `bg`, light / dark).",
    "ink-2": "Body copy and secondary titles on `bg` and `surface` (9.9:1 / 12.0:1).",
    "muted": "Meta lines, dates, counts and helper text on `bg`, `surface` and `surface-2` (5.0:1 at worst, on `surface-2` light).",
    "line": "1px hairlines between rows and sections, card rings, track outlines. Decorative: never the only edge of a control.",
    "control": "Borders of interactive controls (checkboxes, step markers, rating segments, inputs) and empty status rings. 3.2:1 on `bg` light, 4.1:1 dark (meets the 3:1 non-text floor).",
    "teal": "Progress and done: filled checkboxes, done status, progress bars, the primary button fill, the active tab underline. Text on it uses `on-teal` (6.2:1 / 7.1:1).",
    "teal-strong": "Teal as text: links, the \"Done when\" label, active tab text, on `bg`, `surface` and `teal-soft` (6.6:1 at worst). Primary button hover.",
    "teal-soft": "Tint for the lecture goal panel, the catch-up banner and the finished-lecture panel. Text on it uses `ink` or `teal-strong`.",
    "on-teal": "Text and check marks on `teal` fills (white in light, deep teal in dark).",
    "now": "Now / next marks only: the Up next left rule, the now-line, the current step ring, today's tick and cell. Non-text marks, 3.5:1 on `bg` light. Never text, warnings, saving or focus.",
    "now-ink": "Orange as text: the Up next eyebrow, \"Today\", \"This week\", the now-line time, on `surface` and `bg` (5.7:1 / 9.0:1).",
    "now-soft": "The 4px halo behind the current step marker. Decorative.",
    "warn": "Warning text: \"Ask instructor\", save errors, on `warn-soft` and `bg` (5.9:1 / 8.1:1). Never for past work that isn't ticked.",
    "warn-mark": "Warning marks: the Ask instructor status icon, the Weak strength dash (3.6:1 on `surface` light).",
    "warn-soft": "Tint behind warning text.",
    "code-bg": "Code block background. Dark in both themes.",
    "code-ink": "Code text on `code-bg` (13.2:1 / 14.9:1).",
    "code-meta": "The code block's label (\"Terminal\", \"Claude prompt\") on `code-bg` (7.0:1 / 7.4:1).",
    "focus": "The 2px keyboard focus ring at a 2px offset, solid, on every surface (7.6:1 on `bg` light, 10.9:1 dark). Teal, never orange.",
}
# v3: raised surfaces, rings, hairlines, tracks and row states
L.update({"surface-raised": "#ffffff", "ring": "rgb(15 36 39 / .10)", "ring-strong": "rgb(15 36 39 / .16)", "line-soft": "rgb(15 36 39 / .07)", "highlight": "rgb(255 255 255 / 0)", "track": "rgb(27 107 109 / .16)", "row-hover": "rgb(15 36 39 / .035)", "row-sel": "rgb(27 107 109 / .08)"})
DK.update({"surface-raised": "#142226", "ring": "rgb(255 255 255 / .08)", "ring-strong": "rgb(255 255 255 / .13)", "line-soft": "rgb(255 255 255 / .06)", "highlight": "rgb(255 255 255 / .05)", "track": "rgb(90 182 178 / .20)", "row-hover": "rgb(255 255 255 / .035)", "row-sel": "rgb(90 182 178 / .10)"})
USAGE.update({
    "surface-raised": "Floating layers: menus, the palette, sheets and the phone lecture pill. In dark it is lighter than `surface`, because depth on near-black comes from lightness, not shadow.",
    "ring": "The 1px edge of raised things, drawn with box-shadow (never border, so states never shift layout). Alpha, so it adapts on tints.",
    "ring-strong": "Secondary buttons, hovered cards, the segmented thumb and key caps.",
    "line-soft": "Dividers inside a card or dialog (palette input, sheet footer). Row dividers between list items keep `line`.",
    "highlight": "The 1px inner top highlight on raised things in dark mode (off in light).",
    "track": "The empty part of every bar, ring, step rail and segment strip: teal at low alpha, so value and track read as one hue.",
    "row-hover": "The hover pill behind rows, tabs, step headers and quiet buttons. Animates by opacity only.",
    "row-sel": "Selected or current rows (the row you came back to, the palette selection) and the rating hover fill, paired with a 2px teal bar.",
})
ORDER = list(L.keys())

tokens = {
    "name": "Eagle Hub Design System", "version": 1,
    "color": {"themes": [{"id": "light", "name": "Light"}, {"id": "dark", "name": "Dark"}],
              "tokens": [{"name": n, "value": {"light": L[n], "dark": DK[n]}, "usage": USAGE[n]} for n in ORDER]},
    "type": {
        "fonts": [],
        "families": {
            "display": "\"IBM Plex Sans Condensed\", \"Arial Narrow\", \"Helvetica Neue\", Arial, sans-serif",
            "body": "\"IBM Plex Sans\", \"Helvetica Neue\", Arial, sans-serif",
            "mono": "\"IBM Plex Mono\", ui-monospace, \"SF Mono\", Menlo, monospace",
        },
        "groups": [
            {"name": "Display", "family": "display", "styles": [
                {"name": "display", "fontSize": "40px", "lineHeight": "44px", "fontWeight": 600, "letterSpacing": "-0.012em", "sample": "Monday, October 19", "usage": "View titles and today's date, one per view. Use `display-sm` on phones."},
                {"name": "display-sm", "fontSize": "26px", "lineHeight": "30px", "fontWeight": 600, "letterSpacing": "-0.012em", "sample": "Monday, October 19", "usage": "`display` on phones (under 900px)."},
                {"name": "lecture-title", "fontSize": "38px", "lineHeight": "42px", "fontWeight": 600, "sample": "Authentication", "usage": "The H1 of a lecture page (30px/34px on phones)."},
                {"name": "title", "fontSize": "26px", "lineHeight": "32px", "fontWeight": 600, "letterSpacing": "-0.01em", "sample": "Restructure Myflix into front-end/ + supabase/", "usage": "The step title inside the Up next card (21px/27px on phones)."},
                {"name": "section", "fontSize": "20px", "lineHeight": "26px", "fontWeight": 600, "sample": "Prep for tomorrow", "usage": "Section headings. Sentence case, never uppercase eyebrows."},
                {"name": "step-title", "fontSize": "18px", "lineHeight": "26px", "fontWeight": 600, "sample": "Back up, then drop the tables", "usage": "Step titles in a lecture guide."},
                {"name": "panel-title", "fontSize": "17px", "lineHeight": "22px", "fontWeight": 600, "sample": "Week 3", "usage": "Side-panel headings, week names on Course, sheet titles."},
            ]},
            {"name": "Text", "family": "body", "styles": [
                {"name": "body-lg", "fontSize": "16px", "lineHeight": 1.65, "fontWeight": 400, "sample": "How logins work, then Claude Code gives your app real email accounts.", "usage": "The lecture summary. Max 68ch."},
                {"name": "body", "fontSize": "15px", "lineHeight": "24px", "fontWeight": 400, "sample": "Commit first so you can roll back.", "usage": "Default text: step detail and descriptions. Max 68ch."},
                {"name": "row-title", "fontSize": "15px", "lineHeight": "22px", "fontWeight": 600, "sample": "agentic-netflix-clone IV · Auth", "usage": "The title line of a list row."},
                {"name": "meta", "fontSize": "13px", "lineHeight": "18px", "fontWeight": 400, "sample": "In progress · Week 2", "usage": "Row sub-lines, dates, counts and helper text, in `muted`."},
                {"name": "caption", "fontSize": "12px", "lineHeight": "16px", "fontWeight": 500, "sample": "Lost · Could teach it", "usage": "Rating end labels, tab bar labels, badges. The smallest text allowed."},
            ]},
            {"name": "Mono", "family": "mono", "styles": [
                {"name": "code", "fontSize": "13px", "lineHeight": 1.65, "fontWeight": 400, "sample": "git add -A && git commit -m \"Before full-stack\"", "usage": "Code blocks and inline code."},
                {"name": "mono-label", "fontSize": "12px", "lineHeight": "16px", "fontWeight": 500, "sample": "AI-8 · 10:00am", "usage": "Lecture codes, times, step numbers and counts. Always tabular figures."},
            ]},
        ],
    },
    "spacing": {"tokens": [
        {"name": "space-1", "value": "4px", "usage": "Tight gaps: icon to label in chips and badges; gaps between timeline blocks."},
        {"name": "space-2", "value": "8px", "usage": "Between buttons in a group; between a heading and its list."},
        {"name": "space-3", "value": "12px", "usage": "Between a row's icon, text and end; between cards in a grid."},
        {"name": "space-4", "value": "16px", "usage": "The phone page gutter; card padding on phones."},
        {"name": "space-5", "value": "20px", "usage": "Dialog side padding; phone page top padding."},
        {"name": "space-6", "value": "24px", "usage": "Up next card padding on desktop; toolbar to list."},
        {"name": "space-8", "value": "32px", "usage": "Page header to first block; desktop page top padding."},
        {"name": "space-10", "value": "40px", "usage": "Between major sections in the main column."},
        {"name": "space-12", "value": "48px", "usage": "Main column to side panel; above the lecture pager."},
    ]},
    "radius": {"tokens": [
        {"name": "r-xs", "value": "4px", "usage": "Key caps, badges, the now-line time pill."},
        {"name": "r-item", "value": "6px", "usage": "Items inside a track: the segmented thumb, palette tiles."},
        {"name": "r-ctl", "value": "8px", "usage": "Buttons, inputs, rating segments, menu items, row hover pills."},
        {"name": "r-code", "value": "10px", "usage": "Code blocks."},
        {"name": "r-panel", "value": "12px", "usage": "Up next, recall cards, banners, pager links, menus, the toast."},
        {"name": "r-dialog", "value": "16px", "usage": "The palette, dialogs and the top corners of phone sheets."},
        {"name": "r-pill", "value": "999px", "usage": "Badges, bars, segment strips and the phone lecture pill."},
    ], "note": "Nesting rule: inner radius = outer radius − inset, rounded down to the nearest token (a 12px menu with 4px padding gets 8px items)."},
    "size": {"note": "Layout sizes the components share.", "tokens": [
        {"name": "row", "value": "40px", "usage": "Minimum list-row height on desktop (52px on phones, set in the stylesheet)."},
        {"name": "bar-h", "value": "56px", "usage": "Top bar height on desktop and the bottom tab bar on phones (the top bar is 48px on phones)."},
        {"name": "tap", "value": "44px", "usage": "Minimum touch target on phones. Smaller visuals extend their hit area with a pseudo-element."},
        {"name": "content-max", "value": "1240px", "usage": "Max page width."},
        {"name": "main-max", "value": "780px", "usage": "Max width of the main column next to a side panel."},
        {"name": "rail-w", "value": "316px", "usage": "Side panel width on desktop (280px under 1100px)."},
    ]},
    "shadow": {"note": "Depth means something. Rows sit flat on hairlines; things you act on sit one level up (raise); floating layers sit two or three levels up (float, pop). Never animate box-shadow: a hover shadow lives on a pseudo-element and fades in. In dark, depth comes from the ring, a top highlight and surface-raised.", "tokens": [
        {"name": "shadow-ring", "value": {"light": "0 0 0 1px rgb(15 36 39 / .10)", "dark": "0 0 0 1px rgb(255 255 255 / .08)"}, "usage": "Quiet framed things: code blocks, empty-state tiles."},
        {"name": "shadow-raise", "value": {"light": "0 0 0 1px rgb(15 36 39 / .10), 0 1px 2px rgb(15 36 39 / .05), 0 2px 6px -2px rgb(15 36 39 / .06)", "dark": "0 0 0 1px rgb(255 255 255 / .08), inset 0 1px 0 rgb(255 255 255 / .05), 0 1px 2px rgb(0 0 0 / .4)"}, "usage": "Things you act on at rest: Up next, the recall deck, pager links."},
        {"name": "shadow-raise-hover", "value": {"light": "0 0 0 1px rgb(15 36 39 / .16), 0 2px 4px rgb(15 36 39 / .06), 0 8px 16px -6px rgb(15 36 39 / .12)", "dark": "0 0 0 1px rgb(255 255 255 / .13), inset 0 1px 0 rgb(255 255 255 / .05), 0 6px 16px -4px rgb(0 0 0 / .55)"}, "usage": "The same things on hover, on a ::after that fades in."},
        {"name": "shadow-float", "value": {"light": "0 0 0 1px rgb(15 36 39 / .10), 0 4px 8px -2px rgb(15 36 39 / .08), 0 12px 24px -6px rgb(15 36 39 / .16)", "dark": "0 0 0 1px rgb(255 255 255 / .09), inset 0 1px 0 rgb(255 255 255 / .06), 0 8px 24px -4px rgb(0 0 0 / .6)"}, "usage": "Menus, the toast and the phone lecture pill."},
        {"name": "shadow-pop", "value": {"light": "0 0 0 1px rgb(15 36 39 / .10), 0 8px 16px -4px rgb(15 36 39 / .10), 0 24px 48px -12px rgb(15 36 39 / .24)", "dark": "0 0 0 1px rgb(255 255 255 / .10), inset 0 1px 0 rgb(255 255 255 / .07), 0 24px 64px -12px rgb(0 0 0 / .7)"}, "usage": "The palette, dialogs and sheets."},
    ]},
    "meta": {"source": "code", "package": "hub/index.html", "synced": "2026-10-20"},
}
open(f"{D}/project/tokens.json", "w").write(json.dumps(tokens, indent=2, ensure_ascii=False) + "\n")
print("tokens.json:", len(ORDER), "colors,", sum(len(g["styles"]) for g in tokens["type"]["groups"]), "type styles")
