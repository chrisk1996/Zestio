'use client';

import type { ListingData } from './ListingWizard';
import { Building, Bed, Bath, Calendar, MapPin } from 'lucide-react';

interface ListingPreviewProps {
  data: ListingData;
}

export function ListingPreview({ data }: ListingPreviewProps) {
  const formatPrice = () => {
    if (data.transaction_type === 'rent') {
      const warmRent = data.warm_rent || data.cold_rent || 0;
      return warmRent > 0 ? `€${warmRent.toLocaleString()}/mo` : '€0/mo';
    }
    return data.price > 0 ? `€${data.price.toLocaleString()}` : '€0';
  };

  const activeFeatures = Object.entries(data.features)
    .filter(([, v]) => v)
    .map(([k]) => k.replace(/_/g, ' '));

  return (
    <div className="space-y-4">
      {/* Property Type Badge */}
      <div className="flex items-center gap-2">
        <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded">
          {data.property_type ? data.property_type.charAt(0).toUpperCase() + data.property_type.slice(1) : 'Property'}
        </span>
        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
          {data.transaction_type === 'rent' ? 'For Rent' : 'For Sale'}
        </span>
      </div>

      {/* Title */}
      <h2 className="text-lg font-semibold text-gray-900">
        {data.title || (
          <span className="text-gray-400 italic">Title will appear here...</span>
        )}
      </h2>

      {/* Address */}
      <div className="flex items-start gap-2 text-sm text-gray-600">
        <MapPin className="w-4 h-4 mt-0.5 text-gray-400" />
        {data.city ? (
          <span>
            {[data.street, data.house_number].filter(Boolean).join(' ')}
            {data.street && ', '}
            {[data.postal_code, data.city, data.district].filter(Boolean).join(' ')}
          </span>
        ) : (
          <span className="text-gray-400 italic">Enter address to see location...</span>
        )}
      </div>

      {/* Price */}
      <div className="pt-2">
        <span className="text-2xl font-bold text-indigo-600">{formatPrice()}</span>
        {data.transaction_type === 'rent' && data.cold_rent && data.additional_costs && (
          <div className="text-xs text-gray-500 mt-1">
            Kaltmiete: €{data.cold_rent.toLocaleString()} + €{data.additional_costs.toLocaleString()} Nebenkosten
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-3 py-3 border-y border-gray-100">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-gray-600">
            <Building className="w-4 h-4" />
          </div>
          <div className="text-sm font-medium text-gray-900 mt-1">
            {data.living_area || '-'} m²
          </div>
          <div className="text-xs text-gray-500">Area</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-gray-600">
            <Bed className="w-4 h-4" />
          </div>
          <div className="text-sm font-medium text-gray-900 mt-1">
            {data.rooms || '-'}
          </div>
          <div className="text-xs text-gray-500">Rooms</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-gray-600">
            <Bath className="w-4 h-4" />
          </div>
          <div className="text-sm font-medium text-gray-900 mt-1">
            {data.bathrooms || '-'}
          </div>
          <div className="text-xs text-gray-500">Baths</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-gray-600">
            <Calendar className="w-4 h-4" />
          </div>
          <div className="text-sm font-medium text-gray-900 mt-1">
            {data.construction_year || '-'}
          </div>
          <div className="text-xs text-gray-500">Built</div>
        </div>
      </div>

      {/* Features */}
      {activeFeatures.length > 0 && (
        <div>
          <div className="text-xs font-medium text-gray-500 mb-2">FEATURES</div>
          <div className="flex flex-wrap gap-1">
            {activeFeatures.slice(0, 6).map((feature) => (
              <span
                key={feature}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded capitalize"
              >
                {feature}
              </span>
            ))}
            {activeFeatures.length > 6 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                +{activeFeatures.length - 6} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Description Preview */}
      <div className="pt-2">
        <div className="text-xs font-medium text-gray-500 mb-2">DESCRIPTION</div>
        <p className="text-sm text-gray-600 line-clamp-4">
          {data.description || (
            <span className="text-gray-400 italic">
              AI will generate a description based on your data...
            </span>
          )}
        </p>
      </div>

      {/* POI Data (if enriched) */}
      {data.proximity_data && (
        <div className="pt-2 border-t border-gray-100">
          <div className="text-xs font-medium text-gray-500 mb-2">NEARBY AMENITIES</div>
          <div className="space-y-1">
            {(Object.entries(data.proximity_data) as [string, { walking_minutes?: number }[]][]).slice(0, 4).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between text-xs">
                <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}</span>
                <span className="text-gray-900 font-medium">
                  {value?.[0]?.walking_minutes ? `${value[0].walking_minutes} min walk` : '-'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Placeholder Image */}
      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
        <div className="text-center text-gray-400">
          <div className="text-3xl mb-2">📸</div>
          <div className="text-sm">Upload photos to preview</div>
        </div>
      </div>
    </div>
  );
}
