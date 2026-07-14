import { afterEach, describe, expect, it, vi } from 'vitest';
import robots from './robots';
import sitemap from './sitemap';

describe('production metadata routes', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('publishes an absolute sitemap and keeps private handlers out of crawling', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://katachi.example');

    expect(robots()).toEqual({
      rules: {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/auth/'],
      },
      sitemap: 'https://katachi.example/sitemap.xml',
    });
  });

  it('includes canonical public pages and every localized landing variant', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://katachi.example');

    const entries = sitemap();
    expect(entries.map((entry) => entry.url)).toEqual([
      'https://katachi.example/',
      'https://katachi.example/learn-japanese-conjugations',
      'https://katachi.example/conjugation-guide',
    ]);
    expect(entries[1].alternates?.languages).toEqual({
      'x-default': 'https://katachi.example/learn-japanese-conjugations',
      en: 'https://katachi.example/learn-japanese-conjugations',
      zh: 'https://katachi.example/learn-japanese-conjugations?lang=zh',
      vi: 'https://katachi.example/learn-japanese-conjugations?lang=vi',
      ne: 'https://katachi.example/learn-japanese-conjugations?lang=ne',
      my: 'https://katachi.example/learn-japanese-conjugations?lang=my',
      ko: 'https://katachi.example/learn-japanese-conjugations?lang=ko',
    });
  });
});
