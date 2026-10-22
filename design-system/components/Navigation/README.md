# Navigation

Four destinations: Today, Course, Review and Work. A top bar on desktop, a bottom tab bar on phones.

**Use** `.bar` (sticky, 56px, translucent `surface` with blur) with the brand mark, `.tabs` (the current one gets a 2px `teal` underline and `aria-current="page"`), the ⌘K `.search-btn` and the `.save` status. Under 900px the top bar shrinks to 48px with the page title, and `.tabbar` (56px + safe area) carries the tabs with icons and a Review `.badge`.

- Save status words: "Saved" (`teal` dot), "Saving…" (pulsing grey), "Saved in this browser only", "Not saving: reload" (`warn-mark` dot). The save dot is never orange.
- A lecture page is a child of Course: breadcrumb "Course / Week 3 / AI-8" plus previous / next.
