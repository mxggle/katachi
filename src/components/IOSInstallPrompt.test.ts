import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { shouldShowIOSInstallPrompt } from './IOSInstallPrompt';

const promptSource = readFileSync(path.resolve(__dirname, './IOSInstallPrompt.tsx'), 'utf8');
const i18nSource = readFileSync(path.resolve(__dirname, '../lib/i18n.ts'), 'utf8');

describe('iOS install prompt visibility', () => {
  it('shows only on iOS phone-sized browsers that are not already standalone', () => {
    expect(
      shouldShowIOSInstallPrompt({
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
        hasMSStream: false,
        isStandalone: false,
        standaloneNavigator: false,
        viewportWidth: 390,
      }),
    ).toBe(true);

    expect(
      shouldShowIOSInstallPrompt({
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
        hasMSStream: false,
        isStandalone: false,
        standaloneNavigator: false,
        viewportWidth: 932,
      }),
    ).toBe(true);

    expect(
      shouldShowIOSInstallPrompt({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15',
        hasMSStream: false,
        isStandalone: false,
        standaloneNavigator: false,
        viewportWidth: 1280,
      }),
    ).toBe(false);

    expect(
      shouldShowIOSInstallPrompt({
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
        hasMSStream: false,
        isStandalone: true,
        standaloneNavigator: false,
        viewportWidth: 390,
      }),
    ).toBe(false);
  });
});

describe('iOS install prompt copy', () => {
  it('uses localized copy for both prompt lines', () => {
    expect(promptSource).toContain("t('pwaInstallPrompt')");
    expect(promptSource).toContain("t('pwaInstallInstructions')");
    expect(promptSource).not.toContain('Tap Share');
  });

  it('provides install instruction translations for supported app languages', () => {
    expect(i18nSource.match(/pwaInstallInstructions:/g)).toHaveLength(5);
  });
});
