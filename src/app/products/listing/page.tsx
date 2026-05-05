import { ProductPage } from '@/components/ProductPage';

export const metadata = {
  title: 'AI Listing Builder - Property Descriptions in Seconds | Zestio',
  description: 'Generate professional property descriptions optimized for Zillow, ImmoScout24, and more. English & German. Completely free.',
};

export default function ListingProductPage() {
  return (
    <ProductPage
      badge="05 / Narrative"
      title="AI Listing Builder"
      subtitle="List in Minutes"
      heroDescription="Convert property data into compelling listing descriptions. AI generates SEO-optimized text tailored for Zillow, ImmobilienScout24, and more — in English and German. Completely free."
      heroImage="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80"
      heroImageAlt="Real estate listing document"
      ctaHref="/auth"
      ctaLabel="Start for Free"
      creditCost="Free — no credits needed"
      features={[
        { icon: 'edit_document', title: 'AI-Generated Descriptions', description: 'Enter property details and get professional, compelling listing text in seconds.' },
        { icon: 'language', title: 'EN & DE', description: 'Generate descriptions in English and German. Localized for each market.' },
        { icon: 'search', title: 'SEO Optimized', description: 'Text optimized for search visibility on Zillow, ImmoScout24, and Google.' },
        { icon: 'tune', title: 'Customizable Tone', description: 'Adjust tone from professional to casual. Match your brand voice.' },
      ]}
      examples={[
        { title: 'Residential Listings', description: 'Compelling descriptions for apartments, houses, and condos that highlight key selling points.' },
        { title: 'Commercial Properties', description: 'Professional descriptions for office spaces, retail, and industrial properties.' },
        { title: 'Rental Listings', description: 'Engaging rental descriptions optimized for rental platforms and social media.' },
      ]}
    />
  );
}
