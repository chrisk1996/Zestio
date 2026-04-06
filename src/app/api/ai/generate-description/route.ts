import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

interface GenerateDescriptionRequest {
  property_type: string;
  transaction_type: string;
  city: string;
  rooms?: number;
  bedrooms?: number;
  living_area?: number;
  features?: Record<string, boolean>;
}

// Generate property description using AI or fallback template
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: GenerateDescriptionRequest = await request.json();
    const { property_type, transaction_type, city, rooms, bedrooms, living_area, features } = body;

    // Property type labels
    const propertyTypeLabel = property_type === 'apartment' ? 'Apartment' 
      : property_type === 'house' ? 'House' 
      : property_type === 'commercial' ? 'Commercial Property'
      : 'Property';
    
    const transactionLabel = transaction_type === 'sale' ? 'for Sale' : 'for Rent';
    
    // Generate title
    const title = `${propertyTypeLabel} ${transactionLabel} in ${city || 'Prime Location'}`;

    // Build features list
    const featureList: string[] = [];
    if (features?.has_balcony) featureList.push('private balcony');
    if (features?.has_terrace) featureList.push('spacious terrace');
    if (features?.has_garden) featureList.push('landscaped garden');
    if (features?.has_basement) featureList.push('full basement');
    if (features?.has_elevator) featureList.push('elevator access');
    if (features?.has_parking) featureList.push('dedicated parking');
    if (features?.built_in_kitchen) featureList.push('modern built-in kitchen');
    if (features?.has_aircon) featureList.push('air conditioning');
    if (features?.has_fireplace) featureList.push('cozy fireplace');
    if (features?.has_pool) featureList.push('private pool');
    if (features?.is_furnished) featureList.push('fully furnished');

    // Check for OpenAI API key
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    let description: string;

    if (openaiApiKey) {
      // Use OpenAI for generation
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiApiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: `You are a professional real estate copywriter. Generate sophisticated, editorial-style property descriptions. Be concise but evocative. Focus on lifestyle benefits and unique features. Use bullet points for key features. Keep under 200 words.`
              },
              {
                role: 'user',
                content: `Write a listing description for a ${propertyTypeLabel.toLowerCase()} ${transactionLabel} in ${city || 'a prime location'}.
                
Details:
- Rooms: ${rooms || 'N/A'}
- Bedrooms: ${bedrooms || 'N/A'}
- Living Area: ${living_area ? `${living_area} sqm` : 'N/A'}
- Features: ${featureList.length > 0 ? featureList.join(', ') : 'Standard amenities'}

Write an engaging, sophisticated description that highlights the property's best features and location benefits.`
              }
            ],
            max_tokens: 500,
            temperature: 0.7,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          description = data.choices[0]?.message?.content || generateFallbackDescription(propertyTypeLabel, city, rooms, living_area, featureList);
        } else {
          description = generateFallbackDescription(propertyTypeLabel, city, rooms, living_area, featureList);
        }
      } catch (error) {
        console.error('OpenAI error:', error);
        description = generateFallbackDescription(propertyTypeLabel, city, rooms, living_area, featureList);
      }
    } else {
      // Fallback template
      description = generateFallbackDescription(propertyTypeLabel, city, rooms, living_area, featureList);
    }

    return NextResponse.json({ title, description });
  } catch (error) {
    console.error('Generate description error:', error);
    return NextResponse.json(
      { error: 'Failed to generate description' },
      { status: 500 }
    );
  }
}

function generateFallbackDescription(
  propertyType: string,
  city: string,
  rooms?: number,
  livingArea?: number,
  features?: string[]
): string {
  const locationDesc = city 
    ? `Nestled in the heart of ${city}, this ${propertyType.toLowerCase()} offers the perfect blend of urban convenience and refined living.`
    : `This exceptional ${propertyType.toLowerCase()} represents the finest in contemporary living.`;

  const spaceDesc = rooms || livingArea
    ? `With ${rooms ? `${rooms} well-appointed rooms` : ''}${rooms && livingArea ? ' and ' : ''}${livingArea ? `${livingArea} sqm of thoughtfully designed living space` : ''}, every detail has been carefully considered.`
    : '';

  const featureDesc = features && features.length > 0
    ? `\n\nKey features include:\n${features.map(f => `• ${f.charAt(0).toUpperCase() + f.slice(1)}`).join('\n')}`
    : '';

  return `${locationDesc} ${spaceDesc}${featureDesc}

Perfect for discerning buyers seeking quality, comfort, and convenience. Schedule your private viewing today.`;
}
