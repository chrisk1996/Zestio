'use client';

import { useState, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import { AppLayout } from '@/components/layout';
import { TourUpload } from '@/components/tour/TourUpload';
import { TourList } from '@/components/tour/TourList';
import { useTranslations } from 'next-intl';
import type { TourScan } from '@/types/tour-scan';
import toast from 'react-hot-toast';

export default function TourPage() {
  const t = useTranslations('tour');
  const [scans, setScans] = useState<TourScan[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [tipsOpen, setTipsOpen] = useState(false);

  // Load scans on mount
  useState(() => {
    fetch('/api/tour-scans')
      .then(res => res.json())
      .then(data => {
        if (data.scans) setScans(data.scans);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  });

  const handleUpload = useCallback(async (files: File[], title: string, rooms?: string[]) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      formData.append('title', title);
      if (rooms && rooms.length > 0) {
        formData.append('rooms', JSON.stringify(rooms));
      }

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + Math.random() * 15, 90));
      }, 500);

      const response = await fetch('/api/tour-scans', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setScans(prev => [data.scan, ...prev]);
      toast.success('3D Tour created! Processing will begin shortly.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    const response = await fetch(`/api/tour-scans/${id}`, { method: 'DELETE' });
    if (response.ok) {
      setScans(prev => prev.filter(s => s.id !== id));
      toast.success('Tour deleted');
    } else {
      toast.error('Failed to delete tour');
    }
  }, []);

  const handleTogglePublic = useCallback(async (id: string, isPublic: boolean) => {
    const response = await fetch(`/api/tour-scans/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_public: isPublic }),
    });
    if (response.ok) {
      const { scan } = await response.json();
      setScans(prev => prev.map(s => s.id === id ? scan : s));
      toast.success(isPublic ? 'Tour is now public' : 'Tour is now private');
    }
  }, []);

  const handleCheckStatus = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/tour-scans/${id}/check-status`, { method: 'POST' });
      const data = await response.json();
      if (data.scan) {
        setScans(prev => prev.map(s => s.id === id ? { ...s, ...data.scan } : s));
        if (data.scan.status === 'done') {
          toast.success('3D Tour is ready!');
        }
      }
    } catch {
      // Silent fail for polling
    }
  }, []);

  const tips = [t('tip1'), t('tip2'), t('tip3'), t('tip4'), t('tip5')];

  return (
    <AppLayout title="3D Tour">
      <div className="px-6 md:px-12 py-8 max-w-7xl mx-auto">
        {/* Header */}
        <section className="mb-8">
          <h1 className="font-serif text-4xl md:text-5xl text-[#1d2832] mb-3 leading-tight">
            {t('title')}
          </h1>
          <p className="text-[#43474c] max-w-xl">
            {t('subtitle')}
          </p>
        </section>

        {/* Upload Area */}
        <section className="mb-6">
          <TourUpload
            onUpload={handleUpload}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
          />
        </section>

        {/* Scanning Tips */}
        <section className="mb-10">
          <button
            onClick={() => setTipsOpen(!tipsOpen)}
            className="flex items-center gap-2 text-[#1d2832] font-medium hover:text-[#006c4d] transition-colors"
          >
            <ChevronDown
              className={`w-5 h-5 transition-transform duration-200 ${tipsOpen ? 'rotate-180' : ''}`}
            />
            {t('howToScan')}
          </button>
          {tipsOpen && (
            <div className="mt-3 bg-white rounded-xl border border-[#c4c6cd]/10 p-5">
              <ol className="space-y-2.5">
                {tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-[#43474c]">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#006c4d]/10 text-[#006c4d] flex items-center justify-center text-xs font-semibold">
                      {i + 1}
                    </span>
                    <span className="pt-0.5">{tip}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </section>

        {/* Scan List */}
        <section>
          <h2 className="font-serif text-2xl text-[#1d2832] mb-6">Your Tours</h2>
          {loaded ? (
            <TourList
              scans={scans}
              onDelete={handleDelete}
              onTogglePublic={handleTogglePublic}
              onCheckStatus={handleCheckStatus}
            />
          ) : (
            <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-xl border border-[#c4c6cd]/10 overflow-hidden">
                  <div className="aspect-video bg-[#edf4ff]" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-[#edf4ff] rounded w-3/4" />
                    <div className="h-3 bg-[#edf4ff] rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
