'use client';

import { useState } from 'react';
import { Sparkles, Loader2, Globe, Check } from 'lucide-react';
import type { ListingData } from '../ListingWizard';

interface DescriptionStepProps {
  data: ListingData;
  updateData: (data: Partial<ListingData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const TONES = [
  { value: 'professional', label: 'Professional', description: 'Clean, factual, business-focused' },
  { value: 'warm', label: 'Warm', description: 'Friendly, inviting, family-oriented' },
  { value: 'luxury', label: 'Luxury', description: 'Elegant, sophisticated, premium' },
];

export function DescriptionStep({ data, updateData, onNext, onPrev }: DescriptionStepProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTone, setSelectedTone] = useState('professional');
  const [wordCount, setWordCount] = useState(0);

  const generateDescription = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_type: data.property_type,
          transaction_type: data.transaction_type,
          city: data.city,
          district: data.district,
          rooms: data.rooms,
          bedrooms: data.bedrooms,
          living_area: data.living_area,
          features: data.features,
          proximity_data: data.proximity_data,
          tone: selectedTone,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        updateData({
          title: result.title || data.title,
          description: result.description || data.description,
        });
        setWordCount((result.description || '').split(/\s+/).filter(Boolean).length);
      }
    } catch (error) {
      console.error('Error generating description:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-xl font-semibold text-gray-900">AI Description Generator</h2>
          <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
            One-click
          </span>
        </div>
        <p className="text-gray-600">
          Claude generates a compelling description from all the data you've entered.
        </p>
      </div>

      {/* Tone Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Select Tone</label>
        <div className="grid grid-cols-3 gap-3">
          {TONES.map((tone) => (
            <button
              key={tone.value}
              onClick={() => setSelectedTone(tone.value)}
              className={`p-4 rounded-xl text-left transition-all ${
                selectedTone === tone.value
                  ? 'bg-indigo-100 border-2 border-indigo-500'
                  : 'bg-gray-50 border-2 border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium text-gray-900 mb-1">{tone.label}</div>
              <div className="text-xs text-gray-500">{tone.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={generateDescription}
        disabled={isGenerating}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-all"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Generating description...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Generate AI Description
          </>
        )}
      </button>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
        <input
          type="text"
          value={data.title}
          onChange={(e) => updateData({ title: e.target.value })}
          placeholder="e.g., Modern 3-Room Apartment in Berlin-Mitte"
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Description */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">Description</label>
          {wordCount > 0 && (
            <span className="text-xs text-gray-400">{wordCount} words</span>
          )}
        </div>
        <textarea
          value={data.description}
          onChange={(e) => {
            updateData({ description: e.target.value });
            setWordCount(e.target.value.split(/\s+/).filter(Boolean).length);
          }}
          placeholder="Description will appear here after generation..."
          rows={8}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
        />
      </div>

      {/* Multi-language Option */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          <Globe className="w-5 h-5 text-gray-500" />
          <div>
            <div className="font-medium text-gray-900">Generate in Multiple Languages</div>
            <div className="text-sm text-gray-500">Create German and English versions</div>
          </div>
        </div>
        <button className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700">
          Generate
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
          disabled={!data.title || !data.description}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Continue to Features
        </button>
      </div>
    </div>
  );
}
