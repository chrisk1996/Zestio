import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = 'https://zestio.pro';
  const now = new Date().toISOString();

  const pages = [
    { url: '/', priority: '1.0', changefreq: 'weekly' },
    { url: '/pricing', priority: '0.9', changefreq: 'monthly' },
    { url: '/help', priority: '0.8', changefreq: 'monthly' },
    { url: '/terms', priority: '0.3', changefreq: 'yearly' },
    { url: '/privacy', priority: '0.3', changefreq: 'yearly' },
    { url: '/products/studio', priority: '0.8', changefreq: 'monthly' },
    { url: '/products/video', priority: '0.8', changefreq: 'monthly' },
    { url: '/products/social', priority: '0.7', changefreq: 'monthly' },
    { url: '/products/floorplan', priority: '0.7', changefreq: 'monthly' },
    { url: '/products/listing', priority: '0.7', changefreq: 'monthly' },
    { url: '/products/tour', priority: '0.7', changefreq: 'monthly' },
    { url: '/products/api', priority: '0.6', changefreq: 'monthly' },
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(p => `  <url>
    <loc>${baseUrl}${p.url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: { 'Content-Type': 'application/xml' },
  });
}
