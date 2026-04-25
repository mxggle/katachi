import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const layoutSource = readFileSync(path.resolve(__dirname, './layout.tsx'), 'utf8');

describe('root layout hydration guards', () => {
  it('suppresses hydration warnings on the root html element for extension-mutated attributes', () => {
    expect(layoutSource).toContain('<html lang="en" suppressHydrationWarning>');
  });
});

describe('root layout app icons', () => {
  it('declares a png apple touch icon for iOS home screen installs', () => {
    expect(layoutSource).toContain("apple: [");
    expect(layoutSource).toContain("url: '/apple-touch-icon-180x180.png?v=20260425'");
    expect(layoutSource).toContain("sizes: '180x180'");
    expect(layoutSource).toContain("type: 'image/png'");
  });

  it('renders static apple touch icon links before the body for Safari add-to-home-screen', () => {
    const headIndex = layoutSource.indexOf('<head>');
    const bodyIndex = layoutSource.indexOf('<body');
    expect(headIndex).toBeGreaterThan(-1);
    expect(headIndex).toBeLessThan(bodyIndex);
    expect(layoutSource).toContain('rel="apple-touch-icon"');
    expect(layoutSource).toContain('href="/apple-touch-icon-180x180.png?v=20260425"');
    expect(layoutSource).toContain('rel="apple-touch-icon-precomposed"');
  });

  it('renders static iOS standalone web app metadata before the body', () => {
    const headSource = layoutSource.slice(
      layoutSource.indexOf('<head>'),
      layoutSource.indexOf('<body'),
    );
    expect(headSource).toContain('rel="manifest"');
    expect(headSource).toContain('name="mobile-web-app-capable" content="yes"');
    expect(headSource).toContain('name="apple-mobile-web-app-capable" content="yes"');
    expect(headSource).toContain('name="apple-mobile-web-app-title" content="Katachi"');
    expect(headSource).toContain('name="apple-mobile-web-app-status-bar-style" content="default"');
  });
});
