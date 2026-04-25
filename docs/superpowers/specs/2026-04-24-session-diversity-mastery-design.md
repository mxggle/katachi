# Session Diversity & Mastery Design

## Goal
Improve the learning experience by ensuring a balanced mix of verb groups, preventing immediate repetition of words across sessions, and implementing a "mastery-based" session flow similar to Duolingo.

## Core Requirements

### 1. Balanced Selection (Strict Ratio & Interleaving)
- **Target Distribution:** When "Verbs" are selected, the session should aim for a roughly equal distribution (33% each) of:
    - Group 1 (Godan)
    - Group 2 (Ichidan)
    - Group 3 (Irregular: Suru/Kuru)
- **Selection Priority (Balanced Review):** To maintain the ratio while addressing weaknesses, the scheduler will:
    1. Group all eligible units by their verb group (G1, G2, G3).
    2. Within each group, sort units by weakness score (highest first).
    3. Take the top units from each group according to the target share (e.g., top 3-4 from each for a 10-item session).
- **Backfill Rule:** If a group (especially Irregular) has fewer unique words than its target share, fill the remaining slots with the next weakest words from other groups to maintain the requested session length.
- **Interleaving:** Selected units must be interleaved (e.g., G1 -> G2 -> G3 -> G1...) rather than grouped in blocks, ensuring variety throughout the session.

### 2. Session Uniqueness
- **Initial Selection:** A single dictionary word may only be **selected once** for the initial pool of a session. If multiple forms of the same word are high priority, the scheduler must pick the highest priority one and skip others.
- **Between-Sessions (Cooldown):** Implement a "Cooldown" mechanism. Words seen in the most recent session should have their priority significantly reduced (or be temporarily excluded) to prevent them from dominating every session until they are mastered.

### 3. Mastery Flow (Duolingo Style)
- **Progress Tracking:** The progress bar should track "Mastered Items" (items answered correctly on the first attempt or eventually corrected).
- **Retry Logic:** If a user answers incorrectly, the item is **re-queued**. It is moved to the end of the current session queue to be attempted again later in the same session.
- **Completion Criteria:** A session only ends when every unique item in the initial pool has been answered correctly at least once.
- **UI Update:** Remove the "X / Y" countdown. Show only the progress bar representing the percentage of items successfully cleared from the queue.

## Proposed Changes

### Logic (`src/lib/study/scheduler.ts` & `src/lib/study/scoring.ts`)
- Update `selectPracticeUnits` to group eligible units by verb group.
- Implement the "take 1 per group" interleaving logic.
- Add a `lastSeenAt` weight or a specific "cooldown" flag to the scoring logic to deprioritize recently seen words.

### State (`src/lib/store.ts`)
- Update `MiniSession` to handle a dynamic queue.
- Modify `submitAnswer` to:
    - If incorrect: Re-insert the current item at the end of the `words` array.
    - If correct: Increment `currentIndex` and update progress.

### Components (`src/components/PracticeSession.tsx`)
- Update the progress bar to calculate `(itemsCorrected / totalUniqueItems)`.
- Hide the "current / total" numeric indicator.
- Ensure the "Next" button correctly handles the re-queued items.

## Verification
- **Unit Tests:** Add tests for the interleaved scheduler ensuring ratios are met and words are unique in the initial pool.
- **Integration Tests:** Verify that incorrect answers re-queue the item in the `MiniSession` state.
- **Manual UI Check:** Confirm the progress bar advances only on correct answers and the session persists until all are cleared.
