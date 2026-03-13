import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'CalcEmpire - Engineering Calculators',
    short_name: 'CalcEmpire',
    description: 'Professional engineering calculators — precise, fast, multilingual.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#2563eb',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    categories: ['education', 'utilities', 'productivity'],
    lang: 'en',
    dir: 'ltr',
  };
}
