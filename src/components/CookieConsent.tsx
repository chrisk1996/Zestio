'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('cookie_consent_dismissed');
    if (!dismissed) {
      // Small delay so it doesn't flash on first load
      const t = setTimeout(() => setVisible(true), 500);
      return () => clearTimeout(t);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem('cookie_consent_dismissed', 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white rounded-xl shadow-2xl border border-[#c4c6cd]/20 p-5">
        <div className="flex items-start gap-3 mb-3">
          <span className="material-symbols-outlined text-[#006c4d] text-xl shrink-0">cookie</span>
          <div>
            <p className="text-sm text-[#1d2832] font-medium mb-1">Cookie Notice</p>
            <p className="text-xs text-[#43474c] leading-relaxed">
              Zestio uses only essential cookies for authentication and security. No tracking or advertising cookies are used.{' '}
              <Link href="/terms" className="text-[#006c4d] underline">Learn more</Link>
            </p>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={dismiss}
            className="px-4 py-2 bg-[#006c4d] text-white rounded-lg text-xs font-manrope uppercase tracking-widest hover:opacity-90 transition-all"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
