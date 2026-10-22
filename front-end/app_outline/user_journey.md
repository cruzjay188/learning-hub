# User Journey: Eagle Learning Hub

**What it is:** One page for the Code Platoon bootcamp: today's class, a step-by-step guide for every lecture, assignments, spaced review of what I've learned, and my progress.

**Problem:** The course lives in many places (the calendar, the curriculum site, lecture repos, Slack, my notes). Before the hub I had to piece together "what do I do next?" every day, and I had no way to see what I'm shaky on.

**User:** One: me, a student in the Eagle Platoon. My progress is mine alone (saved to my claude.ai account, or this browser).

## The journey

1. **Opens the hub** → lands on **Today**: the date, week and class day number, and the modules this week.
   - Class day: a timeline of the day (Stand Up, the lecture, work time, Team Meet, Stand Down) with a line at the current time.
   - No class: "No class today. Next class: Tuesday, October 20 · AI-9 3rd Party APIs."
   - First visit with lectures already behind me → a **Catch up** banner: mark what I've finished so Up next is right (or "Not now").
2. **Up next**: the one step to do now (today's lecture first, then where I left off, then anything still open from the last few days, then prep). It shows the step's details, its code with a Copy button, and "Done when".
   - **Mark step done** → the button says Done, the card swaps to the next step, and a toast offers **Undo** (⌘Z works too).
   - Everything done → "You're caught up."
3. **Also on Today:** reviews due, prep for the next class, open assignments, and on the right **This week** (a ring per day I studied, my weekly goal and streak) and **Course** (steps done, days to graduation).
4. **Course** → all 15 weeks. A ruler of class days, filters (All · This week · Needs review · Not checked off), a module menu, and one section per week (tap to open). Each lecture row shows its status, date, steps done and my rating.
   - Filter shows nothing → "Nothing matches these filters" with "Show all lectures".
5. **Taps a lecture** → its **guide**: summary, goal, what's required, then the **steps**.
   - Tick a step's circle, or **Mark done and continue** (x on the keyboard): the step folds and the next one opens.
   - **Skip for now** opens the next step; **Expand all** shows every step.
   - Long code blocks are clamped: "Show all 24 lines".
   - All steps done → "AI-8 done. How well do you get it?" with a rating and a link to the next guide.
   - **Check yourself**: the lecture's key terms as flip cards (Space flips, ← Not yet, → Got it).
   - **Links**: the assignment repos and lecture resources.
   - On the right: an outline of the steps, **How well do you get it?** (1 Lost … 5 Could teach it) and **My notes** (saved as I type) with a "Copy Quiz me prompt" button for the tutor agent.
   - On a phone: a bar at the bottom with progress, Rate, Notes and Done.
6. **Review** → lectures I've rated, grouped Due · Weak · Medium · Strong · Unrated. A lecture rated 1 comes back the next class day, 2 in 2 days, 3 in 4 days, 4 in 10 days, 5 never.
   - **Review** opens a session: the key terms as flip cards, then I re-rate it, then "Next due" or "Done for today".
   - Nothing due → "Nothing due today. Next review: AI-7 on Thu Oct 22."
7. **Work** → assignments grouped In progress · To do · Ask instructor · Quizzes · Done. Tapping a status mark opens a menu to change it (1–4 on the keyboard), with Undo. **Activity** shows a 15-week heat map of commits and study days, my work logs and recent commits.
8. **Search** (⌘K or /) → lectures, key terms, assignments and actions ("Continue: …", "Copy the next command", "Toggle light / dark").
9. **Help** (? or the Save badge) → what the status marks mean, how saving works, and the keyboard shortcuts.

## Saving

- On claude.ai (the artifact): ticks, ratings, notes, statuses and the weekly goal save to my account. The Save badge says "Saved".
- Anywhere else: they save to this browser. The badge says "Saved in this browser only".
- The course content itself (lectures, guides, assignments) comes from `hub-data.json`, rebuilt by `data/build_hub.py` when I run `/sync`.

## Accessibility

Every action works from the keyboard. Motion turns off with the system's "reduce motion" setting, and keyboard shortcuts never animate. Phone and desktop layouts, light and dark themes.
