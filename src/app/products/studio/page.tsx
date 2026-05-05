import { ProductPage } from '@/components/ProductPage';

export const metadata = {
  title: 'Image Studio - AI Photo Enhancement & Virtual Staging | Zestio',
  description: 'Enhance property photos, replace skies, change seasons, virtually stage rooms — 13 AI tools in one workspace.',
};

export default function StudioProductPage() {
  return (
    <ProductPage
      badge="01 / Studio"
      title="Image Studio"
      subtitle="Enhance, Stage & Transform"
      heroDescription="One workspace for everything: enhance clarity, swap skies, change seasons, virtually stage rooms, remove objects, and more. 13 AI-powered tools to make every listing photo stand out."
      heroImage="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80"
      heroImageAlt="Enhanced property photography"
      ctaHref="/auth"
      ctaLabel="Start for Free"
      creditCost="1 credit per enhancement"
      features={[
        { icon: 'wb_sunny', title: 'Sky Replacement', description: 'Replace dull skies with clear blue, sunset, or dramatic clouds. Perfect for exterior shots.' },
        { icon: 'auto_awesome', title: 'HDR Enhancement', description: 'Fix underexposed or overexposed areas. Bring out details in shadows and highlights.' },
        { icon: 'palette', title: 'Season Change', description: 'Transform summer photos to autumn, winter, or spring. Make listings seasonally relevant.' },
        { icon: 'chair', title: 'Virtual Staging', description: 'Add furniture to empty rooms with 8 design styles. Help buyers visualize the space.' },
        { icon: 'delete', title: 'Object Removal', description: 'Remove unwanted items, clutter, or personal objects from any photo.' },
        { icon: 'blur_on', title: 'Noise Reduction', description: 'Clean up grainy low-light photos for crisp, professional results.' },
        { icon: 'contrast', title: 'Sharpen & Denoise', description: 'Enhance edge detail while smoothing noise. Perfect for phone photos.' },
        { icon: 'expand', title: '2× AI Upscaling', description: 'Enlarge images up to 2× with AI-powered detail generation.' },
        { icon: 'nightlight', title: 'Virtual Twilight', description: 'Convert daytime exteriors to stunning golden-hour or twilight scenes.' },
      ]}
      examples={[
        { title: 'Real Estate Agents', description: 'Make every listing photo portfolio-ready. Sky replacements, virtual staging, and twilight effects help properties sell faster.' },
        { title: 'Property Photographers', description: 'Deliver more value to clients. Enhance, stage, and transform photos in seconds instead of hours in Photoshop.' },
        { title: 'Marketing Teams', description: 'Batch process property images with consistent quality. Season-specific variants for targeted campaigns.' },
      ]}
    />
  );
}
