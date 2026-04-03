import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';

export const dynamic = 'force-dynamic';

import { createClient } from '@/utils/supabase/server';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

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

// Map room types to prompt keywords
const ROOM_PROMPTS: Record<string, string> = {
  living: 'living room with comfortable sofa, coffee table, entertainment center, rug, lamps',
  bedroom: 'bedroom with bed, nightstands, dresser, lamp, cozy bedding',
  dining: 'dining room with dining table, chairs, chandelier, sideboard',
  office: 'home office with desk, office chair, bookshelf, computer, lamp',
  kitchen: 'kitchen with countertops, appliances, dining area, modern fixtures',
};

// Map styles to prompt keywords
const STYLE_PROMPTS: Record<string, string> = {
  modern: 'modern contemporary furniture, clean lines, neutral colors, sleek design',
  scandinavian: 'scandinavian style, light wood, white and beige, minimalist, cozy hygge',
  luxury: 'luxury high-end furniture, elegant, premium materials, sophisticated design',
  minimalist: 'minimalist furniture, simple clean design, uncluttered, zen aesthetic',
  industrial: 'industrial style, metal and wood, exposed elements, urban loft aesthetic',
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
    const { image, roomType, furnitureStyle, model } = body;

    if (!image || !roomType || !furnitureStyle) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Build the staging prompt
    const roomPrompt = ROOM_PROMPTS[roomType] || ROOM_PROMPTS.living;
    const stylePrompt = STYLE_PROMPTS[furnitureStyle] || STYLE_PROMPTS.modern;
    
    const prompt = `${roomPrompt}, ${stylePrompt}, professional real estate photography, well-lit, high quality, interior design magazine`;
    const negativePrompt = 'empty room, unfurnished, blurry, low quality, distorted, overexposed, underexposed, noisy, pixelated, watermark, text';

    // Use FLUX Depth Pro for virtual staging (preserves room structure)
    // Model ID: flux-depth-pro
    const modelName = model === 'flux-kontext' 
      ? 'black-forest-labs/flux-depth-pro'
      : 'black-forest-labs/flux-depth-pro';

    console.log('Calling Replicate for virtual staging:', { roomType, furnitureStyle, model: modelName });

    const result = await replicate.run(
      modelName,
      {
        input: {
          control_image: image,
          prompt: prompt,
          num_inference_steps: 28,
          guidance_scale: 3.5,
        },
      }
    );

    // Handle different output formats from Replicate
    let resultUrl: string;
    if (typeof result === 'string') {
      resultUrl = result;
    } else if (Array.isArray(result) && result.length > 0) {
      resultUrl = String(result[0]);
    } else if (result && typeof result === 'object') {
      const out = result as Record<string, unknown>;
      resultUrl = String(out.url || out.output || JSON.stringify(result));
    } else {
      resultUrl = String(result);
    }

    if (!resultUrl || resultUrl === '[object Object]') {
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
      { error: error instanceof Error ? error.message : 'Virtual staging failed' },
      { status: 500 }
    );
  }
}
