'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { useTranslations } from 'next-intl';

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const t = useTranslations('auth');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password || !confirmPassword) {
      setError(t('fillAllFields'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('passwordsNoMatch'));
      return;
    }
    if (password.length < 6) {
      setError(t('passwordTooShort'));
      return;
    }

    setIsLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('authFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9ff]">
      <Header />
      <main className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl text-[#1d2832] mb-2">
            {t('setNewPassword')}
          </h1>
          <p className="text-[#43474c]">
            {t('setNewPasswordDesc')}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-[#c4c6cd]/20 p-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#1d2832] mb-1">
                {t('newPassword')}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 border border-[#c4c6cd]/30 rounded-lg focus:ring-2 focus:ring-[#006c4d] focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#1d2832] mb-1">
                {t('confirmPassword')}
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 border border-[#c4c6cd]/30 rounded-lg focus:ring-2 focus:ring-[#006c4d] focus:border-transparent outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#006c4d] text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t('resetting')}
                </>
              ) : (
                t('setPassword')
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
