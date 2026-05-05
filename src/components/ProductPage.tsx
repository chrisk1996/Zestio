import Link from 'next/link';
import { Header } from '@/components/Header';

interface ProductPageProps {
  badge: string;
  title: string;
  subtitle: string;
  heroDescription: string;
  heroImage: string;
  heroImageAlt: string;
  features: { icon: string; title: string; description: string }[];
  examples: { title: string; description: string }[];
  ctaHref: string;
  ctaLabel: string;
  creditCost?: string;
  children?: React.ReactNode;
}

export function ProductPage({
  badge, title, subtitle, heroDescription, heroImage, heroImageAlt,
  features, examples, ctaHref, ctaLabel, creditCost, children,
}: ProductPageProps) {
  return (
    <div className="min-h-screen bg-[#f7f9ff]">
      <Header />
      <main>

        {/* Hero */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-3 py-1 bg-[#e3efff] rounded-sm font-manrope text-[10px] uppercase tracking-widest text-[#1d2832] mb-4">
                {badge}
              </span>
              <h1 className="font-serif text-5xl text-[#1d2832] mb-4">{title}</h1>
              <p className="font-serif italic text-2xl text-[#006c4d] mb-6">{subtitle}</p>
              <p className="text-[#43474c] leading-relaxed mb-8 max-w-lg">{heroDescription}</p>
              <div className="flex items-center gap-4">
                <Link
                  href={ctaHref}
                  className="bg-[#006c4d] text-white px-8 py-3 rounded font-manrope uppercase tracking-widest text-xs hover:opacity-90 transition-all"
                >
                  {ctaLabel}
                </Link>
                {creditCost && (
                  <span className="font-manrope text-sm text-[#43474c]">
                    From <span className="text-[#006c4d] font-medium">{creditCost}</span>
                  </span>
                )}
              </div>
            </div>
            <div className="relative">
              <img
                alt={heroImageAlt}
                className="w-full rounded-xl shadow-lg object-cover"
                src={heroImage}
              />
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-serif text-3xl text-[#1d2832] mb-12 text-center">What You Can Do</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#edf4ff] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[#006c4d]">{feature.icon}</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-[#1d2832] mb-1">{feature.title}</h3>
                    <p className="text-sm text-[#43474c]">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Extra content (pipeline, how-it-works, etc.) */}
        {children}

        {/* Examples */}
        {examples.length > 0 && (
          <section className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="font-serif text-3xl text-[#1d2832] mb-12 text-center">Use Cases</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {examples.map((example, i) => (
                  <div key={i} className="bg-white rounded-lg border border-[#c4c6cd]/20 p-6">
                    <h3 className="font-medium text-[#1d2832] mb-2">{example.title}</h3>
                    <p className="text-sm text-[#43474c]">{example.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Bottom CTA */}
        <section className="bg-[#1d2832] py-16">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="font-serif text-3xl text-white mb-4">Ready to try {title}?</h2>
            <p className="text-white/70 mb-8">
              Free credits included. No credit card needed.
            </p>
            <Link
              href={ctaHref}
              className="bg-white text-[#1d2832] px-8 py-3 rounded font-manrope uppercase tracking-widest text-xs hover:bg-[#86f8c8] transition-all"
            >
              Get Started Free
            </Link>
          </div>
        </section>

      </main>
    </div>
  );
}
