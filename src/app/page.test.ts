import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const pageSource = readFileSync(path.resolve(__dirname, './page.tsx'), 'utf8');

describe('homepage entry layout', () => {
  it('presents a practice-first home with a dominant launch card and compact status strip', () => {
    expect(pageSource).toContain("t('heroTitleLine1')");
    expect(pageSource).toContain("t('startPractice')");
    expect(pageSource).toContain("t('currentlyPracticing')");
    expect(pageSource).toContain("t('streak')");
    expect(pageSource).toContain("t('viewProgress')");
  });

  it('removes the placeholder header slot in favor of learning-focused support content', () => {
    expect(pageSource).not.toContain('Header slot');
    expect(pageSource).toContain('SetupMenu');
  });
});
