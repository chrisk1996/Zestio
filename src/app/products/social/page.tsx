import { ProductPage } from '@/components/ProductPage';

export const metadata = {
  title: 'Smart Captions & Social Kit - AI Social Media for Real Estate | Zestio',
  description: 'AI-generated captions for Instagram, Facebook & more. Auto-resize images for any platform. Completely free.',
};

export default function SocialProductPage() {
  return (
    <ProductPage
      badge="03 / Social"
      title="Smart Captions & Social Kit"
      subtitle="Ready to Post"
      heroDescription="AI-generated captions for Instagram, Facebook, LinkedIn, and more. Auto-resize property images for any platform. Go from edit to post in seconds — completely free."
      heroImage="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&q=80"
      heroImageAlt="Social media content creation"
      ctaHref="/auth"
      ctaLabel="Start for Free"
      creditCost="Free — no credits needed"
      features={[
        { icon: 'edit_note', title: 'AI Captions', description: 'Generate engaging captions tailored for real estate. Professional tone, right hashtags, ready to post.' },
        { icon: 'crop', title: 'Auto-Resize', description: 'Resize images for Instagram, Facebook, LinkedIn, Twitter, and more. One click, all platforms.' },
        { icon: 'tag', title: 'Smart Hashtags', description: 'AI-suggested hashtags optimized for real estate reach and engagement.' },
        { icon: 'language', title: 'EN & DE', description: 'Generate captions in English and German. Perfect for international markets.' },
      ]}
      examples={[
        { title: 'Instagram Posts', description: 'Eye-catching property shots with engaging captions and optimized hashtags. Stories-ready formats.' },
        { title: 'Facebook Marketplace', description: 'Professional listing descriptions adapted for social media. Drive more inquiries.' },
        { title: 'LinkedIn Networking', description: 'Property showcase posts with a professional tone. Build your real estate brand.' },
      ]}
    />
  );
}
