'use client';

import { useState, useEffect } from 'react';
import { ListingFeatures, ENERGY_RATINGS } from '@/types/listing';

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
  latitude?: number;
  longitude?: number;
  price: number;
  cold_rent?: number;
  warm_rent?: number;
  additional_costs?: number;
  deposit?: number;
  hoa_fees?: number;
  min_rental_period?: number;
  living_area: number;
  plot_area: number;
  rooms: number;
  bedrooms: number;
  bathrooms: number;
  floor: number;
  total_floors: number;
  construction_year: number;
  last_renovation_year?: number;
  building_type?: string;
  condition?: string;
  energy_rating: string;
  heating_type: string;
  availability_date?: string;
  is_immediately_available?: boolean;
  contact_phone?: string;
  contact_email?: string;
  features: ListingFeatures;
  media_ids: string[];
  cover_image_id?: string;
  proximity_data?: Record<string, unknown>;
}

interface ListingFormPanelProps {
  data: ListingData;
  updateData: (data: Partial<ListingData>) => void;
  isSaving: boolean;
}

const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'House' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'land', label: 'Land' },
];

const HEATING_TYPES = ['Heat Pump', 'Gas', 'Oil', 'Solar', 'Fernwärme', 'Electric'];

const MOCK_IMAGES = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuD4QFwfPzTudhKpuJz6iVs7nqMzGrI3FudLPR7GkNf96v_u7A7f8Zl_DH2A4trEKZwRXWMA1hhvPMCT5h2I6dEmeOH-CpGVYOfA5yh1CfveqXVmZTYUohVRE4UqqkJvqcRlIWew9OHjWfoPwuKw_CCy9653YLuDhJ3DFkzEePEN0ftNqiiHfDH35ggClnGexQ9YCHbk7i7_BvYkwKVK3Yel_uAEFCuyQqqPoLUySlcFFh25ksctQOpCSb8t_X260TT8Li-RVX5CDLY',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBEDdR1e26EsE83DkHPcDHMCLMN5mL7d1oyddP7eBpHBub3UEra4h81lLMhnIMyXFp7ySsmRPsO6Wa8t_FQcpvWq5iePB1yyBvxFoT7LbhRZknFCeVl1JYt3J3eKO5i0egE4DofaTcCJaMM7gx8yxt9JR-mrIfRPzispyNclgj1ZutWeT7ddRzZY6L0-nBMKYDoQ-j3Wy7ujvOg1H_k6YOL0ng_yyDJls1FbaK2UhP3JTrjrOAqhNIkP3WzUEdST2jYYFi_cTEuzGI',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDfne_Uo3_o-1NcyF9akKlC1nLM2QQfDhsvuuXTnoTosa_VLurFjRklakGw4wPkwEqPEZQKIqU1dIc1uVdbRVF_bK96R90ZO22use6boig7UJ4C-FdmPzUYSGmL075-SClwZiyjNuHP7XjiEubpqLwGDrjoCsSo2CilYg6vGnbJNJJjzTBm5netmGXJeaIiZhdhY6HY15SOh2FbDAHVXoYeNJODtNnSL5e-k0x-UZurXe4RfVVKfeEbZrLwVRbRwVJeAQcr0QXAoMk',
];

