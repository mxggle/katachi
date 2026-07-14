import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const routeSource = readFileSync(path.resolve(__dirname, './page.tsx'), 'utf8');
const pageSource = readFileSync(
  path.resolve(__dirname, '../../components/ConjugationGuidePage.tsx'),
  'utf8'
);
const practiceSource = readFileSync(
  path.resolve(__dirname, '../../components/PracticeSession.tsx'),
  'utf8'
);

describe('conjugation guide experience', () => {
  it('publishes a canonical, structured standalone learning page', () => {
    expect(routeSource).toContain("canonical: '/conjugation-guide'");
    expect(routeSource).toContain("'@type': 'LearningResource'");
    expect(routeSource).toContain("'@type': 'BreadcrumbList'");
    expect(pageSource).toContain('<h1');
    expect(pageSource).toContain('CONJUGATION_FORM_ORDER.map');
    expect(pageSource).toContain('ConjugationRulePanel');
  });

  it('deep-links to allowlisted formations and opens the matching rule section', () => {
    expect(pageSource).toContain('isConjugationType(hash)');
    expect(pageSource).toContain('target instanceof HTMLDetailsElement');
    expect(pageSource).toContain('target.open = true');
  });

  it('turns the practice formation badge into a rule dialog trigger', () => {
    expect(practiceSource).toContain('aria-haspopup="dialog"');
    expect(practiceSource).toContain('setShowFormationRules(true)');
    expect(practiceSource).toContain('<FormationRuleDialog');
  });
});
