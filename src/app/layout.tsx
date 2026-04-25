import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import { headers } from "next/headers";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { translations, type Language } from "@/lib/i18n";
import { AuthProvider } from "@/components/AuthProvider";
import StudySync from "@/components/StudySync";
import IOSInstallPrompt from "@/components/IOSInstallPrompt";
import SplashScreen from "@/components/SplashScreen";

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
                         acceptLang.includes('ne') ? 'ne' : 
                         acceptLang.includes('my') ? 'my' : 'en';
  const t = translations[lang];

  return {
    title: t.metaTitle,
    description: t.metaDescription,
    manifest: '/manifest.json',
    icons: {
      icon: [
        { url: '/icon.svg', type: 'image/svg+xml' },
        { url: '/logo.svg', type: 'image/svg+xml' },
      ],
      apple: [
        { url: '/apple-touch-icon-180x180.png?v=20260425', sizes: '180x180', type: 'image/png' },
      ],
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: 'Katachi',
    },
    alternates: {
      canonical: '/',
    },
    openGraph: {
      title: t.metaTitle,
      description: t.metaDescription,
      url: '/',
      type: 'website',
      locale: lang === 'zh' ? 'zh_CN' : lang === 'vi' ? 'vi_VN' : lang === 'ne' ? 'ne_NP' : lang === 'my' ? 'my_MM' : 'en_US',
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
  themeColor: "#f4f4ea",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Katachi" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-180x180.png?v=20260425" />
        <link rel="apple-touch-icon-precomposed" sizes="180x180" href="/apple-touch-icon-precomposed.png?v=20260425" />
      </head>
      <body className={`${font.variable} antialiased`}>
        <SplashScreen />
        <AuthProvider>
          <IOSInstallPrompt />
          <StudySync />
          {children}
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
