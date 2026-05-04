'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Maximize, Minimize, RefreshCw, AlertTriangle } from 'lucide-react';

interface TourViewerProps {
  splatUrl: string;
  className?: string;
}

export function TourViewer({ splatUrl, className = '' }: TourViewerProps) {
  const t = useTranslations('tour');
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<unknown>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [libMissing, setLibMissing] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const initViewer = useCallback(async () => {
    if (!containerRef.current || viewerRef.current) return;

    setIsLoading(true);
    setError(null);

    try {
      const gaussiansplats3d = await import('@mkkellogg/gaussian-splats-3d');
      const { Viewer } = gaussiansplats3d;

      const viewer = new Viewer({
        rootElement: containerRef.current,
        cameraUp: [0, 1, 0],
        initialCameraPosition: [0, 1.5, 5],
        initialCameraLookAt: [0, 1, 0],
      });

      viewerRef.current = viewer;

      await viewer.addSplatScene(splatUrl, {
        splatAlphaRemovalThreshold: 5,
        showLoadingUI: false,
        position: [0, 0, 0],
        rotation: [0, 0, 0, 1],
        scale: [1, 1, 1],
      });

      viewer.start();
      setIsLoading(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('Cannot find module') || msg.includes('Failed to resolve')) {
        setLibMissing(true);
      }
      setError(msg);
      setIsLoading(false);
      console.error('[TourViewer] Failed to initialize:', err);
    }
  }, [splatUrl]);

  useEffect(() => {
    initViewer();

    return () => {
      if (viewerRef.current) {
        try {
          (viewerRef.current as { dispose?: () => void }).dispose?.();
        } catch {
          // ignore cleanup errors
        }
        viewerRef.current = null;
      }
    };
  }, [initViewer]);

  const toggleFullscreen = useCallback(() => {
    if (!wrapperRef.current) return;

    if (!document.fullscreenElement) {
      wrapperRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className={`relative w-full min-h-[300px] md:min-h-[500px] bg-black/95 rounded-xl flex flex-col items-center justify-center ${className}`}>
        <div className="w-10 h-10 border-3 border-white/20 border-t-white rounded-full animate-spin mb-4" />
        <p className="text-white/70 text-sm">{t('loading')}</p>
      </div>
    );
  }

  // Library missing state
  if (libMissing) {
    return (
      <div className={`relative w-full min-h-[300px] md:min-h-[500px] bg-slate-900 rounded-xl flex flex-col items-center justify-center p-8 ${className}`}>
        <AlertTriangle className="w-10 h-10 text-yellow-400 mb-4" />
        <p className="text-white text-center mb-2 font-medium">Gaussian Splatting library not installed</p>
        <p className="text-white/60 text-sm text-center mb-4">
          Install it with: <code className="bg-white/10 px-2 py-0.5 rounded">npm install @mkkellogg/gaussian-splats-3d</code>
        </p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`relative w-full min-h-[300px] md:min-h-[500px] bg-slate-900 rounded-xl flex flex-col items-center justify-center p-8 ${className}`}>
        <AlertTriangle className="w-10 h-10 text-red-400 mb-4" />
        <p className="text-white text-center mb-2 font-medium">{t('error')}</p>
        <p className="text-white/50 text-xs text-center mb-4 max-w-md">{error}</p>
        <button
          onClick={() => {
            setError(null);
            setLibMissing(false);
            viewerRef.current = null;
            initViewer();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div
      ref={wrapperRef}
      className={`relative w-full min-h-[300px] md:min-h-[500px] bg-black rounded-xl overflow-hidden ${className}`}
    >
      <div ref={containerRef} className="w-full h-full min-h-[300px] md:min-h-[500px]" />

      {/* Fullscreen toggle */}
      <button
        onClick={toggleFullscreen}
        className="absolute top-3 right-3 w-9 h-9 bg-black/50 hover:bg-black/70 rounded-lg flex items-center justify-center text-white/80 hover:text-white transition-all z-10"
        title={t('openInFullscreen')}
      >
        {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
      </button>

      {/* Powered by watermark */}
      <div className="absolute bottom-3 left-3 bg-black/50 rounded px-2 py-1 z-10">
        <span className="text-white/60 text-xs">{t('poweredBy')}</span>
      </div>
    </div>
  );
}
