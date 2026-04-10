import type { Metadata, Viewport } from 'next';
import './globals.css';
import layoutStyles from './layout.module.css';
import ThemeInit from '@/components/ThemeInit';
import { getCurrentUser } from '@/lib/auth';
import DemoBanner from '@/components/DemoBanner';

export const metadata: Metadata = {
  title: 'STAR-LINK | DOST-SEI STEM Educators Hub',
  description: 'Community-driven collaboration hub for STEM educators enriching the e-STAR.ph resource portal. Share action research, discuss challenges, and form networks.',
  icons: {
    icon: '/img/favicon.png',
    apple: '/img/favicon.png',
  },
  openGraph: {
    title: 'STAR-LINK Community',
    description: 'Connect, collaborate, and share impactful Action Research and Extension Projects with STEM educators.',
    url: 'https://geminated.vercel.app',
    siteName: 'STAR-LINK DOST-SEI',
    images: [
      {
        url: '/img/favicon.png',
        width: 800,
        height: 600,
      },
    ],
    locale: 'en_PH',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'STAR-LINK Community',
    description: 'Connect, collaborate, and share impactful Action Research and Extension Projects with STEM educators.',
    images: ['/img/favicon.png'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#1d4f91',
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
        
        <DemoBanner />

        <div className={layoutStyles.pageShell}>
          <Navigation currentUser={currentUser} />

          <main className={layoutStyles.mainContent}>
            {children}
          </main>


          <footer className={layoutStyles.footer}>
            <div className={layoutStyles.container}>
              <p>&copy; {new Date().getFullYear()} DOST-SEI STAR-LINK. A collaborative space for STEM educators.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
