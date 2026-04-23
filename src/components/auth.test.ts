import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const layoutSource = readFileSync(path.resolve(__dirname, '../app/layout.tsx'), 'utf8');
const homeSource = readFileSync(path.resolve(__dirname, '../app/page.tsx'), 'utf8');
const progressSource = readFileSync(path.resolve(__dirname, '../app/progress/page.tsx'), 'utf8');

describe('auth integration source wiring', () => {
  it('wraps the app in auth and cloud sync providers', () => {
    expect(layoutSource).toContain('AuthProvider');
    expect(layoutSource).toContain('StudySync');
  });

  it('surfaces login from the home and progress pages without blocking guest practice', () => {
    expect(homeSource).toContain('AuthStatus');
    expect(progressSource).toContain('LoginForm');
  });
});
