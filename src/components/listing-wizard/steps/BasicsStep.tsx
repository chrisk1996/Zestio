'use client';

import type { ListingData } from '../ListingWizard';

interface BasicsStepProps {
  data: ListingData;
  updateData: (data: Partial<ListingData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Apartment', icon: '🏢' },
  { value: 'house', label: 'House', icon: '🏠' },
  { value: 'commercial', label: 'Commercial', icon: '🏬' },
  { value: 'land', label: 'Land', icon: '🌍' },
];

export function BasicsStep({ data, updateData, onNext, onPrev }: BasicsStepProps) {
  const canProceed = data.property_type && data.living_area > 0 && data.rooms > 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-xl font-semibold text-gray-900">Listing Basics</h2>
          <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">
            Required
          </span>
        </div>
        <p className="text-gray-600">
          Essential property details. Sale or rent changes the fields below.
        </p>
      </div>

      {/* Sale/Rent Toggle */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Type</label>
        <div className="flex gap-3">
          <button
            onClick={() => updateData({ transaction_type: 'sale' })}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              data.transaction_type === 'sale'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            For Sale
          </button>
          <button
            onClick={() => updateData({ transaction_type: 'rent' })}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              data.transaction_type === 'rent'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            For Rent
          </button>
        </div>
      </div>

      {/* Property Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
        <div className="grid grid-cols-4 gap-3">
          {PROPERTY_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => updateData({ property_type: type.value as ListingData['property_type'] })}
              className={`py-4 px-3 rounded-lg text-center transition-all ${
                data.property_type === type.value
                  ? 'bg-indigo-100 border-2 border-indigo-500 text-indigo-900'
                  : 'bg-gray-50 border-2 border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-1">{type.icon}</div>
              <div className="text-sm font-medium">{type.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Size & Rooms */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Size (m²) *</label>
          <input
            type="number"
            value={data.living_area || ''}
            onChange={(e) => updateData({ living_area: parseFloat(e.target.value) || 0 })}
            placeholder="85"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rooms *</label>
          <input
            type="number"
            value={data.rooms || ''}
            onChange={(e) => updateData({ rooms: parseFloat(e.target.value) || 0 })}
            placeholder="3"
            step="0.5"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
          <input
            type="number"
            value={data.bedrooms || ''}
            onChange={(e) => updateData({ bedrooms: parseInt(e.target.value) || 0 })}
            placeholder="2"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
          <input
            type="number"
            value={data.bathrooms || ''}
            onChange={(e) => updateData({ bathrooms: parseInt(e.target.value) || 0 })}
            placeholder="1"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Floor & Year */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
          <input
            type="number"
            value={data.floor || ''}
            onChange={(e) => updateData({ floor: parseInt(e.target.value) || 0 })}
            placeholder="3"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Total Floors</label>
          <input
            type="number"
            value={data.total_floors || ''}
            onChange={(e) => updateData({ total_floors: parseInt(e.target.value) || 0 })}
            placeholder="5"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Year Built</label>
          <input
            type="number"
            value={data.construction_year || ''}
            onChange={(e) => updateData({ construction_year: parseInt(e.target.value) || 0 })}
            placeholder="2015"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Plot Area (m²)</label>
          <input
            type="number"
            value={data.plot_area || ''}
            onChange={(e) => updateData({ plot_area: parseFloat(e.target.value) || 0 })}
            placeholder="500"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Price Section - Changes based on Sale/Rent */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-sm font-medium text-gray-700 mb-4">
          {data.transaction_type === 'sale' ? 'Asking Price' : 'Rent Details'}
        </h3>

        {data.transaction_type === 'sale' ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (€)</label>
              <input
                type="number"
                value={data.price || ''}
                onChange={(e) => updateData({ price: parseFloat(e.target.value) || 0 })}
                placeholder="450000"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">HOA Fees (€/month)</label>
              <input
                type="number"
                value={data.hoa_fees || ''}
                onChange={(e) => updateData({ hoa_fees: parseFloat(e.target.value) || 0 })}
                placeholder="250"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cold Rent (€)</label>
              <input
                type="number"
                value={data.cold_rent || ''}
                onChange={(e) => updateData({ cold_rent: parseFloat(e.target.value) || 0 })}
                placeholder="950"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Warm Rent (€)</label>
              <input
                type="number"
                value={data.warm_rent || ''}
                onChange={(e) => updateData({ warm_rent: parseFloat(e.target.value) || 0 })}
                placeholder="1200"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deposit (€)</label>
              <input
                type="number"
                value={data.deposit || ''}
                onChange={(e) => updateData({ deposit: parseFloat(e.target.value) || 0 })}
                placeholder="2850"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-gray-100">
        <button
          onClick={onPrev}
          className="px-6 py-2.5 text-gray-600 hover:text-gray-900 font-medium transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Continue to Media
        </button>
      </div>
    </div>
  );
}
