import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import { headers } from "next/headers";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { translations, type Language } from "@/lib/i18n";
import { AuthProvider } from "@/components/AuthProvider";
import StudySync from "@/components/StudySync";

const font = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const acceptLang = headersList.get('accept-language') || '';
  const lang: Language = acceptLang.includes('zh') ? 'zh' : 
                         acceptLang.includes('vi') ? 'vi' : 
                         acceptLang.includes('ne') ? 'ne' : 'en';
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
      locale: lang === 'zh' ? 'zh_CN' : lang === 'vi' ? 'vi_VN' : lang === 'ne' ? 'ne_NP' : 'en_US',
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
        <AuthProvider>
          <StudySync />
          {children}
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
