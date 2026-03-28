'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout';

const distributionPlatforms = [
  { id: 'zillow', name: 'Zillow', logo: 'Z', active: true },
  { id: 'rightmove', name: 'Rightmove', logo: 'R', active: true },
  { id: 'immobiliare', name: 'Immobiliare', logo: 'I', active: false },
  { id: 'immoscout', name: 'ImmoScout24', logo: 'IS', active: false },
];

export default function ListingPage() {
  const [address, setAddress] = useState('');
  const [price, setPrice] = useState('');
  const [features, setFeatures] = useState('');
  const [generatedCopy, setGeneratedCopy] = useState(`Nestled in the heart of the historic district, this architectural masterpiece blends mid-century modern aesthetics with cutting-edge smart home technology. The expansive open-concept living area flows seamlessly onto a sun-drenched private terrace, perfect for high-end entertaining. Features include a chef-inspired kitchen with premium finishes, a bespoke home cinema, and a tranquil infinity pool overlooking the valley.`);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedImages, setSelectedImages] = useState<number[]>([0, 1]);
  const [platforms, setPlatforms] = useState(distributionPlatforms);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setGeneratedCopy(`Stunning ${features || 'luxury property'} located at ${address || 'a prime location'}. Listed at ${price || 'market price'}, this exceptional residence offers unparalleled craftsmanship and modern amenities. Perfect for discerning buyers seeking privacy, elegance, and convenience.`);
      setIsGenerating(false);
    }, 2000);
  };

  const togglePlatform = (id: string) => {
    setPlatforms(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));
  };

  const mockImages = [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&q=80',
    'https://images.unsplash.com/photo-1600566753086-00f18fb78b95?w=400&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0b?w=400&q=80',
  ];

  return (
    <AppLayout title="Listing Builder">
      <div className="max-w-[1600px] mx-auto p-12">
        {/* Header */}
        <header className="mb-16">
          <span className="text-emerald-600 font-bold tracking-widest uppercase text-xs mb-2 block">Campaign Creator</span>
          <h1 className="font-['Newsreader'] text-5xl text-slate-900 font-bold tracking-tighter leading-none mb-4">Listing Builder</h1>
          <p className="max-w-xl text-slate-600 leading-relaxed">
            Transform your visual assets into high-converting market listings using AI-driven copywriting and multi-platform distribution.
          </p>
        </header>

        <div className="grid grid-cols-12 gap-10">
          {/* Left Column - Inputs */}
          <div className="col-span-12 lg:col-span-7 space-y-12">
            {/* Narrative Engine */}
            <section className="bg-white p-8 shadow-sm rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-['Newsreader'] text-2xl font-bold text-slate-900 italic">Narrative Engine</h3>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="flex items-center gap-2 text-emerald-600 font-bold text-sm hover:opacity-70 transition-all disabled:opacity-50"
                >
                  <span className="material-symbols-outlined">bolt</span>
                  {isGenerating ? 'Generating...' : 'Generate Description'}
                </button>
              </div>

              <div className="space-y-8">
                <div className="group">
                  <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Property Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 742 Evergreen Terrace, Springfield"
                    className="w-full bg-transparent border-b border-slate-200 py-2 font-medium text-slate-900 placeholder:text-slate-400 transition-colors focus:border-emerald-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="group">
                    <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Price Point</label>
                    <input
                      type="text"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="$ 1,250,000"
                      className="w-full bg-transparent border-b border-slate-200 py-2 font-medium text-slate-900 placeholder:text-slate-400 transition-colors focus:border-emerald-600"
                    />
                  </div>
                  <div className="group">
                    <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Key Features</label>
                    <input
                      type="text"
                      value={features}
                      onChange={(e) => setFeatures(e.target.value)}
                      placeholder="Pool, Smart Home, Terrace"
                      className="w-full bg-transparent border-b border-slate-200 py-2 font-medium text-slate-900 placeholder:text-slate-400 transition-colors focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Generated Copy</label>
                  <textarea
                    value={generatedCopy}
                    onChange={(e) => setGeneratedCopy(e.target.value)}
                    rows={6}
                    className="w-full bg-slate-50 border-none p-4 font-['Inter'] leading-relaxed text-slate-700 focus:ring-1 focus:ring-emerald-600/20 rounded-xl"
                  />
                </div>
              </div>
            </section>

            {/* Media Curation */}
            <section className="bg-slate-50 p-8 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-['Newsreader'] text-2xl font-bold text-slate-900 italic">Media Curation</h3>
                <span className="text-xs font-bold text-slate-500">{selectedImages.length} Assets Selected</span>
              </div>

              <div className="grid grid-cols-4 gap-4">
                {mockImages.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedImages(prev =>
                        prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
                      );
                    }}
                    className={`aspect-square bg-white relative overflow-hidden rounded-xl cursor-pointer group border-2 transition-all ${
                      selectedImages.includes(idx)
                        ? 'border-emerald-600 ring-2 ring-emerald-600/20'
                        : 'border-transparent hover:border-slate-300'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Property ${idx + 1}`}
                      className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${
                        !selectedImages.includes(idx) ? 'opacity-50' : ''
                      }`}
                    />
                    <div className="absolute inset-0 bg-emerald-600/0 group-hover:bg-emerald-600/10 transition-colors flex items-center justify-center">
                      {selectedImages.includes(idx) && (
                        <span className="material-symbols-outlined text-white text-2xl drop-shadow-lg">check_circle</span>
                      )}
                    </div>
                  </div>
                ))}
                <div className="aspect-square border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-2 hover:bg-white/50 transition-colors cursor-pointer rounded-xl">
                  <span className="material-symbols-outlined text-slate-400">cloud_upload</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Browse Library</span>
                </div>
              </div>
            </section>

            {/* Distribution Channels */}
            <section>
              <h3 className="font-['Newsreader'] text-2xl font-bold text-slate-900 italic mb-6">Distribution Channels</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {platforms.map((platform) => (
                  <div
                    key={platform.id}
                    onClick={() => togglePlatform(platform.id)}
                    className={`bg-white p-6 border flex flex-col items-center text-center gap-4 cursor-pointer transition-all ${
                      platform.active
                        ? 'border-emerald-600 shadow-lg'
                        : 'border-slate-200 hover:shadow-md'
                    }`}
                  >
                    <span className="w-12 h-12 flex items-center justify-center bg-slate-100 rounded-full font-['Newsreader'] font-bold text-slate-900 text-lg italic">
                      {platform.logo}
                    </span>
                    <span className="font-bold text-sm">{platform.name}</span>
                    <input
                      type="checkbox"
                      checked={platform.active}
                      onChange={() => {}}
                      className="text-emerald-600 focus:ring-emerald-600 rounded-sm"
                    />
                  </div>
                ))}
                <div className="bg-white p-6 border border-slate-200 flex flex-col items-center text-center gap-4 opacity-50 hover:opacity-100 cursor-pointer transition-all">
                  <span className="material-symbols-outlined text-4xl text-slate-400">add_circle</span>
                  <span className="font-bold text-sm">Add More</span>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column - Live Preview */}
          <div className="col-span-12 lg:col-span-5">
            <div className="sticky top-24">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-3 h-3 bg-red-400 rounded-full animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Live Preview — Mobile View</span>
              </div>

              {/* Phone Mockup */}
              <div className="mx-auto w-[320px] h-[640px] bg-white rounded-[2.5rem] shadow-2xl border-[8px] border-slate-900 overflow-hidden relative">
                <div className="h-full overflow-y-auto pb-20">
                  {/* Property Hero */}
                  <div className="h-48 relative">
                    <img
                      src={mockImages[0]}
                      alt="Property"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded-full shadow-sm text-xs font-bold text-emerald-600">
                      {price || '$ 1.25M'}
                    </div>
                  </div>

                  {/* Property Info */}
                  <div className="p-6">
                    <h4 className="font-['Newsreader'] text-2xl font-bold leading-tight mb-2">Architectural Sanctuary</h4>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-4">
                      {address || 'Silver Lake, Los Angeles'}
                    </p>

                    <div className="flex gap-4 mb-6 border-y border-slate-100 py-3">
                      <div className="text-center">
                        <p className="text-xs font-bold">4</p>
                        <p className="text-[8px] uppercase tracking-tighter text-slate-500">Beds</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-bold">3.5</p>
                        <p className="text-[8px] uppercase tracking-tighter text-slate-500">Baths</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-bold">3,200</p>
                        <p className="text-[8px] uppercase tracking-tighter text-slate-500">Sqft</p>
                      </div>
                    </div>

                    <p className="text-xs leading-relaxed text-slate-600">
                      {generatedCopy.slice(0, 200)}...
                    </p>
                  </div>

                  {/* CTA */}
                  <div className="px-6 mt-4">
                    <div className="bg-slate-900 text-white text-center py-3 text-sm font-bold rounded-lg">
                      Contact Agent
                    </div>
                  </div>
                </div>
              </div>

              {/* Publish Button */}
              <div className="mt-12 bg-slate-100 p-8 flex flex-col items-center gap-6 rounded-2xl border border-slate-200">
                <p className="text-center text-sm font-medium text-slate-600">Ready to broadcast your property to the world?</p>
                <button className="w-full bg-emerald-600 text-white py-5 text-lg font-bold tracking-tight shadow-xl hover:translate-y-[-2px] transition-all flex items-center justify-center gap-3 rounded-xl hover:bg-emerald-700">
                  <span className="material-symbols-outlined">rocket_launch</span>
                  Publish Listing
                </button>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">Est. Reach: 24,500 active buyers</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
