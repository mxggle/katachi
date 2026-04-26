# Diagnostic Learning Algorithm

Katachi trains Japanese conjugation ability, not vocabulary recall. The learning
algorithm treats each question word as a sample used to diagnose whether the
learner can apply a conjugation rule in context. Progress is therefore tracked
primarily at the form and rule-pattern level, while word-level data remains a
lightweight exposure log.

This document describes the intended MVP behavior after the diagnostic learning
algorithm changes.

## Goals

Katachi should answer these questions for the learner:

- Which conjugation forms are weak?
- Which specific rule patterns inside those forms are weak?
- What should today's practice emphasize?
- Which attempts should count toward daily progress, streaks, and mastery?

It should avoid treating "knows this word" as the main curriculum goal. A word
such as 書く is useful because it samples the `te_form::godan-ku` rule; it is not
itself the durable unit of mastery.

## Learning Objects

### FormStats

`FormStats` is the broadest mastery object. It tracks performance for a whole
conjugation form, such as:

- `te_form`
- `polite`
- `negative_plain`
- `past_plain`

Each form stat records total attempts, correct attempts, accuracy, mastery level,
and recent timestamps. It is used to detect broad difficulty, such as "the
learner struggles with plain negative forms."

### PatternStats

`PatternStats` is the primary diagnostic object. It tracks a specific
morphological rule inside a form, such as:

- `te_form::godan-ku`
- `te_form::godan-gu`
- `te_form::godan-u-tsu-ru`
- `te_form::godan-mu-bu-nu`
- `te_form::godan-su`
- `te_form::iku-exception`
- `te_form::ichidan`
- `te_form::suru`
- `te_form::kuru`
- `negative_plain::godan`
- `polite::ichidan`
- `past_plain::i-adj`

This is the curriculum-level signal that lets Katachi say "you are missing the
ku-to-ite te-form rule" rather than "you missed 書く."

### WordStats

`WordStats` is intentionally lightweight. It records raw exposure and correctness
for a word, but it does not represent curriculum progress. Word stats are useful
for auditing sample variety, avoiding repeated examples, and understanding which
sample words have appeared, but they should not drive mastery decisions on their
own.

### UnitProgress

`UnitProgress` remains for backward compatibility and transition support. It
tracks `wordId + conjugationType + mode` for older persisted state and migration
repair. New scheduling semantics should not use it as the source of truth; daily
and weakness selection should come from `FormStats` and `PatternStats`.

## Rule Pattern Derivation

Every practice unit has a `rulePattern`, derived from the word and conjugation
form through `getRulePattern`.

The MVP pattern system supports:

- `te_form`
- `polite`
- `negative_plain`
- `past_plain`

For non-te-form conjugations, patterns use the normalized word group:

```text
{conjugationType}::{group}
```

Examples:

```text
polite::ichidan
negative_plain::godan
past_plain::i-adj
```

For `te_form`, godan verbs split into the rule families learners actually need
to distinguish:

```text
te_form::ichidan
te_form::godan-ku
te_form::godan-gu
te_form::godan-u-tsu-ru
te_form::godan-mu-bu-nu
te_form::godan-su
te_form::iku-exception
te_form::suru
te_form::kuru
```

The `iku-exception` pattern captures 行く-style behavior separately from the
regular `godan-ku` pattern.

## Attempt Records

Each answer creates an `AttemptRecord`. The attempt record is the diagnostic
event log and should preserve enough context to aggregate safely later.

Core fields:

- `attemptId`
- `sessionId`
- `wordId`
- `conjugationType`
- `mode`
- `isCorrect`
- `answeredAt`

Diagnostic fields:

- `practiceType`: `daily`, `weakness`, or `free`
- `scopeType`: `curriculum` or `user-selected`
- `wordType`: verb, i-adjective, or na-adjective
- `group`: word group such as godan, ichidan, suru, kuru, i-adj, or na-adj
- `rulePattern`: derived pattern key
- `isRetry`: whether this attempt came from same-session re-queueing
- `affectsMastery`: whether this attempt updates form and pattern mastery
- `affectsWeakness`: whether this attempt came from a weakness drill
- `countsTowardDailyGoal`: whether this attempt advances the daily goal
- `countsTowardStreak`: whether this attempt qualifies for streak activity

The boolean fields are important because they make future aggregation explicit.
Reports and sync merges should not infer daily-goal or mastery semantics only
from `practiceType`; the attempt record already states how the attempt counted.

## Mastery Updates

When `affectsMastery` is true, an attempt updates:

- the relevant `FormStats`
- the relevant `PatternStats`
- backward-compatible `UnitProgress`

For curriculum attempts, currently daily and weakness practice, the app also
updates:

- `WordStats`
- total answered and total correct summary counts
- session history when the session completes

Every attempt, including free practice, updates:

- session-local answer state
- the append-only `attemptHistory`

Free practice does not update `WordStats` by default. This keeps the sandbox
from changing even lightweight curriculum sample aggregates unless a future
opt-in setting explicitly enables it.

Mastery level is derived from attempts and accuracy:

- `undiagnosed`: no attempts
- `weak`: low accuracy, or early evidence below 50%
- `unstable`: limited evidence or middling accuracy
- `stable`: good accuracy, but not yet mastered
- `mastered`: high accuracy with enough evidence

The exact thresholds can evolve, but the levels should remain interpretable as
diagnostic buckets for scheduling and homepage guidance.

## Practice Types

### Daily Practice

