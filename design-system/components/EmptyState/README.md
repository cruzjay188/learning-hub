# EmptyState

What a list shows when it has nothing: what will appear here, and the one action that fills it.

**Use** `.empty` with a 32px `.empty__tile` (icon, `surface` + `shadow-ring`), a `.empty__title`, one line in `muted`, and at most one button. Left-aligned and top-aligned, never floating in a big empty area. It enters with a 4px rise (200ms).

- Write it as direction, not mood: "Nothing due today" + "Next review: AI-5 on Thu Oct 22."
- Review's empty Due list still shows the next due lecture as a normal row below it, so the view is never blank.
