// Stripe Billing Portal Configuration
// Run this once to configure the portal for subscription upgrades/downgrades

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
});

async function configureBillingPortal() {
  try {
    const configuration = await stripe.billingPortal.configurations.create({
      features: {
        subscription_update: {
          enabled: true,
          default_allowed: true,
          products: [
            {
              // Pro product
              product: process.env.STRIPE_PRO_PRODUCT_ID!,
              prices: [
                { price: process.env.STRIPE_PRO_PRICE_ID! },
              ],
            },
            {
              // Enterprise product (allow upgrade to this)
              product: process.env.STRIPE_ENTERPRISE_PRODUCT_ID!,
              prices: [
                { price: process.env.STRIPE_ENTERPRISE_PRICE_ID! },
              ],
            },
          ],
        },
        subscription_cancel: {
          enabled: true,
          mode: 'at_period_end',
        },
        payment_method_update: {
          enabled: true,
        },
        invoice_history: {
          enabled: true,
        },
      },
      business_profile: {
        headline: 'Zestio - PropertyPix Pro Subscription Management',
      },
    });

    console.log('✅ Billing portal configured successfully!');
    console.log('Configuration ID:', configuration.id);
    console.log('\nFeatures enabled:');
    console.log('  - Subscription upgrades/downgrades (Pro ↔ Enterprise)');
    console.log('  - Subscription cancellation (at period end)');
    console.log('  - Payment method updates');
    console.log('  - Invoice history');
    
  } catch (error) {
    console.error('Error configuring billing portal:', error);
    process.exit(1);
  }
}

configureBillingPortal();
