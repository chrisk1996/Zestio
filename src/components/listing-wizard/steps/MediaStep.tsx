'use client';

import { useState, useCallback } from 'react';
import { Upload, Sparkles, Sofa, Video, Loader2, Check, Image as ImageIcon, X } from 'lucide-react';
import type { ListingData } from '../ListingWizard';
import { EnhancePanel, StagingPanel } from '@/components/media';

interface MediaStepProps {
  data: ListingData;
  updateData: (data: Partial<ListingData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

interface ImageMeta {
  id: string;
  url: string;
  originalUrl?: string;
  enhanced?: boolean;
  staged?: boolean;
  roomType?: string;
  style?: string;
}

export function MediaStep({ data, updateData, onNext, onPrev }: MediaStepProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
  const [processingType, setProcessingType] = useState<'enhance' | 'staging' | null>(null);

  // Image state - stored in data.media_ids as URLs
  const images: ImageMeta[] = (data.media_ids || []).map((url, idx) => {
    // Check if URL contains metadata (enhanced/staged)
    if (typeof url === 'object' && url !== null) {
      return { id: `img-${idx}`, ...(url as object) } as ImageMeta;
    }
    return { id: `img-${idx}`, url } as ImageMeta;
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Convert to base64 for API processing
        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        uploadedUrls.push(dataUrl);
      }

      // Add to existing media
      updateData({
        media_ids: [...(data.media_ids || []), ...uploadedUrls],
      });
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newMedia = [...(data.media_ids || [])];
    newMedia.splice(index, 1);
    updateData({ media_ids: newMedia });
    if (activeImageIndex === index) {
      setActiveImageIndex(null);
    }
  };

  const handleEnhanceResult = (resultUrl: string, metadata: { model: string; creditsUsed: number }) => {
    if (activeImageIndex === null) return;

    const newMedia = [...(data.media_ids || [])];
    // Replace the original with enhanced version
    newMedia[activeImageIndex] = resultUrl;

    updateData({
      media_ids: newMedia,
      // Track enhancement cost
      used_credits: (data.used_credits || 0) + metadata.creditsUsed,
    });

    setProcessingType(null);
  };

  const handleStagingResult = (
    resultUrl: string,
    metadata: { roomType: string; furnitureStyle: string; model: string; creditsUsed: number }
  ) => {
    if (activeImageIndex === null) return;

    // For staging, we add the staged version as a new image (keep original)
    const newMedia = [...(data.media_ids || []), resultUrl];

    updateData({
      media_ids: newMedia,
      used_credits: (data.used_credits || 0) + metadata.creditsUsed,
    });

    setProcessingType(null);
  };

  const handleError = (error: string) => {
    console.error('Processing error:', error);
    setProcessingType(null);
  };

  const activeImage = activeImageIndex !== null ? images[activeImageIndex]?.url || null : null;

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
          <p className="text-xs text-gray-400 mt-2">Supports JPG, PNG, WebP</p>
        </label>
      </div>

      {/* Image Gallery */}
      {images.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">Uploaded Images ({images.length})</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((img, index) => (
              <div
                key={img.id}
                className={`relative group rounded-lg overflow-hidden border-2 transition-all ${
                  activeImageIndex === index
                    ? 'border-indigo-500 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="aspect-[4/3] bg-gray-100 relative">
                  <img
                    src={img.url}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(index);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                {/* Select Button */}
                <button
                  onClick={() => setActiveImageIndex(activeImageIndex === index ? null : index)}
                  className="w-full py-2 text-xs font-medium text-center bg-gray-50 hover:bg-gray-100"
                >
                  {activeImageIndex === index ? 'Selected' : 'Select for AI'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Processing Panel - shown when image is selected */}
      {activeImage && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-wider">
              AI Image Processing
            </h3>
            <button
              onClick={() => setActiveImageIndex(null)}
              className="text-indigo-600 hover:text-indigo-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tab Selection */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setProcessingType('enhance')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                processingType === 'enhance'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-indigo-700 hover:bg-indigo-100'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Enhance
            </button>
            <button
              onClick={() => setProcessingType('staging')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                processingType === 'staging'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-purple-700 hover:bg-purple-100'
              }`}
            >
              <Sofa className="w-4 h-4" />
              Virtual Staging
            </button>
          </div>

          {/* Processing Panel */}
          {processingType === 'enhance' && (
            <EnhancePanel
              image={activeImage}
              onResult={handleEnhanceResult}
              onError={handleError}
              compact
            />
          )}

          {processingType === 'staging' && (
            <StagingPanel
              image={activeImage}
              onResult={handleStagingResult}
              onError={handleError}
              compact
            />
          )}
        </div>
      )}

      {/* Credit Cost Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Credit costs:</strong> Enhance = 1-2 credits, Virtual Staging = 2-3 credits, Video Tour = 5 credits
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
