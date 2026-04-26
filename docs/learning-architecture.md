# Learning Architecture: How Katachi Works

Katachi trains Japanese conjugation ability rather than vocabulary recall. Words
are practice samples: they let the app observe whether a learner can apply a
form or rule pattern in context. The durable learning objects are `FormStats`
and `PatternStats`.

For the detailed MVP algorithm contract, see
[diagnostic-learning-algorithm.md](./diagnostic-learning-algorithm.md).

## 1. Diagnostic Mastery

Katachi tracks mastery at two curriculum levels:

- `FormStats`: broad conjugation forms such as `te_form`, `polite`,
  `negative_plain`, and `past_plain`.
- `PatternStats`: rule families inside those forms, such as
  `te_form::godan-ku`, `te_form::godan-gu`, `te_form::ichidan`, or
  `polite::godan`.

This lets the app diagnose "the learner struggles with godan く to いて" instead
of reducing progress to "the learner missed 書く."

## 2. Daily Practice

Daily practice is the default curriculum path. It uses the learner's diagnostic
state to build a balanced session:

- 50% weakness: weak or unstable forms and patterns.
- 30% coverage: stable or mastered patterns kept active.
- 20% exploration: undiagnosed patterns sampled to discover unknown gaps.

Only non-retry daily attempts count toward the daily goal. Daily attempts update
mastery and streak state.

## 3. Weakness Practice

Weakness practice is an optional focused drill. It selects only weak or unstable
forms and patterns, updates mastery, and does not consume the daily goal or
extend streaks. If no weak or unstable area exists, the learner should return to
daily practice to collect more diagnostic evidence.

## 4. Free Practice

Free practice is a sandbox. It respects user-selected forms, levels, and word
types, but by default it records only raw attempts. It does not update mastery,
word stats, daily progress, streaks, or curriculum summary totals unless a
future explicit opt-in setting enables that behavior.

## 5. Mastery-Based Flow

Incorrect answers are re-queued inside the same session. A session finishes only
after every initial item has eventually been answered correctly. Retries can be
useful diagnostic evidence in daily and weakness practice, but daily retries do
not inflate the daily goal.

## 6. User-Facing Guidance

The homepage should translate algorithm state into learner-facing language. It
should answer what to do today and how much remains, not expose internal labels
such as `undiagnosed`, `explore_form`, or raw pattern keys. Detailed diagnostic
state belongs in progress views and algorithm documentation.
