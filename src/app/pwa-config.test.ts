import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const rootDir = process.cwd();
const nextConfigSource = readFileSync(join(rootDir, 'next.config.ts'), 'utf8');
const eslintConfigSource = readFileSync(join(rootDir, 'eslint.config.mjs'), 'utf8');
const proxySource = readFileSync(join(rootDir, 'src/proxy.ts'), 'utf8');
const packageJson = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf8')) as {
  scripts: Record<string, string>;
};

describe('PWA build configuration', () => {
  it('does not enable Turbopack for Serwist-managed service worker builds', () => {
    expect(nextConfigSource).not.toContain('turbopack');
    expect(packageJson.scripts.dev).toContain('--webpack');
    expect(packageJson.scripts.build).toContain('--webpack');
  });

  it('precaches the static app shell for navigation fallback', () => {
    expect(nextConfigSource).toContain('additionalPrecacheEntries: [{ url: "/", revision: null }]');
  });

  it('keeps generated PWA and local worktree artifacts out of lint', () => {
    expect(eslintConfigSource).toContain('"public/sw.js"');
    expect(eslintConfigSource).toContain('".worktrees/**"');
  });

  it('does not run Supabase session refresh work for the service worker or TTS route', () => {
    expect(proxySource).toContain('api/tts');
    expect(proxySource).toContain('sw.js');
    expect(proxySource).toContain('manifest.json');
  });

  it('sets baseline production security headers', () => {
    expect(nextConfigSource).toContain('X-Content-Type-Options');
    expect(nextConfigSource).toContain('X-Frame-Options');
    expect(nextConfigSource).toContain('Content-Security-Policy');
    expect(nextConfigSource).toContain("frame-ancestors 'none'");
    expect(nextConfigSource).toContain('Strict-Transport-Security');
    expect(nextConfigSource).toContain('browsing-topics=()');
  });
});