export function ListingFormPanel({ data, updateData, isSaving }: ListingFormPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedImages, setSelectedImages] = useState<number[]>([0]);
  const [wordCount, setWordCount] = useState(0);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const showRentalFields = data.transaction_type === 'rent';

  useEffect(() => {
    const words = data.description.trim().split(/\s+/).filter(w => w.length > 0).length;
    setWordCount(words);
  }, [data.description]);

  const generateDescription = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_type: data.property_type,
          transaction_type: data.transaction_type,
          city: data.city,
          rooms: data.rooms,
          bedrooms: data.bedrooms,
          living_area: data.living_area,
          features: data.features,
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        updateData({ 
          title: result.title || data.title,
          description: result.description || data.description 
        });
      } else {
        const propertyTypeLabel = data.property_type === 'apartment' ? 'Apartment' : 
                                   data.property_type === 'house' ? 'House' : 'Property';
        const generatedTitle = `${propertyTypeLabel} in ${data.city || 'Prime Location'}`;
        const generatedDescription = `Nestled in the heart of ${data.city || 'the historic district'}, this architectural masterpiece blends mid-century modern aesthetics with cutting-edge smart home technology. The expansive open-concept living area flows seamlessly onto a sun-drenched private terrace, perfect for high-end entertaining. Key features include: Chef-inspired kitchen with premium finishes, ${data.rooms || 5} spacious rooms, ${data.living_area || 185} sqm of refined living space, Energy efficiency rating: ${data.energy_rating || 'A+'}.`;
        updateData({ title: generatedTitle, description: generatedDescription });
      }
    } catch (error) {
      console.error('Error generating description:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleImage = (idx: number) => {
    setSelectedImages(prev => 
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const geocodeLocation = async () => {
    if (!data.city) return;
    setIsGeocoding(true);
    try {
      const res = await fetch('/api/listings/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ street: data.street, house_number: data.house_number, postal_code: data.postal_code, city: data.city, country: data.country || 'Germany' }),
      });
      if (res.ok) {
        const r = await res.json();
        updateData({ latitude: r.latitude, longitude: r.longitude, proximity_data: r.proximity_data });
      }
    } catch (e) { console.error('Geocoding error:', e); }
    finally { setIsGeocoding(false); }
  };

  useEffect(() => {
    if (data.city && data.city.length > 2 && !data.latitude) {
      const t = setTimeout(geocodeLocation, 2000);
      return () => clearTimeout(t);
    }
  }, [data.city, data.street, data.postal_code]);

  return (
    <div className="space-y-6">
      {/* Basic Details & Location Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Details */}
        <section className="bg-surface-container-lowest p-6 shadow-sm border border-outline-variant/10">
          <h3 className="font-headline text-xl font-bold text-primary italic mb-6">Basic Details</h3>
          <div className="space-y-4">
            <div className="group">
              <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Listing Title</label>
              <input
                type="text"
                value={data.title}
                onChange={e => updateData({ title: e.target.value })}
                placeholder="e.g. Modern Hillside Sanctuary"
                className="w-full bg-transparent border-b border-outline-variant/40 py-1.5 font-medium text-primary placeholder:text-outline-variant/60"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="group">
                <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Property Type</label>
                <select
                  value={data.property_type}
                  onChange={e => updateData({ property_type: e.target.value as ListingData['property_type'] })}
                  className="w-full bg-transparent border-b border-outline-variant/40 py-1.5 font-medium text-primary cursor-pointer text-sm"
                >
                  {PROPERTY_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div className="group">
                <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Year Built</label>
                <input
                  type="number"
                  value={data.construction_year || ''}
                  onChange={e => updateData({ construction_year: parseInt(e.target.value) || 0 })}
                  placeholder="2022"
                  className="w-full bg-transparent border-b border-outline-variant/40 py-1.5 font-medium text-primary placeholder:text-outline-variant/60"
                />
              </div>
            </div>
            <div className="group">
              <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Price Point</label>
              <div className="relative">
                <input
                  type="number"
                  value={data.price ? data.price / 100 : ''}
                  onChange={e => updateData({ price: parseFloat(e.target.value) * 100 })}
                  placeholder="1250000"
                  className="w-full bg-transparent border-b border-outline-variant/40 py-1.5 font-medium text-primary placeholder:text-outline-variant/60 pr-12"
                />
                <span className="absolute right-0 bottom-1.5 text-[10px] font-bold text-outline-variant">EUR</span>
              </div>
            </div>
          </div>
        </section>

        {/* Location */}
        <section className="bg-surface-container-lowest p-6 shadow-sm border border-outline-variant/10">
          <h3 className="font-headline text-xl font-bold text-primary italic mb-6">Location</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="group">
                <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Street</label>
                <input
                  type="text"
                  value={data.street}
                  onChange={e => updateData({ street: e.target.value })}
                  placeholder="Street Name"
                  className="w-full bg-transparent border-b border-outline-variant/40 py-1.5 font-medium text-primary placeholder:text-outline-variant/60"
                />
              </div>
              <div className="group">
                <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Number</label>
                <input
                  type="text"
                  value={data.house_number}
                  onChange={e => updateData({ house_number: e.target.value })}
                  placeholder="42"
                  className="w-full bg-transparent border-b border-outline-variant/40 py-1.5 font-medium text-primary placeholder:text-outline-variant/60"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="group">
                <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Postal Code</label>
                <input
                  type="text"
                  value={data.postal_code}
                  onChange={e => updateData({ postal_code: e.target.value })}
                  placeholder="10115"
                  className="w-full bg-transparent border-b border-outline-variant/40 py-1.5 font-medium text-primary placeholder:text-outline-variant/60"
                />
              </div>
              <div className="group">
                <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">City</label>
                <input
                  type="text"
                  value={data.city}
                  onChange={e => updateData({ city: e.target.value })}
                  placeholder="Berlin"
                  className="w-full bg-transparent border-b border-outline-variant/40 py-1.5 font-medium text-primary placeholder:text-outline-variant/60"
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Pricing Section - Rental or Purchase */}
      <section className="bg-surface-container-lowest p-6 shadow-sm border border-outline-variant/10">
        <h3 className="font-headline text-xl font-bold text-primary italic mb-6">
          {showRentalFields ? 'Rental Pricing' : 'Purchase Price'}
        </h3>
        {showRentalFields ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="group">
              <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Cold Rent (€)</label>
              <input type="number" value={data.cold_rent ? data.cold_rent / 100 : ''} onChange={e => updateData({ cold_rent: parseFloat(e.target.value) * 100 || undefined })} placeholder="1200" className="w-full bg-transparent border-b border-outline-variant/40 py-1.5 font-medium text-primary placeholder:text-outline-variant/60" />
            </div>
            <div className="group">
              <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Warm Rent (€)</label>
              <input type="number" value={data.warm_rent ? data.warm_rent / 100 : ''} onChange={e => updateData({ warm_rent: parseFloat(e.target.value) * 100 || undefined })} placeholder="1450" className="w-full bg-transparent border-b border-outline-variant/40 py-1.5 font-medium text-primary placeholder:text-outline-variant/60" />
            </div>
            <div className="group">
              <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Utilities (€)</label>
              <input type="number" value={data.additional_costs ? data.additional_costs / 100 : ''} onChange={e => updateData({ additional_costs: parseFloat(e.target.value) * 100 || undefined })} placeholder="250" className="w-full bg-transparent border-b border-outline-variant/40 py-1.5 font-medium text-primary placeholder:text-outline-variant/60" />
            </div>
            <div className="group">
              <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Deposit (€)</label>
              <input type="number" value={data.deposit ? data.deposit / 100 : ''} onChange={e => updateData({ deposit: parseFloat(e.target.value) * 100 || undefined })} placeholder="3600" className="w-full bg-transparent border-b border-outline-variant/40 py-1.5 font-medium text-primary placeholder:text-outline-variant/60" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className="group">
              <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Purchase Price (€)</label>
              <input type="number" value={data.price ? data.price / 100 : ''} onChange={e => updateData({ price: parseFloat(e.target.value) * 100 || undefined })} placeholder="450000" className="w-full bg-transparent border-b border-outline-variant/40 py-1.5 font-medium text-primary placeholder:text-outline-variant/60" />
            </div>
            <div className="group">
              <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">HOA Fees (€/mo)</label>
              <input type="number" value={data.hoa_fees ? data.hoa_fees / 100 : ''} onChange={e => updateData({ hoa_fees: parseFloat(e.target.value) * 100 || undefined })} placeholder="350" className="w-full bg-transparent border-b border-outline-variant/40 py-1.5 font-medium text-primary placeholder:text-outline-variant/60" />
            </div>
          </div>
        )}
      </section>

      {/* Property Dimensions */}
      <section className="bg-surface-container-lowest p-6 shadow-sm border border-outline-variant/10">
        <h3 className="font-headline text-xl font-bold text-primary italic mb-6">Property Dimensions &amp; Features</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <div className="group">
            <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Rooms</label>
            <input
              type="number"
              value={data.rooms || ''}
              onChange={e => updateData({ rooms: parseInt(e.target.value) || 0 })}
              placeholder="5"
              className="w-full bg-transparent border-b border-outline-variant/40 py-1.5 font-medium text-primary placeholder:text-outline-variant"
            />
          </div>
          <div className="group">
            <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Bedrooms</label>
            <input
              type="number"
              value={data.bedrooms || ''}
              onChange={e => updateData({ bedrooms: parseInt(e.target.value) || 0 })}
              placeholder="3"
              className="w-full bg-transparent border-b border-outline-variant/40 py-1.5 font-medium text-primary placeholder:text-outline-variant"
            />
          </div>
          <div className="group">
            <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Bathrooms</label>
            <input
              type="text"
              value={data.bathrooms || ''}
              onChange={e => updateData({ bathrooms: parseFloat(e.target.value) || 0 })}
              placeholder="2.5"
              className="w-full bg-transparent border-b border-outline-variant/40 py-1.5 font-medium text-primary placeholder:text-outline-variant"
            />
          </div>
          <div className="group">
            <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Living Space</label>
            <div className="relative">
              <input
                type="number"
                value={data.living_area || ''}
                onChange={e => updateData({ living_area: parseInt(e.target.value) || 0 })}
                placeholder="185"
                className="w-full bg-transparent border-b border-outline-variant/40 py-1.5 font-medium text-primary placeholder:text-outline-variant pr-12"
              />
              <span className="absolute right-0 bottom-1.5 text-[10px] font-bold text-outline-variant">SQM</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="group">
              <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Energy Class</label>
              <select
                value={data.energy_rating}
                onChange={e => updateData({ energy_rating: e.target.value })}
                className="w-full bg-transparent border-b border-outline-variant/40 py-1.5 font-medium text-primary cursor-pointer text-sm"
              >
                <option value="">Select...</option>
                {ENERGY_RATINGS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="group">
              <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Heating</label>
              <select
                value={data.heating_type}
                onChange={e => updateData({ heating_type: e.target.value })}
                className="w-full bg-transparent border-b border-outline-variant/40 py-1.5 font-medium text-primary cursor-pointer text-sm"
              >
                <option value="">Select...</option>
                {HEATING_TYPES.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Narrative Engine */}
      <section className="bg-surface-container-lowest shadow-sm border border-outline-variant/10 overflow-hidden">
        <div className="p-4 bg-surface-container-low flex items-center justify-between border-b border-outline-variant/10">
          <div className="flex items-center gap-4">
            <h3 className="font-headline text-lg font-bold text-primary italic">Narrative Engine</h3>
          </div>
          <button
            onClick={generateDescription}
            disabled={isGenerating}
            className="flex items-center gap-2 bg-secondary/10 text-secondary px-3 py-1.5 rounded-full font-bold text-xs hover:bg-secondary/20 transition-all disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-sm">bolt</span>
            {isGenerating ? 'GENERATING...' : 'REGENERATE WITH AI'}
          </button>
        </div>
        <div className="p-6">
          <textarea
            value={data.description}
            onChange={e => updateData({ description: e.target.value })}
            rows={8}
            placeholder="Nestled in the heart of the historic district, this architectural masterpiece blends mid-century modern aesthetics with cutting-edge smart home technology..."
            className="w-full bg-transparent border-none p-0 font-body leading-relaxed text-on-surface text-sm focus:ring-0 resize-none"
          />
          <div className="mt-4 flex justify-between items-center text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">
            <span>Words: {wordCount}</span>
            <span className="text-secondary">Tone: Sophisticated &amp; Editorial</span>
          </div>
        </div>
      </section>

      {/* Media Curation */}
      <section className="bg-surface-container-low p-6 shadow-sm border border-outline-variant/10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-headline text-xl font-bold text-primary italic">Media Curation</h3>
          <span className="text-xs font-bold text-on-surface-variant">{selectedImages.length} Assets Selected</span>
        </div>
        <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
          {MOCK_IMAGES.map((img, idx) => (
            <div
              key={idx}
              onClick={() => toggleImage(idx)}
              className={`aspect-square bg-surface-container-highest relative overflow-hidden group rounded cursor-pointer border-2 transition-all ${
                selectedImages.includes(idx)
                  ? 'border-secondary ring-2 ring-secondary/20'
                  : 'border-transparent hover:border-outline-variant/40'
              }`}
            >
              <img
                src={img}
                alt={`Property ${idx + 1}`}
                className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${
                  !selectedImages.includes(idx) ? 'opacity-50' : ''
                }`}
              />
              <div className="absolute inset-0 bg-secondary/0 group-hover:bg-secondary/10 transition-colors flex items-center justify-center">
                {selectedImages.includes(idx) && (
                  <span className="material-symbols-outlined text-white text-2xl drop-shadow-lg">check_circle</span>
                )}
              </div>
            </div>
          ))}
          <div className="aspect-square border border-dashed border-outline-variant/40 flex flex-col items-center justify-center gap-1 hover:bg-white transition-colors cursor-pointer rounded">
            <span className="material-symbols-outlined text-lg text-outline-variant">cloud_upload</span>
            <span className="text-[8px] font-bold uppercase tracking-widest text-outline-variant">Add</span>
          </div>
        </div>
      </section>

      {/* Distribution Channels - DISABLED */}
      <section>
        <h3 className="font-headline text-xl font-bold text-primary italic mb-4">Distribution Channels</h3>
        <div className="grid grid-cols-4 md:grid-cols-5 gap-3">
          {['Zillow', 'Scout24', 'Rightmove'].map((name) => (
            <div
              key={name}
              className="bg-surface-container-lowest p-4 border border-outline-variant/10 flex flex-col items-center text-center gap-3 opacity-50 cursor-not-allowed"
            >
              <span className="w-8 h-8 flex items-center justify-center bg-primary-container/10 rounded font-headline font-bold text-primary text-xs italic">
                {name[0]}
              </span>
              <span className="font-bold text-[10px] uppercase tracking-wider">{name}</span>
              <span className="text-[9px] text-outline-variant uppercase">Not Connected</span>
            </div>
          ))}
          <div className="bg-surface-container-lowest p-4 border border-outline-variant/10 flex flex-col items-center text-center gap-3 opacity-50 cursor-not-allowed">
            <span className="material-symbols-outlined text-xl text-outline-variant">add_circle</span>
            <span className="font-bold text-[10px] uppercase tracking-wider">More</span>
          </div>
        </div>
        <p className="text-[10px] text-on-surface-variant/60 mt-3 uppercase tracking-widest">
          Connect distribution channels in Settings to enable multi-platform publishing
        </p>
      </section>
    </div>
  );
}
