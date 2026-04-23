import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const layoutSource = readFileSync(path.resolve(__dirname, '../app/layout.tsx'), 'utf8');
const homeSource = readFileSync(path.resolve(__dirname, '../app/page.tsx'), 'utf8');
const progressSource = readFileSync(path.resolve(__dirname, '../app/progress/page.tsx'), 'utf8');
const loginFormSource = readFileSync(path.resolve(__dirname, './LoginForm.tsx'), 'utf8');
const studySyncSource = readFileSync(path.resolve(__dirname, './StudySync.tsx'), 'utf8');
const authStatusSource = readFileSync(path.resolve(__dirname, './AuthStatus.tsx'), 'utf8');

describe('auth integration source wiring', () => {
  it('wraps the app in auth and cloud sync providers', () => {
    expect(layoutSource).toContain('AuthProvider');
    expect(layoutSource).toContain('StudySync');
  });

  it('surfaces login from the home and progress pages without blocking guest practice', () => {
    expect(homeSource).toContain('AuthStatus');
    expect(progressSource).toContain('LoginForm');
  });

  it('surfaces auth callback errors on the homepage', () => {
    expect(homeSource).toContain('useSearchParams');
    expect(homeSource).toContain("authError === 'auth_failed'");
    expect(homeSource).toContain("authError === 'auth_unconfigured'");
  });

  it('recovers the login form from thrown auth and OAuth startup failures', () => {
    expect(loginFormSource).toContain('try');
    expect(loginFormSource).toContain('finally');
    expect(loginFormSource).toContain('signInWithOAuth');
    expect(loginFormSource).toContain('oauthResult.error');
  });

  it('shows cloud sync setup failures instead of only logging them', () => {
    expect(studySyncSource).toContain('syncErrorKey');
    expect(studySyncSource).toContain('getStudySyncErrorMessageKey');
    expect(studySyncSource).toContain("t(syncErrorKey)");
  });

  it('keeps auth status controls from resizing the homepage brand mark during loading', () => {
    expect(authStatusSource).toContain('h-11 shrink-0');
    expect(authStatusSource).toContain('whitespace-nowrap');
  });
});
