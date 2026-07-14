import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Study Progress | Katachi',
  description: 'Review your private Japanese conjugation practice progress and recent activity.',
  alternates: { canonical: '/progress' },
  robots: { index: false, follow: true },
};

export default function ProgressLayout({ children }: { children: React.ReactNode }) {
  return children;
}
