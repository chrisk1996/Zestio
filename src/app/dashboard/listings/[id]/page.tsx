'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import {
  Loader2,
  Edit,
  Trash2,
  ExternalLink,
  ArrowLeft,
  MapPin,
  Bed,
  Bath,
  Square,
  Calendar,
  Building,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  Share2,
  Archive,
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Listing {
  id: string;
  transaction_type: string;
  property_type: string;
  title: string;
  description: string;
  city: string;
  street?: string;
  house_number?: string;
  postal_code?: string;
  price: number;
  living_area?: number;
  rooms?: number;
  bedrooms?: number;
  bathrooms?: number;
  construction_year?: number;
  energy_rating?: string;
  features?: Record<string, boolean>;
  publish_status: string;
  created_at: string;
  updated_at?: string;
}

interface SyndicationLog {
  id: string;
  portal_name: string;
  status: string;
  portal_listing_url?: string;
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

// Portal display configs
const PORTAL_INFO: Record<string, { name: string; icon: string; color: string }> = {
  immobilienscout24: { name: 'ImmoScout24', icon: '🔍', color: 'bg-orange-100 text-orange-700' },
  immowelt: { name: 'Immowelt', icon: '🏠', color: 'bg-blue-100 text-blue-700' },
  immonet: { name: 'Immonet', icon: '📱', color: 'bg-green-100 text-green-700' },
  ebay_kleinanzeigen: { name: 'eBay Kleinanzeigen', icon: '🛒', color: 'bg-purple-100 text-purple-700' },
};

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const listingId = params.id as string;

