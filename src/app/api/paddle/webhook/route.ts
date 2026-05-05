// Paddle Webhook Handler — no SDK dependency for fast cold starts
// Verifies signature using native crypto, parses JSON directly

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logCreditTransaction } from '@/lib/credit-transactions';
import { getPlanCredits } from '@/lib/credits-shared';
import {
  isPaddleConfigured,
  getPaddle,
  getPlanFromPriceId,
  getTopupCreditsFromPriceId,
  unmarshal,
} from '@/lib/paddle';

export const dynamic = 'force-dynamic';

// Lazy-init Supabase admin client
let supabaseAdmin: ReturnType<typeof createClient> | null = null;
function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('Missing Supabase env vars');
    supabaseAdmin = createClient(url, key);
  }
  return supabaseAdmin;
}

export async function POST(request: NextRequest) {
  console.log('[Paddle] Webhook received');

  if (!isPaddleConfigured()) {
    return NextResponse.json({ error: 'Paddle not configured' }, { status: 503 });
  }

  const secret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!secret) {
    console.error('[Paddle] PADDLE_WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  const requestBody = await request.text();
  const signature = request.headers.get('paddle-signature') || '';

  let parsed: any;
  try {
    parsed = await unmarshal(requestBody, secret, signature);
  } catch (err) {
    console.error('[Paddle] Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const eventType = parsed.eventType;
  const data = parsed.data;

  const admin = getSupabaseAdmin();
  console.log(`[Paddle] Processing event: ${eventType}`);

  try {
    switch (eventType) {
      case 'transaction.completed': {
        const customData = data.customData || {};
        const userId = customData.user_id;
        const type = customData.type;
        const customerId = data.customerId;

        console.log(
          `[Paddle] Transaction completed — userId: ${userId}, type: ${type}, txId: ${data.id}, customerId: ${customerId}`,
        );

        // If no userId in customData, look up by paddle_customerId
        let resolvedUserId = userId;
        if (!resolvedUserId && customerId) {
          const { data: lookupUser } = await admin
            .from('zestio_users')
            .select('id')
            .eq('paddle_customerId', customerId)
            .single();
          resolvedUserId = lookupUser?.id;
          console.log(`[Paddle] Resolved userId from customerId: ${resolvedUserId}`);
        }

        if (!resolvedUserId) {
          console.warn('[Paddle] No user_id found, skipping');
          break;
        }

        if (type === 'topup') {
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
              console.log(`[Paddle] Top-up: added ${topUpAmount} credits. New total: ${newCredits}`);
              logCreditTransaction({
                userId: resolvedUserId,
                type: 'topup',
                amount: topUpAmount,
                description: `${topUpAmount} credit top-up (Paddle)`,
                paymentReference: data.id,
              });
            }
          }
        } else if (type === 'subscription') {
          const plan = customData.plan || 'pro';
          const planCredits = getPlanCredits(plan);

          // Also save subscription_id
          const subscriptionId = data.subscriptionId || null;

          const { error: updateError } = await admin
            .from('zestio_users')
            .update({
              subscription_tier: plan,
              subscription_status: 'active',
              credits: planCredits,
              used_credits: 0,
              paddle_subscription_id: subscriptionId,
              subscription_cancel_at: null,
              subscription_canceled_at: null,
            })
            .eq('id', resolvedUserId);

          if (updateError) {
            console.error('[Paddle] Failed to update subscription:', updateError);
          } else {
            console.log(`[Paddle] Subscription activated for user ${resolvedUserId}: ${plan}`);
            logCreditTransaction({
              userId: resolvedUserId,
              type: 'subscription',
              amount: planCredits,
              description: `${plan} plan — monthly credits (Paddle)`,
              paymentReference: data.id,
            });
          }
        } else {
          // Try to determine type from line items
          const items = data.details?.lineItems || [];
          for (const item of items) {
            const priceId = item.priceId || item.price?.id;
            const plan = getPlanFromPriceId(priceId);
            const topupCredits = getTopupCreditsFromPriceId(priceId);

            if (topupCredits) {
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
                  userId: resolvedUserId,
                  type: 'topup',
                  amount: topupCredits,
                  description: `${topupCredits} credit top-up (Paddle)`,
                  paymentReference: data.id,
                });
              }
            } else if (plan !== 'free') {
              const planCredits = getPlanCredits(plan);
              const { data: userData } = await admin
                .from('zestio_users')
                .select('credits, subscription_tier')
                .eq('id', resolvedUserId)
                .single();

              if (userData) {
                const previousPlanCredits = getPlanCredits(userData.subscription_tier || 'free');
                const extraCredits = Math.max(0, (userData.credits || 0) - previousPlanCredits);
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
                  userId: resolvedUserId,
                  type: 'reset',
                  amount: planCredits,
                  description: `Monthly credit reset (${plan}) — ${extraCredits} top-up credits preserved (Paddle)`,
                  paymentReference: data.id,
                });
              }
            }
          }
        }
        break;
      }

      case 'transaction.payment_failed': {
        console.warn(`[Paddle] Payment failed — txId: ${data.id}, customerId: ${data.customerId}`);
        break;
      }

      case 'subscription.created': {
        const customerId = data.customerId;
        const priceId = data.items?.[0]?.price?.id;
        const plan = priceId ? getPlanFromPriceId(priceId) : 'pro';
        const planCredits = getPlanCredits(plan);

        const { data: user } = await admin
          .from('zestio_users')
          .select('id, paddle_subscription_id')
          .eq('paddle_customerId', customerId)
          .single();

        if (user) {
          // Cancel any previous subscription to prevent duplicates
          if (user.paddle_subscription_id && user.paddle_subscription_id !== data.id) {
            try {
              const paddle = await getPaddle();
              await paddle.subscriptions.cancel(user.paddle_subscription_id);
              console.log(`[Paddle] Canceled previous subscription: ${user.paddle_subscription_id}`);
            } catch (cancelErr) {
              console.warn(`[Paddle] Failed to cancel previous subscription ${user.paddle_subscription_id}:`, cancelErr);
            }
          }

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
        const customerId = data.customerId;
        const priceId = data.items?.[0]?.price?.id;
        const newPlan = priceId ? getPlanFromPriceId(priceId) : 'pro';
        const status = data.status;
        const scheduledChange = data.scheduledChange;

        const effectivePlan =
          status === 'canceled' || status === 'expired' ? 'free' : newPlan;
        const effectiveStatus =
          scheduledChange?.action === 'cancel' ? 'cancel_at_period_end' : status;

        const { data: user } = await admin
          .from('zestio_users')
          .select('id, subscription_tier, credits, used_credits')
          .eq('paddle_customerId', customerId)
          .single();

        if (user) {
          const previousPlan = user.subscription_tier || 'free';

          if (effectivePlan === 'free') {
            // Subscription canceled/expired — keep credits (user already paid)
            await admin
              .from('zestio_users')
              .update({
                subscription_tier: 'free',
                subscription_status: effectiveStatus,
                paddle_subscription_id: status === 'expired' ? null : data.id,
                ...(scheduledChange?.action === 'cancel' && {
                  subscription_cancel_at: scheduledChange.effective_at,
                }),
              })
              .eq('id', user.id);
          } else if (previousPlan !== effectivePlan) {
            // Plan change — grant new plan credits, preserve any top-up credits
            const previousPlanCredits = getPlanCredits(previousPlan);
            const extraCredits = Math.max(0, (user.credits || 0) - previousPlanCredits);
            const newPlanCredits = getPlanCredits(effectivePlan);
            const totalCredits = newPlanCredits + extraCredits;

            await admin
              .from('zestio_users')
              .update({
                subscription_tier: effectivePlan,
                subscription_status: effectiveStatus,
                credits: totalCredits,
                used_credits: 0,
                ...(scheduledChange?.action === 'cancel' && {
                  subscription_cancel_at: scheduledChange.effective_at,
                }),
              })
              .eq('id', user.id);

            logCreditTransaction({
              userId: user.id,
              type: 'reset',
              amount: newPlanCredits,
              description: `Plan changed ${previousPlan} → ${effectivePlan}. ${newPlanCredits} plan credits + ${extraCredits} preserved top-up credits = ${totalCredits} total.`,
              paymentReference: data.id,
            });
          } else {
            // Same plan, just status update
            await admin
              .from('zestio_users')
              .update({
                subscription_status: effectiveStatus,
                ...(scheduledChange?.action === 'cancel' && {
                  subscription_cancel_at: scheduledChange.effective_at,
                }),
              })
              .eq('id', user.id);
          }

          console.log(
            `[Paddle] Subscription updated: ${data.id} for user ${user.id}, plan: ${effectivePlan}, status: ${effectiveStatus}`,
          );
        }
        break;
      }

      case 'subscription.canceled': {
        const customerId = data.customerId;

        const { data: user } = await admin
          .from('zestio_users')
          .select('id, subscription_tier, credits')
          .eq('paddle_customerId', customerId)
          .single();

        if (user) {
          // Keep credits — user already paid for them
          await admin
            .from('zestio_users')
            .update({
              subscription_tier: 'free',
              subscription_status: 'canceled',
              paddle_subscription_id: null,
              subscription_cancel_at: null,
              subscription_canceled_at: new Date().toISOString(),
            })
            .eq('id', user.id);

          console.log(
            `[Paddle] Subscription canceled for user ${user.id}, was: ${user.subscription_tier}. Credits preserved: ${user.credits}`,
          );
        }
        break;
      }

      case 'subscription.past_due': {
        console.warn(
          `[Paddle] Subscription past due — subId: ${data.id}, customerId: ${data.customerId}`,
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
