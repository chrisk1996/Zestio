'use client';

import { useState, useRef } from 'react';
import { AppLayout } from '@/components/layout';

const videoStyles = [
  { id: 'cinematic', name: 'Cinematic Tour', icon: 'movie', description: 'Hollywood-style property showcase' },
  { id: 'drone', name: 'Drone Flyover', icon: 'flight', description: 'Aerial exterior footage' },
  { id: 'walkthrough', name: 'Walkthrough', icon: 'directions_walk', description: 'Room-by-room interior tour' },
  { id: 'lifestyle', name: 'Lifestyle', icon: 'wb_sunny', description: 'Living experience focus' },
];

const durationOptions = [
  { id: '30s', label: '30 sec' },
  { id: '60s', label: '60 sec' },
  { id: '90s', label: '90 sec' },
  { id: '2m', label: '2 min' },
];

export default function VideoPage() {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [selectedStyle, setSelectedStyle] = useState('cinematic');
  const [duration, setDuration] = useState('60s');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      setUploadedImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (uploadedImages.length < 5) {
      alert('Please upload at least 5 images');
      return;
    }
    setIsGenerating(true);
    setProgress(10);
    try {
      // Use first image for video generation
      const response = await fetch('/api/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          image: uploadedImages[0], 
          motionType: 'orbit' 
        }),
      });
      setProgress(50);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Video generation failed');
      setProgress(100);
      // Could show video result here
      console.log('Video generated:', data.output);
    } catch (err) {
      console.error('Video generation error:', err);
      alert(err instanceof Error ? err.message : 'Failed to generate video');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AppLayout title="Video Creator">
      <div className="max-w-[1400px] mx-auto p-12">
        {/* Header */}
        <header className="mb-12">
          <span className="text-purple-600 font-bold tracking-widest uppercase text-xs mb-2 block">AI Video Production</span>
          <h1 className="font-['Plus_Jakarta_Sans'] text-5xl text-slate-900 font-bold tracking-tighter leading-none mb-4">Video Creator</h1>
          <p className="max-w-xl text-slate-600 leading-relaxed">
            Generate cinematic drone-style tours and walkthrough videos from your property images automatically.
          </p>
        </header>

        <div className="grid grid-cols-12 gap-10">
          {/* Left Column */}
          <div className="col-span-12 lg:col-span-7 space-y-8">
            {/* Upload Section */}
            <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-lg text-slate-900 mb-6">Upload Images</h3>
              
              {/* Upload Area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-video bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-purple-500 hover:bg-purple-50/50 transition-all mb-6"
              >
                <span className="material-symbols-outlined text-5xl text-slate-400">add_photo_alternate</span>
                <div className="text-center">
                  <p className="font-semibold text-slate-700">Drop your property images here</p>
                  <p className="text-sm text-slate-500">or click to browse (min 5 images)</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleUpload}
                  className="hidden"
                />
              </div>

              {/* Uploaded Images Grid */}
              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-4 gap-3">
                  {uploadedImages.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group">
                      <img src={img} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Video Style */}
            <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-lg text-slate-900 mb-6">Video Style</h3>
              <div className="grid grid-cols-2 gap-4">
                {videoStyles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`p-6 rounded-xl border-2 transition-all text-left ${
                      selectedStyle === style.id
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-slate-200 hover:border-purple-300'
                    }`}
                  >
                    <span className="material-symbols-outlined text-3xl text-purple-600 mb-3">{style.icon}</span>
                    <h4 className="font-bold text-slate-900">{style.name}</h4>
                    <p className="text-sm text-slate-500 mt-1">{style.description}</p>
                  </button>
                ))}
              </div>
            </section>

            {/* Duration */}
            <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-lg text-slate-900 mb-6">Duration</h3>
              <div className="flex gap-3">
                {durationOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setDuration(opt.id)}
                    className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                      duration === opt.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column - Preview */}
          <div className="col-span-12 lg:col-span-5">
            <div className="sticky top-24">
              {/* Preview Card */}
              <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-2xl">
                {/* Video Preview Area */}
                <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center relative">
                  {uploadedImages.length > 0 ? (
                    <div className="absolute inset-0 grid grid-cols-2 gap-1 p-2 opacity-50">
                      {uploadedImages.slice(0, 4).map((img, idx) => (
                        <img key={idx} src={img} alt="" className="w-full h-full object-cover rounded" />
                      ))}
                    </div>
                  ) : null}
                  
                  <div className="relative z-10 flex flex-col items-center">
                    <span className="material-symbols-outlined text-6xl text-white/80">play_circle</span>
                    <span className="text-white/60 text-sm mt-2">Preview</span>
                  </div>

                  {/* Progress Overlay */}
                  {isGenerating && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
                      <div className="w-48 h-2 bg-slate-700 rounded-full overflow-hidden mb-4">
                        <div
                          className="h-full bg-purple-500 transition-all duration-200"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-white text-sm">Generating video... {progress}%</span>
                    </div>
                  )}
                </div>

                {/* Video Info */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-white">Property Tour</h4>
                    <span className="text-sm text-slate-400">{duration}</span>
                  </div>
                  <div className="flex gap-4 text-sm text-slate-400">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">videocam</span>
                      4K Cinematic
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">graphic_eq</span>
                      AI Voice
                    </span>
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={uploadedImages.length < 5 || isGenerating}
                className="w-full mt-6 py-5 bg-purple-600 text-white rounded-xl font-bold text-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-purple-600/20"
              >
                <span className="material-symbols-outlined">auto_awesome</span>
                {isGenerating ? 'Generating...' : 'Generate Video'}
              </button>

              {uploadedImages.length < 5 && (
                <p className="text-center text-sm text-slate-500 mt-3">
                  Upload at least {5 - uploadedImages.length} more images to generate
                </p>
              )}

              {/* Export Options */}
              <div className="mt-8 p-6 bg-slate-100 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-4">Export Options</h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" defaultChecked className="text-purple-600 focus:ring-purple-600 rounded" />
                    <span className="text-sm text-slate-700">Include background music</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" defaultChecked className="text-purple-600 focus:ring-purple-600 rounded" />
                    <span className="text-sm text-slate-700">Add property branding</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="text-purple-600 focus:ring-purple-600 rounded" />
                    <span className="text-sm text-slate-700">Include contact overlay</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
