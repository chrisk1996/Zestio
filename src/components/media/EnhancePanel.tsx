'use client';

import { useState, useRef } from 'react';
import AIModelSelector, { type AIModel } from '@/components/AIModelSelector';

type EnhancementTool = 'auto-lighting' | 'denoise' | 'sky-replacement' | null;

const enhancementTools = [
  { id: 'auto-lighting' as const, icon: 'light_mode', label: 'Auto-Lighting', description: 'Perfect exposure balance' },
  { id: 'denoise' as const, icon: 'grain', label: 'Denoise & Sharp', description: 'Crystal clear detail' },
  { id: 'sky-replacement' as const, icon: 'wb_twilight', label: 'Sky Replacement', description: 'Dramatic sky transforms' },
];

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
          enhancementType: selectedTool === 'sky-replacement' ? 'sky' : 'auto',
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
          {enhancementTools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setSelectedTool(tool.id)}
              disabled={!image || isProcessing}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                selectedTool === tool.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <span className="material-symbols-outlined">{tool.icon}</span>
              <div className="text-left">
                <div className="font-semibold text-sm">{tool.label}</div>
                {!compact && <div className="text-xs opacity-75">{tool.description}</div>}
              </div>
            </button>
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
