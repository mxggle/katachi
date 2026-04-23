import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import { headers } from "next/headers";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { translations } from "@/lib/i18n";

const font = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const acceptLang = headersList.get('accept-language') || '';
  const lang: 'en' | 'zh' = acceptLang.includes('zh') ? 'zh' : 'en';
  const t = translations[lang];

  return {
    title: t.metaTitle,
    description: t.metaDescription,
    icons: {
      icon: '/icon.svg',
    },
    alternates: {
      canonical: '/',
    },
    openGraph: {
      title: t.metaTitle,
      description: t.metaDescription,
      url: '/',
      type: 'website',
      locale: lang === 'zh' ? 'zh_CN' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: t.metaTitle,
      description: t.metaDescription,
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${font.variable} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
