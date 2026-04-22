# Session Word Diversity Design

## Goal
When a learner selects multiple conjugation forms, a single practice session should prefer unique dictionary words before repeating the same word with different forms.

## Rules
- Prefer at most one unit per word in the initial selection pass.
- Only reuse the same word with another conjugation when the pool of unique words is too small to fill the requested question count.
- Preserve existing practice-mode prioritization:
  - free: use eligible units, but diversify by word first
  - daily: keep daily new-item cap and budget behavior, but diversify by word first within selected pools
  - weakness: keep weakness ordering, but first take the weakest unit from each word before reusing the same word

## Implementation
- Keep eligible-unit generation unchanged.
- In scheduler selection, split units into grouped-by-word buckets.
- Build a primary diversified pass by taking the highest-priority unit per word.
- If the diversified pass does not fill the session, append leftover units in existing priority order.

## Verification
- Add scheduler tests for diversified selection across free, daily, and weakness practice.
- Run targeted Vitest suites for scheduler and session builder.
