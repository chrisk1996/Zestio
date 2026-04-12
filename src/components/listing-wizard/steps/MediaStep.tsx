'use client';
import { useState, useCallback } from 'react';
import { Upload, Sparkles, Sofa, Loader2, X, Star, FolderOpen, Check } from 'lucide-react';
import type { ListingData } from '../ListingWizard';
import { EnhancePanel, StagingPanel, MediaPicker } from '@/components/media';

interface MediaStepProps {
  data: ListingData;
  updateData: (data: Partial<ListingData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

interface ImageMeta {
  id: string;
  url: string;
  isCover?: boolean;
}

export function MediaStep({ data, updateData, onNext, onPrev }: MediaStepProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
  const [processingType, setProcessingType] = useState<'enhance' | 'staging' | null>(null);
  const [showLibraryPicker, setShowLibraryPicker] = useState(false);

  // Get cover image index
  const coverIndex = data.cover_image_index ?? 0;

  // Image state
  const images: ImageMeta[] = (data.media_ids || []).map((url, idx) => ({
    id: `img-${idx}`,
    url: typeof url === 'string' ? url : (url as any).url || '',
    isCover: idx === coverIndex,
  }));

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        uploadedUrls.push(dataUrl);
      }

      updateData({ media_ids: [...(data.media_ids || []), ...uploadedUrls] });
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newMedia = [...(data.media_ids || [])];
    newMedia.splice(index, 1);
    
    // Adjust cover index if needed
    let newCoverIndex = coverIndex;
    if (index === coverIndex) {
      newCoverIndex = 0;
    } else if (index < coverIndex) {
      newCoverIndex = coverIndex - 1;
    }
    
    updateData({ 
      media_ids: newMedia,
      cover_image_index: newCoverIndex,
    });
    
    if (activeImageIndex === index) {
      setActiveImageIndex(null);
    }
  };

  const setCoverImage = (index: number) => {
    updateData({ cover_image_index: index });
  };

  const handleLibrarySelect = (urls: string[]) => {
    updateData({ 
      media_ids: [...(data.media_ids || []), ...urls],
    });
    setShowLibraryPicker(false);
  };

  const handleEnhanceResult = (resultUrl: string, metadata: { model: string; creditsUsed: number }) => {
    if (activeImageIndex === null) return;
    const newMedia = [...(data.media_ids || [])];
    newMedia[activeImageIndex] = resultUrl;
    updateData({ 
      media_ids: newMedia,
      used_credits: (data.used_credits || 0) + metadata.creditsUsed,
    });
    setProcessingType(null);
  };

  const handleStagingResult = (
    resultUrl: string,
    metadata: { roomType: string; furnitureStyle: string; model: string; creditsUsed: number }
  ) => {
    if (activeImageIndex === null) return;
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
          <h2 className="text-xl font-semibold text-gray-900">Photos & Media</h2>
          <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
            AI-powered
          </span>
        </div>
        <p className="text-gray-600">
          Upload photos or select from your library. Click the star to set the cover image.
        </p>
      </div>

      {/* Upload & Library Buttons */}
      <div className="flex gap-3">
        <label className="flex-1 border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-indigo-400 transition-colors cursor-pointer">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            disabled={isUploading}
          />
          {isUploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
              <span className="text-sm text-gray-600">Uploading...</span>
            </div>
          ) : (
            <>
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 font-medium">Upload New Photos</p>
              <p className="text-gray-400 text-xs mt-1">JPG, PNG, WebP</p>
            </>
          )}
        </label>

        <button
          onClick={() => setShowLibraryPicker(true)}
          className="flex-1 border-2 border-gray-200 rounded-xl p-6 text-center hover:border-indigo-400 hover:bg-indigo-50 transition-all cursor-pointer"
        >
          <FolderOpen className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
          <p className="text-gray-700 font-medium">Select from Library</p>
          <p className="text-gray-400 text-xs mt-1">Previously enhanced images</p>
        </button>
      </div>

      {/* Image Gallery */}
      {images.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">
              Images ({images.length})
            </h3>
            <p className="text-xs text-gray-500">
              ⭐ = Cover image (shown in listings grid)
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((img, index) => (
              <div
                key={img.id}
                className={`relative group rounded-lg overflow-hidden border-2 transition-all ${
                  activeImageIndex === index
                    ? 'border-indigo-500 shadow-lg'
                    : img.isCover
                    ? 'border-amber-400 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="aspect-[4/3] bg-gray-100 relative">
                  <img
                    src={img.url}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {/* Cover Badge */}
                  {img.isCover && (
                    <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                      Cover
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Set Cover Button */}
                    {!img.isCover && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCoverImage(index);
                        }}
                        className="bg-white/90 hover:bg-amber-100 text-gray-600 hover:text-amber-600 p-1.5 rounded-full transition-colors"
                        title="Set as cover"
                      >
                        <Star className="w-3.5 h-3.5" />
                      </button>
                    )}
                    
                    {/* Remove Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(index);
                      }}
                      className="bg-white/90 hover:bg-red-100 text-gray-600 hover:text-red-600 p-1.5 rounded-full transition-colors"
                      title="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Select Button */}
                <button
                  onClick={() => setActiveImageIndex(activeImageIndex === index ? null : index)}
                  className={`w-full py-2 text-xs font-medium text-center transition-colors ${
                    activeImageIndex === index
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {activeImageIndex === index ? (
                    <span className="flex items-center justify-center gap-1">
                      <Check className="w-3 h-3" />
                      Selected
                    </span>
                  ) : (
                    'Select for AI'
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Processing Panel */}
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

      {/* Credit Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Credit costs:</strong> Enhance = 1-2 credits, Virtual Staging = 2-3 credits
        </p>
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
          disabled={images.length === 0}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Continue to Description
        </button>
      </div>

      {/* Library Picker Modal */}
      {showLibraryPicker && (
        <MediaPicker
          onSelect={handleLibrarySelect}
          onClose={() => setShowLibraryPicker(false)}
          multiple
        />
      )}
    </div>
  );
}