  const [listing, setListing] = useState<Listing | null>(null);
  const [logs, setLogs] = useState<SyndicationLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);

  // Handle connection success message
  useEffect(() => {
    const connected = searchParams.get('connected');
    if (connected) {
      toast.success(`Successfully connected to ${connected}!`);
    }
    const error = searchParams.get('error');
    if (error) {
      toast.error(error);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchListing();
    fetchLogs();
  }, [listingId]);

  const fetchListing = async () => {
    try {
      const response = await fetch(`/api/listings/${listingId}`);
      if (response.ok) {
        setListing(await response.json());
      }
    } catch (error) {
      console.error('Failed to fetch listing:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await fetch(`/api/listings/${listingId}/syndication`);
      if (response.ok) {
        setLogs(await response.json());
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this listing? This cannot be undone.')) return;

    try {
      const response = await fetch(`/api/listings/${listingId}`, { method: 'DELETE' });
      if (response.ok) {
        toast.success('Listing deleted');
        router.push('/dashboard/listings');
      } else {
        toast.error('Failed to delete listing');
      }
    } catch (error) {
      console.error('Failed to delete:', error);
      toast.error('Failed to delete listing');
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const response = await fetch(`/api/listings/${listingId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portals: ['immowelt', 'immonet'] }),
      });

      if (response.ok) {
        toast.success('Publishing started! Check syndication status below.');
        fetchLogs();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to publish');
      }
    } catch (error) {
      toast.error('Failed to publish');
    } finally {
      setIsPublishing(false);
    }
  };

  const formatPrice = (cents?: number) => {
    if (!cents) return 'Price on request';
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(cents / 100);
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { style: string; icon: React.ReactNode }> = {
      draft: { style: 'bg-gray-100 text-gray-700', icon: <Edit className="w-3 h-3" /> },
      pending: { style: 'bg-yellow-100 text-yellow-700', icon: <Clock className="w-3 h-3" /> },
      published: { style: 'bg-green-100 text-green-700', icon: <CheckCircle2 className="w-3 h-3" /> },
      archived: { style: 'bg-blue-100 text-blue-700', icon: <Archive className="w-3 h-3" /> },
    };
    return configs[status] || configs.draft;
  };

  const getSyndicationStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'processing':
        return <RefreshCw className="w-5 h-5 text-yellow-500 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <div className="bg-white rounded-xl shadow-sm border p-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Listing not found</h2>
            <p className="text-gray-600 mb-4">This listing may have been deleted.</p>
            <Link
              href="/dashboard/listings"
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              ← Back to Listings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusBadge(listing.publish_status);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <Link
          href="/dashboard/listings"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Listings
        </Link>

        {/* Header Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${statusConfig.style}`}>
                  {statusConfig.icon}
                  {listing.publish_status}
                </span>
                <span className="text-sm text-gray-500 capitalize">
                  {listing.transaction_type === 'sale' ? 'For Sale' : 'For Rent'} • {listing.property_type}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {listing.title || 'Untitled Listing'}
              </h1>
              <div className="flex items-center gap-2 text-gray-600 mb-3">
                <MapPin className="w-4 h-4" />
                <span>
                  {listing.street && `${listing.street} ${listing.house_number}, `}
                  {listing.postal_code} {listing.city}
                </span>
              </div>
              <p className="text-3xl font-bold text-indigo-600">
                {formatPrice(listing.price)}
                {listing.transaction_type === 'rent' && <span className="text-sm text-gray-500"> /month</span>}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href={`/dashboard/listings/${listingId}/edit`}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Link>
              {listing.publish_status === 'draft' && (
                <button
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {isPublishing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Share2 className="w-4 h-4" />
                  )}
                  {isPublishing ? 'Publishing...' : 'Publish'}
                </button>
              )}
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {listing.living_area && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Square className="w-4 h-4" />
                <span className="text-sm">Area</span>
              </div>
              <p className="text-xl font-semibold text-gray-900">{listing.living_area} m²</p>
            </div>
          )}
          {listing.rooms && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Building className="w-4 h-4" />
                <span className="text-sm">Rooms</span>
              </div>
              <p className="text-xl font-semibold text-gray-900">{listing.rooms}</p>
            </div>
          )}
          {listing.bedrooms && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Bed className="w-4 h-4" />
                <span className="text-sm">Bedrooms</span>
              </div>
              <p className="text-xl font-semibold text-gray-900">{listing.bedrooms}</p>
            </div>
          )}
          {listing.bathrooms && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Bath className="w-4 h-4" />
                <span className="text-sm">Bathrooms</span>
              </div>
              <p className="text-xl font-semibold text-gray-900">{listing.bathrooms}</p>
            </div>
          )}
          {listing.construction_year && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Built</span>
              </div>
              <p className="text-xl font-semibold text-gray-900">{listing.construction_year}</p>
            </div>
          )}
          {listing.energy_rating && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <span className="text-sm">⚡ Energy</span>
              </div>
              <p className="text-xl font-semibold text-gray-900">{listing.energy_rating}</p>
            </div>
          )}
        </div>

        {/* Features */}
        {listing.features && Object.keys(listing.features).length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Features</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(listing.features)
                .filter(([, value]) => value)
                .map(([key]) => (
                  <div key={key} className="flex items-center gap-2 text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Syndication Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Portal Syndication</h2>
          {logs.length === 0 ? (
            <div className="text-center py-8">
              <Share2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">Not published to any portals yet.</p>
              {listing.publish_status === 'draft' && (
                <button
                  onClick={handlePublish}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  <Share2 className="w-4 h-4" />
                  Publish to Portals
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => {
                const portal = PORTAL_INFO[log.portal_name] || {
                  name: log.portal_name,
                  icon: '🏠',
                  color: 'bg-gray-100 text-gray-700',
                };
                return (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-2xl p-2 rounded-lg ${portal.color}`}>
                        {portal.icon}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900">{portal.name}</p>
                        <p className="text-sm text-gray-500">
                          {log.completed_at
                            ? new Date(log.completed_at).toLocaleDateString('de-DE', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Processing...'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {log.error_message && (
                        <span className="text-sm text-red-600">{log.error_message}</span>
                      )}
                      {getSyndicationStatusIcon(log.status)}
                      {log.portal_listing_url && (
                        <a
                          href={log.portal_listing_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-700"
                          title="View on portal"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Description */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {listing.description || 'No description provided.'}
          </p>
        </div>

        {/* Metadata */}
        <div className="mt-6 text-sm text-gray-500 flex justify-between">
          <span>Created: {new Date(listing.created_at).toLocaleDateString('de-DE')}</span>
          {listing.updated_at && (
            <span>Last updated: {new Date(listing.updated_at).toLocaleDateString('de-DE')}</span>
          )}
        </div>
      </main>
    </div>
  );
}
