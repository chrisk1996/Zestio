'use client';

import { useState, useRef } from 'react';
import AIModelSelector, { type AIModel } from '@/components/AIModelSelector';

type EnhancementTool = 'auto-lighting' | 'denoise' | 'sky-replacement' | 'sky-sunset' | 'sky-dramatic' | 'season-summer' | 'season-autumn' | 'season-winter' | 'object-removal' | 'declutter' | 'curb-appeal' | 'facade-refresh' | 'twilight' | null;

type ToolCategory = 'general' | 'sky' | 'exterior' | 'cleanup';

interface EnhancementToolDef {
  id: EnhancementTool;
  icon: string;
  label: string;
  description: string;
  category: ToolCategory;
  apiType: string;
}

const enhancementTools: EnhancementToolDef[] = [
  { id: 'auto-lighting', icon: 'light_mode', label: 'Auto-Lighting', description: 'Perfect exposure balance', category: 'general', apiType: 'auto' },
  { id: 'denoise', icon: 'grain', label: 'Denoise & Sharp', description: 'Crystal clear detail', category: 'general', apiType: 'denoise' },
  { id: 'sky-replacement', icon: 'wb_sunny', label: 'Blue Sky', description: 'Clear sunny sky', category: 'sky', apiType: 'sky' },
  { id: 'sky-sunset', icon: 'wb_twilight', label: 'Golden Sunset', description: 'Warm golden hour', category: 'sky', apiType: 'sky_sunset' },
  { id: 'sky-dramatic', icon: 'cloud', label: 'Dramatic Clouds', description: 'Moody cinematic sky', category: 'sky', apiType: 'sky_dramatic' },
  { id: 'twilight', icon: 'dark_mode', label: 'Virtual Twilight', description: 'Blue hour with warm glow', category: 'sky', apiType: 'twilight' },
  { id: 'season-summer', icon: 'local_florist', label: 'Summer', description: 'Lush green landscape', category: 'exterior', apiType: 'season_summer' },
  { id: 'season-autumn', icon: 'eco', label: 'Autumn', description: 'Golden fall foliage', category: 'exterior', apiType: 'season_autumn' },
  { id: 'season-winter', icon: 'ac_unit', label: 'Winter', description: 'Pristine snow scene', category: 'exterior', apiType: 'season_winter' },
  { id: 'curb-appeal', icon: 'yard', label: 'Curb Appeal', description: 'Green lawn & landscaping', category: 'exterior', apiType: 'curb_appeal' },
  { id: 'facade-refresh', icon: 'home_repair_service', label: 'Facade Refresh', description: 'Clean painted exterior', category: 'exterior', apiType: 'facade_refresh' },
  { id: 'object-removal', icon: 'delete_sweep', label: 'Object Removal', description: 'Remove unwanted items', category: 'cleanup', apiType: 'object_removal' },
  { id: 'declutter', icon: 'cleaning_services', label: 'Declutter', description: 'Remove personal items', category: 'cleanup', apiType: 'declutter' },
];

const categoryLabels: Record<ToolCategory, string> = {
  general: 'Enhancement',
  sky: 'Sky & Time of Day',
  exterior: 'Exterior & Seasons',
  cleanup: 'Cleanup',
};

interface EnhancePanelProps {
  /** Image URL or base64 data URL to enhance */
  image: string | null;
  /** Called when enhancement completes successfully */
  onResult: (resultUrl: string, metadata: { model: string; creditsUsed: number }) => void;
  /** Called when an error occurs */
  onError?: (error: string) => void;
  /** Optional: initial model selection */
  defaultModel?: AIModel;
  /** Optional: compact mode for sidebar/embedded use */
  compact?: boolean;
  /** Optional: additional class names */
  className?: string;
}

export function EnhancePanel({
  image,
  onResult,
  onError,
  defaultModel = 'auto',
  compact = false,
  className = '',
}: EnhancePanelProps) {
  const [selectedTool, setSelectedTool] = useState<EnhancementTool>(null);
  const [selectedModel, setSelectedModel] = useState<AIModel>(defaultModel);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedToolDef = enhancementTools.find(t => t.id === selectedTool) ?? null;

  // Group tools by category
  const categories = Object.keys(categoryLabels) as ToolCategory[];

  const handleEnhance = async () => {
    if (!image || !selectedTool) return;

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image,
          enhancementType: selectedToolDef?.apiType || 'auto',
          model: selectedModel,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Enhancement failed');
      }

      onResult(data.output, { model: data.model || selectedModel, creditsUsed: data.creditsUsed || 1 });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to enhance image';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <div className={className}>
      <div className={compact ? 'space-y-3' : 'space-y-4'}>
        {/* Tool Selection */}
        <div className={compact ? 'space-y-2' : 'space-y-3'}>
          {categories.map(category => (
            <div key={category}>
              <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{categoryLabels[category]}</label>
              <div className="grid grid-cols-2 gap-2">
                {enhancementTools
                  .filter(t => t.category === category)
                  .map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => setSelectedTool(tool.id)}
                      disabled={!image || isProcessing}
                      className={`flex flex-col items-center gap-1 px-2 py-2.5 rounded-lg transition-all text-center ${
                        selectedTool === tool.id
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <span className="material-symbols-outlined text-lg">{tool.icon}</span>
                      <span className="text-xs font-semibold leading-tight">{tool.label}</span>
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Enhance Button */}
        {selectedTool && image && (
          <button
            onClick={handleEnhance}
            disabled={isProcessing}
            className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-base">auto_awesome</span>
                Apply Enhancement
              </>
            )}
          </button>
        )}

        {/* AI Model Selector */}
        {selectedTool && image && (
          <div className="p-3 bg-slate-50 rounded-xl">
            <AIModelSelector category="enhance" selected={selectedModel} onSelect={setSelectedModel} />
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex justify-between items-center">
            {error}
            <button onClick={clearError} className="font-bold text-lg">×</button>
          </div>
        )}
      </div>
    </div>
  );
}
