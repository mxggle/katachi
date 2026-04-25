# Session Diversity & Mastery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a balanced verb group scheduler, session word uniqueness with cooldown, and a Duolingo-style mastery flow where missed items are re-queued.

**Architecture:** 
1. **Scheduler:** Group eligible units by verb group, apply a strict ratio (33% each), and interleave them. Use a `lastSeenAt` cooldown to deprioritize recently practiced words.
2. **State:** Update `MiniSession` to support a dynamic queue where incorrect answers append the item to the end of the `words` array.
3. **UI:** Replace the countdown with a progress bar tracking unique items mastered.

**Tech Stack:** React (Next.js), TypeScript, Zustand (State Management), Vitest (Testing).

---

### Task 1: Scheduler - Balanced Selection & Interleaving

**Files:**
- Modify: `src/lib/study/scheduler.ts`
- Test: `src/lib/study/scheduler.test.ts`

- [ ] **Step 1: Write a failing test for verb group balancing**
```typescript
it('should balance Godan, Ichidan, and Irregular verbs strictly 33/33/33', () => {
  const words = [...godanWords, ...ichidanWords, ...irregularWords];
  const config = { ...defaultConfig, questionCount: 9, wordTypes: ['verb'] };
  const selected = selectPracticeUnits({ words, config, ...otherOptions });
  
  const counts = selected.reduce((acc, unit) => {
    acc[unit.word.group] = (acc[unit.word.group] || 0) + 1;
    return acc;
  }, {});
  
  expect(counts.godan).toBe(3);
  expect(counts.ichidan).toBe(3);
  expect(counts.suru + counts.kuru).toBe(3);
});
```

- [ ] **Step 2: Implement verb grouping and interleaving in `selectPracticeUnits`**
Update `selectPracticeUnits` to partition verbs into `godan`, `ichidan`, and `irregular` buckets. Pull one from each in a round-robin fashion until the `questionCount` is met, backfilling from available pools if one group runs dry.

- [ ] **Step 3: Run tests and verify**
Run: `npm test src/lib/study/scheduler.test.ts`

- [ ] **Step 4: Commit**
`git add src/lib/study/scheduler.ts src/lib/study/scheduler.test.ts && git commit -m "feat: balanced verb group interleaving"`

---

### Task 2: Session Uniqueness & Cooldown

**Files:**
- Modify: `src/lib/study/scoring.ts`
- Modify: `src/lib/study/scheduler.ts`
- Test: `src/lib/study/scheduler.test.ts`

- [ ] **Step 1: Add cooldown weight to `calculateWeaknessScore`**
```typescript
// src/lib/study/scoring.ts
export function calculateWeaknessScore(progress: UnitProgress, now: string): number {
  let score = baseCalculation(progress);
  if (progress.lastSeenAt) {
    const hoursSince = (new Date(now).getTime() - new Date(progress.lastSeenAt).getTime()) / 3600000;
    if (hoursSince < 24) score *= 0.1; // Cooldown: 90% reduction if seen today
  }
  return score;
}
```

- [ ] **Step 2: Enforce word uniqueness in `buildEligibleUnits`**
Ensure that for a single session, only the highest-priority conjugation form for any given `wordId` is included in the `eligibleUnits` pool.

- [ ] **Step 3: Run tests and verify uniqueness and cooldown**
Run: `npm test src/lib/study/scheduler.test.ts`

- [ ] **Step 4: Commit**
`git add src/lib/study/scheduler.ts src/lib/study/scoring.ts && git commit -m "feat: word uniqueness and 24h cooldown"`

---

### Task 3: Mastery Flow - Dynamic Re-queueing

**Files:**
- Modify: `src/lib/store.ts`
- Test: `src/lib/store.test.ts`

- [ ] **Step 1: Update `submitAnswer` to re-queue on error**
```typescript
// src/lib/store.ts -> submitAnswer
const nextWords = [...activeSession.words];
if (!isCorrect) {
  // Move current item to end of queue
  const currentItem = nextWords[activeSession.currentIndex];
  nextWords.push({ ...currentItem, retryCount: currentItem.retryCount + 1 });
}
const nextCurrentIndex = activeSession.currentIndex + 1;
// ... update state with nextWords and nextCurrentIndex
```

- [ ] **Step 2: Run tests for re-queueing behavior**
Run: `npm test src/lib/store.test.ts`

- [ ] **Step 3: Commit**
`git add src/lib/store.ts && git commit -m "feat: re-queue incorrect items at end of session"`

---

### Task 4: UI - Duolingo-style Progress Bar

**Files:**
- Modify: `src/components/PracticeSession.tsx`

- [ ] **Step 1: Update progress calculation**
Calculate progress based on unique units mastered vs total unique units in the initial session.
```typescript
const uniqueUnits = new Set(activeSession.words.map(w => w.unitKey)).size;
const masteredUnits = activeSession.results.filter((res, idx) => res && !activeSession.words[idx].retryCount).length; 
// Simplified: track actual mastery in activeSession state
```

- [ ] **Step 2: Hide numeric countdown and update Progress Bar UI**
Remove the `{currentIdx + 1}/{totalWords}` display. Update the progress bar width to reflect the mastery percentage.

- [ ] **Step 3: Commit**
`git add src/components/PracticeSession.tsx && git commit -m "ui: duolingo-style mastery progress bar"`

---

### Task 5: Documentation - Learning Architecture

**Files:**
- Create: `docs/learning-architecture.md`

- [ ] **Step 1: Document the mechanism**
Write a high-level explanation of:
- **Spaced Repetition & Cooldown:** Why we hide words for 24 hours.
- **Interleaved Practice:** Why we mix verb groups.
- **Mastery-Based Learning:** Why we re-queue errors until corrected.

- [ ] **Step 2: Commit**
`git add docs/learning-architecture.md && git commit -m "docs: add learning architecture guide"`
