import { describe, expect, it } from 'vitest';
import { getSiteUrl } from './siteUrl';

describe('getSiteUrl', () => {
  it('uses the explicit production URL and normalizes it to an origin', () => {
    expect(
      getSiteUrl({ NEXT_PUBLIC_SITE_URL: 'https://katachi.example/path?preview=1' }).toString()
    ).toBe('https://katachi.example/');
  });

  it('supports Vercel-provided hostnames', () => {
    expect(getSiteUrl({ VERCEL_PROJECT_PRODUCTION_URL: 'katachi.vercel.app' }).toString()).toBe(
      'https://katachi.vercel.app/'
    );
  });

  it('falls back to the documented local development URL', () => {
    expect(getSiteUrl({}).toString()).toBe('http://localhost:4399/');
  });

  it('rejects non-http protocols', () => {
    expect(() => getSiteUrl({ NEXT_PUBLIC_SITE_URL: 'javascript:alert(1)' })).toThrow();
  });

  it('rejects credentials and insecure production origins', () => {
    expect(() => getSiteUrl({ NEXT_PUBLIC_SITE_URL: 'https://user:secret@example.com' })).toThrow();
    expect(() => getSiteUrl({ NEXT_PUBLIC_SITE_URL: 'http://example.com' })).toThrow();
    expect(getSiteUrl({ NEXT_PUBLIC_SITE_URL: 'http://localhost:4399' }).toString()).toBe(
      'http://localhost:4399/'
    );
  });
});
