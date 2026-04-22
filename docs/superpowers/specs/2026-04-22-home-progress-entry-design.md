# Home Progress Entry Design

**Date:** 2026-04-22
**Status:** Approved for implementation
**Scope:** Improve the visibility of the progress entry point on the home page

---

## 1. Overview

The current home page places `View progress` below the setup area as a small footer-style action. That placement makes it easy to miss because it sits outside the main scan path and visually competes with the language switcher rather than with the learning content.

The home page should continue to be practice-first, but progress needs a clearer and more intentional entry point.

---

## 2. Goal

Make progress discoverable from the home page without weakening the main `Start practice` CTA.

Success criteria:

- users can notice the progress entry point in the same scan as the launch card
- `Start practice` remains the dominant action on the page
- the progress entry feels connected to learning state, not like a footer utility
- the change works cleanly on both desktop and mobile

---

## 3. Approaches Considered

### Option A: Header Utility Action

Place `View progress` in the hero/header area, aligned to the top right.

Pros:

- easy to implement
- visually separate from setup controls

Cons:

- still easy to miss on mobile
- reads like a utility link instead of a core learning destination
- weak association with current study state

### Option B: Secondary CTA Beside Start

Place `View progress` inside the main card, next to `Start practice`.

Pros:

- highly visible
- keeps both core actions inside the main launch area

Cons:

- adds action density to the card
- risks competing with the primary CTA
- leaves little room to explain what progress contains

### Option C: Dedicated Progress Strip

Place a compact progress strip directly below the main `Start practice` button inside the hero card.

Pros:

- visible in the primary reading path
- preserves a clear primary/secondary hierarchy
- allows a small metric preview to give the action context
- scales well on mobile as a stacked module

Cons:

- adds one more content block to the main card
- needs tighter copy and spacing discipline to avoid bloat

### Recommendation

Use **Option C: Dedicated Progress Strip**.

This gives progress its own scan zone without diluting the main practice action. It also creates room for a small preview metric so the entry point feels informative, not merely navigational.

---

## 4. Chosen Design

The home-page hero card will contain, in order:

1. streak and goal summary
2. error message, when present
3. primary `Start practice` button
4. compact progress strip
5. current setup summary

The progress strip will:

- sit directly under the primary CTA
- use a distinct but quieter visual treatment than the start button
- show one cumulative metric preview
- include a clear `View progress` action on the right

The language switcher will remain outside the card. The standalone footer-style `View progress` link will be removed.

---

## 5. Metric Choice

The strip should preview a single cumulative metric: `items studied`.

Implementation source:

- use `studyState.learnerSummary.totalAnswered`

Rationale:

- cumulative progress is stable and easy to understand
- it does not duplicate the existing streak display
- it is already tracked in the store, so the UI does not need new progress derivation
- it gives users a reason to open the progress page without overloading the home page

The label should be phrased in user-facing language such as `Items studied` or the equivalent translation string.

---

## 6. Visual and Interaction Guidance

### Hierarchy

- `Start practice` remains the strongest color block and largest button
- the progress strip should read as a secondary module, not a second primary CTA
- the metric should be scannable first, then the action

### Layout

- desktop: horizontal strip with metric content on the left and action on the right
- mobile: stacked or tightly wrapped layout with preserved tap target sizes

### Styling Direction

- place the strip inside the same hero card as the main CTA
- use a soft tinted background or accent-soft treatment
- keep the border and shadow language consistent with the current card system
- use enough contrast that the strip reads as an intentional module, not body copy

### Copy

- short label for the metric
- short, explicit action label: `View progress`
- avoid explanatory paragraphs inside the strip

---

## 7. Testing Impact

The home-page layout test should be updated to reflect the new structure:

- `viewProgress` should still be present
- the page should describe progress as part of the main launch card structure, not as a footer strip

If component extraction is introduced for the strip, add focused rendering tests only if the component contains non-trivial conditional logic.

---

## 8. Out of Scope

These are not part of this change:

- adding weak-point summaries to the home page
- changing the progress page information architecture
- introducing charts or sparkline visuals to the home page
- adding new progress calculations beyond the existing cumulative count

---

## 9. Implementation Notes

- prefer reusing existing store data rather than creating a new selector unless the component boundary needs one
- keep the change limited to home-page composition and related copy/tests
- preserve the current animation cadence and card style language
