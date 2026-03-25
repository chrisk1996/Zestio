import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { generateOpenImmoXML } from '@/lib/openimmo';

export const dynamic = 'force-dynamic';

// GET /api/feeds/openimmo/[token] - OpenImmo XML feed for agent
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const supabase = await createClient();
    const { token } = params;

    // Look up agent by feed token
    const { data: credentials, error: credError } = await supabase
      .from('portal_credentials')
      .select('agent_id')
      .eq('portal', 'openimmo_feed')
      .eq('access_token', token)
      .single();

    if (credError || !credentials) {
      return new NextResponse('Invalid feed token', { status: 404 });
    }

    // Get all active listings for this agent
    const { data: listings, error: listingsError } = await supabase
      .from('listings')
      .select('*')
      .eq('agent_id', credentials.agent_id)
      .in('publish_status', ['published', 'archived']);

    if (listingsError) {
      console.error('Failed to fetch listings:', listingsError);
      return new NextResponse('Failed to generate feed', { status: 500 });
    }

    // Generate XML
    const xml = generateOpenImmoXML(listings || [], credentials.agent_id);

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600', // 1 hour cache
      },
    });
  } catch (error) {
    console.error('OpenImmo feed error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
