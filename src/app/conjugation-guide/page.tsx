import type { Metadata } from 'next';
import ConjugationGuidePage from '@/components/ConjugationGuidePage';
import { getSiteUrl } from '@/lib/siteUrl';

export const metadata: Metadata = {
  title: 'Japanese Conjugation Guide: Verbs & Adjectives | Katachi',
  description: 'Learn Japanese verb and adjective conjugation rules with clear patterns and examples for Godan, Ichidan, irregular verbs, い-adjectives, and な-adjectives.',
  alternates: {
    canonical: '/conjugation-guide',
  },
  openGraph: {
    title: 'Japanese Conjugation Guide: Verbs & Adjectives | Katachi',
    description: 'See the rule and an example for every Japanese verb and adjective formation practiced in Katachi.',
    url: '/conjugation-guide',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Japanese Conjugation Guide | Katachi',
    description: 'Clear rules and examples for Japanese verb and adjective conjugations.',
  },
};

export default function Page() {
  const guideUrl = new URL('/conjugation-guide', getSiteUrl()).toString();
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'LearningResource',
        name: 'Japanese Conjugation Guide',
        url: guideUrl,
        description: 'Rules and examples for Japanese verb and adjective conjugations.',
        educationalLevel: 'JLPT N5–N3',
        inLanguage: ['en', 'zh', 'vi', 'ne', 'my', 'ko'],
        learningResourceType: 'Reference guide',
        isAccessibleForFree: true,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Katachi',
            item: getSiteUrl().toString(),
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Japanese Conjugation Guide',
            item: guideUrl,
          },
        ],
      },
    ],
  };
  const serializedJsonLd = JSON.stringify(jsonLd).replace(/</g, '\\u003c');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializedJsonLd }}
      />
      <ConjugationGuidePage />
    </>
  );
}
