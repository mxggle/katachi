# Homepage UX Direction Notes

**Date:** 2026-04-26  
**Status:** Saved for later use  
**Scope:** Homepage structure, visual hierarchy, and icon direction

## Context

The current homepage has several UX issues:

- The visual style is too poster-like and heavy for a daily practice app.
- The primary practice path, support actions, and status information compete for attention.
- Decorative symbolic icons such as `▣`, `◎`, and `▤` feel improvised rather than product-grade.
- The blob background and oversized comic-style borders are not aligned with the existing "practice instrument / drill lab" design direction.
- The homepage should remain practice-first, local-first, mobile-friendly, and PWA-safe.

## Direction Options

### Option A: Daily Practice Console

Use the homepage as a focused daily practice console.

Core traits:

- One dominant primary action: start today's practice.
- Compact learning status near the main action.
- Secondary practice paths remain available but visually quieter.
- Progress is visible as a supporting entry, not a dashboard takeover.
- Professional iconography replaces ad hoc symbols.

Pros:

- Best fit for returning users.
- Keeps the homepage efficient and task-focused.
- Works well on mobile and in standalone PWA mode.
- Leaves room for setup controls without crowding the first screen.

Cons:

- Less visually explanatory for first-time visitors than a product demo hero.

### Option B: Drill Lab

Make the homepage more expressive by showing a live-looking conjugation drill preview.

Core traits:

- Hero includes an example prompt, answer choices, and session metrics.
- The product experience is immediately visible.
- Stronger editorial identity: focused conjugation lab rather than generic study app.

Pros:

- Better at explaining what Katachi does to new users.
- More distinctive and memorable.
- Aligns with the existing `/learn-japanese-conjugations` Drill Lab direction.

Cons:

- Slightly less direct for repeat users who only want to resume practice.
- More visual complexity on the first screen.

### Option C: Progress Dashboard Entry

Turn the homepage into a status-forward dashboard.

Core traits:

- Progress cards and learning metrics are prominent.
- Today's practice is framed as one module among several.
- Weakness, streak, studied count, and setup summary all surface early.

Pros:

- Useful for committed learners who want feedback.
- Makes progress discovery very strong.

Cons:

- Risks weakening the main practice CTA.
- Can make the homepage feel like analytics instead of a launch surface.
- Higher chance of crowding on mobile.

## Recommendation

Use **Option A: Daily Practice Console** as the base.

Borrow a small amount of Option B's drill detail only where it helps the homepage feel specific to Japanese conjugation practice. Avoid Option C's dashboard density on the first screen.

The homepage should feel like a polished practice instrument:

- fast to scan
- clearly action-oriented
- calm enough for daily repeated use
- specific enough to feel like Katachi, not a generic learning app

## Proposed Homepage Structure

1. Compact top bar
   - Brand mark and app name on the left.
   - Auth status and language/setup utilities kept compact.
   - Avoid large header decoration.

2. Hero / daily practice area
   - Small label for the practice rhythm.
   - Strong but restrained title.
   - Today's plan shown as a compact summary, not a large bordered table.
   - Primary CTA for today's practice.

3. Learning status strip
   - Streak, goal, and total studied can appear as lightweight metrics.
   - Progress link should feel connected to learning state.
   - Keep this quieter than the primary CTA.

4. Secondary practice actions
   - Weakness drill and free practice as secondary buttons/cards.
   - Use real icons from `lucide-react` rather than text symbols.
   - Descriptions should be short and scannable.

5. Setup controls
   - Keep setup available but visually secondary unless the user is configuring.
   - Avoid placing setup above the primary daily practice path.

6. Footer utilities
   - Language switcher and version can remain low priority.
   - Do not place important learning actions only in the footer.

## Icon Direction

Replace improvised symbols with `lucide-react` icons:

- Daily practice: `CalendarCheck`, `Play`, or `Flame` depending on copy.
- Weakness drill: `Target` or `Crosshair`.
- Free practice: `SlidersHorizontal`, `ListChecks`, or `Dumbbell`.
- Progress: `ChartNoAxesColumnIncreasing` or `TrendingUp`.
- Navigation arrows: `ArrowRight`.

Icons should be functional, not decorative. Use them to clarify action types and keep labels compact.

## Visual Style Direction

Use a calmer version of the existing warm-paper identity:

- Background: warm paper `var(--bg)` with subtle structure, not blob gradients.
- Surfaces: white or soft warm panels with restrained borders.
- Radius: generally 8-18px, larger only for major app surfaces.
- Shadows: soft depth, not heavy comic offset shadows.
- Color: coral remains the primary CTA color; muted green/yellow/blue are accents only.
- Typography: strong headings, but avoid oversized hero type inside compact app surfaces.

## Implementation Notes For Later

- Preserve PWA behavior and keep browser-only APIs inside client components/effects.
- Keep `public/sw.js` generated; do not hand-edit it.
- Update homepage source tests if structure or translation key usage changes.
- If adding or changing user-facing copy, update all languages in `src/lib/i18n.ts`.
- Run focused homepage tests and lint after implementation.
- Run `npm run build` only if PWA, metadata, manifest, service worker, or static asset behavior changes.

## Visual Companion Artifact

The temporary browser mockup was created at:

`.superpowers/brainstorm/39170-1777169335/homepage-direction.html`

That directory is intentionally ignored by git, so this document is the durable project copy of the design direction.
