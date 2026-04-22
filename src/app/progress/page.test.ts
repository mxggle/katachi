import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const pageSource = readFileSync(path.resolve(__dirname, './page.tsx'), 'utf8');

describe('progress page', () => {
  it('surfaces learner stats, weak spots, and drill actions', () => {
    expect(pageSource).toContain("getOverviewStats");
    expect(pageSource).toContain("getWeakestConjugations");
    expect(pageSource).toContain("getWeakestItems");
    expect(pageSource).toContain("t('practiceThisWeakness')");
  });

  it('puts weak-point practice ahead of overview summary', () => {
    expect(pageSource).toContain("t('practiceNextTitle')");
    expect(pageSource.indexOf('<WeaknessPanels')).toBeGreaterThan(-1);
    expect(pageSource.indexOf('<OverviewPanel')).toBeGreaterThan(-1);
    expect(pageSource.indexOf('<WeaknessPanels')).toBeLessThan(pageSource.indexOf('<OverviewPanel'));
  });
});
