import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { createClient } from '@/utils/supabase/server';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 20; // requests per hour
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }
  if (record.count >= RATE_LIMIT) {
    return false;
  }
  record.count++;
  return true;
}

interface PropertyData {
  property_type?: string;
  transaction_type?: string;
  city?: string;
  district?: string;
  street?: string;
  rooms?: number;
  bedrooms?: number;
  bathrooms?: number;
  living_area?: number;
  construction_year?: number;
  energy_rating?: string;
  features?: Record<string, boolean>;
  proximity_data?: {
    poi?: Record<string, { name?: string; distance?: number }[]>;
  };
  tone?: string;
  language?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
               request.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    // Auth check
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request
    const body: PropertyData = await request.json();
    const {
      property_type,
      transaction_type,
      city,
      district,
      street,
      rooms,
      bedrooms,
      bathrooms,
      living_area,
      construction_year,
      energy_rating,
      features,
      proximity_data,
      tone = 'professional',
      language = 'de',
    } = body;

    // Build feature list
    const activeFeatures = features
      ? Object.entries(features)
          .filter(([, v]) => v)
          .map(([k]) => k.replace(/_/g, ' '))
      : [];

    // Build proximity description
    let proximityText = '';
    if (proximity_data?.poi) {
      const poiEntries = Object.entries(proximity_data.poi)
        .filter(([, v]) => v && v.length > 0)
        .slice(0, 5)
        .map(([category, items]) => {
          const item = items[0];
          const distance = item?.distance ? `${Math.round(item.distance)}m` : 'nearby';
          const name = item?.name || '';
          return `${category}: ${name ? `${name} ` : ''}${distance}`;
        });
      if (poiEntries.length > 0) {
        proximityText = `Nearby: ${poiEntries.join(', ')}.`;
      }
    }

    // Build the prompt
    const isGerman = language === 'de';
    const isRent = transaction_type === 'rent';

    const prompt = isGerman
      ? `Du bist ein professioneller Immobilienautor. Erstelle eine ansprechende Immobilienbeschreibung auf Deutsch.

Immobilienart: ${property_type || 'Wohnung'}
Angebot: ${isRent ? 'Miete' : 'Kauf'}
Ort: ${city || 'Unbekannt'}${district ? `, ${district}` : ''}${street ? `, ${street}` : ''}
Zimmer: ${rooms || '-'}
Schlafzimmer: ${bedrooms || '-'}
Badezimmer: ${bathrooms || '-'}
Wohnfläche: ${living_area ? `${living_area} m²` : '-'}
Baujahr: ${construction_year || '-'}
Energieklasse: ${energy_rating || '-'}
Ausstattung: ${activeFeatures.length > 0 ? activeFeatures.join(', ') : 'Standard'}
Lage: ${proximityText || 'Gute Lage'}

Tonalität: ${tone === 'luxury' ? 'Luxuriös und elegant' : tone === 'warm' ? 'Familiär und einladend' : 'Professionell und sachlich'}

Erstelle:
1. Einen kurzen, aussagekräftigen Titel (max. 80 Zeichen)
2. Eine Beschreibung (150-200 Wörter)

Formatiere die Antwort als JSON:
{"title": "...", "description": "..."}

Beschreibe die Immobilie lebendig und detailreich. Hebe besondere Merkmale hervor. Nutze emotionale Sprache für ${tone === 'luxury' ? 'Luxusimmobilien' : tone === 'warm' ? 'Familienwohnungen' : 'professionelle Kunden'}.`
      : `You are a professional real estate copywriter. Create a compelling property description in English.

Property type: ${property_type || 'Apartment'}
Offer: ${isRent ? 'Rent' : 'Sale'}
Location: ${city || 'Unknown'}${district ? `, ${district}` : ''}${street ? `, ${street}` : ''}
Rooms: ${rooms || '-'}
Bedrooms: ${bedrooms || '-'}
Bathrooms: ${bathrooms || '-'}
Living area: ${living_area ? `${living_area} m²` : '-'}
Year built: ${construction_year || '-'}
Energy rating: ${energy_rating || '-'}
Features: ${activeFeatures.length > 0 ? activeFeatures.join(', ') : 'Standard'}
Location: ${proximityText || 'Good location'}

Tone: ${tone === 'luxury' ? 'Luxurious and elegant' : tone === 'warm' ? 'Family-friendly and inviting' : 'Professional and factual'}

Create:
1. A short, compelling title (max 80 characters)
2. A description (150-200 words)

Format the response as JSON:
{"title": "...", "description": "..."}

Describe the property vividly and in detail. Highlight special features. Use emotional language for ${tone === 'luxury' ? 'luxury properties' : tone === 'warm' ? 'family homes' : 'professional clients'}.`;

    console.log('[AI Description] Generating for:', city, property_type, tone, language);

    // Use Llama 3.1 8B - fast and cheap (~$0.0001 per request)
    const result = await replicate.run(
      "meta/meta-llama-3.1-8b-instruct",
      {
        input: {
          prompt,
          max_tokens: 500,
          temperature: 0.7,
          top_p: 0.9,
          system_prompt: isGerman
            ? "Du bist ein professioneller Immobilienautor. Antworte nur mit gültigem JSON."
            : "You are a professional real estate copywriter. Respond only with valid JSON.",
        },
      }
    );

    // Parse the response
    let responseText = '';
    if (typeof result === 'string') {
      responseText = result;
    } else if (Array.isArray(result)) {
      responseText = result.join('');
    } else if (result && typeof result === 'object') {
      responseText = String(result);
    }

    console.log('[AI Description] Raw response:', responseText.substring(0, 200));

    // Extract JSON from response
    let parsed: { title?: string; description?: string } = {};
    try {
      // Try to find JSON in the response
      const jsonMatch = responseText.match(/\{[^{}]*"title"[^{}]*"description"[^{}]*\}/s);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: try parsing whole response
        parsed = JSON.parse(responseText);
      }
    } catch (parseError) {
      console.error('[AI Description] Parse error:', parseError);
      // Fallback: extract from text
      const titleMatch = responseText.match(/"title"\s*:\s*"([^"]+)"/);
      const descMatch = responseText.match(/"description"\s*:\s*"([^"]+)"/);
      if (titleMatch) parsed.title = titleMatch[1];
      if (descMatch) parsed.description = descMatch[1];
    }

    // Ensure we have valid output
    const title = parsed.title || `${rooms || ''} Room ${property_type || 'Property'} in ${city || 'Great Location'}`;
    const description = parsed.description || 'A wonderful property with great features and excellent location. Contact us for more information.';

    console.log('[AI Description] Success:', title);

    return NextResponse.json({
      success: true,
      title,
      description,
      wordCount: description.split(/\s+/).filter(Boolean).length,
    });

  } catch (error) {
    console.error('[AI Description] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate description';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
