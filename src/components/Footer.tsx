'use client';

import Link from 'next/link';

export function Footer() {
  const footerLinks = {
    Product: [
      { label: 'Image Studio', href: '/products/studio' },
      { label: 'Video Creator', href: '/products/video' },
      { label: 'Social Kit', href: '/products/social' },
      { label: '3D Floor Plans', href: '/products/floorplan' },
      { label: 'Listing Builder', href: '/products/listing' },
      { label: '3D Tour Scanner', href: '/products/tour' },
      { label: 'API', href: '/products/api' },
    ],
    Resources: [
      { label: 'Pricing', href: '/pricing' },
      { label: 'Help Center', href: '/help' },
    ],
    Company: [
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
    ],
  };

  return (
    <footer className="bg-white border-t border-[#c4c6cd]/10 mt-auto">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <span className="font-serif text-2xl text-[#1d2832] tracking-tight">
                Zest<span className="text-[#006c4d]">i</span>o
              </span>
            </Link>
            <p className="text-sm text-[#43474c] mb-4 leading-relaxed">
              AI-powered real estate media platform. Enhance photos, create videos, build floor plans — all in one place.
            </p>
          </div>

          {/* Link Groups */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-xs font-manrope uppercase tracking-widest text-[#43474c] mb-4">
                {title}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#43474c] hover:text-[#006c4d] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#c4c6cd]/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[#43474c]">
            &copy; {new Date().getFullYear()} Zestio. All rights reserved.
          </p>
          <p className="text-xs text-[#43474c]">
            Made with ❤️ for real estate professionals
          </p>
          <div className="flex items-center gap-4">
            <a
              href="mailto:zestioai1@gmail.com"
              className="text-xs text-[#43474c] hover:text-[#006c4d] transition-colors"
            >
              zestioai1@gmail.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
