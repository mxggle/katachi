import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { translations } from "@/lib/i18n";
import { AuthProvider } from "@/components/AuthProvider";
import StudySync from "@/components/StudySync";
import IOSInstallPrompt from "@/components/IOSInstallPrompt";
import SplashScreen from "@/components/SplashScreen";
import { getSiteUrl } from "@/lib/siteUrl";

const font = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const defaultMetadataCopy = translations.en;
const metadataBase = getSiteUrl();

export const metadata: Metadata = {
    metadataBase,
    title: defaultMetadataCopy.metaTitle,
    description: defaultMetadataCopy.metaDescription,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
      },
    },
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
      title: defaultMetadataCopy.metaTitle,
      description: defaultMetadataCopy.metaDescription,
      url: '/',
      type: 'website',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: defaultMetadataCopy.metaTitle,
      description: defaultMetadataCopy.metaDescription,
    },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
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
        <link rel="apple-touch-icon-precomposed" sizes="180x180" href="/apple-touch-icon-precomposed.png?v=20260425" />
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(sessionStorage.getItem("splash-shown")){document.documentElement.dataset.splashShown = "true";}}catch{}`,
          }}
        />
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
