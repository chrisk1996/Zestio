'use client';

import { ListingFeatures } from '@/types/listing';

interface ListingData {
  id?: string;
  transaction_type: 'sale' | 'rent';
  property_type: 'apartment' | 'house' | 'commercial' | 'land' | 'garage' | 'other';
  title: string;
  description: string;
  street: string;
  house_number: string;
  postal_code: string;
  city: string;
  district: string;
  country: string;
  price: number;
  living_area: number;
  plot_area: number;
  rooms: number;
  bedrooms: number;
  bathrooms: number;
  floor: number;
  total_floors: number;
  construction_year: number;
  energy_rating: string;
  heating_type: string;
  features: ListingFeatures;
  media_ids: string[];
  cover_image_id?: string;
}

interface ListingPreviewPanelProps {
  data: ListingData;
  onPublish: () => void;
}

const MOCK_IMAGES = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCtqRBE6U_H8gsMLvCBoDPkbpee0F0-ITXW_Ti_jaeK9aY1tAkvsBmNqaAXjjKmG0bB16IZWWv95CuR_vREs6IbjGvCT8aMtHcskI1heXpQqiKxYP1KTusxwAkO4i5utY9P_0pjfXf8SffiaQKgPQepwagTeixpVj-HeyTPEDDqpGwteDeC7-Bft6t9KonQgpleMSR9srYQUFl1HVczIXfHkn3vm9hIfGtw8n_UIWspcWDTW2b5sXEwe6O5LiDFYdyhNOm8CI9A74g',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuD4QFwfPzTudhKpuJz6iVs7nqMzGrI3FudLPR7GkNf96v_u7A7f8Zl_DH2A4trEKZwRXWMA1hhvPMCT5h2I6dEmeOH-CpGVYOfA5yh1CfveqXVmZTYUohVRE4UqqkJvqcRlIWew9OHjWfoPwuKw_CCy9653YLuDhJ3DFkzEePEN0ftNqiiHfDH35ggClnGexQ9YCHbk7i7_BvYkwKVK3Yel_uAEFCuyQqqPoLUySlcFFh25ksctQOpCSb8t_X260TT8Li-RVX5CDLY',
];

export function ListingPreviewPanel({ data, onPublish }: ListingPreviewPanelProps) {
  const formatPrice = (price: number) => {
    if (!price) return '€ --';
    return `€ ${(price / 100).toLocaleString()}`;
  };

  const previewTitle = data.title || 'Architectural Sanctuary';
  const previewLocation = data.city || 'Silver Lake, Los Angeles';
  const previewPrice = formatPrice(data.price);
  const previewDescription = data.description || 'Nestled in the heart of the historic district, this architectural masterpiece blends mid-century modern aesthetics with cutting-edge smart home technology...';
  const truncatedDescription = previewDescription.length > 150 
    ? previewDescription.slice(0, 150) + '...' 
    : previewDescription;

  return (
    <div className="sticky top-24">
      <div className="flex items-center gap-3 mb-6">
        <span className="w-2.5 h-2.5 bg-red-400 rounded-full animate-pulse"></span>
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
          Live Preview — Mobile View
        </span>
      </div>

      {/* Phone Mockup Container */}
      <div className="mx-auto w-[320px] h-[640px] bg-white rounded-[2.5rem] shadow-2xl border-[10px] border-primary-container overflow-hidden relative">
        <div className="h-full overflow-y-auto preview-scroll pb-20">
          {/* Property Hero */}
          <div className="h-52 relative">
            <img
              alt="preview exterior"
              className="w-full h-full object-cover"
              src={MOCK_IMAGES[0]}
            />
            <div className="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded-sm shadow-sm text-[10px] font-bold text-primary uppercase tracking-wider">
              {data.transaction_type === 'sale' ? 'For Sale' : 'For Rent'}
            </div>
            <div className="absolute top-4 right-4 bg-white/95 px-3 py-1 rounded-sm shadow-sm text-xs font-bold text-secondary">
              {previewPrice}
            </div>
          </div>

          {/* Property Info */}
          <div className="p-6">
            <h4 className="font-headline text-2xl font-bold leading-tight mb-2 italic">
              {previewTitle}
            </h4>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-4">
              {previewLocation}
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2 mb-6 border-y border-outline-variant/15 py-4">
              <div className="text-center">
                <p className="text-sm font-bold text-primary">{data.rooms || 5}</p>
                <p className="text-[8px] uppercase tracking-widest text-on-surface-variant font-bold">Rooms</p>
              </div>
              <div className="text-center border-x border-outline-variant/15">
                <p className="text-sm font-bold text-primary">{data.living_area || 185}</p>
                <p className="text-[8px] uppercase tracking-widest text-on-surface-variant font-bold">Sqm</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-primary">{data.energy_rating || 'A+'}</p>
                <p className="text-[8px] uppercase tracking-widest text-on-surface-variant font-bold">Energy</p>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-on-surface-variant font-medium">
              {truncatedDescription}
            </p>
          </div>

          {/* Platform-specific CTA */}
          <div className="px-6 mt-2">
            <button className="w-full bg-primary text-white text-center py-3.5 text-xs font-bold uppercase tracking-widest rounded-sm">
              Contact Agent
            </button>
          </div>
        </div>
      </div>

      {/* Final Action Card */}
      <div className="mt-8 bg-surface-container p-6 border border-outline-variant/10 rounded-sm">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
            Est. Reach: 24.5k Buyers
          </span>
          <span className="material-symbols-outlined text-secondary text-sm">trending_up</span>
        </div>
        <button
          onClick={onPublish}
          className="w-full bg-secondary text-on-secondary py-4 text-sm font-bold tracking-widest uppercase shadow-lg hover:bg-secondary/90 transition-all flex items-center justify-center gap-3"
        >
          <span className="material-symbols-outlined text-lg">rocket_launch</span>
          Publish Listing
        </button>
      </div>

      <style jsx>{`
        .preview-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .preview-scroll::-webkit-scrollbar-thumb {
          background: #bcc8d5;
          border-radius: 2px;
        }
      `}</style>
    </div>
  );
}
