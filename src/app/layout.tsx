import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PaddleProvider } from "@/components/PaddleProvider";
import { CookieConsent } from "@/components/CookieConsent";
import { GlobalErrorTelemetry } from "@/components/GlobalErrorTelemetry";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { locales, type Locale } from '@/i18n/config';
import { createClient } from '@/utils/supabase/server';
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Zestio — AI-Powered Real Estate Media Platform",
    template: "%s | Zestio",
  },
  description: "Enhance property photos, create cinematic videos, generate listing descriptions, build floor plans, and more — all with AI. The all-in-one platform for real estate professionals.",
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://zestio.pro',
    siteName: 'Zestio',
    title: 'Zestio — AI-Powered Real Estate Media Platform',
    description: 'Enhance photos, create videos, generate descriptions, build floor plans — all with AI.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Zestio AI Real Estate Platform' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zestio — AI Real Estate Tools',
    description: 'Enhance photos, create videos, generate descriptions, build floor plans — all with AI.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

async function getLocale(): Promise<Locale> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('zestio_users')
        .select('language')
        .eq('id', user.id)
        .single();
      if (data?.language && locales.includes(data.language as Locale)) {
        return data.language as Locale;
      }
    }
  } catch {
    // Not logged in or error — use default
  }
  return 'de';
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  const messages = await getMessages({ locale });

  return (
    <html lang={locale}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <GlobalErrorTelemetry />
          <PaddleProvider>
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
            <CookieConsent />
          </PaddleProvider>
        </NextIntlClientProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#333',
              color: '#fff',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
