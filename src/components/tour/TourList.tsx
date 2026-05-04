'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Eye, Share2, Trash2, RefreshCw, Globe, Lock, Loader2 } from 'lucide-react';
import { EmbedCode } from './EmbedCode';
import { TOUR_STATUS_CONFIG, type TourScan, type TourScanStatus } from '@/types/tour-scan';
import { cn } from '@/utils/cn';

interface TourListProps {
  scans: TourScan[];
  onDelete: (id: string) => void;
  onTogglePublic: (id: string, isPublic: boolean) => void;
  onCheckStatus: (id: string) => void;
}

function StatusBadge({ status }: { status: TourScanStatus }) {
  const config = TOUR_STATUS_CONFIG[status];
  return (
    <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium', config.bgColor, config.color)}>
      {(status === 'uploading' || status === 'processing') && (
        <Loader2 className="w-3 h-3 animate-spin" />
      )}
      {config.label}
    </span>
  );
}

export function TourList({ scans, onDelete, onTogglePublic, onCheckStatus }: TourListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Auto-poll processing scans
  const processingScans = scans.filter(s => s.status === 'processing' || s.status === 'uploading');

  useEffect(() => {
    if (processingScans.length === 0) return;
    const interval = setInterval(() => {
      processingScans.forEach(scan => {
        onCheckStatus(scan.id);
      });
    }, 15000);
    return () => clearInterval(interval);
  }, [processingScans.length, onCheckStatus]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Delete this D tour? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  }, [onDelete]);

  const handleCopyLink = useCallback(async (scan: TourScan) => {
    const url = `${window.location.origin}/tour/${scan.share_token}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(scan.id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  if (scans.length === 0) {
    return (
      <div className="text-center py-12 text-[#43474c]">
        <p className="text-lg mb-1">No 3D tours yet</p>
        <p className="text-sm">Upload photos above to create your first tour</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {scans.map((scan) => (
        <div
          key={scan.id}
          className="bg-white rounded-xl border border-[#c4c6cd]/10 overflow-hidden hover:shadow-md transition-shadow"
        >
          {/* Thumbnail */}
          <div className="aspect-video bg-gradient-to-br from-[#edf4ff] to-[#006c4d]/10 flex items-center justify-center relative">
            {scan.thumbnail_url ? (
              <img src={scan.thumbnail_url} alt={scan.title || 'Tour'} className="w-full h-full object-cover" />
            ) : (
              <div className="text-center">
                <div className="text-4xl mb-1">🏠</div>
                <p className="text-xs text-[#43474c]">{scan.image_count} images</p>
              </div>
            )}
            <div className="absolute top-2 right-2">
              <StatusBadge status={scan.status} />
            </div>
          </div>

          {/* Info */}
          <div className="p-4">
            <h3 className="font-medium text-[#1d2832] truncate">
              {scan.title || 'Untitled Tour'}
            </h3>
            <p className="text-xs text-[#43474c] mt-1">
              {new Date(scan.created_at).toLocaleDateString()} · {scan.credits_used} credits
            </p>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-3">
              {scan.status === 'done' && (
                <Link
                  href={`/tour/${scan.share_token}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#006c4d] text-white hover:bg-[#005a3e] transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" /> View
                </Link>
              )}

              {(scan.status === 'processing' || scan.status === 'uploading') && (
                <button
                  onClick={() => onCheckStatus(scan.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Check Status
                </button>
              )}

              {scan.status === 'done' && (
                <>
                  <button
                    onClick={() => onTogglePublic(scan.id, !scan.is_public)}
                    className={cn(
                      'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors',
                      scan.is_public
                        ? 'text-green-700 bg-green-50 hover:bg-green-100'
                        : 'text-[#43474c] bg-[#edf4ff] hover:bg-[#c4c6cd]/20'
                    )}
                    title={scan.is_public ? 'Public' : 'Private'}
                  >
                    {scan.is_public ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => handleCopyLink(scan)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#43474c] bg-[#edf4ff] hover:bg-[#c4c6cd]/20 transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    {copiedId === scan.id ? 'Copied!' : 'Share'}
                  </button>
                  <EmbedCode shareToken={scan.share_token} />
                </>
              )}

              <button
                onClick={() => handleDelete(scan.id)}
                disabled={deletingId === scan.id}
                className="ml-auto flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {scan.error_message && (
              <p className="mt-2 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
                {scan.error_message}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
