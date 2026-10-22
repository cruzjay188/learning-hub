# Lecture guide spec (Learning Hub)

Each lecture in the Learning Hub has one JSON file here: `hub/guides/<id>.json`. `hub/build_hub.py` merges them with the schedule, progress and work logs into `hub/hub-data.json`, which the hub page reads.

The reader is **Jeffrey**, a career-switching veteran in Code Platoon's AI + Full-Stack SE bootcamp (Eagle Platoon, Oct 5 2026 → Jan 15 2027). He builds with Claude Code and learns fast, but he's new to most of these tools. Write for him: plain English, short sentences, no jargon without a one-line explanation.

## Two kinds of guide

- **`"status": "full"`**: lectures whose instructor material exists (lecture site homework, assignment repo, curriculum page). A real step-by-step for what he must do to meet the requirement.
- **`"status": "outline"`**: future lectures where only the curriculum page exists. What it covers, how to prep, where to read. `/sync` upgrades an outline to full once the lecture's material is published.

## Schema

```json
{
  "id": "ai-8",
  "code": "AI-8",
  "title": "Authentication",
  "status": "full",
  "summary": "1–2 sentences: what this lecture teaches, in plain English.",
  "goal": "One sentence starting with a verb: what he can do after finishing.",
  "required": [
    "Each thing the instructors require, in their priority order, e.g. 'Homework Part II, priority 2: add authentication to Netflix Clone IV'"
  ],
  "steps": [
    {
      "id": "s1",
      "title": "Short imperative title (≤ 8 words)",
      "detail": "1–3 sentences: what to do and why. Mention his real paths/projects when it applies.",
      "code": "Optional. The exact command, SQL or Claude prompt to copy. Quote instructor prompts word for word.",
      "codeLabel": "Terminal | Claude prompt | SQL | Browser | File",
      "doneWhen": "An observable check: what he sees when this step is done."
    }
  ],
  "concepts": [{ "term": "JWT", "meaning": "One plain sentence." }],
  "resources": [{ "label": "Lecture site: Claude and Auth", "url": "https://kabeier.github.io/Claude-and-auth/" }],
  "assignments": ["agentic-netflix-clone-IV"],
  "estMinutes": 180,
  "sources": ["Where each requirement came from (URL or repo path), so it can be re-checked"]
}
```

Outline guides use the same shape: `steps` = 2–4 **prep** steps (read X, try Y, set up Z), `required` = `[]` unless something is already known, `estMinutes` = prep time.

## Rules

1. **Never invent requirements.** Every item in `required` and every full-guide step must trace to a source in `sources`. If something is unclear, say so in `detail` ("Confirm in #eagle_questions…") instead of guessing.
2. **Quote instructor prompts and commands exactly** (`code` field). Don't paraphrase a prompt the lecture site gives.
3. **Follow the instructors' priority order**: "your own app" (personal project) → Netflix clone → FreeCodeCamp steps, or whatever order the slide says.
4. **5–10 steps for full guides**, ordered as he'd actually do them. Each step is one sitting's worth of action with a `doneWhen`.
5. **Never include secrets** (keys, tokens, passwords). Use placeholders like `YOUR_PUBLISHABLE_KEY`.
6. Use `\n` for newlines inside `code`. The file must be valid JSON (no comments, no trailing commas).
7. `id` is lowercase and must match the filename.

## Jeffrey's current state (as of Oct 18, 2026)

- Workspace: `~/Desktop/codeplatoon` (see its `CLAUDE.md`). Assignments live in `assignments/week-NN/<repo>`.
- **Netflix clone** ("Myflix"): `assignments/week-02/netflix`, GitHub `cruzjay188/netflix`. React 19 + Vite, Supabase. My List with ratings and comments, user-added titles and named lists. Anonymous sign-in with RLS (`auth.uid()`). **Flat layout**: not yet restructured into `front-end/` + `supabase/`. Missing planning files (`app_outline/`, `user_stories.md`, `api_notes.md`). Agents installed: `front-end-agent`, `supabase-agent`, `qa-agent`, `project-mapper`. Design skills and `postgresql-table-design` installed.
- **Hangman**: done (`cruzjay188/hangman`). Knowledge Checks 1–5 done; 6–8 not forked yet.
- No personal "own app" project found yet.
- MCPs: Playwright, Context7, Chrome DevTools (user scope); Supabase (project scope, needs re-approval); GitHub MCP not set up.

## Sources

- Lecture sites (homework steps live on each site's `index.html` and in the slides' "Homework" sections): `https://kabeier.github.io/SPAs-and-Claude/`, `https://kabeier.github.io/Databases-and-Supabase/`, `https://kabeier.github.io/Claude-and-full-stack-apps/`, `https://kabeier.github.io/Claude-and-auth/`. Repos: `github.com/kabeier/<name>`; clone with `gh repo clone kabeier/<name> <tmpdir> -- --depth 1`.
- Curriculum site: `https://codeplatoon.github.io/se-curriculum/` (Installfest, Phase I fundamentals/OOP/DS, Phase II front-end/back-end/full-stack, Phase III AI, Phase IV deployment). Repo: `github.com/CodePlatoon/se-curriculum`.
- Instructor demos: `~/Desktop/codeplatoon/cohort-notes/phase-III/` (read only).
- Assignment repos: `gh repo list Code-Platoon-Assignments` and `gh api repos/Code-Platoon-Assignments/<repo>/readme`. Knowledge Checks keep their questions in `static/main.js`.
- Checklists: `Code-Platoon-Assignments/claude-code-checklist`, `Code-Platoon-Assignments/obsidian-checklist`.
- Schedule: `~/Desktop/codeplatoon/schedule/schedule.md`. Syllabus: `schedule/syllabus.md`.
