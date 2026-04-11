'use client';

import { useState, useCallback } from 'react';
import { Upload, Sparkles, Sofa, Video, Loader2, Check, Image as ImageIcon } from 'lucide-react';
import type { ListingData } from '../ListingWizard';

interface MediaStepProps {
  data: ListingData;
  updateData: (data: Partial<ListingData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function MediaStep({ data, updateData, onNext, onPrev }: MediaStepProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [enhancingImages, setEnhancingImages] = useState<Set<number>>(new Set());
  const [stagingIndex, setStagingIndex] = useState<number | null>(null);

  // Mock images for demo
  const [images, setImages] = useState<string[]>([]);
  const [enhancedImages, setEnhancedImages] = useState<Set<number>>(new Set());

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsUploading(true);
    // In real implementation, upload to Supabase storage
    // For now, just simulate with placeholder
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const newImages: string[] = [];
    for (let i = 0; i < files.length; i++) {
      newImages.push(`/api/placeholder/${Date.now() + i}`);
    }
    setImages((prev) => [...prev, ...newImages]);
    setIsUploading(false);
  };

  const enhanceImage = async (index: number) => {
    setEnhancingImages((prev) => new Set([...prev, index]));
    // Call /api/enhance
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setEnhancedImages((prev) => new Set([...prev, index]));
    setEnhancingImages((prev) => {
      const next = new Set(prev);
      next.delete(index);
      return next;
    });
  };

  const stageImage = async (index: number) => {
    setStagingIndex(index);
    // Call /api/staging
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setStagingIndex(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-xl font-semibold text-gray-900">Photos, Staging & Floor Plan</h2>
          <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
            AI-powered
          </span>
        </div>
        <p className="text-gray-600">
          Upload photos and enhance them with AI. Empty rooms can be virtually staged.
        </p>
      </div>

      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-400 transition-colors cursor-pointer">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
          id="photo-upload"
        />
        <label htmlFor="photo-upload" className="cursor-pointer">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">Drag & drop photos here</p>
          <p className="text-gray-400 text-sm mt-1">or click to browse</p>
          <p className="text-xs text-gray-400 mt-2">Photos will be auto-enhanced on upload</p>
        </label>
      </div>

      {/* Image Gallery */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((img, index) => (
            <div key={index} className="relative group">
              <div className="aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                <div className="w-full h-full flex items-center justify-center bg-gray-50">
                  <ImageIcon className="w-8 h-8 text-gray-300" />
                </div>
                {enhancedImages.has(index) && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                    <Check className="w-3 h-3" />
                  </div>
                )}
              </div>

              {/* Image Actions */}
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => enhanceImage(index)}
                  disabled={enhancingImages.has(index)}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 disabled:opacity-50"
                >
                  {enhancingImages.has(index) ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Sparkles className="w-3 h-3" />
                  )}
                  Enhance
                </button>
                <button
                  onClick={() => stageImage(index)}
                  disabled={stagingIndex === index}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 text-xs font-medium bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 disabled:opacity-50"
                >
                  {stagingIndex === index ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Sofa className="w-3 h-3" />
                  )}
                  Stage
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Credit Cost Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Credit costs:</strong> Enhance = 1 credit, Virtual Staging = 3 credits, Video Tour = 5 credits
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4">
        <button className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
          <Video className="w-6 h-6 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Generate Video Tour</span>
          <span className="text-xs text-gray-400">5 credits</span>
        </button>
        <button className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
          <ImageIcon className="w-6 h-6 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Create Floor Plan</span>
          <span className="text-xs text-gray-400">Open Editor</span>
        </button>
        <button className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
          <Upload className="w-6 h-6 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Upload Floor Plan</span>
          <span className="text-xs text-gray-400">PDF, PNG, JPG</span>
        </button>
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
          Continue to Description
        </button>
      </div>
    </div>
  );
}
