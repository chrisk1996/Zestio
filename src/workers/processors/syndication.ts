// Syndication Processor
// Handles posting listings to real estate portals

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SyndicationJob } from '../../lib/queue';

interface PortalConfig {
  name: string;
  apiBaseUrl: string;
  requiresOAuth: boolean;
  feedBased: boolean;
}

const PORTAL_CONFIGS: Record<string, PortalConfig> = {
  immobilienscout24: {
    name: 'ImmobilienScout24',
    apiBaseUrl: 'https://api.immobilienscout24.de/restapi/api/1.4',
    requiresOAuth: true,
    feedBased: false,
  },
  immowelt: {
    name: 'Immowelt',
    apiBaseUrl: 'https://api.immowelt.de',
    requiresOAuth: false,
    feedBased: true, // Uses OpenImmo XML feed
  },
  immonet: {
    name: 'Immonet',
    apiBaseUrl: 'https://api.immonet.de',
    requiresOAuth: false,
    feedBased: true,
  },
  ebay_kleinanzeigen: {
    name: 'eBay Kleinanzeigen',
    apiBaseUrl: 'https://api.ebay-kleinanzeigen.de',
    requiresOAuth: false,
    feedBased: false,
  },
};

export async function processSyndication(
  job: SyndicationJob,
  supabase: SupabaseClient
): Promise<{ success: boolean; portalListingId?: string; error?: string }> {
  const { listingId, agentId, portalName, syndicationLogId } = job;

  try {
    // Update status to processing
    await supabase
      .from('syndication_logs')
      .update({ status: 'processing', submitted_at: new Date().toISOString() })
      .eq('id', syndicationLogId);

    // Fetch listing details
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('*')
      .eq('id', listingId)
      .single();

    if (listingError || !listing) {
      throw new Error('Listing not found');
    }

    // Get portal credentials
    const { data: credentials, error: credError } = await supabase
      .from('portal_credentials')
      .select('*')
      .eq('agent_id', agentId)
      .eq('portal_name', portalName)
      .single();

    if (credError || !credentials) {
      throw new Error(`No credentials found for portal: ${portalName}`);
    }

    const config = PORTAL_CONFIGS[portalName];
    if (!config) {
      throw new Error(`Unknown portal: ${portalName}`);
    }

    let result: { portalListingId?: string; portalListingUrl?: string };

    if (config.feedBased) {
      // Feed-based portals (Immowelt, Immonet) - already handled via OpenImmo feed
      result = await syndicateViaFeed(listing, credentials, config);
    } else {
      // API-based portals (ImmoScout24, eBay Kleinanzeigen)
      result = await syndicateViaAPI(listing, credentials, config);
    }

    // Update success
    await supabase
      .from('syndication_logs')
      .update({
        status: 'success',
        portal_listing_id: result.portalListingId,
        portal_listing_url: result.portalListingUrl,
        completed_at: new Date().toISOString(),
      })
      .eq('id', syndicationLogId);

    // Update listing status if all syndications are successful
    await updateListingPublishStatus(supabase, listingId);

    return { success: true, portalListingId: result.portalListingId };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Update failure
    await supabase
      .from('syndication_logs')
      .update({
        status: 'failed',
        error_message: errorMessage,
        completed_at: new Date().toISOString(),
      })
      .eq('id', syndicationLogId);

    throw error;
  }
}

async function syndicateViaFeed(
  listing: any,
  credentials: any,
  config: PortalConfig
): Promise<{ portalListingId: string; portalListingUrl?: string }> {
  // For feed-based portals, the listing is already included in the OpenImmo feed
  // The portal periodically fetches the feed from /api/feeds/openimmo/[token]
  // We just need to ensure the listing is marked for syndication

  console.log(`[Syndication] Feed-based syndication for ${config.name}`);

  // In production, you might ping the portal to notify of new listing
  // or use their API to trigger a feed refresh

  return {
    portalListingId: `feed-${listing.id}`,
    portalListingUrl: `${config.apiBaseUrl}/listing/${listing.id}`,
  };
}

async function syndicateViaAPI(
  listing: any,
  credentials: any,
  config: PortalConfig
): Promise<{ portalListingId: string; portalListingUrl?: string }> {
  console.log(`[Syndication] API-based syndication for ${config.name}`);

  if (config.requiresOAuth) {
    // Check if token is expired and refresh if needed
    if (credentials.expires_at && new Date(credentials.expires_at) < new Date()) {
      console.log(`[Syndication] Token expired for ${config.name}, refresh needed`);
      // In production, implement OAuth refresh flow here
      throw new Error('OAuth token expired - reconnection required');
    }
  }

  // API-specific implementation would go here
  // For ImmoScout24, you'd use their REST API
  // For eBay Kleinanzeigen, you'd use their publishing API

  // Placeholder implementation
  const portalListingId = `api-${Date.now()}`;

  return {
    portalListingId,
    portalListingUrl: `${config.apiBaseUrl}/listing/${portalListingId}`,
  };
}

async function updateListingPublishStatus(
  supabase: SupabaseClient,
  listingId: string
): Promise<void> {
  // Check if all syndications for this listing are successful
  const { data: logs } = await supabase
    .from('syndication_logs')
    .select('status')
    .eq('listing_id', listingId);

  const allSuccess = logs?.every(log => log.status === 'success');
  const anyFailed = logs?.some(log => log.status === 'failed');

  if (allSuccess) {
    await supabase
      .from('listings')
      .update({
        publish_status: 'published',
        published_at: new Date().toISOString(),
      })
      .eq('id', listingId);
  } else if (anyFailed) {
    // Keep as pending if any failed
  }
}
