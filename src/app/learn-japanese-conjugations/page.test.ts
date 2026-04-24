import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const pageSource = readFileSync(path.resolve(__dirname, './page.tsx'), 'utf8');
const globalStyles = readFileSync(path.resolve(__dirname, '../globals.css'), 'utf8');

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

  it('adds motion hooks to make the drill preview feel active', () => {
    expect(pageSource).toContain('motion-drift-grid');
    expect(pageSource).toContain('motion-drill-panel');
    expect(pageSource).toContain('motion-answer-correct');
    expect(pageSource).toContain('motion-stagger-item');
    expect(globalStyles).toContain('@keyframes drillPanelEnter');
    expect(globalStyles).toContain('@media (prefers-reduced-motion: reduce)');
  });
});
