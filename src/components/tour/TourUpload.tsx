'use client';

import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, Film, Plus } from 'lucide-react';
import { cn } from '@/utils/cn';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'];
const MAX_FILES = 200;
const MAX_FILE_SIZE = 50 * 1024 * 1024;

interface TourUploadProps {
  onUpload: (files: File[], title: string, rooms?: string[]) => void;
  isUploading: boolean;
  uploadProgress: number;
}

export function TourUpload({ onUpload, isUploading, uploadProgress }: TourUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rooms, setRooms] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Create stable object URLs and revoke on cleanup
  const objectUrls = useMemo(() => {
    return files
      .filter(f => f.type.startsWith('image/'))
      .map(f => URL.createObjectURL(f));
  }, [files]);

  useEffect(() => {
    return () => {
      objectUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [objectUrls]);

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    setError(null);
    const fileArray = Array.from(newFiles);

    const validFiles = fileArray.filter(f => {
      if (!ACCEPTED_TYPES.includes(f.type)) {
        setError(`Unsupported file type: ${f.name}`);
        return false;
      }
      if (f.size > MAX_FILE_SIZE) {
        setError(`File too large: ${f.name} (max 50MB)`);
        return false;
      }
      return true;
    });

    setFiles(prev => {
      const combined = [...prev, ...validFiles];
      if (combined.length > MAX_FILES) {
        setError(`Maximum ${MAX_FILES} files allowed`);
        return combined.slice(0, MAX_FILES);
      }
      return combined;
    });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  }, [addFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
    }
  }, [addFiles]);

  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const addRoom = useCallback(() => setRooms(prev => [...prev, '']), []);
  const removeRoom = useCallback((index: number) => setRooms(prev => prev.filter((_, i) => i !== index)), []);
  const updateRoom = useCallback((index: number, name: string) => setRooms(prev => prev.map((r, i) => i === index ? name : r)), []);

  const handleSubmit = useCallback(() => {
    if (files.length === 0) return;
    const namedRooms = rooms.filter(r => r.trim() !== '');
    onUpload(files, title || `3D Tour ${new Date().toLocaleDateString()}`, namedRooms.length > 0 ? namedRooms : undefined);
  }, [files, title, rooms, onUpload]);

  const imageCount = files.filter(f => f.type.startsWith('image/')).length;
  const videoCount = files.filter(f => f.type.startsWith('video/')).length;

  return (
    <div className="bg-white rounded-xl p-6 border border-[#c4c6cd]/10">
      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
          isDragging
            ? 'border-[#006c4d] bg-[#006c4d]/5'
            : 'border-[#c4c6cd]/30 hover:border-[#006c4d]/40 hover:bg-[#006c4d]/5'
        )}
      >
        <Upload className="w-10 h-10 mx-auto mb-3 text-[#43474c]" />
        <p className="text-[#1d2832] font-medium mb-1">
          Drag & drop photos or video
        </p>
        <p className="text-sm text-[#43474c]">
          JPG, PNG, WebP, or MP4 — up to {MAX_FILES} files
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.webp,.mp4"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-600">{error}</p>
      )}

      {/* Title input */}
      <div className="mt-4">
        <input
          type="text"
          placeholder="Tour title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg border border-[#c4c6cd]/20 text-[#1d2832] placeholder:text-[#43474c]/50 focus:outline-none focus:border-[#006c4d]/40 transition-colors"
        />
      </div>

      {/* Rooms */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-[#1d2832]">Rooms (optional)</span>
          <button
            onClick={addRoom}
            className="flex items-center gap-1 text-xs text-[#006c4d] hover:text-[#005a3e] font-medium"
          >
            <Plus className="w-3.5 h-3.5" /> Add Room
          </button>
        </div>
        {rooms.length > 0 && (
          <div className="space-y-2">
            {rooms.map((name, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`Room ${i + 1} name`}
                  value={name}
                  onChange={(e) => updateRoom(i, e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border border-[#c4c6cd]/20 text-sm text-[#1d2832] placeholder:text-[#43474c]/50 focus:outline-none focus:border-[#006c4d]/40 transition-colors"
                />
                <button
                  onClick={() => removeRoom(i)}
                  className="text-[#43474c] hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* File previews */}
      {files.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3 text-sm text-[#43474c]">
              {imageCount > 0 && (
                <span className="flex items-center gap-1">
                  <ImageIcon className="w-4 h-4" /> {imageCount} photos
                </span>
              )}
              {videoCount > 0 && (
                <span className="flex items-center gap-1">
                  <Film className="w-4 h-4" /> {videoCount} videos
                </span>
              )}
            </div>
            <button
              onClick={() => setFiles([])}
              className="text-sm text-red-500 hover:text-red-700"
            >
              Clear all
            </button>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-48 overflow-y-auto">
            {files.slice(0, 32).map((file, i) => (
              <div key={`${file.name}-${i}`} className="relative aspect-square rounded-lg overflow-hidden bg-[#edf4ff] group">
                {file.type.startsWith('image/') && objectUrls[i] ? (
                  <img
                    src={objectUrls[i]}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Film className="w-6 h-6 text-[#43474c]" />
                  </div>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {files.length > 32 && (
              <div className="aspect-square rounded-lg bg-[#edf4ff] flex items-center justify-center text-sm text-[#43474c] font-medium">
                +{files.length - 32}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upload progress */}
      {isUploading && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-[#43474c] mb-1">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="h-2 bg-[#edf4ff] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#006c4d] rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={files.length === 0 || isUploading}
        className={cn(
          'mt-4 w-full py-3 rounded-xl font-medium text-white transition-all',
          files.length > 0 && !isUploading
            ? 'bg-[#006c4d] hover:bg-[#005a3e] cursor-pointer'
            : 'bg-[#c4c6cd] cursor-not-allowed'
        )}
      >
        {isUploading ? 'Uploading...' : `Create 3D Tour (8 credits)`}
      </button>
    </div>
  );
}
