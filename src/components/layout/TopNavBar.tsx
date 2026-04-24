'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

interface TopNavBarProps {
  title?: string;
  onSave?: () => void;
  onExport?: () => void;
}

export default function TopNavBar({ title = 'Editor Workspace', onSave, onExport }: TopNavBarProps) {
  const [userInitial, setUserInitial] = useState('U');
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) {
        setUserInitial(data.user.email.charAt(0).toUpperCase());
      }
    });
  }, [supabase.auth]);

  return (
    <header className="fixed top-0 right-0 lg:left-64 left-0 h-20 flex items-center justify-between px-4 md:px-10 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="flex items-center gap-4 md:gap-8">
        {/* Mobile: spacer for hamburger */}
        <div className="w-10 lg:hidden" />
        <h2 className="font-['Plus_Jakarta_Sans'] font-bold text-slate-800 text-sm md:text-lg truncate">{title}</h2>
      </div>
      <div className="flex items-center gap-3 md:gap-6">
        {onSave && (
          <button
            onClick={onSave}
            className="px-3 md:px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 rounded-lg transition-colors text-sm"
          >
            Save
          </button>
        )}
        {onExport && (
          <button
            onClick={onExport}
            className="px-4 md:px-6 py-2 bg-slate-900 text-white font-bold rounded-lg hover:opacity-90 transition-opacity text-sm"
          >
            Export
          </button>
        )}
        <Link
          href="/settings"
          className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center border-2 border-white shadow-sm hover:opacity-80 transition-opacity"
          title="Settings"
        >
          <span className="text-white font-bold text-sm">{userInitial}</span>
        </Link>
      </div>
    </header>
  );
}