Daily practice is the default curriculum path. It updates mastery and advances
daily progress for non-retry attempts.

Daily selection uses a budgeted mix:

- 50% weakness
- 30% coverage
- 20% exploration

Weakness slots draw from weak or unstable form and pattern stats. Coverage slots
sample stable or mastered patterns to keep previously learned rules active.
Exploration slots sample undiagnosed patterns so the app can discover gaps and
expand coverage.

Only non-retry daily attempts count toward the daily goal. Retries are useful
training evidence and can update mastery, but they should not inflate the daily
goal by repeatedly counting the same initial prompt.

Daily attempts count toward streak activity.

### Weakness Practice

Weakness practice is a focused drill mode. It selects only weak or unstable
`FormStats` and `PatternStats`. If no weak or unstable form or pattern exists,
the mode should return no drillable units and ask the learner to complete daily
practice first.

Weakness practice updates mastery because it provides real evidence about the
same forms and patterns. It does not count toward the daily goal or streak by
default. This keeps the daily rhythm distinct from optional remediation.

### Free Practice

Free practice is a sandbox. It respects user-selected setup choices and records
raw attempts, but by default it does not update form mastery, pattern mastery,
word stats, learner summary totals, session history, the daily goal, or streaks.

A future setting may allow a learner to opt a free-practice session into mastery
updates, but the default should remain non-curricular.

## Session Flow

The scheduler builds candidate practice units from all eligible
word-by-form combinations:

```text
word + conjugation form + practice mode -> practice unit
```

Each unit carries:

- the sample word
- the conjugation form
- the practice mode
- the word type and group
- the derived rule pattern
- a stable unit key for compatibility

Selection then depends on practice type:

- `daily`: allocate weakness, coverage, and exploration slots
- `weakness`: select only weak or unstable forms and patterns
- `free`: select from all eligible user-scoped candidates

Within each bucket, the scheduler diversifies by word group and avoids repeating
the same word before filling with additional units. Suru and kuru are treated as
an irregular meta-group for interleaving while remaining distinct pattern groups
for diagnosis.

## Retry Semantics

Incorrect answers are re-queued inside the same session. A session finishes only
after every initial item has eventually been answered correctly.

Retries are marked with `isRetry = true`. Retry attempts may update mastery when
the practice type affects mastery, but daily retries do not count toward the
daily goal. This preserves two separate meanings:

- the daily goal measures initial prompts attempted today
- mastery stats measure all diagnostic evidence collected during training

## Daily Progress and Streaks

Daily goal progress should be computed from attempts where:

```text
countsTowardDailyGoal === true
```

In the MVP behavior, that means non-retry daily attempts.

Streak progress should be computed from attempts where:

```text
countsTowardStreak === true
```

In the MVP behavior, that means daily practice attempts. Weakness and free
practice remain useful, but they do not extend the daily streak by default.

## Homepage Guidance

The homepage should translate algorithm state into learner-facing guidance. It
should not expose internal labels such as `PatternStats` as the main user
language.

Useful guidance examples:

- "Today focuses on te-form weak spots, review, and a few new samples."
- "Your weakest pattern is te-form for verbs ending in く."
- "You have 12 daily prompts left."
- "Weakness drill is available for unstable forms."
- "Free practice will not affect mastery unless you opt in."

The homepage should remain practice-first. The algorithm should inform the CTA,
status strip, and secondary practice actions without turning the first screen
into an analytics dashboard.

## Persistence and Sync

Katachi is local-first. Guest mode must preserve all diagnostic data locally and
remain fully usable without network access.

Sync should merge diagnostic state conservatively:

- form and pattern counts should aggregate without losing local evidence
- word stats should remain raw exposure tracking
- attempt history should merge by stable `attemptId`
- remote state should not erase local guest progress
- future aggregation should rely on explicit attempt flags such as
  `affectsMastery` and `countsTowardDailyGoal`

The event log should be rich enough that future versions can recompute summary
stats or repair aggregation errors without guessing which attempts were
curricular.

## Extension Points

### Curriculum Scope and Unlocking

Future versions can add `curriculumScope` or unlocked-form gates. The scheduler
should then build candidates only from forms, patterns, JLPT levels, and word
types currently in scope. Undiagnosed patterns outside the unlocked scope should
not appear as exploration.

### Free-Practice Mastery Toggle

Free practice can later offer a "count toward mastery" toggle. When enabled, the
session should set `affectsMastery = true` while keeping
`scopeType = user-selected` so reports can distinguish self-directed evidence
from curriculum evidence.

### Better Scoring and Ranking

The MVP scheduler classifies candidates by mastery bucket. Future scoring can
rank within each bucket using signals such as recency, confidence, sample
variety, repeated misses, input-vs-choice mode, or the number of samples already
seen for a pattern.

Ranking should improve selection order without changing the core model:
forms and patterns remain the learning objects; words remain samples.

### Sync-Safe Aggregation

Longer term, summary stats can be treated as cached aggregates over attempt
history. To support this, new diagnostic fields should be additive and explicit.
Avoid changing the meaning of existing fields in place. If semantics change,
version the state and provide migrations so local and Supabase copies can merge
without erasing evidence.

## Non-Goals

The diagnostic algorithm is not a full vocabulary spaced-repetition system.
It does not attempt to schedule every word as a memory card, maintain infinite
review debt, or optimize for dictionary-word recall.

The algorithm may still use spacing, diversity, and exposure limits, but those
serve conjugation diagnosis and training rather than vocabulary memorization.
