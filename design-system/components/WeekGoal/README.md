# WeekGoal

A weekly study goal: a ring per class day, smaller weekend rings, one week ring, and a streak counted in weeks.

**Use** `.goal-row` with `.goal-days` (`.gd` items holding a 26px Ring; `.gd--we` 12px; `data-on`, `data-today`) and a 56px `.week-ring` labelled "2/4", then `.goal-text` and `.goal-ctl` ("Goal 4 days a week" with − and + icon buttons; the number ticks).

- A logged day fills its ring and turns into the done disc (spring pop). Meeting the goal sends a wave through the filled days, 45ms apart, and closes the week ring.
- Today is marked by a 4px `now` dot under its letter, not an orange outline.
- Ticking a step, rating or writing notes logs the day; "I studied off the hub" logs it by hand.
- The streak counts weeks in a row that met the goal, so weekends never break it. No flames, no guilt copy.
