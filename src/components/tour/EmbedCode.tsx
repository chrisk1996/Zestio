'use client';

import { useState, useCallback } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Code2, Copy, Check, Monitor, Smartphone, Maximize2 } from 'lucide-react';
import { cn } from '@/utils/cn';

type SizePreset = 'responsive' | 'small' | 'large';

const SIZE_PRESETS: Record<SizePreset, { label: string; icon: React.ReactNode; width: string; height: string }> = {
  responsive: { label: 'Responsive', icon: <Monitor className="w-4 h-4" />, width: '100%', height: '600' },
  small: { label: 'Small', icon: <Smartphone className="w-4 h-4" />, width: '640', height: '400' },
  large: { label: 'Large', icon: <Maximize2 className="w-4 h-4" />, width: '100%', height: '800' },
};

interface EmbedCodeProps {
  shareToken: string;
}

function generateEmbedCode(shareToken: string, preset: SizePreset): string {
  const { width, height } = SIZE_PRESETS[preset];
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const widthAttr = width === '100%' ? 'width="100%"' : `width="${width}"`;
  return `<iframe src="${origin}/tour/${shareToken}?embed=true" ${widthAttr} height="${height}" style="border:none;border-radius:12px" allowfullscreen></iframe>`;
}

export function EmbedCode({ shareToken }: EmbedCodeProps) {
  const [open, setOpen] = useState(false);
  const [preset, setPreset] = useState<SizePreset>('responsive');
  const [copied, setCopied] = useState(false);

  const embedCode = generateEmbedCode(shareToken, preset);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [embedCode]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#43474c] bg-[#edf4ff] hover:bg-[#c4c6cd]/20 transition-colors">
          <Code2 className="w-3.5 h-3.5" /> Embed
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl w-[90vw] max-w-lg p-6 z-50 focus:outline-none">
          <Dialog.Title className="text-lg font-semibold text-[#1d2832] mb-1">
            Embed 3D Tour
          </Dialog.Title>
          <Dialog.Description className="text-sm text-[#43474c] mb-4">
            Copy the embed code below to add this tour to your website.
          </Dialog.Description>

          {/* Size presets */}
          <div className="flex gap-2 mb-4">
            {(Object.entries(SIZE_PRESETS) as [SizePreset, typeof SIZE_PRESETS[SizePreset]][]).map(([key, val]) => (
              <button
                key={key}
                onClick={() => setPreset(key)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors border',
                  preset === key
                    ? 'border-[#006c4d] bg-[#006c4d]/5 text-[#006c4d]'
                    : 'border-[#c4c6cd]/20 text-[#43474c] hover:bg-[#edf4ff]'
                )}
              >
                {val.icon} {val.label}
                <span className="text-[10px] opacity-60">
                  ({val.width}×{val.height})
                </span>
              </button>
            ))}
          </div>

          {/* Code block */}
          <div className="relative bg-[#1d2832] rounded-xl p-4 mb-4">
            <pre className="text-sm text-green-300 overflow-x-auto whitespace-pre-wrap break-all font-mono">
              {embedCode}
            </pre>
          </div>

          {/* Copy button */}
          <button
            onClick={handleCopy}
            className={cn(
              'w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors',
              copied
                ? 'bg-green-50 text-green-700'
                : 'bg-[#006c4d] text-white hover:bg-[#005a3e]'
            )}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Code'}
          </button>

          {/* Preview mockup */}
          <div className="mt-4 border border-[#c4c6cd]/20 rounded-xl overflow-hidden">
            <div className="bg-[#edf4ff] px-3 py-1.5 flex items-center gap-2 border-b border-[#c4c6cd]/20">
              <div className="flex gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-red-300" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-300" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-300" />
              </div>
              <div className="flex-1 text-center">
                <span className="text-[10px] text-[#43474c] font-mono">
                  /tour/{shareToken}?embed=true
                </span>
              </div>
            </div>
            <div className="aspect-[16/9] bg-gradient-to-br from-[#edf4ff] to-[#006c4d]/10 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl mb-1">🏠</div>
                <p className="text-xs text-[#43474c]">3D Tour Preview</p>
                <p className="text-[10px] text-[#43474c]/50 mt-0.5">
                  {SIZE_PRESETS[preset].width} × {SIZE_PRESETS[preset].height}px
                </p>
              </div>
            </div>
          </div>

          <Dialog.Close asChild>
            <button
              className="absolute top-4 right-4 text-[#43474c] hover:text-[#1d2832]"
              aria-label="Close"
            >
              ✕
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
