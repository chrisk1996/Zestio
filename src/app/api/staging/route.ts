import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';
export const dynamic = 'force-dynamic';
import { createClient } from '@/utils/supabase/server';

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN! });


// Helper: Convert data URL to File and upload to Supabase storage
async function uploadImageToStorage(supabase: any, userId: string, dataUrl: string): Promise<string> {
  // Extract base64 data from data URL
  const matches = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!matches) {
    throw new Error('Invalid image data URL format');
  }

  const extension = matches[1];
  const base64Data = matches[2];

  // Convert base64 to buffer
  const buffer = Buffer.from(base64Data, 'base64');

  // Generate unique filename
  const filename = `staged/${userId}/${Date.now()}.${extension}`;

  // Upload to Supabase storage
  const { data, error } = await supabase.storage
    .from('images')
    .upload(filename, buffer, {
      contentType: `image/${extension}`,
      upsert: true,
    });

  if (error) {
    console.error('Supabase upload error:', error);
    throw new Error('Failed to upload image to storage');
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('images')
    .getPublicUrl(filename);

  return urlData.publicUrl;
}

// Room type prompts for virtual staging
const ROOM_PROMPTS: Record<string, string> = {
  living: 'furnished living room with comfortable sofa, coffee table, rug, lamps, wall art, plants, curtains',
  bedroom: 'furnished bedroom with bed, nightstands, lamps, dresser, rug, curtains, pillows',
  kitchen: 'furnished kitchen with dining table, chairs, countertop decorations, pendant lights',
  bathroom: 'furnished bathroom with towels, plants, soap dispensers, mirror, rug',
  dining: 'furnished dining room with dining table, chairs, sideboard, centerpiece, pendant light',
  office: 'furnished home office with desk, office chair, bookshelf, desk lamp, computer, rug',
  basement: 'furnished basement with entertainment center, sofa, game table, rug, lighting',
  patio: 'furnished patio with outdoor furniture, plants, string lights, rug, cushions',
};

// Style prompts for virtual staging
const STYLE_PROMPTS: Record<string, string> = {
  modern: 'modern minimalist style, clean lines, neutral colors, contemporary furniture',
  scandinavian: 'scandinavian style, light wood, white walls, cozy textiles, minimalist',
  industrial: 'industrial style, exposed brick, metal fixtures, dark colors, leather furniture',
  bohemian: 'bohemian style, colorful textiles, plants, rattan furniture, eclectic decor',
  traditional: 'traditional style, classic furniture, warm colors, elegant details, antique pieces',
  midcentury: 'mid-century modern style, retro furniture, warm wood tones, bold colors',
  farmhouse: 'farmhouse style, rustic wood, shiplap walls, vintage accessories, cozy textiles',
  luxury: 'luxury style, high-end furniture, marble accents, gold fixtures, elegant decor',
};

