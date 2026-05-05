import { ProductPage } from '@/components/ProductPage';
import Link from 'next/link';

export const metadata = {
  title: 'Video Creator - AI Property Videos | Zestio',
  description: 'Turn property photos into cinematic videos with AI voiceover, music, and effects. Upload images, get a video in minutes.',
};

export default function VideoProductPage() {
  return (
    <ProductPage
      badge="02 / Motion"
      title="Video Creator"
      subtitle="Photos → Video, Automatically"
      heroDescription="Upload property photos and get a cinematic video walkthrough. AI auto-sorts rooms, generates voiceover narration, applies twilight effects, and animates each shot into a professional video."
      heroImage="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80"
      heroImageAlt="Cinematic property video frame"
      ctaHref="/auth"
      ctaLabel="Start for Free"
      creditCost="5 credits per video"
    >
      {/* Pipeline visualization */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl text-[#1d2832] mb-12 text-center">How It Works</h2>
          <div className="flex flex-col md:flex-row items-center gap-4">
            {[
              { step: '1', label: 'Upload', desc: 'Add photos or paste a listing URL' },
              { step: '2', label: 'Sort', desc: 'AI classifies rooms by type' },
              { step: '3', label: 'Script', desc: 'Auto-generate voiceover narration' },
              { step: '4', label: 'Enhance', desc: 'Twilight, upscale, renovate' },
              { step: '5', label: 'Animate', desc: 'Each image becomes a video clip' },
              { step: '6', label: 'Finalize', desc: 'Stitch with music & watermark' },
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center text-center flex-1">
                <div className="w-10 h-10 rounded-full bg-[#006c4d] text-white flex items-center justify-center font-manrope text-sm font-bold mb-2">
                  {s.step}
                </div>
                <span className="font-medium text-[#1d2832] text-sm">{s.label}</span>
                <span className="text-xs text-[#43474c] mt-1">{s.desc}</span>
                {i < 5 && (
                  <span className="hidden md:block material-symbols-outlined text-[#c4c6cd] text-xl mt-1">arrow_forward</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl text-[#1d2832] mb-12 text-center">Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: 'record_voice_over', title: 'AI Voiceover', description: 'Auto-generated narration from listing data, or write your own script. Mixed with background music.' },
              { icon: 'music_note', title: 'Background Music', description: 'Choose from 7 music genres: cinematic, upbeat, ambient, and more.' },
              { icon: 'nightlight', title: 'Twilight Effects', description: 'Exterior shots automatically enhanced with golden-hour and twilight atmosphere.' },
              { icon: 'auto_fix_high', title: 'Virtual Renovation', description: 'Apply 8 renovation styles to interior shots: modern, luxury, minimalist, and more.' },
              { icon: 'image', title: 'Image Normalization', description: 'All images automatically normalized to 16:9 for consistent video output.' },
              { icon: 'link', title: 'URL or Upload', description: 'Paste a listing URL to auto-scrape images, or upload your own.' },
            ].map((feature, i) => (
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
    </ProductPage>
  );
}
