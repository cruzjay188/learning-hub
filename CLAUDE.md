# Learning Hub: instructions for Claude

The Eagle Learning Hub is Jeffrey's study app for the Code Platoon bootcamp. `README.md` explains how it works and where everything is; `front-end/app_outline/user_journey.md` describes every page. The workspace `CLAUDE.md` one level up still applies (Jeffrey is a student: explain in plain language, plan before big changes).

> **Status:** this folder is a reorganized **test copy** of `../hub/`. Until Jeffrey says to switch over, the live artifact, `/sync` and the shared agents all still use `../hub/`. Don't publish from here without asking.

## Security rules (read before writing or changing anything)

@docs/security-rules.md

These are mandatory for every change: owner-scoped RLS on every table (the front end never sends `user_id`), authorization only on the server, no SQL or PostgREST filters built from input, no secrets in code or on the command line, and exports of your own data only. Run its §1 checklist before coding, put the answers in the PR under **Security**, and run §11 before calling a change done. If a request would break a rule, stop and ask.

## Stack

React 19 · Vite 8 · Vitest 5 + React Testing Library (jsdom) · plain CSS · no router (the URL hash picks the page) · Supabase (`@supabase/supabase-js` 2.117.0, pinned) for student accounts and progress, with `localStorage` as the offline copy (and the artifact's database when there are no accounts).

## Commands

Run npm commands inside `front-end/`:

```bash
npm run dev      # http://localhost:5173
npm test         # all tests once
npm run build    # front-end/dist/
```

From `learning-hub/`: `python3 -I data/build_hub.py` (rebuild course data) · `python3 -I tools/build_artifact.py` (one-page build for the artifact).

**Before calling a change done:** `npm test` and `npm run build` pass, and `node qa/motion.mjs` (with `python3 -I qa/serve.py front-end/dist &` running) passes 20/20. For UI changes, screenshot the views you touched with `qa/shoot.mjs` (desktop 1360 light, phone 390 dark) and look at them.

## Git workflow (the instructors' main / dev / feature branches)

Repo: https://github.com/cruzjay188/learning-hub. `main` = what's live, `dev` = finished work waiting to ship, `feature/<name>` = one change.

1. Start from dev: `git switch dev && git pull`, then `git switch -c feature/<short-name>`.
2. Commit there; before pushing, check `git status` for secrets (`.env.local`, keys) and that `npm test` and `npm run build` pass.
3. `git push -u origin feature/<short-name>`, open a PR into **dev**, merge it.
4. To ship: open a PR from **dev** into **main**. Never commit or push straight to main.

`../hub/` is an older clone of the same GitHub repo: don't push from it.

## Supabase (student accounts)

Project `eagle-learning-hub`, ref `fhlxeswlqzdhkvtcbjym` (dashboard: https://supabase.com/dashboard/project/fhlxeswlqzdhkvtcbjym). Code: `lib/supabase.js` (client), `lib/auth.js` + `hooks/useAuth.js` (accounts), `lib/supabaseSync.js` (progress ⇄ rows), `views/AuthPage.jsx`.

- **Schema changes:** add a file to `supabase/migrations/`, apply it with `npx supabase db query --project-ref fhlxeswlqzdhkvtcbjym --linked -f <file>`, and update `supabase/schema.sql` to match. Every table: RLS on, policies on `user_id = (select auth.uid())`, no access for `anon`.
- **Keys:** only the publishable key, in `front-end/.env.local`. Never the secret/service_role key, never a key or password on a command line or in a file that's committed.
- **Test accounts** from `qa/accounts.mjs` are `hubtest+<stamp>-a/-b@example.com` (it prints them). Delete exactly those afterwards, never a pattern that could catch someone else's: `npx supabase db query --project-ref fhlxeswlqzdhkvtcbjym --linked "delete from auth.users where email in ('hubtest+<stamp>-a@example.com', 'hubtest+<stamp>-b@example.com')"` (their progress rows go with them). Real students' accounts are never touched.
- `.mcp.json` points the Supabase MCP at this project; it connects when Claude Code is started in `learning-hub/`.

## Conventions

- **Actions live in `src/lib/actions.js`.** Components call `hub.something(…)`; they don't change stores themselves. An action changes the stores inside `commit()` (so React redraws immediately), then does the follow-up that needs the new page: focus, scroll, replay an animation.
- **State:** your saved progress is `lib/progressStore.js`; page state (route, filters, open steps, the open sheet) is the ui store in `lib/actions.js`. Both are tiny external stores read with `useStore` (`useSyncExternalStore`). Don't add parallel `useState` copies of them.
- **Questions about the course** ("is this done?", "when is it due for review?") go in `utils/model.js` as pure functions, with a test in `src/test/model.test.js`.
- **Markup and CSS stay in step.** The CSS selects on classes and `data-*` attributes (`data-done`, `data-open`, `data-k`…); keep them when editing components. Styles load in number order and later files win; new styles go in the file for that view.
- **Animation:** CSS does the motion. `data-k` on an element makes it animate from its old value (`lib/continuity.js`). Keyboard shortcuts and "reduce motion" never animate (`instantMode()`, `reducedMotion()`).
- **Design system first.** UI changes follow `design-system/README.md` and its tokens (CSS variables in `src/styles/01-base.css`). A new UI pattern gets added to the design system too (`design-system/HOW-TO-UPDATE.md`).
- **CSS gotcha:** put `-webkit-` properties *before* the standard one. The build's minifier keeps only the last of a pair, and Chrome ignores the `-webkit-` one.
- **Guides:** follow `data/guides/README.md`. When helping with a lecture's homework, read its guide first.

## Vercel (the public site)

https://eagle-learning-hub.vercel.app: project `eagle-learning-hub`, team id `team_zOriGM37yMuwstdv08iXhUD9`, Root Directory `front-end`. Env vars `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` (publishable key) on Production + Preview. The Vercel MCP can read but not create or change projects (403): use the Vercel CLI (`vercel …`, logged in as cruzjay188) or `vercel api`. After a deploy, run `qa/accounts.mjs` against it with `HUB_URL=…` and delete the test accounts.

## Publishing to the claude.ai artifact (only once Jeffrey switches over to this folder)

`npm run build`, then `python3 -I tools/build_artifact.py`, then publish `dist/index.html` to https://claude.ai/artifact/MtGWwvJQRsSXyC7YqFozf9 with `files: {"hub-data.json": "front-end/dist/hub-data.json"}`. Omit `capabilities` and `icon` so the stored ones carry over.

## Known issues

- The Work view is 8px wider than the screen at 1360px (also in the live page). Cause not found yet; likely a `::before`/`::after` with a negative inset.
