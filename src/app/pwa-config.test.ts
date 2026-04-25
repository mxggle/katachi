import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const rootDir = process.cwd();
const nextConfigSource = readFileSync(join(rootDir, 'next.config.ts'), 'utf8');
const eslintConfigSource = readFileSync(join(rootDir, 'eslint.config.mjs'), 'utf8');
const packageJson = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf8')) as {
  scripts: Record<string, string>;
};

describe('PWA build configuration', () => {
  it('does not enable Turbopack for Serwist-managed service worker builds', () => {
    expect(nextConfigSource).not.toContain('turbopack');
    expect(packageJson.scripts.dev).toContain('--webpack');
    expect(packageJson.scripts.build).toContain('--webpack');
  });

  it('keeps generated PWA and local worktree artifacts out of lint', () => {
    expect(eslintConfigSource).toContain('"public/sw.js"');
    expect(eslintConfigSource).toContain('".worktrees/**"');
  });
});
