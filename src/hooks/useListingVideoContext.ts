'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

interface ListingVideoData {
  listingId?: string;
  title?: string;
  images: string[];
  city?: string;
  propertyType?: string;
}

/**
 * Hook to detect when user navigates from listing wizard
 * and pre-populate images from the listing.
 */
export function useListingVideoContext() {
  const searchParams = useSearchParams();
  const [listingData, setListingData] = useState<ListingVideoData | null>(null);
  const [shouldSwitchToManual, setShouldSwitchToManual] = useState(false);

  useEffect(() => {
    // Check if coming from listing wizard
    const fromListings = searchParams.get('from') === 'listings';
    
    if (fromListings) {
      const stored = sessionStorage.getItem('videoFromListing');
      if (stored) {
        try {
          const data = JSON.parse(stored) as ListingVideoData;
          if (data.images && data.images.length > 0) {
            setListingData(data);
            setShouldSwitchToManual(true);
            // Clear sessionStorage after reading
            sessionStorage.removeItem('videoFromListing');
          }
        } catch (e) {
          console.error('Failed to parse video listing data:', e);
        }
      }
    }
  }, [searchParams]);

  return { listingData, shouldSwitchToManual };
}
