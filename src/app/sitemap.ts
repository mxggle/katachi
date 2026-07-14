import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/siteUrl';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const landingUrl = new URL('/learn-japanese-conjugations', siteUrl);

  return [
    {
      url: siteUrl.toString(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: landingUrl.toString(),
      changeFrequency: 'monthly',
      priority: 1,
      alternates: {
        languages: {
          'x-default': landingUrl.toString(),
          en: landingUrl.toString(),
          zh: `${landingUrl}?lang=zh`,
          vi: `${landingUrl}?lang=vi`,
          ne: `${landingUrl}?lang=ne`,
          my: `${landingUrl}?lang=my`,
          ko: `${landingUrl}?lang=ko`,
        },
      },
    },
  ];
}
