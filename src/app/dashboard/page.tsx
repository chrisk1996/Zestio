'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { Sparkles, Image, TrendingUp, Crown, Zap, Download } from 'lucide-react';
import Link from 'next/link';

interface Enhancement {
  id: string;
  type: string;
  date: string;
  status: 'completed' | 'processing' | 'failed';
}

interface User {
  name: string;
  email: string;
  plan: 'free' | 'pro' | 'enterprise';
  creditsUsed: number;
  creditsLimit: number;
}

export default function DashboardPage() {
  // Mock user data - will be replaced with Supabase auth
  const [user] = useState<User>({
    name: 'Demo User',
    email: 'demo@example.com',
    plan: 'free',
    creditsUsed: 3,
    creditsLimit: 5,
  });

  const [recentEnhancements] = useState<Enhancement[]>([]);

  const getPlanBadge = () => {
    switch (user.plan) {
      case 'pro':
        return <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">Pro</span>;
      case 'enterprise':
        return <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full flex items-center gap-1"><Crown className="w-3 h-3" /> Enterprise</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">Free</span>;
    }
  };

  const planBadge = getPlanBadge();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.name}</h1>
              <p className="text-gray-600 mt-1">Manage your property enhancements</p>
            </div>
            {planBadge}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Credits Used</p>
                <p className="text-2xl font-bold text-gray-900">{user.creditsUsed} / {user.creditsLimit}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Image className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Enhancements</p>
                <p className="text-2xl font-bold text-gray-900">{recentEnhancements.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Plan</p>
                <p className="text-2xl font-bold text-gray-900 capitalize">{user.plan}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Enhancements */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Enhancements</h2>

          {recentEnhancements.length === 0 ? (
            <div className="text-center py-12">
              <Image className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No enhancements yet</p>
              <Link
                href="/enhance"
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                Enhance your first photo
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentEnhancements.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Image className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="flex-grow">
                      <p className="font-medium text-gray-900 capitalize">{item.type} Enhancement</p>
                      <p className="text-sm text-gray-500">{item.date}</p>
                      <div className="flex gap-2 mt-2">
                        <button className="text-xs text-indigo-600 hover:text-indigo-700">View</button>
                        <span className="text-gray-300">•</span>
                        <button className="text-xs text-gray-600 hover:text-gray-700 flex items-center gap-1">
                          <Download className="w-3 h-3" />
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upgrade CTA for Free users */}
        {user.plan === 'free' && (
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-white">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold mb-2">Upgrade to Pro</h3>
                <p className="opacity-90">Get 100 enhancements/month, virtual staging, and priority processing.</p>
              </div>
              <Link
                href="/pricing"
                className="flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                View Plans
                <TrendingUp className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
