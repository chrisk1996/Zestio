/**
 * Credit costs for different features
 * 
 * Based on Replicate API costs:
 * - Photo Enhancement: ~$0.03-0.04 (SDXL)
 * - Virtual Staging: ~$0.03-0.05 (SDXL with prompts)
 * - Floor Plan 3D: ~$0.02-0.03 (Vision model)
 * - Video Generation: ~$0.50-1.00 (Stable Video Diffusion - most expensive!)
 */

export const CREDIT_COSTS = {
  // Image enhancement - standard cost
  ENHANCE: 1,
  
  // Virtual staging - slightly more expensive (complex prompts)
  STAGING: 2,
  
  // Floor plan 3D - standard cost
  FLOORPLAN: 1,
  
  // Video generation - 3 credits (most expensive, ~$0.50-1.00 per run)
  VIDEO: 3,
} as const;

export type FeatureType = keyof typeof CREDIT_COSTS;

/**
 * Get the credit cost for a feature
 */
export function getCreditCost(feature: FeatureType): number {
  return CREDIT_COSTS[feature];
}

/**
 * Check if user has enough credits for a feature
 */
export function hasEnoughCredits(remaining: number, feature: FeatureType): boolean {
  return remaining >= CREDIT_COSTS[feature];
}

/**
 * Get feature name for display
 */
export function getFeatureName(feature: FeatureType): string {
  const names: Record<FeatureType, string> = {
    ENHANCE: 'Photo Enhancement',
    STAGING: 'Virtual Staging',
    FLOORPLAN: 'Floor Plan 3D',
    VIDEO: 'Video Generation',
  };
  return names[feature];
}
