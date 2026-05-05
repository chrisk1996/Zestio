'use client';

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout';
import { CreditCard, Loader2, AlertCircle, Check, Zap, Crown, Building2, ArrowUpRight, Calendar, Clock, XCircle } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useTranslations } from 'next-intl';
import { getPaddleInstance } from '@/components/PaddleProvider';

interface UserData {
  email: string;
  plan: string;
  credits_remaining: number;
  credits_used: number;
  credits_total: number;
  paddle_customer_id?: string;
  subscription_status?: string;
  subscription_current_period_end?: string;
  subscription_cancel_at?: string;
  subscription_canceled_at?: string;
}

// Use centralized pricing config so billing always matches pricing page
const planConfig = {
  free: { icon: Zap, color: 'text-gray-600 bg-gray-100' },
  pro: { icon: Crown, color: 'text-indigo-600 bg-indigo-100' },
  enterprise: { icon: Building2, color: 'text-amber-600 bg-amber-100' },
};

import { PLANS } from '@/lib/pricing';

const planEntries = Object.values(PLANS);
const planIds = ['free', 'pro', 'enterprise'] as const;

export default function BillingPage() {
  const t = useTranslations('billing');
  const tp = useTranslations('pricing');
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [confirmPlanChange, setConfirmPlanChange] = useState<{ plan: string; name: string; isUpgrade: boolean } | null>(null);
  const [previewData, setPreviewData] = useState<{ immediateCharge?: { amount: string; currency: string }; nextCharge?: { amount: string; date: string }; proration?: { credit: string; charge: string } } | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadUser();

    // Check for success/cancel params
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') || params.get('checkout') === 'success') {
      // Refresh to get updated subscription
      setTimeout(() => loadUser(), 2000);
    }
  }, []);

  const loadUser = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) {
        window.location.href = '/auth';
        return;
      }

      // Fetch credits via API (Model A: credits = remaining balance)
      const [creditsRes, profileRes] = await Promise.all([
        fetch('/api/credits'),
        supabase.from('zestio_users').select('paddle_customer_id, subscription_status, subscription_current_period_end, subscription_cancel_at, subscription_canceled_at').eq('id', authUser.id).single(),
      ]);
      const creditsData = await creditsRes.json();
      const profile = profileRes.data;

      setUser({
        email: authUser.email || '',
        plan: creditsData.plan || 'free',
        credits_remaining: creditsData.credits || 0,
        credits_used: creditsData.used || 0,
        credits_total: creditsData.total || 5,
        paddle_customer_id: profile?.paddle_customer_id,
        subscription_status: profile?.subscription_status,
        subscription_current_period_end: profile?.subscription_current_period_end,
        subscription_cancel_at: profile?.subscription_cancel_at,
        subscription_canceled_at: profile?.subscription_canceled_at,
      });
    } catch (err) {
      console.error('Error loading user:', err);
      setError(t('loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const getCreditPercentage = () => {
    if (!user || user.credits_total <= 0) return 0;
    return Math.max(0, Math.round((user.credits_remaining / user.credits_total) * 100));
  };

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  /**
   * Open a Paddle checkout overlay using Paddle.js.
   * The server creates a transaction, and we open it client-side.
   */
  // Poll for subscription changes after checkout
  const startPolling = (initialPlan: string) => {
    let attempts = 0;
    const maxAttempts = 30; // Poll for up to ~90 seconds
    const interval = setInterval(async () => {
      attempts++;
      if (attempts >= maxAttempts) {
        clearInterval(interval);
        return;
      }
      try {
        const res = await fetch('/api/credits');
        const data = await res.json();
        // Only reload if plan actually changed (prevents false reload on top-ups)
        if (data.plan && data.plan !== initialPlan) {
          clearInterval(interval);
          window.location.href = '/billing?checkout=success';
        }
        // Also reload if credits changed significantly (top-up completed)
        if (user && data.credits > user.credits_remaining + 10) {
          clearInterval(interval);
          window.location.href = '/billing?checkout=success';
        }
      } catch {
        // Ignore poll errors
      }
    }, 3000);
  };

  const openPaddleCheckout = async (params: {
    type: 'subscription' | 'topup';
    plan?: 'pro' | 'enterprise';
    credits?: number;
    loadingKey: string;
  }) => {
    setCheckoutLoading(params.loadingKey);
    try {
      const res = await fetch('/api/paddle/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: params.type,
          plan: params.plan,
          credits: params.credits,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t('checkoutFailed'));
        return;
      }

      // Open Paddle.js checkout overlay with the transaction ID
      const paddle = getPaddleInstance();
      if (paddle && data.transactionId) {
        paddle.Checkout.open({ transactionId: data.transactionId });
        // Start polling — track current plan to detect actual changes
        startPolling(user?.plan || 'free');
      } else {
        setError('Paddle checkout not available. Please try again.');
      }
    } catch (err) {
      console.error('Paddle checkout error:', err);
      setError(t('startCheckoutFailed'));
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleSubscribe = async (plan: string) => {
    // If user already has a subscription, fetch preview first
    if (user?.plan !== 'free' && user?.paddle_customer_id) {
      const planOrder = ['free', 'pro', 'enterprise'];
      const isUpgrade = planOrder.indexOf(plan) > planOrder.indexOf(user?.plan || 'free');
      const planName = plan === 'pro' ? 'Pro' : 'Enterprise';
      setPreviewLoading(true);
      setPreviewData(null);
      setConfirmPlanChange({ plan, name: planName, isUpgrade });

      // Fetch proration preview from Paddle
      try {
        const res = await fetch('/api/paddle/preview-update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setPreviewData(data);
        } else {
          setError(data.error || 'Failed to preview plan change');
          setConfirmPlanChange(null);
        }
      } catch (err) {
        console.error('Preview error:', err);
        setError('Failed to preview plan change. Please try again.');
        setConfirmPlanChange(null);
      } finally {
        setPreviewLoading(false);
      }
      return;
    }

    // New subscription via Paddle checkout
    await openPaddleCheckout({
      type: 'subscription',
      plan: plan as 'pro' | 'enterprise',
      loadingKey: plan,
    });
  };

  const handleManageSubscription = async () => {
    setCheckoutLoading('portal');
    try {
      const response = await fetch('/api/paddle/portal', { method: 'POST' });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || t('portalFailed'));
      }
    } catch (err) {
      console.error('Portal error:', err);
      setError(t('portalFailed'));
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleConfirmPlanChange = async () => {
    if (!confirmPlanChange) return;
    const { plan } = confirmPlanChange;
    setConfirmPlanChange(null);
    setCheckoutLoading(plan);
    try {
      const response = await fetch('/api/paddle/update-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to update subscription');
        return;
      }

      startPolling(user?.plan || 'free');
    } catch (err) {
      console.error('Update subscription error:', err);
      setError('Failed to update subscription. Please try again.');
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleTopUp = async (credits: number) => {
    await openPaddleCheckout({
      type: 'topup',
      credits: credits as 50 | 200 | 500,
      loadingKey: `topup-${credits}`,
    });
  };

  // Format cent-based amounts from Paddle API (e.g. "1500" → "€15.00")
  const formatPreviewAmount = (amount: string, currency: string) => {
    const num = Number(amount) / 100;
    const symbol = currency === 'EUR' ? '€' : currency === 'USD' ? '$' : currency;
    return `${symbol}${num.toFixed(2)}`;
  };

  const formatPreviewDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  if (loading) {
    return (
      <AppLayout title="Billing">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      </AppLayout>
    );
  }

  const plans = planEntries.map((p, idx) => ({
    id: planIds[idx],
    nameKey: p.nameKey,
    price: p.priceLabel,
    periodKey: p.periodKey,
    credits: p.credits,
    features: p.features,
    icon: planConfig[planIds[idx]]?.icon || Zap,
    color: planConfig[planIds[idx]]?.color || 'text-gray-600 bg-gray-100',
    popular: 'popular' in p ? p.popular : false,
  }));

  const currentPlan = plans.find(p => p.id === user?.plan) || plans[0];
  const isCancelAtPeriodEnd = user?.subscription_status === 'cancel_at_period_end';
  const isCanceled = user?.subscription_status === 'canceled';

  return (
    <AppLayout title="Billing">
      <div className="p-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-600">{t('subtitle')}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Checkout processing overlay */}
        {checkoutLoading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            <div>
              <p className="text-blue-800 font-medium">Processing your subscription...</p>
              <p className="text-blue-600 text-sm mt-1">This page will update automatically once payment is confirmed.</p>
            </div>
          </div>
        )}

        {/* Plan Change Review Modal */}
        {confirmPlanChange && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {confirmPlanChange.isUpgrade ? (t('upgrade') || 'Upgrade') : (t('downgrade') || 'Downgrade')} to {confirmPlanChange.name}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {t('reviewChanges') || 'Review your plan change details below.'}
              </p>

              {previewLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                  <span className="ml-2 text-gray-600">Calculating proration...</span>
                </div>
              ) : previewData ? (
                <div className="space-y-3 mb-4">
                  {/* Proration charge/credit */}
                  {previewData.immediateCharge && (
                    <div className="bg-indigo-50 rounded-xl p-4">
                      <p className="text-xs font-medium text-indigo-600 uppercase tracking-wide">
                        {t('dueToday') || 'Due Today'}
                      </p>
                      <p className="text-2xl font-bold text-indigo-900 mt-1">
                        {formatPreviewAmount(previewData.immediateCharge.amount, previewData.immediateCharge.currency)}
                      </p>
                      <p className="text-xs text-indigo-600 mt-0.5">
                        {t('proratedForRemainingPeriod') || 'Prorated for the remaining billing period'}
                      </p>
                    </div>
                  )}

                  {/* Next renewal */}
                  {previewData.nextCharge && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        {t('nextRenewal') || 'Next Renewal'}
                      </p>
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        {formatPreviewAmount(previewData.nextCharge.amount, 'EUR')}
                      </p>
                      {previewData.nextCharge.date && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {t('onDate') || 'on'} {formatPreviewDate(previewData.nextCharge.date)}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Proration breakdown */}
                  {previewData.proration && (
                    <div className="text-xs text-gray-500 px-1">
                      {Number(previewData.proration.credit) > 0 && (
                        <p>✓ {t('creditForUnused') || 'Credit for unused time'}: {formatPreviewAmount(previewData.proration.credit, 'EUR')}</p>
                      )}
                      {Number(previewData.proration.charge) > 0 && (
                        <p>✓ {t('chargeForUpgrade') || 'Charge for upgrade'}: {formatPreviewAmount(previewData.proration.charge, 'EUR')}</p>
                      )}
                    </div>
                  )}

                  <p className="text-xs text-gray-400">
                    {t('creditsAlwaysPreserved') || 'Your top-up credits are always preserved across plan changes.'}
                  </p>
                </div>
              ) : (
                <div className="bg-yellow-50 rounded-xl p-4 mb-4">
                  <p className="text-sm text-yellow-800">
                    {t('planChangeInfo') || 'Switching plans takes effect immediately. You\'ll only be charged the prorated difference for the remaining billing period.'}
                  </p>
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => { setConfirmPlanChange(null); setPreviewData(null); }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmPlanChange}
                  disabled={checkoutLoading === confirmPlanChange.plan}
                  className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50 ${
                    confirmPlanChange.isUpgrade ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-600 hover:bg-gray-700'
                  }`}
                >
                  {checkoutLoading === confirmPlanChange.plan ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    `Confirm ${confirmPlanChange.isUpgrade ? (t('upgrade') || 'Upgrade') : (t('downgrade') || 'Downgrade')}`
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Subscription Status Alert */}
        {isCancelAtPeriodEnd && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-yellow-800 font-medium">{t('subscriptionEnding')}</p>
              <p className="text-yellow-700 text-sm mt-1">
                {t('subscriptionEndingDesc')} <strong>{formatDate(user?.subscription_current_period_end)}</strong>.
                {t('subscriptionAccess')} {t('toReactivate')}
              </p>
            </div>
          </div>
        )}

        {isCanceled && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <XCircle className="w-5 h-5 text-gray-500 mt-0.5" />
            <div>
              <p className="text-gray-700 font-medium">{t('subscriptionCanceled')}</p>
              <p className="text-gray-600 text-sm mt-1">
                {t('subscriptionCanceledDesc')} <strong>{formatDate(user?.subscription_canceled_at)}</strong>.
                {t('freePlanDesc')}
              </p>
            </div>
          </div>
        )}

        {/* Credits Overview Card */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 mb-8 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-indigo-200 text-sm font-medium">{t('currentPlan')}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-bold">{tp(currentPlan.nameKey)}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium uppercase ${
                  isCancelAtPeriodEnd ? 'bg-yellow-400/30 text-yellow-100' :
                  isCanceled ? 'bg-gray-400/30 text-gray-200' :
                  'bg-white/20'
                }`}>
                  {isCancelAtPeriodEnd ? t('ending') : isCanceled ? t('canceled') : t('active')}
                </span>
              </div>
            </div>
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <currentPlan.icon className="w-7 h-7" />
            </div>
          </div>

          {/* Credit Progress Bar */}
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-indigo-200">{t('creditsRemaining')}</span>
              <span className="text-lg font-bold">
                {`${user?.credits_remaining} / ${user?.credits_total}`}
              </span>
            </div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${getCreditPercentage()}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-indigo-200">
              <span>{user?.credits_used} {t('used')}</span>
              <span>{`${getCreditPercentage()}% ${t('remaining')}`}</span>
            </div>
          </div>

          {/* Top Up Credits */}
          <div className="mt-4 bg-white/10 rounded-lg p-4">
            <span className="text-sm text-indigo-200 block mb-3">{t('needMoreCredits')}</span>
            <div className="flex gap-2">
              <button
                onClick={() => handleTopUp(50)}
                className="flex-1 py-2 px-3 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white transition-all"
              >
                {t('topUp50')}
              </button>
              <button
                onClick={() => handleTopUp(200)}
                className="flex-1 py-2 px-3 bg-white/20 hover:bg-white/30 rounded-lg text-sm text-white font-medium transition-all"
              >
                {t('topUp200')}
              </button>
              <button
                onClick={() => handleTopUp(500)}
                className="flex-1 py-2 px-3 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white transition-all"
              >
                {t('topUp500')}
              </button>
            </div>
          </div>
        </div>

        {/* Manage Subscription */}
        {user?.plan !== 'free' && user?.paddle_customer_id && (
          <div className="mb-8">
            <button
              onClick={handleManageSubscription}
              disabled={checkoutLoading === 'portal'}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {checkoutLoading === 'portal' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CreditCard className="w-4 h-4" />
              )}
              {t('manageSubscription')}
            </button>
          </div>
        )}

        {/* Plan Cards */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">{t('changePlan')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => {
              const isCurrent = plan.id === user?.plan;
              const Icon = plan.icon;

              return (
                <div
                  key={plan.id}
                  className={`relative bg-white rounded-xl border-2 p-5 transition-shadow hover:shadow-md ${
                    isCurrent
                      ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                      : 'border-gray-200'
                  } ${plan.popular && !isCurrent ? 'border-indigo-300' : ''}`}
                >
                  {plan.popular && !isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-indigo-600 text-white text-xs font-medium rounded-full">
                      {t('mostPopular')}
                    </div>
                  )}

                  {isCurrent && (
                    <div className="absolute -top-3 right-4 px-3 py-1 bg-green-600 text-white text-xs font-medium rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      {t('current')}
                    </div>
                  )}

                  <div className={`w-12 h-12 ${plan.color} rounded-lg flex items-center justify-center mb-3`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className="font-bold text-gray-900">{tp(plan.nameKey)}</h3>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-sm text-gray-500">{tp(plan.periodKey)}</span>
                  </div>

                  <p className="text-sm text-gray-600 mt-2">
                    {plan.credits} {t('creditsPerMonth')}
                  </p>

                  <ul className="mt-4 space-y-2">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                        <Check className="w-4 h-4 text-green-500 shrink-0" />
                        {tp(feature)}
                      </li>
                    ))}
                  </ul>

                  {/* Subscribe / Upgrade / Downgrade Button */}
                  {plan.id !== 'free' && !isCurrent && (() => {
                    const planOrder = ['free', 'pro', 'enterprise'];
                    const isUpgrade = planOrder.indexOf(plan.id) > planOrder.indexOf(user?.plan || 'free');
                    return (
                      <button
                        onClick={() => handleSubscribe(plan.id)}
                        disabled={checkoutLoading === plan.id}
                        className={`mt-4 w-full py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
                          isUpgrade
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                        } disabled:opacity-50`}
                      >
                        {checkoutLoading === plan.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            {user?.plan === 'free'
                              ? t('subscribe')
                              : isUpgrade
                                ? t('upgrade') || 'Upgrade'
                                : t('downgrade') || 'Downgrade'}
                            <ArrowUpRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    );
                  })()}
                </div>
              );
            })}
          </div>
        </div>

        {/* Plan Change Info for existing subscribers */}
        {user?.plan !== 'free' && user?.paddle_customer_id && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 mt-6">
            <p className="text-blue-800 text-sm">
              {t('planChangeInfo') || 'Switching plans takes effect immediately. You\'ll only be charged the prorated difference for the remaining billing period. Your top-up credits are always preserved.'}
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
