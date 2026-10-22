# Eagle Hub Design System (source copy)

Live system: https://claude.ai/artifact/HZUBEYey53MBnWwo1CXsiG
Built from the hub's CSS in `front-end/src/styles/` (the hub's code is the source of truth). v3 cards live in `tools/ds_cards_v3.py`.

- `README.md`, `tokens.json`, `components/`: the same files as the live system.
- `tools/ds_tokens.py`, `tools/ds_build.py`: the generators. `ds_build.py` lifts `components/bundle.css` from `front-end/src/styles/*.css` and writes every component card, the cover and the README.

**When the hub's UI changes:** update `front-end/src/styles/` first, then rebuild with `python3 -I tools/ds_tokens.py <dir>` and `python3 -I tools/ds_build.py <dir>` (they write `<dir>/project/`). Republish only the changed files to the live system following its type's SKILL.md (index last). Keep token names identical to the CSS variables in `front-end/src/styles/01-base.css`.
