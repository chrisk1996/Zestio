'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';
import { Check, Trash2, Archive, Send, X } from 'lucide-react';

interface Listing {
  id: string;
  title: string;
  city: string;
  property_type: string;
  transaction_type: string;
  price: number;
  living_area: number;
  rooms: number;
  publish_status: string;
  cover_image_url?: string;
  created_at: string;
  updated_at: string;
}

export default function ListingsGrid() {
  const supabase = createClient();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'draft' | 'published'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  useEffect(() => { fetchListings(); }, []);

  const fetchListings = async () => {
    const { data, error } = await supabase.from('listings').select('*').order('updated_at', { ascending: false });
    if (!error && data) setListings(data);
    setLoading(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('de-DE', { month: 'short', day: 'numeric' });
  };

  const formatPrice = (cents: number, type: string) => {
    if (!cents) return 'Price on request';
    const price = cents / 100;
    const formatted = new Intl.NumberFormat('de-DE').format(price);
    return type === 'rent' ? `€${formatted}/mo` : `€${formatted}`;
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    const { error } = await supabase.from('listings').delete().eq('id', id);
    if (!error) setListings(listings.filter(l => l.id !== id));
  };

  // Bulk selection
  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const selectAll = () => {
    const allIds = new Set(filteredListings.map(l => l.id));
    setSelectedIds(selectedIds.size === allIds.size ? new Set() : allIds);
  };

  const clearSelection = () => setSelectedIds(new Set());

  // Bulk actions
  const handleBulkPublish = async () => {
    if (selectedIds.size === 0) return;
    setIsBulkProcessing(true);
    const ids = Array.from(selectedIds);
    const { error } = await supabase.from('listings').update({ publish_status: 'published' }).in('id', ids);
    if (!error) {
      setListings(listings.map(l => ids.includes(l.id) ? { ...l, publish_status: 'published' } : l));
      setSelectedIds(new Set());
    }
    setIsBulkProcessing(false);
  };

  const handleBulkArchive = async () => {
    if (selectedIds.size === 0) return;
    setIsBulkProcessing(true);
    const ids = Array.from(selectedIds);
    const { error } = await supabase.from('listings').update({ publish_status: 'archived' }).in('id', ids);
    if (!error) {
      setListings(listings.map(l => ids.includes(l.id) ? { ...l, publish_status: 'archived' } : l));
      setSelectedIds(new Set());
    }
    setIsBulkProcessing(false);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} listing${selectedIds.size > 1 ? 's' : ''}? This cannot be undone.`)) return;
    setIsBulkProcessing(true);
    const ids = Array.from(selectedIds);
    const { error } = await supabase.from('listings').delete().in('id', ids);
    if (!error) {
      setListings(listings.filter(l => !ids.includes(l.id)));
      setSelectedIds(new Set());
    }
    setIsBulkProcessing(false);
  };

  const filteredListings = filter === 'all' ? listings : listings.filter(l => l.publish_status === filter);
  const getStatusBadge = (status: string) => status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600';

  return (
    <div className="p-8">
      {/* Filters Bar */}
      <div className="flex items-center gap-4 mb-8 border-b border-slate-200 pb-6">
        <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors ${filter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>All Listings</button>
        <button onClick={() => setFilter('draft')} className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors ${filter === 'draft' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Drafts</button>
        <button onClick={() => setFilter('published')} className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors ${filter === 'published' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Published</button>
        <div className="ml-auto flex items-center gap-2 text-slate-400">
          <span className="text-xs font-semibold mr-2">Sort by:</span>
          <button className="flex items-center gap-1 text-xs font-bold text-slate-900">Last Modified<span className="material-symbols-outlined text-sm">keyboard_arrow_down</span></button>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-4 z-50">
          <span className="font-medium">{selectedIds.size} selected</span>
          <button onClick={clearSelection} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
          <div className="h-6 w-px bg-slate-700" />
          <button onClick={handleBulkPublish} disabled={isBulkProcessing} className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors">
            <Send className="w-4 h-4" />Publish
          </button>
          <button onClick={handleBulkArchive} disabled={isBulkProcessing} className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors">
            <Archive className="w-4 h-4" />Archive
          </button>
          <button onClick={handleBulkDelete} disabled={isBulkProcessing} className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors">
            <Trash2 className="w-4 h-4" />Delete
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12 text-slate-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-400 mx-auto mb-4"></div>
          <p>Loading listings...</p>
        </div>
      )}

      {/* Listings Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Select All Checkbox */}
          {filteredListings.length > 0 && (
            <button onClick={selectAll} className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors col-span-full">
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${selectedIds.size === filteredListings.length && selectedIds.size > 0 ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                {selectedIds.size === filteredListings.length && selectedIds.size > 0 && <Check className="w-3 h-3 text-white" />}
              </div>
              {selectedIds.size === filteredListings.length ? 'Deselect all' : 'Select all'}
            </button>
          )}

          {/* Add New Listing Card */}
          <Link href="/listing/new" className="group relative aspect-[4/5] border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center gap-4 hover:border-[#006c4d] hover:bg-emerald-50/50 transition-all">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-slate-600 text-2xl">add_home</span>
            </div>
            <span className="text-xs uppercase tracking-wider font-bold text-slate-600">Create New Listing</span>
          </Link>

          {/* Listing Cards */}
          {filteredListings.map((listing) => (
            <div key={listing.id} className="group flex flex-col">
              <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-slate-100 mb-4">
                {/* Selection Checkbox */}
                <button onClick={() => toggleSelect(listing.id)} className={`absolute top-3 left-3 z-10 w-6 h-6 rounded-full flex items-center justify-center transition-all ${selectedIds.has(listing.id) ? 'bg-indigo-600 text-white' : 'bg-white/80 text-slate-400 opacity-0 group-hover:opacity-100'}`}>
                  {selectedIds.has(listing.id) ? <Check className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border-2 border-current" />}
                </button>

                {/* Cover Image */}
                {listing.cover_image_url ? (
                  <Image src={listing.cover_image_url} alt={listing.title || 'Property'} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                    <span className="material-symbols-outlined text-5xl text-slate-400">home</span>
                  </div>
                )}

                {/* Status Badge */}
                <div className={`absolute top-3 right-3 backdrop-blur-sm px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(listing.publish_status)}`}>
                  {listing.publish_status}
                </div>

                {/* Price Badge */}
                <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-md">
                  <span className="font-serif font-bold text-sm text-slate-900">{formatPrice(listing.price, listing.transaction_type)}</span>
                </div>

                {/* Hover Actions */}
                <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 pointer-events-none">
                  <Link href={`/listing/${listing.id}`} className="w-10 h-10 bg-white text-slate-900 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform pointer-events-auto" title="Edit listing">
                    <span className="material-symbols-outlined">edit</span>
                  </Link>
                  {listing.publish_status === 'published' && (
                    <button className="w-10 h-10 bg-white text-slate-900 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform pointer-events-auto" title="View live">
                      <span className="material-symbols-outlined">visibility</span>
                    </button>
                  )}
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(listing.id); }} className="w-10 h-10 bg-white text-red-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform pointer-events-auto" title="Delete listing">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Card Info */}
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 text-sm mb-1 truncate">{listing.title || 'Untitled'}</h3>
                <p className="text-xs text-slate-500 mb-1 truncate">{listing.city || 'No location'}</p>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span>{listing.rooms || '-'} rooms</span>
                  <span>{listing.living_area || '-'} m²</span>
                  <span className="ml-auto">{formatDate(listing.updated_at)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredListings.length === 0 && (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">home</span>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No listings found</h3>
          <p className="text-slate-500 mb-6">Create your first listing to get started</p>
          <Link href="/listing/new" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            <span className="material-symbols-outlined text-lg">add_home</span>
            Create Listing
          </Link>
        </div>
      )}
    </div>
  );
}
