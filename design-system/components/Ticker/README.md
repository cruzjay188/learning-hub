# Ticker

A number that rolls to its new value instead of swapping: step counters, "1 of 116", the goal, recall tallies.

**Use** `.tick` (aria-hidden) with one `.d` column of 0–9 per digit (`--d` = the digit) followed by an `.sr-only` copy of the number. Each column moves `translateY(calc(var(--d) * -1.3em))` in 220ms `ease-out`, right-most digit first, 30ms apart. A soft mask fades the digits in and out at the edges.

- Only for numbers that change while you watch. Static counts stay plain text.
- Screen readers get the number once; changes are announced in words by the live region.
