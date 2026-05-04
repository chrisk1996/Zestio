'use client';

import { useEffect, useState } from 'react';
import { TourViewer } from '@/components/tour/TourViewer';
import { ArrowLeft, Maximize, Minimize, Share2, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function TourViewPage({ params }: { params: Promise<{ shareToken: string }> }) {
  const [scan, setScan] = useState<{ splat_file_url: string; title: string | null; id: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [shareToken, setShareToken] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    params.then(p => setShareToken(p.shareToken));
  }, [params]);

  useEffect(() => {
    if (!shareToken) return;

    // Try to fetch as public share first, then as authenticated user's scan
    fetch(`/api/tour-scans/${shareToken}/share`)
      .then(async (res) => {
        if (res.ok) return res.json();
        // Fallback: try authenticated endpoint
        const authRes = await fetch(`/api/tour-scans/${shareToken}`);
        if (authRes.ok) return authRes.json();
        throw new Error('Tour not found');
      })
      .then(data => {
        if (data.scan) setScan(data.scan);
        else setError('Tour not found');
      })
      .catch(err => setError(err.message))
      .finally(() => {});
  }, [shareToken]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/tour/${shareToken}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-xl mb-4">{error}</p>
          <Link href="/tour" className="text-[#006c4d] hover:underline">
            ← Back to Tours
          </Link>
        </div>
      </div>
    );
  }

  if (!scan) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading 3D Tour...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center gap-3">
          <Link href="/tour" className="text-white/80 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-white font-medium truncate">
            {scan.title || '3D Tour'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            {copied ? 'Copied!' : 'Share'}
          </button>
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 3D Viewer */}
      <TourViewer splatUrl={scan.splat_file_url} className="w-screen h-screen" />

      {/* Powered by */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
        <span className="text-white/40 text-xs">
          Powered by <span className="font-medium">Zestio</span>
        </span>
      </div>
    </div>
  );
}
