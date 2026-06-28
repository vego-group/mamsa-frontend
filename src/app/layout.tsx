import type { Metadata } from 'next';
import { IBM_Plex_Sans_Arabic, Inter } from 'next/font/google';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { QueryProvider } from '@/components/shared/QueryProvider';
import { LoginDialog } from '@/components/features/auth/LoginDialog';
import { RegisterDialog } from '@/components/features/auth/RegisterDialog';
import './globals.css';

const arabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-arabic',
  display: 'swap',
});

const latin = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-latin',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'مَمسَى — منصة حجز الإقامات',
  description: 'منصة رائدة في مجال حجز أماكن الإقامة الفريدة حول العالم.',
  keywords: ['حجز', 'فلل', 'شاليهات', 'شقق', 'الرياض', 'السعودية'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${arabic.variable} ${latin.variable}`}>
      <body className="min-h-screen bg-brand-cream/30 font-arabic text-brand-ink">
        <QueryProvider>
          <Header />
          <main>{children}</main>
          <Footer />
          {/* Global auth modals — controlled by ui store */}
          <LoginDialog />
          <RegisterDialog />
        </QueryProvider>
      </body>
    </html>
  );
}
