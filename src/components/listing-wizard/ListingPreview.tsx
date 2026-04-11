'use client';

import type { ListingData } from './ListingWizard';

interface ListingPreviewProps {
  data: ListingData;
}

export function ListingPreview({ data }: ListingPreviewProps) {
  const formatPrice = () => {
    if (data.transaction_type === 'rent') {
      const warmRent = data.warm_rent || data.cold_rent || 0;
      return {
        main: warmRent > 0 ? `€${warmRent.toLocaleString()}` : '€0',
        period: '/Monat'
      };
    }
    return {
      main: data.price > 0 ? `€${data.price.toLocaleString()}` : '€0',
      period: ''
    };
  };

  const activeFeatures = Object.entries(data.features)
    .filter(([, v]) => v)
    .map(([k]) => k);

  const price = formatPrice();
  const hasImages = data.media_ids && data.media_ids.length > 0;

  const titlePreview = data.title || (
    data.rooms && data.living_area
      ? `${data.rooms}-Zimmer ${data.property_type === 'apartment' ? 'Wohnung' : 'Haus'}`
      : 'Property Name'
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#006c4d] animate-pulse" />
          <span className="text-[10px] uppercase tracking-widest text-[#006c4d] font-bold">
            Live Portal Preview
          </span>
        </div>
        <div className="flex gap-2">
          <button className="p-2 bg-white rounded shadow-sm hover:bg-slate-50 transition-colors">
            <span className="material-symbols-outlined text-sm text-[#1d2832]">laptop</span>
          </button>
          <button className="p-2 bg-white rounded shadow-sm opacity-50">
            <span className="material-symbols-outlined text-sm text-[#1d2832]">smartphone</span>
          </button>
        </div>
      </div>

      {/* Preview Canvas */}
      <div className="flex-1 bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col border border-slate-200/50">
        
        {/* Hero Section */}
        <div className="relative h-64 w-full bg-gradient-to-br from-slate-100 to-slate-200">
          {hasImages ? (
            <img 
              src={data.media_ids[0]} 
              alt="Property" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-slate-400">
                <span className="material-symbols-outlined text-5xl">home</span>
                <p className="text-xs mt-2">Upload photos to preview</p>
              </div>
            </div>
          )}
          
          {/* Price Glass Panel */}
          <div className="absolute top-6 right-6 glass-panel px-4 py-2 rounded-sm">
            <span className="font-serif font-bold text-lg text-[#1d2832]">
              {price.main}
            </span>
            <span className="text-sm text-slate-600">{price.period}</span>
          </div>

          {/* Gradient Overlay */}
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/60 to-transparent" />
          
          {/* Status + Title */}
          <div className="absolute bottom-4 left-6">
            <span className="text-white/80 text-[10px] uppercase tracking-widest block mb-1">
              {data.transaction_type === 'rent' ? 'Miete' : 'Kauf'}
            </span>
            <h2 className="text-white font-serif text-2xl">{titlePreview}</h2>
          </div>
        </div>

        {/* Editorial Content Grid */}
        <div className="p-8 space-y-8 overflow-y-auto">
          
          {/* Key Facts Row */}
          <div className="flex justify-between border-b border-slate-200/50 pb-4">
            <div className="text-center">
              <span className="block font-serif text-xl text-[#1d2832]">{data.rooms || '—'}</span>
              <span className="block text-[10px] uppercase tracking-tight text-[#43474c]">Zimmer</span>
            </div>
            <div className="text-center">
              <span className="block font-serif text-xl text-[#1d2832]">{data.living_area || '—'}</span>
              <span className="block text-[10px] uppercase tracking-tight text-[#43474c]">m²</span>
            </div>
            <div className="text-center">
              <span className="block font-serif text-xl text-[#1d2832]">{data.bedrooms || '—'}</span>
              <span className="block text-[10px] uppercase tracking-tight text-[#43474c]">Schlafz.</span>
            </div>
            <div className="text-center">
              <span className="block font-serif text-xl text-[#1d2832]">{data.bathrooms || '—'}</span>
              <span className="block text-[10px] uppercase tracking-tight text-[#43474c]">Bad</span>
            </div>
          </div>

          {/* Asymmetric Layout: Title + Description */}
          {data.description && (
            <div className="flex gap-8 items-start">
              <div className="w-1/3">
                <h3 className="font-serif text-xl text-[#1d2832] leading-snug">
                  {data.city || 'Ihr neues Zuhause'}
                </h3>
              </div>
              <div className="w-2/3">
                <p className="text-xs text-[#43474c] leading-relaxed line-clamp-3">
                  {data.description}
                </p>
              </div>
            </div>
          )}

          {/* Photo Bento Grid */}
          {hasImages && data.media_ids.length > 1 && (
            <div className="grid grid-cols-2 gap-4 h-48">
              <div className="bg-slate-100 rounded overflow-hidden">
                <img src={data.media_ids[1]} alt="Interior" className="w-full h-full object-cover" />
              </div>
              <div className="grid grid-rows-2 gap-4">
                <div className="bg-slate-100 rounded overflow-hidden">
                  {data.media_ids[2] && (
                    <img src={data.media_ids[2]} alt="Detail" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="bg-slate-100 rounded overflow-hidden flex items-center justify-center relative">
                  {data.media_ids.length > 3 && (
                    <>
                      <img 
                        src={data.media_ids[3]} 
                        alt="More" 
                        className="w-full h-full object-cover opacity-40 blur-[2px]"
                      />
                      <span className="absolute inset-0 flex items-center justify-center font-label text-xs font-bold text-[#1d2832]">
                        +{data.media_ids.length - 3} Photos
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Feature Badges */}
          {activeFeatures.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-4">
              {activeFeatures.slice(0, 4).map((feature) => (
                <span 
                  key={feature}
                  className="px-3 py-1 bg-[#006c4d]/10 text-[#006c4d] text-[10px] font-bold uppercase tracking-wider rounded-full"
                >
                  {feature.replace(/_/g, ' ')}
                </span>
              ))}
              {activeFeatures.length > 4 && (
                <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider rounded-full">
                  +{activeFeatures.length - 4}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CSS for glass-panel */}
      <style jsx>{`
        .glass-panel {
          background: rgba(247, 249, 255, 0.7);
          backdrop-filter: blur(12px);
        }
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24;
        }
      `}</style>
    </div>
  );
}
