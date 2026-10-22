# CodeBlock

A command or Claude prompt to copy exactly, on a dark `code-bg` that reads the same in both themes.

**Use** `.code` with a `.code__bar` (label in `code-meta` mono + a Copy button) and a `<pre><code>`. Set `data-wrap="true"` for Claude prompts and prose (they wrap and stay fully readable); terminal commands and SQL keep `white-space: pre` and scroll inside the block. Over 12 lines, `data-clamp="true"` limits it to 280px with a fade and a "Show all N lines" button.

**The consumer provides** the code text and its label: `Terminal`, `Claude prompt`, `SQL`, `File`.

- Copy always copies the full text. The label switches to "Copied" for 1.6s; on phones a toast confirms too.
- If the clipboard is refused, select the text and say "Selected: press ⌘C".
- Type: `code` (13px, 1.65). Never put secrets in examples: use `YOUR_PUBLISHABLE_KEY`.
