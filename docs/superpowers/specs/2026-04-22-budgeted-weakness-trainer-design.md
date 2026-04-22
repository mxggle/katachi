# Budgeted Weakness Trainer Design

**Date:** 2026-04-22
**Status:** Approved for implementation
**Scope:** Learning-state redesign, budgeted weakness scheduling, progress page, minimal homepage changes

---

## 1. Overview

Katachi will shift from a purely random session generator into a budgeted weakness trainer.

The product goal is not to become a full spaced-repetition system with unlimited review debt. Instead, it should:

- preserve the current fast homepage CTA flow
- record learner weak points at conjugation-level granularity
- resurface mistakes in a controlled way
- provide a dedicated progress page that shows actionable weak areas
- remain local-first and easy to migrate to Supabase later

---

## 2. Product Model

### Practice Types

- `daily`: default mode, subject to a fixed daily budget
- `weakness`: focused drill mode, draws only from weak items
- `free`: user-directed practice, updates learning stats but does not generate future review debt

### Daily Budget

The first implementation uses a fixed session budget instead of an accumulating due queue.

Defaults:

- `dailyQuestionGoal = 20`
- `dailyNewLimit = 5`
- `dailyWeaknessTarget = 15`

Rules:

- only `daily` mode is budget-governed
- once the daily budget is exhausted, users may still practice with `weakness` or `free`
- extra practice continues to improve learner stats, but does not create a backlog obligation

---

## 3. Learning Unit Granularity

All learner modeling will use:

- `(wordId, conjugationType, mode)`

Rationale:

- weakness at word-only level is too coarse
- multiple-choice success should not fully hide typing weakness
- the progress page needs to surface both weak forms and weak words/forms

---

## 4. Learning Data Model

### Preferences

- `language`
- `defaultSessionConfig`
- `dailyQuestionGoal`
- `dailyNewLimit`

### Learner Summary

- `dailyStreak`
- `lastPracticeDate`
- `lastSessionAt`
- `totalAnswered`
- `totalCorrect`
- `schemaVersion`

### Unit Progress

Keyed by `unitKey = wordId + "::" + conjugationType + "::" + mode`

Fields:

- `wordId`
- `conjugationType`
- `mode`
- `wordType`
- `seenCount`
- `correctCount`
- `wrongCount`
- `consecutiveCorrect`
- `consecutiveWrong`
- `lastSeenAt`
- `lastCorrectAt`
- `lastWrongAt`
- `sameDayExposureCount`
- `sameSessionRetryCount`

### Session Records

- `sessionId`
- `practiceType`
- `configSnapshot`
- `startedAt`
- `endedAt`
- `totalAnswered`
- `totalCorrect`

### Attempt Records

- `attemptId`
- `sessionId`
- `wordId`
- `conjugationType`
- `mode`
- `isCorrect`
- `answeredAt`

### Runtime Session State

Not part of long-term sync boundary:

- active queue
- retry queue
- current index
- feedback state

---

## 5. Persistence Boundary

The app will separate runtime state from persisted learner state.

### Local Runtime Store

Owns:

- active session UI state
- temporary feedback state
- session queue and retry queue

### Study Repository

Owns:

- reading persisted learner state
- writing learner summary, unit progress, session records, attempt records
- exposing functions used by session building and progress reporting

Initial backend:

- `localStorage`

Future backend:

- Supabase-backed repository using the same domain model

The UI must not read/write `localStorage` directly.

---

## 6. Scheduling Algorithm

### Daily Practice

Build the session in two stages:

1. choose up to `dailyNewLimit` unseen or low-exposure units
2. fill remaining slots from a weighted weak-point pool

### Weakness Drill

- choose only units with non-trivial weakness score
- ignore new-item quota

### Free Practice

- preserve the user-selected setup filters
- still update stats
- do not consume daily budget

### Weakness Scoring

The first version will use a weighted heuristic rather than FSRS.

Signals:

- recent wrong answer
- consecutive wrong count
- lifetime accuracy
- time since last seen
- typing mode penalty boost

This score is derived in code rather than stored as a permanent source of truth.

---

## 7. Retry Behavior

Wrong answers should be reintroduced in a controlled way.

Rules:

- wrong items enter a retry queue
- retries are delayed by 2-4 cards, not immediate
- each unit can be retried only a limited number of times per session
- heavily missed items stay weak for later sessions instead of dominating one session forever

This gives users short-term correction without turning the session into spam.

---

## 8. Streak Semantics

Daily streak should advance on completed practice activity, not homepage load.

Qualifying activity for the first implementation:

- finishing a session in any practice type with at least 1 answered question

This is cleaner for future sync than the current load-based behavior.

---

## 9. Homepage Changes

Homepage changes must remain minimal.

Keep:

- current hero
- main CTA
- setup block

Add:

- a light practice-type selector near setup controls
- a low-prominence `View Progress` entry point

Do not:

- turn the homepage into a dashboard
- move the main CTA out of focus
- add dense analytics cards to the home screen

---

## 10. Progress Page

Add a dedicated progress page for Web-only value.

Sections:

- `Overview`
- `Weakest Conjugations`
- `Weakest Items`
- `Mode Comparison`
- `Recent Activity`
- `Recommended Drills`

Each weakness section should support an actionable CTA:

- `Practice this weakness`

The page is not just reporting. It should guide the next drill.

---

## 11. Migration Strategy

Current persisted state only includes aggregate stats and config. The new model will migrate:

- `config` -> `preferences.defaultSessionConfig`
- `language` -> `preferences.language`
- `dailyStreak`, `lastPracticeDate`, `progress` -> `learnerSummary`

New entities start empty:

- `unitProgress`
- `sessionRecords`
- `attemptRecords`

No fake backfill of per-item history will be attempted.

---

## 12. Supabase Readiness

The first implementation stays local-first, but the model should map cleanly to future tables:

- `user_preferences`
- `learner_summary`
- `unit_progress`
- `session_records`
- `attempt_records`

No cross-device active-session resume is required in this phase.

---

## 13. Out of Scope

- full due-date SRS / FSRS
- cross-device session resume
- realtime multi-device sync
- advanced charts beyond practical weak-point reporting

