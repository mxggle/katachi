# Conjugation Landing Drill Lab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `/learn-japanese-conjugations` as the approved Drill Lab landing page.

**Architecture:** Keep the page as a server component. Extend the existing landing copy object with small structured sections for hero proof, training metrics, and mode labels so the UI stays localized without adding runtime state.

**Tech Stack:** Next.js App Router, React server components, Tailwind CSS v4, Vitest source-level tests.

---

## File Structure

- Modify: `src/lib/landing-i18n.ts`
  - Add localized microcopy needed by the Drill Lab layout.
  - Preserve existing copy keys so metadata and older sections remain stable.
- Modify: `src/app/learn-japanese-conjugations/page.tsx`
  - Replace the current narrow stacked-card layout with the Drill Lab composition.
  - Keep metadata, JSON-LD, language resolution, and language switcher behavior.
- Create: `src/app/learn-japanese-conjugations/page.test.ts`
  - Verify the route contains the new structural markers and primary CTA destinations.

### Task 1: Add Landing Page Test

**Files:**
- Create: `src/app/learn-japanese-conjugations/page.test.ts`

- [ ] **Step 1: Write the source-level test**

```ts
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const pageSource = readFileSync(path.resolve(__dirname, './page.tsx'), 'utf8');

describe('learn japanese conjugations landing page', () => {
  it('uses the Drill Lab conversion structure', () => {
    expect(pageSource).toContain('Conjugation Lab');
    expect(pageSource).toContain('drillPanel');
    expect(pageSource).toContain('trainingStats');
    expect(pageSource).toContain('modeIndex');
  });

  it('keeps the route focused on starting practice', () => {
    expect(pageSource).toContain('copy.hero.ctaLink');
    expect(pageSource).toContain('copy.finalCta.cta');
    expect(pageSource).toContain('href="/"');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `yarn test src/app/learn-japanese-conjugations/page.test.ts`

Expected: FAIL because the test file or required source markers do not exist yet.

### Task 2: Extend Localized Landing Copy

**Files:**
- Modify: `src/lib/landing-i18n.ts`

- [ ] **Step 1: Add type fields**

Add `eyebrow`, `proof`, `drillPanel`, `trainingStats`, and `modeIndex` fields to `LandingCopy`.

- [ ] **Step 2: Add localized values**

Populate the new fields for `en`, `zh`, and `vi`. Keep strings concise and conversion-focused.

- [ ] **Step 3: Run tests**

Run: `yarn test src/app/learn-japanese-conjugations/page.test.ts`

Expected: still FAIL until the page consumes the new fields.

### Task 3: Rebuild the Route UI

**Files:**
- Modify: `src/app/learn-japanese-conjugations/page.tsx`

- [ ] **Step 1: Replace the current layout**

Use a full-width warm-paper page with header, two-column hero, drill panel, editorial bands, feature grid, mode rows, coverage matrix, N3 rationale, and final CTA.

- [ ] **Step 2: Preserve existing behavior**

Keep `generateMetadata`, JSON-LD, language selection, `LandingLanguageSwitcher`, `Logo`, and `Link` usage.

- [ ] **Step 3: Run focused test**

Run: `yarn test src/app/learn-japanese-conjugations/page.test.ts`

Expected: PASS.

### Task 4: Verify Quality

**Files:**
- No additional files.

- [ ] **Step 1: Run lint**

Run: `yarn lint`

Expected: PASS.

- [ ] **Step 2: Run app tests**

Run: `yarn test`

Expected: PASS.

- [ ] **Step 3: Start dev server**

Run: `yarn dev`

Expected: Next dev server starts on `http://localhost:4399`.
