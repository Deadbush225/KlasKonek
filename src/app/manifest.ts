import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'STAR-LINK DOST-SEI STEM Educators Hub',
    short_name: 'STAR-LINK',
    description: 'Community-driven collaboration hub for STEM educators enriching the e-STAR.ph resource portal.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#1d4f91',
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
