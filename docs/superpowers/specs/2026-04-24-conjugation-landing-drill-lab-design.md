# Conjugation Landing Drill Lab Design

## Goal

Revamp `/learn-japanese-conjugations` into a distinctive, conversion-focused landing page that presents Katachi as a focused Japanese conjugation drill tool and drives visitors into the practice app.

## Direction

Use the approved "Drill Lab" direction: a warm-paper, product-first page with a live-looking conjugation exercise in the hero. The page should feel like a focused practice instrument rather than a generic edtech SaaS landing page.

## Scope

- Preserve the existing route, metadata, JSON-LD, language switcher, and CTA destination.
- Keep the original intent: explain the conjugation problem, show what Katachi trains, describe practice modes, list coverage, and explain the N3 boundary.
- Refine copy only where it improves clarity and conversion.
- Avoid the current repeated stacked card pattern, floating blob background, and generic AI-style decorative gradients.

## Layout

1. Header: compact brand mark, "Conjugation Lab" context label, language switcher, and a secondary practice link on larger screens.
2. Hero: two-column desktop layout with high-impact headline, concise subtitle, primary CTA, trust/utility microcopy, and a detailed drill panel showing a Japanese prompt, answer choices, and session metrics.
3. Problem section: editorial copy with a small callout that names the learner pain: knowing rules but freezing during production.
4. Training system: feature grid showing zero-friction drills, weakness detection, dual modes, and streak consistency.
5. Practice modes: horizontal/stacked step panels for Daily Drill, Weakness Training, and Free Practice.
6. Coverage: compact form matrix for verbs and adjectives.
7. N3 rationale: clear explanatory section that positions Katachi as pattern training, not vocabulary memorization.
8. Final CTA: strong closing band that reuses the practice-lab language and links back to `/`.

## Visual System

- Palette: warm paper background, white/cream surfaces, ink text, coral CTA, muted green/yellow accents used sparingly.
- Shape language: tighter 8-18px radii, structured borders, subtle shadows, worksheet/lab dividers.
- Typography: strong headline hierarchy with compact labels; avoid oversized decorative cards in content sections.
- Distinctive details: Japanese form chips, answer choices, session counters, and form coverage rows.

## Testing

- Add a source-level page test for the new route that verifies key landing sections and CTA links exist.
- Run the focused test and lint after implementation.
