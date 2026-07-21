import type { Metadata } from 'next';
import { IBM_Plex_Sans_Arabic, Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages, getTranslations } from 'next-intl/server';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { QueryProvider } from '@/components/shared/QueryProvider';
import { LoginDialog } from '@/components/features/auth/LoginDialog';
import { RegisterDialog } from '@/components/features/auth/RegisterDialog';
import { FavoritesSync } from '@/components/shared/FavoritesSync';
import { ToastHost } from '@/components/shared/ToastHost';
import { WebMcpTools } from '@/components/agents/WebMcpTools';
import './globals.css';

const arabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-arabic',
  display: 'swap',
});

const latin = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-latin',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('meta');
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();
  const isArabic = locale === 'ar';

  return (
    <html lang={locale} dir={isArabic ? 'rtl' : 'ltr'} className={`${arabic.variable} ${latin.variable}`}>
      <body
        className={`min-h-screen bg-brand-cream/30 text-brand-ink ${isArabic ? 'font-arabic' : 'font-latin'}`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <QueryProvider>
            <Header />
            <main>{children}</main>
            <Footer />
            {/* Global auth modals — controlled by ui store */}
            <LoginDialog />
            <RegisterDialog />
            {/* Keeps favourites in sync with the account across login/logout */}
            <FavoritesSync />
            <ToastHost />
            {/* Read-only catalogue tools for in-browser AI agents (WebMCP). */}
            <WebMcpTools />
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
