import { PLANS } from './pricing';

/**
 * Centralized credit state for a user.
 *
 * Model A: credits = remaining balance (decremented on use).
 * `used` = consumed this billing period (for display, reset monthly).
 * `total` = plan allocation (for progress bars / "X of Y" display).
 */
export interface CreditState {
  /** Remaining spendable credits */
  remaining: number;
  /** Credits used this billing period */
  used: number;
  /** Plan credit allocation (e.g. 5 for free, 100 for pro, 500 for enterprise) */
  total: number;
  /** Subscription tier */
  plan: string;
}

/**
 * Get the credit allocation for a plan tier.
 */
export function getPlanCredits(tier: string): number {
  return (PLANS as Record<string, { credits: number }>)[tier]?.credits ?? 5;
}

/**
 * Shared function to compute credit state from zestio_users row.
 * Use this everywhere — pages, API routes, components.
 *
 * @param row - A row from `zestio_users` with at least `credits`, `used_credits`, `subscription_tier`
 */
export function computeCreditState(row: {
  credits: number | null;
  used_credits: number | null;
  subscription_tier: string | null;
}): CreditState {
  const plan = row.subscription_tier || 'free';
  return {
    remaining: row.credits ?? getPlanCredits(plan),
    used: row.used_credits ?? 0,
    total: getPlanCredits(plan),
    plan,
  };
}

/**
 * Check if a user has enough credits for an action.
 */
export function hasCredits(state: CreditState, cost: number): boolean {
  return state.remaining >= cost;
}
