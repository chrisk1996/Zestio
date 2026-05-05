import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/studio',
          '/video',
          '/social',
          '/listing',
          '/floorplan',
          '/tour',
          '/library',
          '/settings',
          '/billing',
          '/usage',
          '/auth',
          '/api/',
        ],
      },
    ],
    sitemap: 'https://zestio.pro/sitemap.xml',
  };
}
