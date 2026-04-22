import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const layoutSource = readFileSync(path.resolve(__dirname, './layout.tsx'), 'utf8');

describe('root layout hydration guards', () => {
  it('suppresses hydration warnings on the root html element for extension-mutated attributes', () => {
    expect(layoutSource).toContain('<html lang="en" suppressHydrationWarning>');
  });
});
