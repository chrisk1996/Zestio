'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { createClient } from '@/utils/supabase/client';

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setIsLoggedIn(!!data.user);
    });
  }, []);

  const ctaHref = isLoggedIn ? '/dashboard' : '/auth';
  const ctaText = isLoggedIn ? 'Go to Dashboard' : 'Get Started Free';

  return (
    <div className="min-h-screen bg-[#f7f9ff]">
      <Header />

      <main className="pt-32">
        {/* Hero Section */}
        <section className="px-12 mb-20">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-24">
            <div className="md:w-3/5">
              <span className="font-manrope text-xs uppercase tracking-[0.3em] text-[#006c4d] mb-4 block">
                AI-Powered Real Estate Media
              </span>
              <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl leading-[0.9] text-[#1d2832] mb-6 tracking-tighter">
                Property Photos
                <br />
                That <span className="italic">Sell.</span>
              </h1>
              <p className="text-base text-[#43474c] leading-relaxed mb-8 max-w-xl">
                Enhance, stage, animate, and list — all from one platform. Zestio uses cutting-edge AI
                to transform standard property photos into marketing that converts.
              </p>
              <Link
                href={ctaHref}
                className="inline-flex items-center gap-3 bg-[#006c4d] text-white px-8 py-4 rounded font-manrope uppercase tracking-widest text-xs hover:opacity-90 transition-all"
              >
                {ctaText}
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
            </div>
            <div className="md:w-2/5 h-[300px] md:h-[400px] relative overflow-hidden rounded-lg grayscale-[0.2] opacity-90">
              <img
                alt="Minimalist luxury interior"
                className="w-full h-full object-cover"
                src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80"
              />
            </div>
          </div>
        </section>

        {/* Service Catalogue */}
      <section id="products" className="px-12 py-20 bg-[#edf4ff]">
        
          <div className="max-w-7xl mx-auto">
            <div className="flex items-baseline justify-between mb-16 border-b border-[#c4c6cd]/30 pb-6">
              <h2 className="font-serif text-4xl text-[#1d2832]">What You Can Do</h2>
              <span className="font-manrope text-xs uppercase tracking-widest text-[#43474c]">
                7 AI-Powered Tools
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Image Studio */}
              <div className="bg-white rounded-lg overflow-hidden flex flex-col card-hover-effect border border-[#c4c6cd]/10">
                <div className="h-64 relative overflow-hidden">
                  <img
                    alt="Enhanced property photography"
                    className="w-full h-full object-cover"
                    src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-sm">
                    <span className="font-manrope text-[10px] uppercase tracking-widest text-[#1d2832]">
                      01 / Studio
                    </span>
                  </div>
                </div>
                <div className="p-8 flex flex-col flex-grow">
                  <h3 className="font-serif text-3xl text-[#1d2832] mb-2">Image Studio</h3>
                  <p className="font-serif italic text-xl text-[#006c4d] mb-4">Enhance, Stage &amp; Transform</p>
                  <p className="text-sm text-[#43474c] leading-relaxed mb-8 flex-grow">
                    One workspace for everything: enhance clarity, swap skies, change seasons, virtually
                    stage rooms, remove objects, and more — 13 AI tools in one.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-6 border-t border-[#c4c6cd]/10">
                    <span className="px-2 py-1 bg-[#e3efff] rounded-sm font-manrope text-[8px] uppercase tracking-widest text-[#1d2832]">Sky Replace</span>
                    <span className="px-2 py-1 bg-[#e3efff] rounded-sm font-manrope text-[8px] uppercase tracking-widest text-[#1d2832]">Virtual Staging</span>
                    <span className="px-2 py-1 bg-[#e3efff] rounded-sm font-manrope text-[8px] uppercase tracking-widest text-[#1d2832]">Season Change</span>
                    <span className="px-2 py-1 bg-[#e3efff] rounded-sm font-manrope text-[8px] uppercase tracking-widest text-[#1d2832]">Object Removal</span>
                    <span className="px-2 py-1 bg-[#e3efff] rounded-sm font-manrope text-[8px] uppercase tracking-widest text-[#1d2832]">+9 More</span>
                  </div>
                </div>
              </div>

              {/* Video Creator */}
              <div className="bg-white rounded-lg overflow-hidden flex flex-col card-hover-effect border border-[#c4c6cd]/10">
                <div className="h-64 relative overflow-hidden bg-[#333e48]">
                  <img
                    alt="Cinematic property video frame"
                    className="w-full h-full object-cover opacity-80"
                    src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-sm">
                    <span className="font-manrope text-[10px] uppercase tracking-widest text-[#1d2832]">
                      02 / Motion
                    </span>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full border border-white/50 flex items-center justify-center backdrop-blur-sm">
                      <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                    </div>
                  </div>
                </div>
                <div className="p-8 flex flex-col flex-grow">
                  <h3 className="font-serif text-3xl text-[#1d2832] mb-2">Video Creator</h3>
                  <p className="font-serif italic text-xl text-[#006c4d] mb-4">Photos → Video, Automatically</p>
                  <p className="text-sm text-[#43474c] leading-relaxed mb-8 flex-grow">
                    Upload property photos and get a cinematic video walkthrough. AI auto-sorts
                    rooms by type, stages interiors, and animates each shot.
                  </p>
                  <div className="flex items-center gap-3 pt-6 border-t border-[#c4c6cd]/10">
                    <div className="flex items-center gap-3 text-[#1d2832] opacity-80">
                      <span className="material-symbols-outlined text-sm text-[#006c4d]">movie</span>
                      <span className="font-manrope text-[10px] uppercase tracking-widest">
                        AI-Powered Pipeline
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media Kit */}
              <div className="bg-white rounded-lg overflow-hidden flex flex-col card-hover-effect border border-[#c4c6cd]/10">
                <div className="h-64 relative overflow-hidden">
                  <img
                    alt="Social media content creation"
                    className="w-full h-full object-cover"
                    src="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&q=80"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-sm">
                    <span className="font-manrope text-[10px] uppercase tracking-widest text-[#1d2832]">
                      03 / Social
                    </span>
                  </div>
                </div>
                <div className="p-8 flex flex-col flex-grow">
                  <h3 className="font-serif text-3xl text-[#1d2832] mb-2">Smart Captions &amp; Social Kit</h3>
                  <p className="font-serif italic text-xl text-[#006c4d] mb-4">Ready to Post</p>
                  <p className="text-sm text-[#43474c] leading-relaxed mb-8 flex-grow">
                    AI-generated captions for Instagram, Facebook &amp; more. Auto-resize images
                    for any platform. Go from edit to post in seconds.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-6 border-t border-[#c4c6cd]/10">
                    <span className="px-2 py-1 bg-[#e3efff] rounded-sm font-manrope text-[8px] uppercase tracking-widest text-[#1d2832]">Free Captions</span>
                    <span className="px-2 py-1 bg-[#e3efff] rounded-sm font-manrope text-[8px] uppercase tracking-widest text-[#1d2832]">Multi-Platform</span>
                    <span className="px-2 py-1 bg-[#e3efff] rounded-sm font-manrope text-[8px] uppercase tracking-widest text-[#1d2832]">Auto-Resize</span>
                  </div>
                </div>
              </div>

              {/* Floor Plans */}
              <div className="bg-white rounded-lg overflow-hidden flex flex-col card-hover-effect border border-[#c4c6cd]/10">
                <div className="h-64 relative overflow-hidden">
              <img
                alt="Modern 3D floor plan rendering with minimalist interior design"
                className="w-full h-full object-cover"
                src="/images/3d-floorplan.png"
              />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-sm">
                    <span className="font-manrope text-[10px] uppercase tracking-widest text-[#1d2832]">
                      04 / Precision
                    </span>
                  </div>
                </div>
                <div className="p-8 flex flex-col flex-grow">
                  <h3 className="font-serif text-3xl text-[#1d2832] mb-2">2D &amp; 3D Floor Plans</h3>
                  <p className="font-serif italic text-xl text-[#006c4d] mb-4">&apos;The Architectural Blueprint.&apos;</p>
                  <p className="text-sm text-[#43474c] leading-relaxed mb-8 flex-grow">
                    Precision 2D drafting and immersive 3D interior design. Millimeter-perfect accuracy.
                  </p>
                  <div className="flex gap-6 pt-6 border-t border-[#c4c6cd]/10">
                    <div className="text-[#1d2832] opacity-80">
                      <span className="block font-manrope text-[9px] uppercase tracking-tighter mb-0.5">Precision</span>
                      <span className="text-sm font-serif italic">Millimeter Perfect</span>
                    </div>
                    <div className="text-[#1d2832] opacity-80">
                      <span className="block font-manrope text-[9px] uppercase tracking-tighter mb-0.5">Immersion</span>
                      <span className="text-sm font-serif italic">360° Vision</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Listing Builder */}
              <div className="bg-white rounded-lg overflow-hidden flex flex-col card-hover-effect border border-[#c4c6cd]/10">
                <div className="h-64 relative overflow-hidden">
                  <img
                    alt="Real estate listing document on desk with property photos"
                    className="w-full h-full object-cover"
                    src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-sm">
                    <span className="font-manrope text-[10px] uppercase tracking-widest text-[#1d2832]">
                      05 / Narrative
                    </span>
                  </div>
                </div>
                <div className="p-8 flex flex-col flex-grow">
                  <h3 className="font-serif text-3xl text-[#1d2832] mb-2">AI Listing Builder</h3>
                  <p className="font-serif italic text-xl text-[#006c4d] mb-4">List in Minutes</p>
                  <p className="text-sm text-[#43474c] leading-relaxed mb-8 flex-grow">
                    Convert property data into compelling descriptions. Optimized for Zillow,
                    ImmobilienScout24, and more. English &amp; German.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-6 border-t border-[#c4c6cd]/10">
                    <span className="px-2 py-1 bg-[#e3efff] rounded-sm font-manrope text-[8px] uppercase tracking-widest text-[#1d2832]">Zillow Ready</span>
                    <span className="px-2 py-1 bg-[#e3efff] rounded-sm font-manrope text-[8px] uppercase tracking-widest text-[#1d2832]">EN / DE</span>
                    <span className="px-2 py-1 bg-[#e3efff] rounded-sm font-manrope text-[8px] uppercase tracking-widest text-[#1d2832]">SEO Optimized</span>
                  </div>
                </div>
              </div>

              {/* API Access */}
              <div className="bg-white rounded-lg overflow-hidden flex flex-col card-hover-effect border border-[#c4c6cd]/10">
                <div className="h-64 relative overflow-hidden bg-[#1d2832] flex items-center justify-center">
                  <div className="text-center">
                    <span className="material-symbols-outlined text-white/20 text-[80px]">code</span>
                  </div>
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-sm">
                    <span className="font-manrope text-[10px] uppercase tracking-widest text-[#1d2832]">
                      06 / API
                    </span>
                  </div>
                </div>
                <div className="p-8 flex flex-col flex-grow">
                  <h3 className="font-serif text-3xl text-[#1d2832] mb-2">Developer API</h3>
                  <p className="font-serif italic text-xl text-[#006c4d] mb-4">Build With Zestio</p>
                  <p className="text-sm text-[#43474c] leading-relaxed mb-8 flex-grow">
                    RESTful API for enhance, staging, and more. Generate API keys, integrate
                    into your CRM or custom workflow.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-6 border-t border-[#c4c6cd]/10">
                    <span className="px-2 py-1 bg-[#e3efff] rounded-sm font-manrope text-[8px] uppercase tracking-widest text-[#1d2832]">REST API</span>
                    <span className="px-2 py-1 bg-[#e3efff] rounded-sm font-manrope text-[8px] uppercase tracking-widest text-[#1d2832]">API Keys</span>
                    <span className="px-2 py-1 bg-[#e3efff] rounded-sm font-manrope text-[8px] uppercase tracking-widest text-[#1d2832]">Full Docs</span>
                  </div>
                </div>
              </div>

              {/* CTA Card */}
              <div className="bg-[#1d2832] flex flex-col justify-center items-center p-8 rounded-lg text-center card-hover-effect">
                <h3 className="font-serif text-3xl text-white mb-6">Ready to Start?</h3>
                <p className="text-sm text-white/70 mb-8 max-w-[200px]">
                  Free credits included. No credit card needed.
                </p>
                <Link
                  href={ctaHref}
                  className="bg-white text-[#1d2832] px-8 py-3 rounded font-manrope uppercase tracking-widest text-xs hover:bg-[#86f8c8] transition-all"
                >
                  {ctaText}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-12 py-32 text-center max-w-4xl mx-auto">
          <h2 className="font-serif text-5xl md:text-6xl text-[#1d2832] mb-6 leading-tight">
            Your listings deserve better.
            <br />
            Start for free.
          </h2>
          <p className="text-lg text-[#43474c] mb-10 max-w-2xl mx-auto font-light leading-relaxed">
            Join real estate professionals using AI to create stunning property media in minutes, not hours.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <Link
              href={ctaHref}
              className="w-full md:w-auto bg-[#1d2832] text-white px-10 py-4 rounded font-manrope uppercase tracking-widest text-xs hover:bg-[#333e48] transition-all"
            >
              {isLoggedIn ? 'Go to Dashboard' : 'Create Your Account'}
            </Link>
            <Link
              href="/pricing"
              className="w-full md:w-auto border border-[#1d2832]/20 text-[#1d2832] px-10 py-4 rounded font-manrope uppercase tracking-widest text-xs hover:bg-[#edf4ff] transition-all"
            >
              View Pricing
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#edf4ff] border-t border-[#c4c6cd]/15">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 px-8 md:px-20 py-16">
          <div className="space-y-6">
            <div className="text-xl font-serif italic text-[#1d2832]">Zestio</div>
            <p className="font-manrope text-xs uppercase tracking-widest text-[#1d2832]/60 leading-relaxed">
              AI-Powered Real Estate Media.
              <br />
              Enhance, stage, animate, list — all from one platform.
            </p>
          </div>
          <div className="space-y-6">
            <h5 className="font-manrope text-xs uppercase tracking-[0.2em] font-bold text-[#1d2832]">Navigation</h5>
            <ul className="space-y-3">
              <li><Link href="/studio" className="font-manrope text-xs uppercase tracking-widest text-[#1d2832]/60 hover:text-[#006c4d] transition-colors">Image Studio</Link></li>
              <li><Link href="/video" className="font-manrope text-xs uppercase tracking-widest text-[#1d2832]/60 hover:text-[#006c4d] transition-colors">Video Creator</Link></li>
              <li><Link href="/pricing" className="font-manrope text-xs uppercase tracking-widest text-[#1d2832]/60 hover:text-[#006c4d] transition-colors">Pricing</Link></li>
              <li><Link href="/docs" className="font-manrope text-xs uppercase tracking-widest text-[#1d2832]/60 hover:text-[#006c4d] transition-colors">API Docs</Link></li>
            </ul>
          </div>
          <div className="space-y-6">
            <h5 className="font-manrope text-xs uppercase tracking-[0.2em] font-bold text-[#1d2832]">Connect</h5>
            <ul className="space-y-3">
              <li><Link href="https://twitter.com/zestio" target="_blank" className="font-manrope text-xs uppercase tracking-widest text-[#1d2832]/60 hover:text-[#006c4d] transition-colors">Twitter</Link></li>
              <li><Link href="https://linkedin.com/company/zestio" target="_blank" className="font-manrope text-xs uppercase tracking-widest text-[#1d2832]/60 hover:text-[#006c4d] transition-colors">LinkedIn</Link></li>
              <li><Link href="mailto:hello@zestio.ai" className="font-manrope text-xs uppercase tracking-widest text-[#1d2832]/60 hover:text-[#006c4d] transition-colors">Contact Us</Link></li>
            </ul>
          </div>
          <div className="space-y-6">
            <h5 className="font-manrope text-xs uppercase tracking-[0.2em] font-bold text-[#1d2832]">Legal</h5>
            <ul className="space-y-3">
              <li><Link href="/privacy" className="font-manrope text-xs uppercase tracking-widest text-[#1d2832]/60 hover:text-[#006c4d] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="font-manrope text-xs uppercase tracking-widest text-[#1d2832]/60 hover:text-[#006c4d] transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="px-8 md:px-20 py-8 border-t border-[#c4c6cd]/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-manrope text-[9px] uppercase tracking-[0.2em] text-[#1d2832]/40">
            © 2026 Zestio. AI-Powered Real Estate Media. All rights reserved.
          </p>
          <div className="flex gap-4">
            <span className="text-[#006c4d] font-bold text-[9px] uppercase tracking-widest">Powered by AI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
