import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const splashSource = readFileSync(path.resolve(__dirname, './SplashScreen.tsx'), 'utf8');

describe('splash screen first paint behavior', () => {
  it('renders the splash overlay immediately before client effects run', () => {
    expect(splashSource).toContain('useState(true)');
    expect(splashSource).not.toContain('setTimeout(() => {\n        setIsRendered(true);');
  });

  it('marks the overlay with a stable class for the early session-storage guard', () => {
    expect(splashSource).toContain('className={`splash-screen fixed inset-0');
  });
});
