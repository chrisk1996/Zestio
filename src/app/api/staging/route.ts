import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { createClient } from '@/utils/supabase/server';

// Decor8.ai API for proper virtual staging (preserves architecture)
const DECOR8_API_URL = 'https://api.decor8.ai/v1/generate_designs_for_room';

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW = 60 * 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }
  if (record.count >= RATE_LIMIT) return false;
  record.count++;
  return true;
}

// Map our room types to Decor8 room types
const ROOM_TYPE_MAP: Record<string, string> = {
  living: 'livingroom',
  bedroom: 'bedroom',
  dining: 'diningroom',
  office: 'office',
  kitchen: 'kitchen',
};

// Map our styles to Decor8 styles
const STYLE_MAP: Record<string, string> = {
  modern: 'modern',
  scandinavian: 'scandinavian',
  luxury: 'luxemodern',
  minimalist: 'minimalist',
  industrial: 'industrial',
};

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { image, roomType, furnitureStyle } = body;

    if (!image || !roomType || !furnitureStyle) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const decor8RoomType = ROOM_TYPE_MAP[roomType] || 'livingroom';
    const decor8Style = STYLE_MAP[furnitureStyle] || 'modern';

    // Call Decor8.ai API - specialized for virtual staging
    // This API is designed to preserve architectural elements
    const response = await fetch(DECOR8_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DECOR8_API_KEY}`,
      },
      body: JSON.stringify({
        input_image_url: image,
        room_type: decor8RoomType,
        design_style: decor8Style,
        num_images: 1,
        scale_factor: 2, // Max 1536px, no extra charge
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Decor8 API error:', errorData);
      
      // Fallback to FLUX if Decor8 fails
      if (response.status === 401 || response.status === 403) {
        return NextResponse.json({ 
          error: 'Virtual staging service unavailable. Please try again later or contact support.' 
        }, { status: 503 });
      }
      
      throw new Error(errorData.message || 'Virtual staging failed');
    }

    const data = await response.json();
    
    // Decor8 returns array of image URLs
    const resultUrl = Array.isArray(data.images) ? data.images[0] : data.image || data.output;

    if (!resultUrl) {
      throw new Error('No output from virtual staging service');
    }

    // Deduct credits (2 credits for virtual staging)
    const { data: userData } = await supabase
      .from('propertypix_users')
      .select('credits, used_credits')
      .eq('id', user.id)
      .single();

    if (userData) {
      await supabase
        .from('propertypix_users')
        .update({
          credits: Math.max(0, userData.credits - 2),
          used_credits: userData.used_credits + 2,
        })
        .eq('id', user.id);
    }

    return NextResponse.json({
      success: true,
      output: resultUrl,
      roomType,
      furnitureStyle,
      creditsUsed: 2,
    });

  } catch (error) {
    console.error('Virtual staging error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Staging failed' },
      { status: 500 }
    );
  }
}
