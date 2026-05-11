import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'KlasKonek Educators Hub',
    short_name: 'KlasKonek',
    description: 'Community-driven collaboration hub for educators to share research, programs, and regional insights.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#154597',
    icons: [
      {
        src: '/img/favicon.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/img/favicon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
