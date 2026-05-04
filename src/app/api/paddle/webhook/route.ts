// Paddle Webhook Handler
// Handles Paddle webhook events to sync subscription status and credit top-ups

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logCreditTransaction } from '@/lib/credit-transactions';
import { getPlanCredits } from '@/lib/credits-shared';
import {
  isPaddleConfigured,
  getPlanFromPriceId,
  getTopupCreditsFromPriceId,
} from '@/lib/paddle';

export const dynamic = 'force-dynamic';

// Lazy-initialize Supabase admin client
let supabaseAdmin: ReturnType<typeof createClient> | null = null;
function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error('Missing Supabase environment variables');
    }
    supabaseAdmin = createClient(url, key);
  }
  return supabaseAdmin;
}

export async function POST(request: NextRequest) {
  console.log('[Paddle] Webhook received');
  const startTime = Date.now();
  if (!isPaddleConfigured()) {
    return NextResponse.json({ error: 'Paddle not configured' }, { status: 503 });
  }

  const secret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!secret) {
    console.error('[Paddle] PADDLE_WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  // Body must be raw text for signature verification
  const requestBody = await request.text();
  const signature = request.headers.get('paddle-signature') || '';

  try {
    // Dynamic import + unmarshal — do it inline to avoid double lazy init
    console.log('[Paddle] Importing SDK...');
    const { Paddle, Environment } = await import('@paddle/paddle-node-sdk');
    console.log('[Paddle] SDK imported in', Date.now() - startTime, 'ms');
    const paddle = new Paddle(process.env.PADDLE_API_KEY!, {
      environment: process.env.NEXT_PUBLIC_PADDLE_ENV === 'production' ? Environment.production : Environment.sandbox,
    });
    const eventData = paddle.webhooks.unmarshal(requestBody, secret, signature);
    console.log('[Paddle] Unmarshal done in', Date.now() - startTime, 'ms');
  } catch (err) {
    console.error('[Paddle] Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  const eventType = eventData.eventType;
  const data = eventData.data;

  try {
    switch (eventType) {
      case 'transaction.completed': {
        const customData = data.customData || data.custom_data || {};
        const userId = customData.user_id;
        const type = customData.type;
        const customerId = data.customerId || data.customer_id || data.customer_id;

        console.log(
          `[Paddle] Transaction completed — userId: ${userId}, type: ${type}, txId: ${data.id}, customerId: ${customerId}`,
        );

        // If no userId in customData, try to look up user by paddle_customer_id
        let resolvedUserId = userId;
        if (!resolvedUserId && customerId) {
          const { data: lookupUser } = await admin
            .from('zestio_users')
            .select('id')
            .eq('paddle_customer_id', customerId)
            .single();
          resolvedUserId = lookupUser?.id;
          console.log(`[Paddle] Resolved userId from customerId: ${resolvedUserId}`);
        }

        if (!resolvedUserId) {
          console.warn('[Paddle] No user_id in custom_data and no customer match, skipping');
          break;
        }

        if (type === 'topup') {
          // ── Credit top-up ──
          const topUpAmount = parseInt(customData.credits, 10);
          if (!topUpAmount || isNaN(topUpAmount)) {
            console.error('[Paddle] Invalid top-up credits:', customData.credits);
            break;
          }

          const { data: userData } = await admin
            .from('zestio_users')
            .select('credits')
            .eq('id', resolvedUserId)
            .single();

          if (userData) {
            const newCredits = (userData.credits || 0) + topUpAmount;
            const { error: updateError } = await admin
              .from('zestio_users')
              .update({ credits: newCredits })
              .eq('id', resolvedUserId);

            if (updateError) {
              console.error('[Paddle] Top-up failed:', updateError);
            } else {
              console.log(
                `[Paddle] Top-up: added ${topUpAmount} credits to user ${userId}. New total: ${newCredits}`,
              );
              logCreditTransaction({
                userId,
                type: 'topup',
                amount: topUpAmount,
                description: `${topUpAmount} credit top-up (Paddle)`,
              });
            }
          }
        } else if (type === 'subscription') {
          // ── New subscription checkout ──
          const plan = customData.plan || 'pro';
          const planCredits = getPlanCredits(plan);

          const { error: updateError } = await admin
            .from('zestio_users')
            .update({
              subscription_tier: plan,
              subscription_status: 'active',
              credits: planCredits,
              used_credits: 0,
              subscription_cancel_at: null,
              subscription_canceled_at: null,
            })
            .eq('id', resolvedUserId);

          if (updateError) {
            console.error('[Paddle] Failed to update subscription:', updateError);
          } else {
            console.log(`[Paddle] Subscription created for user ${userId}: ${plan}`);
            logCreditTransaction({
              userId,
              type: 'subscription',
              amount: planCredits,
              description: `${plan} plan — monthly credits (Paddle)`,
            });
          }
        } else {
          // Try to determine type from line items (subscription renewal)
          const items = data.details?.lineItems || [];
          for (const item of items) {
            const plan = getPlanFromPriceId(item.price?.id || '');
            const topupCredits = getTopupCreditsFromPriceId(item.price?.id || '');

            if (topupCredits) {
              // It's a top-up
              const { data: userData } = await admin
                .from('zestio_users')
                .select('credits')
                .eq('id', resolvedUserId)
                .single();

              if (userData) {
                const newCredits = (userData.credits || 0) + topupCredits;
                await admin
                  .from('zestio_users')
                  .update({ credits: newCredits })
                  .eq('id', resolvedUserId);
                logCreditTransaction({
                  userId,
                  type: 'topup',
                  amount: topupCredits,
                  description: `${topupCredits} credit top-up (Paddle)`,
                });
              }
            } else if (plan !== 'free' && userId) {
              // Subscription payment — reset credits
              const planCredits = getPlanCredits(plan);
              const { data: userData } = await admin
                .from('zestio_users')
                .select('credits, subscription_tier')
                .eq('id', resolvedUserId)
                .single();

              if (userData) {
                const previousPlanCredits = getPlanCredits(userData.subscription_tier || 'free');
                const extraCredits = Math.max(
                  0,
                  (userData.credits || 0) - previousPlanCredits,
                );
                const newTotalCredits = planCredits + extraCredits;

                await admin
                  .from('zestio_users')
                  .update({
                    subscription_tier: plan,
                    subscription_status: 'active',
                    used_credits: 0,
                    credits: newTotalCredits,
                  })
                  .eq('id', resolvedUserId);

                logCreditTransaction({
                  userId,
                  type: 'reset',
                  amount: planCredits,
                  description: `Monthly credit reset (${plan}) — ${extraCredits} top-up credits preserved (Paddle)`,
                });
              }
            }
          }
        }
        break;
      }

      case 'transaction.payment_failed': {
        console.warn(
          `[Paddle] Payment failed — txId: ${data.id}, customerId: ${data.customerId || data.customer_id}`,
        );
        break;
      }

      case 'subscription.created': {
        const customerId = data.customerId || data.customer_id;
        const priceId = data.items?.[0]?.price?.id;
        const plan = priceId ? getPlanFromPriceId(priceId) : 'pro';
        const planCredits = getPlanCredits(plan);

        // Look up user by paddle_customer_id
        const { data: user } = await admin
          .from('zestio_users')
          .select('id')
          .eq('paddle_customer_id', customerId)
          .single();

        if (user) {
          await admin
            .from('zestio_users')
            .update({
              subscription_tier: plan,
              subscription_status: 'active',
              credits: planCredits,
              used_credits: 0,
              paddle_subscription_id: data.id,
            })
            .eq('id', user.id);

          console.log(`[Paddle] Subscription created: ${data.id} for user ${user.id}, plan: ${plan}`);
        }
        break;
      }

      case 'subscription.updated': {
        const customerId = data.customerId || data.customer_id;
        const priceId = data.items?.[0]?.price?.id;
        const plan = priceId ? getPlanFromPriceId(priceId) : 'pro';
        const status = data.status;
        const scheduledChange = data.scheduledChange;
        const effectivePlan =
          status === 'canceled' || status === 'expired' ? 'free' : plan;
        const effectiveStatus =
          scheduledChange?.action === 'cancel' ? 'cancel_at_period_end' : status;

        const { data: user } = await admin
          .from('zestio_users')
          .select('id')
          .eq('paddle_customer_id', customerId)
          .single();

        if (user) {
          await admin
            .from('zestio_users')
            .update({
              subscription_tier: effectivePlan,
              subscription_status: effectiveStatus,
              credits:
                effectivePlan === 'free'
                  ? getPlanCredits('free')
                  : getPlanCredits(plan),
              ...(scheduledChange?.action === 'cancel' && {
                subscription_cancel_at: scheduledChange.effectiveAt,
              }),
            })
            .eq('id', user.id);

          console.log(
            `[Paddle] Subscription updated: ${data.id} for user ${user.id}, plan: ${effectivePlan}, status: ${effectiveStatus}`,
          );
        }
        break;
      }

      case 'subscription.canceled': {
        const customerId = data.customerId || data.customer_id;

        const { data: user } = await admin
          .from('zestio_users')
          .select('id, subscription_tier')
          .eq('paddle_customer_id', customerId)
          .single();

        if (user) {
          await admin
            .from('zestio_users')
            .update({
              subscription_tier: 'free',
              subscription_status: 'canceled',
              credits: getPlanCredits('free'),
              paddle_subscription_id: null,
              subscription_cancel_at: null,
              subscription_current_period_end: null,
              subscription_canceled_at: new Date().toISOString(),
            })
            .eq('id', user.id);

          console.log(
            `[Paddle] Subscription canceled for user ${user.id}, was: ${user.subscription_tier}`,
          );
        }
        break;
      }

      case 'subscription.past_due': {
        console.warn(
          `[Paddle] Subscription past due — subId: ${data.id}, customerId: ${data.customerId || data.customer_id}`,
        );
        break;
      }

      default:
        console.log(`[Paddle] Unhandled event type: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Paddle] Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
