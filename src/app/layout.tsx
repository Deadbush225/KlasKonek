import type { Metadata, Viewport } from 'next';
import './globals.css';
import layoutStyles from './layout.module.css';
import ThemeInit from '@/components/ThemeInit';
import { getCurrentUser } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'KlasKonek | Educators Hub',
  description: 'Community-driven collaboration hub for educators to share action research, discuss challenges, and form networks.',
  icons: {
    icon: '/img/favicon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

import Navigation from '@/components/Navigation';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeInit />
      </head>
      <body>
        <div className="blobContainer">
          <div className="blob blob1" />
          <div className="blob blob2" />
          <div className="blob blob3" />
        </div>

        <div className={layoutStyles.pageShell}>
          <Navigation currentUser={currentUser} />

          <main className={layoutStyles.mainContent}>
            {children}
          </main>


          <footer className={layoutStyles.footer}>
            <div className={layoutStyles.container}>
              <p>&copy; {new Date().getFullYear()} KlasKonek. A collaborative space for educators.</p>
              <p style={{ marginTop: '0.4rem', fontSize: '0.85rem' }}>
                <a href="/privacy" style={{ color: 'var(--primary-blue)', fontWeight: 600 }}>Privacy Policy</a>
                <span style={{ margin: '0 0.5rem', opacity: 0.5 }}>·</span>
                <a href="/terms" style={{ color: 'var(--primary-blue)', fontWeight: 600 }}>Terms &amp; Conditions</a>
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
