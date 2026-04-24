'use client';

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string | null;
  created_at: string;
}

export default function UsagePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/credits/transactions');
        if (!res.ok) throw new Error('Failed to load');
        const data = await res.json();
        setTransactions(data.transactions || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load transactions');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const typeLabels: Record<string, { label: string; color: string }> = {
    purchase: { label: 'Subscription', color: 'text-blue-600 bg-blue-50' },
    topup: { label: 'Top Up', color: 'text-emerald-600 bg-emerald-50' },
    usage: { label: 'Usage', color: 'text-orange-600 bg-orange-50' },
    refund: { label: 'Refund', color: 'text-purple-600 bg-purple-50' },
    reset: { label: 'Monthly Reset', color: 'text-gray-600 bg-gray-50' },
    subscription: { label: 'New Subscription', color: 'text-blue-600 bg-blue-50' },
  };

  const totalSpent = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0);
  const totalGained = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);

  return (
    <AppLayout title="Usage History">
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        <h1 className="font-serif text-3xl text-[#1d2832] mb-6">Credit Usage</h1>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 border border-gray-100">
            <span className="text-xs text-gray-500 uppercase tracking-wider">Credits Spent</span>
            <p className="text-2xl font-bold text-orange-600 mt-1">{Math.abs(totalSpent)}</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-100">
            <span className="text-xs text-gray-500 uppercase tracking-wider">Credits Added</span>
            <p className="text-2xl font-bold text-emerald-600 mt-1">+{totalGained}</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-100">
            <span className="text-xs text-gray-500 uppercase tracking-wider">Transactions</span>
            <p className="text-2xl font-bold text-[#1d2832] mt-1">{transactions.length}</p>
          </div>
        </div>

        {/* Transaction List */}
        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 rounded-xl p-6 text-center text-red-600">
            {error}
            <p className="text-sm text-red-400 mt-2">Run migration 018 to enable usage tracking.</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-12 text-center">
            <span className="material-symbols-outlined text-4xl text-gray-300 block mb-3">receipt_long</span>
            <p className="text-gray-500">No transactions yet. Start using tools to see your history here.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="divide-y divide-gray-50">
              {transactions.map((t) => {
                const meta = typeLabels[t.type] || { label: t.type, color: 'text-gray-600 bg-gray-50' };
                return (
                  <div key={t.id} className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${meta.color}`}>
                        {meta.label}
                      </span>
                      <div>
                        <p className="text-sm text-[#1d2832]">{t.description || meta.label}</p>
                        <p className="text-xs text-gray-400">{new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {['topup', 'purchase', 'subscription'].includes(t.type) && (
                        <a
                          href={`/api/invoice?id=${t.id}`}
                          target="_blank"
                          className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-sm">receipt_long</span>
                          Invoice
                        </a>
                      )}
                      <span className={`font-medium text-sm ${t.amount > 0 ? 'text-emerald-600' : 'text-gray-900'}`}>
                        {t.amount > 0 ? '+' : ''}{t.amount} cr
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
