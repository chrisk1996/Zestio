'use client';

import type { ListingData } from '../ListingWizard';
import { ENERGY_RATINGS } from '@/types/listing';

interface FeaturesStepProps {
  data: ListingData;
  updateData: (data: Partial<ListingData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const FEATURES = [
  { key: 'parking', label: 'Parking', icon: '🅿️' },
  { key: 'balcony', label: 'Balcony', icon: '🌿' },
  { key: 'garden', label: 'Garden', icon: '🌳' },
  { key: 'elevator', label: 'Elevator', icon: '🛗' },
  { key: 'basement', label: 'Basement', icon: '🏠' },
  { key: 'pets_allowed', label: 'Pets Allowed', icon: '🐾' },
  { key: 'built_in_kitchen', label: 'Built-in Kitchen', icon: '🍳' },
  { key: 'furnished', label: 'Furnished', icon: '🛋️' },
  { key: 'air_conditioning', label: 'Air Conditioning', icon: '❄️' },
  { key: 'heating', label: 'Heating', icon: '🔥' },
  { key: 'terrace', label: 'Terrace', icon: '🌅' },
  { key: 'pool', label: 'Pool', icon: '🏊' },
];

const HEATING_TYPES = ['Heat Pump', 'Gas', 'Oil', 'Solar', 'Fernwärme', 'Electric'];

export function FeaturesStep({ data, updateData, onNext, onPrev }: FeaturesStepProps) {
  const toggleFeature = (key: string) => {
    updateData({
      features: {
        ...data.features,
        [key]: !data.features[key],
      },
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-xl font-semibold text-gray-900">Features & Legal Details</h2>
          <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">
            EU Required
          </span>
        </div>
        <p className="text-gray-600">
          Select property features and fill in legally required fields for EU listings.
        </p>
      </div>

      {/* Feature Checkboxes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Amenities</label>
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
          {FEATURES.map((feature) => (
            <button
              key={feature.key}
              onClick={() => toggleFeature(feature.key)}
              className={`p-3 rounded-xl text-center transition-all ${
                data.features[feature.key]
                  ? 'bg-indigo-100 border-2 border-indigo-500'
                  : 'bg-gray-50 border-2 border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-1">{feature.icon}</div>
              <div className="text-sm font-medium text-gray-700">{feature.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Energy Certificate */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Energy Certificate (Required in EU)</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Energy Rating</label>
            <select
              value={data.energy_rating}
              onChange={(e) => updateData({ energy_rating: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              <option value="">Select rating</option>
              {ENERGY_RATINGS.map((rating) => (
                <option key={rating} value={rating}>{rating}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Heating Type</label>
            <select
              value={data.heating_type}
              onChange={(e) => updateData({ heating_type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              <option value="">Select heating</option>
              {HEATING_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Availability */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Available From</label>
          <input
            type="date"
            value={data.availability_date || ''}
            onChange={(e) => updateData({ availability_date: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 mt-6">Or</label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.is_immediately_available || false}
              onChange={(e) => updateData({ is_immediately_available: e.target.checked, availability_date: undefined })}
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700">Immediately Available</span>
          </label>
        </div>
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
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          Continue to Review
        </button>
      </div>
    </div>
  );
}
