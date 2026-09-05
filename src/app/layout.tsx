import type { Metadata, Viewport } from 'next';
import './globals.css';
import { getTheme } from '@/lib/session';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { BackToTop } from '@/components/ui/back-to-top';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: {
    default: 'ManMan — Read manga & manhwa',
    template: '%s · ManMan',
  },
  description:
    'Read manga and manhwa with a fast, mobile-first reader: infinite vertical scroll, saved reading position, and a personal library.',
  openGraph: {
    type: 'website',
    siteName: 'ManMan',
  },
};

export const viewport: Viewport = {
  themeColor: '#0b0d12',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const theme = getTheme();

  return (
    <html lang="en" className={theme === 'light' ? 'light' : ''}>
      <body className="min-h-dvh antialiased">
        <SiteHeader theme={theme} />
        <main>{children}</main>
        <SiteFooter />
        <BackToTop />
      </body>
    </html>
  );
}