// Generate depth map using Marigold
async function generateDepthMap(imageUrl: string): Promise<string> {
  try {
    // Use Marigold - diffusion-based monocular depth estimation
    // https://replicate.com/adirik/marigold
    // Returns: [grayscale_depth_url, spectral_depth_url]
    const result = await replicate.run(
      "adirik/marigold:1a363593bc4882684fc58042d19db5e13a810e44e02f8d4c32afd1eb30464818",
      {
        input: {
          image: imageUrl,
        },
      }
    );

    // Debug log the result
    console.log('Marigold result:', JSON.stringify(result, null, 2));

    // Extract URL from result
    // Marigold returns an array of URLs [grayscale, spectral]
    const r = result as any;

    // Try array output
    if (Array.isArray(result) && result.length > 0) {
      const first = result[0];
      if (typeof first === 'string') return first;
      if (first && typeof first.url === 'function') {
        const url = first.url();
        return typeof url === 'string' ? url : url.toString();
      }
    }

    // Try common property names
    if (r.url) return r.url;
    if (r.output) return typeof r.output === 'string' ? r.output : r.output.url;
    if (r.image) return r.image;
  }

  // Direct string URL
  if (typeof result === 'string') {
    return result;
  }

  console.error('Could not extract URL from result:', result);
  throw new Error('Failed to generate depth map - no valid URL returned. Result: ' + JSON.stringify(result));
  } catch (error) {
    console.error('Depth map generation error:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has credits
    const { data: userData } = await supabase
      .from('zestio_users')
      .select('credits, used_credits, subscription_tier')
      .eq('id', user.id)
      .single();

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parse request body
    const body = await request.json();
    const { image, roomType, furnitureStyle, model = 'flux-depth' } = body;

    if (!image) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    // Check credits (enterprise has unlimited)
    const hasUnlimitedCredits = userData.subscription_tier === 'enterprise' || userData.credits === -1;
    if (!hasUnlimitedCredits && userData.credits <= 0) {
      return NextResponse.json({ error: 'No credits remaining' }, { status: 402 });
    }

    let resultUrl: string | null = null;
    let creditsUsed = 1;

    try {
      if (model === 'decor8') {
        // Use Decor8 API for virtual staging
        // Decor8 is a specialized API for real estate virtual staging
        creditsUsed = 2;

        const roomTypeDecor8 = roomType?.toUpperCase() || 'LIVING_ROOM';
        const designStyle = furnitureStyle?.toUpperCase() || 'MODERN';

        const decor8Response = await fetch('https://api.decor8.ai/api/v1/stage', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.DECOR8_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            input_image_url: imageUrl,
            room_type: roomTypeDecor8,
            design_style: designStyle,
            num_images: 1,
          }),
        });

        if (!decor8Response.ok) {
          const errorText = await decor8Response.text();
          console.error('Decor8 API error:', errorText);
          throw new Error(`Decor8 staging failed: ${decor8Response.status}`);
        }

        const decor8Data = await decor8Response.json();
        resultUrl = decor8Data?.info?.images?.[0]?.url;
        if (!resultUrl) {
          throw new Error('No output from Decor8 API');
        }
      } else if (model === 'flux-depth') {
        // Use adirik/interior-design - specifically designed for virtual staging
        // Uses Realistic Vision V3.0 + segmentation + MLSD ControlNets
        // Preserves original room layout unlike FLUX Depth Pro
        // https://replicate.com/adirik/interior-design
        creditsUsed = 2;

        const roomPrompt = ROOM_PROMPTS[roomType] || ROOM_PROMPTS.living;
        const stylePrompt = STYLE_PROMPTS[furnitureStyle] || STYLE_PROMPTS.modern;
        const prompt = `${roomPrompt}, ${stylePrompt}, professional real estate photography, well-lit, high quality, interior design magazine, bright and clean`;
        const negativePrompt = 'empty room, unfurnished, blurry, low quality, distorted, overexposed, underexposed, noisy, pixelated, watermark, text, dark, cluttered, structural changes, different room, hallucinated architecture';

        console.log('Interior design model:', { roomType, furnitureStyle, prompt });

        const result = await replicate.run(
          "adirik/interior-design",
          {
            input: {
              image: imageUrl,
              prompt: prompt,
              negative_prompt: negativePrompt,
              num_inference_steps: 50,
              guidance_scale: 7.5,
              prompt_strength: 0.8,
            },
          }
        );

        // Handle output
        if (Array.isArray(result) && result.length > 0) {
          const first = result[0];
          if (first && typeof first.url === 'function') {
            resultUrl = first.url();
          } else {
            resultUrl = String(first);
          }
        } else if (result && typeof result === 'object' && typeof (result as any).url === 'function') {
          resultUrl = (result as any).url();
        } else if (typeof result === 'string') {
          resultUrl = result;
        } else {
          resultUrl = String(result);
        }

        if (!resultUrl || resultUrl === '[object Object]') {
          throw new Error('No output from interior design model');
        }
      } else {
        // Fallback to SDXL for other models
        // Note: SDXL doesn't preserve structure as well as depth-based models
        creditsUsed = 2;
        const roomPrompt = ROOM_PROMPTS[roomType] || ROOM_PROMPTS.living;
        const stylePrompt = STYLE_PROMPTS[furnitureStyle] || STYLE_PROMPTS.modern;
        const prompt = `${roomPrompt}, ${stylePrompt}, professional real estate photography, well-lit, high quality, interior design magazine, bright and clean`;
        const negativePrompt = 'empty room, unfurnished, blurry, low quality, distorted, overexposed, underexposed, noisy, pixelated, watermark, text, dark, cluttered';

        const result = await replicate.run(
          "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
          {
            input: {
              image: image,
              prompt: prompt,
              negative_prompt: negativePrompt,
              num_inference_steps: 30,
              prompt_strength: 0.7,
              guidance_scale: 7.5,
              refine: "expert_ensemble_refiner",
            },
          }
        );

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
      }

      // Deduct credits
      const { data: userData } = await supabase
        .from('zestio_users')
        .select('credits, used_credits')
        .eq('id', user.id)
        .single();

      if (userData) {
        await supabase
          .from('zestio_users')
          .update({
            credits: Math.max(0, userData.credits - creditsUsed),
            used_credits: (userData.used_credits || 0) + creditsUsed,
          })
          .eq('id', user.id);
      }

      return NextResponse.json({
        success: true,
        resultUrl,
        creditsUsed,
        creditsRemaining: hasUnlimitedCredits ? -1 : Math.max(0, userData!.credits - creditsUsed),
      });
    } catch (apiError: any) {
      console.error('API error:', apiError);
      return NextResponse.json(
        { error: apiError.message || 'Virtual staging failed' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Staging error:', error);
    return NextResponse.json(
      { error: 'Failed to process virtual staging request' },
      { status: 500 }
    );
  }
}
