import { ProductPage } from '@/components/ProductPage';

export const metadata = {
  title: '2D & 3D Floor Plans - Precision Drafting | Zestio',
  description: 'Create precision 2D floor plans and immersive 3D walkthroughs. Millimeter-perfect accuracy with furniture and room layout tools.',
};

export default function FloorplanProductPage() {
  return (
    <ProductPage
      badge="04 / Precision"
      title="2D & 3D Floor Plans"
      subtitle="The Architectural Blueprint"
      heroDescription="Precision 2D drafting and immersive 3D interior design. Draw walls, add furniture, and visualize spaces in millimeter-perfect accuracy — all in your browser."
      heroImage="/images/3d-floorplan.png"
      heroImageAlt="Modern 3D floor plan rendering"
      ctaHref="/auth"
      ctaLabel="Start for Free"
      creditCost="Free — unlimited projects"
      features={[
        { icon: 'architecture', title: '2D Drafting', description: 'Draw walls, doors, and windows with precise measurements. Snap-to-grid for accuracy.' },
        { icon: 'view_in_ar', title: '3D Visualization', description: 'See your floor plan come alive in 3D. Real-time preview with realistic materials.' },
        { icon: 'chair', title: 'Furniture Library', description: 'Drag and drop furniture, fixtures, and appliances. Hundreds of items to choose from.' },
        { icon: 'undo', title: 'Undo & Redo', description: 'Full undo/redo history. Experiment freely without fear of losing work.' },
        { icon: 'save', title: 'Auto-Save', description: 'Your work is saved automatically to the cloud. Access from any device.' },
        { icon: 'file_download', title: 'Export Formats', description: 'Export as PNG, PDF, SVG, GLTF, or GLB. Share with clients or embed on websites.' },
      ]}
      examples={[
        { title: 'Real Estate Listings', description: 'Add professional floor plans to your listings. Help buyers understand the layout before viewing.' },
        { title: 'Interior Design', description: 'Plan furniture placement and room layouts. Visualize changes before making them.' },
        { title: 'Architecture', description: 'Create detailed floor plans for proposals and client presentations. Millimeter accuracy.' },
      ]}
    />
  );
}
