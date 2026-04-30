import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Enable Turbopack for Next.js 16
  turbopack: {},
  // Bundle ffmpeg binary with the stitch route for Vercel Fluid compute
  outputFileTracingIncludes: {
    '/api/video-jobs/[id]/process': [
      './node_modules/ffmpeg-static/ffmpeg',
    ],
  },
};

export default withNextIntl(nextConfig);
