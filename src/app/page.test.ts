import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const pageSource = readFileSync(path.resolve(__dirname, './page.tsx'), 'utf8');

describe('homepage entry layout', () => {
  it('presents a practice-first home with a dominant launch card and a dedicated progress strip', () => {
    expect(pageSource).toContain("t('heroTitleLine1')");
    expect(pageSource).toContain("t('startPractice')");
    expect(pageSource).toContain("t('currentlyPracticing')");
    expect(pageSource).toContain("t('streak')");
    expect(pageSource).toContain("t('viewProgress')");
    expect(pageSource).toContain("t('itemsStudied')");
    expect(pageSource).toContain('studyState.learnerSummary.totalAnswered');
  });

  it('removes the placeholder header slot in favor of learning-focused support content', () => {
    expect(pageSource).not.toContain('Header slot');
    expect(pageSource).toContain('SetupMenu');
  });

  it('keeps the top brand mark stable while auth controls change state', () => {
    expect(pageSource).toContain('flex items-center gap-4 shrink-0');
    expect(pageSource).toContain('whitespace-nowrap text-lg font-black');
  });

  it('shows the app package version in the footer for release tracking', () => {
    expect(pageSource).toContain("import { APP_VERSION } from '@/lib/appVersion'");
    expect(pageSource).toContain('v{APP_VERSION}');
  });
});
