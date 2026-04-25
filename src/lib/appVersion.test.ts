import { describe, expect, it } from 'vitest';
import packageJson from '../../package.json';
import { APP_VERSION } from './appVersion';

describe('app version', () => {
  it('tracks the package version used for app releases', () => {
    expect(APP_VERSION).toBe(packageJson.version);
  });
});
