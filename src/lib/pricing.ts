// Centralized pricing configuration
// Single source of truth for all credit costs and plan details
// Display strings are translation keys — resolved via i18n

export const CREDIT_COSTS = {
  ENHANCE_BASIC: 1,     // Auto, HDR, Sharpen, Denoise
  ENHANCE_PREMIUM: 2,   // Sky Replace, Season, Staging, Object Removal
  UPSCALE: 2,           // AI upscaling to 4K
  VIDEO_GENERATION: 5,  // Full pipeline: sort → stage → animate → stitch
  LISTING_DESCRIPTION: 0, // Free
  SMART_CAPTIONS: 0,    // Free
  SOCIAL_KIT: 0,        // Free
} as const;

// Plan data — features are i18n keys (resolved in components via t())
export const PLANS = {
  free: {
    nameKey: 'pricing.free',
    price: 0,
    priceLabel: '€0',
    periodKey: 'pricing.forever',
    credits: 5,
    descriptionKey: 'pricing.freeDesc',
    features: [
      'pricing.freeFeature1',
      'pricing.freeFeature2',
      'pricing.freeFeature3',
      'pricing.freeFeature4',
      'pricing.freeFeature5',
    ],
  },
  pro: {
    nameKey: 'pricing.pro',
    price: 29,
    priceLabel: '€29',
    periodKey: 'pricing.perMonth',
    credits: 100,
    descriptionKey: 'pricing.proDesc',
    features: [
      'pricing.proFeature1',
      'pricing.proFeature2',
      'pricing.proFeature3',
      'pricing.proFeature4',
      'pricing.proFeature5',
      'pricing.proFeature6',
      'pricing.proFeature7',
      'pricing.proFeature8',
    ],
    popular: true,
  },
  enterprise: {
    nameKey: 'pricing.enterprise',
    price: 99,
    priceLabel: '€99',
    periodKey: 'pricing.perMonth',
    credits: 500,
    descriptionKey: 'pricing.enterpriseDesc',
    features: [
      'pricing.enterpriseFeature1',
      'pricing.enterpriseFeature2',
      'pricing.enterpriseFeature3',
      'pricing.enterpriseFeature4',
      'pricing.enterpriseFeature5',
    ],
  },
} as const;

// Credit top-up packs
export const TOP_UP_PACKS = [
  { credits: 50, price: 9, labelKey: 'pricing.topUp50', priceLabel: '€9', perCredit: '€0.18' },
  { credits: 200, price: 29, labelKey: 'pricing.topUp200', priceLabel: '€29', perCredit: '€0.145', popular: true },
  { credits: 500, price: 59, labelKey: 'pricing.topUp500', priceLabel: '€59', perCredit: '€0.118' },
] as const;

// What each credit buys (for display) — i18n keys
export const CREDIT_BREAKDOWN = [
  { actionKey: 'pricing.breakdownBasic', cost: 1, noteKey: 'pricing.breakdownBasicNote' },
  { actionKey: 'pricing.breakdownPremium', cost: 2, noteKey: 'pricing.breakdownPremiumNote' },
  { actionKey: 'pricing.breakdownStaging', cost: 2, noteKey: 'pricing.breakdownStagingNote' },
  { actionKey: 'pricing.breakdownVideo', cost: 5, noteKey: 'pricing.breakdownVideoNote' },
  { actionKey: 'pricing.breakdownListing', cost: 0, noteKey: 'pricing.breakdownListingNote' },
  { actionKey: 'pricing.breakdownCaptions', cost: 0, noteKey: 'pricing.breakdownCaptionsNote' },
] as const;
