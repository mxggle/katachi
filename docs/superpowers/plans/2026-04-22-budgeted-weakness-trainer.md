# Budgeted Weakness Trainer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add budgeted weakness-driven practice, learner-state persistence, and a dedicated progress page with minimal homepage disruption.

**Architecture:** Split runtime session UI state from persisted learner data. Add a study-domain layer that tracks per-unit progress and produces budgeted practice sessions. Keep homepage structure intact and move analytics to a dedicated route.

**Tech Stack:** Next.js App Router, Zustand, localStorage persistence, Vitest, TypeScript

---

### Task 1: Introduce learner-domain types and migrations

**Files:**
- Modify: `src/lib/store.ts`
- Create: `src/lib/study/types.ts`
- Create: `src/lib/study/migrate.ts`
- Test: `src/lib/study/migrate.test.ts`

- [ ] Write failing migration tests for current persisted state -> new domain shape
- [ ] Verify tests fail for missing migration logic
- [ ] Implement domain types and migration helpers
- [ ] Update store persistence shape to use the migrated learner state
- [ ] Run targeted tests

### Task 2: Add weakness scoring and session scheduling

**Files:**
- Create: `src/lib/study/scoring.ts`
- Create: `src/lib/study/scheduler.ts`
- Modify: `src/lib/sessionBuilder.ts`
- Test: `src/lib/study/scoring.test.ts`
- Test: `src/lib/study/scheduler.test.ts`

- [ ] Write failing tests for weakness scoring
- [ ] Write failing tests for daily/weakness/free session selection
- [ ] Implement weighted weak-point selection and new-item quotas
- [ ] Refactor session builder to use scheduler output
- [ ] Run targeted tests

### Task 3: Record attempts and session completion correctly

**Files:**
- Modify: `src/lib/store.ts`
- Modify: `src/components/PracticeSession.tsx`
- Test: `src/lib/store.test.ts`

- [ ] Write failing tests for attempt recording and completed-session streak updates
- [ ] Implement attempt/session record updates in store actions
- [ ] Change streak logic to run on completed practice, not homepage load
- [ ] Wire PracticeSession to submit richer answer payloads
- [ ] Run targeted tests

### Task 4: Add retry queue behavior

**Files:**
- Create: `src/lib/study/retryQueue.ts`
- Modify: `src/lib/store.ts`
- Modify: `src/components/PracticeSession.tsx`
- Test: `src/lib/study/retryQueue.test.ts`

- [ ] Write failing tests for delayed retry insertion
- [ ] Implement retry queue rules and caps
- [ ] Integrate retry behavior into active session advancement
- [ ] Run targeted tests

### Task 5: Add practice-type selection with minimal homepage changes

**Files:**
- Modify: `src/components/SetupMenu.tsx`
- Modify: `src/components/setupMenu.helpers.ts`
- Modify: `src/lib/i18n.ts`
- Test: `src/components/setupMenu.helpers.test.ts`
- Test: `src/app/page.test.ts`

- [ ] Write failing tests for practice-type copy and homepage navigation text
- [ ] Add lightweight practice-type selector and progress entry
- [ ] Keep homepage CTA and hero unchanged
- [ ] Run targeted tests

### Task 6: Build the progress page

**Files:**
- Create: `src/app/progress/page.tsx`
- Create: `src/components/progress/OverviewPanel.tsx`
- Create: `src/components/progress/WeaknessPanels.tsx`
- Create: `src/components/progress/RecentActivityPanel.tsx`
- Modify: `src/lib/i18n.ts`
- Test: `src/app/progress/page.test.ts`

- [ ] Write failing tests for progress page rendering from learner data
- [ ] Implement overview, weakness, and recent activity sections
- [ ] Add drill CTA links/actions from weak areas
- [ ] Run targeted tests

### Task 7: Verification and cleanup

**Files:**
- Modify: affected files only

- [ ] Run full test suite
- [ ] Review for minimal homepage impact and routing sanity
- [ ] Review persistence shape for Supabase-friendly boundaries
- [ ] Fix any regressions

