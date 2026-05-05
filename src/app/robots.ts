import { NextResponse } from 'next/server';

export async function GET() {
  const robotsTxt = `User-agent: *
Allow: /

# Public pages
Allow: /products/
Allow: /pricing
Allow: /help
Allow: /terms
Allow: /privacy

# Authenticated pages (not useful for search)
Disallow: /dashboard
Disallow: /studio
Disallow: /video
Disallow: /social
Disallow: /listing
Disallow: /floorplan
Disallow: /tour
Disallow: /library
Disallow: /settings
Disallow: /billing
Disallow: /usage
Disallow: /auth

# API routes
Disallow: /api/

Sitemap: https://zestio.pro/sitemap.xml
`;
  return new NextResponse(robotsTxt, {
    headers: { 'Content-Type': 'text/plain' },
  });
}
