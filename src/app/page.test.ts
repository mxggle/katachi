import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const pageSource = readFileSync(path.resolve(__dirname, './page.tsx'), 'utf8');

describe('homepage entry layout', () => {
  it('presents a practice-first home with a dominant launch card and compact status strip', () => {
    expect(pageSource).toContain('Today&apos;s practice');
    expect(pageSource).toContain('Start in under a minute');
    expect(pageSource).toContain('Current setup');
    expect(pageSource).toContain('Daily streak');
  });

  it('removes the placeholder header slot in favor of learning-focused support content', () => {
    expect(pageSource).not.toContain('Header slot');
    expect(pageSource).toContain('How practice works');
  });
});
