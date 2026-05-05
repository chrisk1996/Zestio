import { ProductPage } from '@/components/ProductPage';

export const metadata = {
  title: '3D Tour Scanner - Interactive Virtual Walkthroughs | Zestio',
  description: 'Upload photos from your phone and get a fully interactive 3D walkthrough. No special camera or Matterport subscription needed.',
};

export default function TourProductPage() {
  return (
    <ProductPage
      badge="07 / Immersive"
      title="3D Tour Scanner"
      subtitle="Walk. Scan. Share."
      heroDescription="Walk around a property with your phone and take photos from different angles. Upload them to Zestio — our AI generates a fully interactive 3D walkthrough. Share via link or embed on any website."
      heroImage="https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80"
      heroImageAlt="3D virtual tour experience"
      ctaHref="/auth"
      ctaLabel="Start for Free"
      creditCost="8 credits per scan"
      features={[
        { icon: 'photo_camera', title: 'Phone Only', description: 'No special camera, LiDAR, or Matterport subscription needed. Just your phone.' },
        { icon: 'view_in_ar', title: 'Interactive 3D', description: 'Walk through the property in 3D. Rotate, zoom, and explore every angle.' },
        { icon: 'share', title: 'Share & Embed', description: 'Share via direct link or embed the tour on any website or listing page.' },
        { icon: 'speed', title: 'Fast Processing', description: '20–200 photos processed into a walkthrough in minutes. Not hours.' },
      ]}
      examples={[
        { title: 'Property Viewings', description: 'Let potential buyers explore the property remotely before scheduling an in-person visit.' },
        { title: 'Remote Clients', description: 'International or out-of-town buyers can experience the property as if they were there.' },
        { title: 'Listing Enhancement', description: '3D tours increase listing engagement by 300% compared to photos alone.' },
      ]}
    />
  );
}
