import { ProductPage } from '@/components/ProductPage';

export const metadata = {
  title: 'Developer API - Build With Zestio | Zestio',
  description: 'RESTful API for image enhancement, virtual staging, video generation, and more. API keys, full docs, and integration support.',
};

export default function ApiProductPage() {
  return (
    <ProductPage
      badge="06 / API"
      title="Developer API"
      subtitle="Build With Zestio"
      heroDescription="RESTful API for image enhancement, virtual staging, video generation, and more. Generate API keys, integrate into your CRM or custom workflow. Full documentation and support."
      heroImage="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80"
      heroImageAlt="Code editor with API integration"
      ctaHref="/auth"
      ctaLabel="Get API Key"
      creditCost="Included with Enterprise plan"
    >
      {/* Code example */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl text-[#1d2832] mb-8 text-center">Quick Start</h2>
          <div className="bg-[#1d2832] rounded-lg p-6 text-sm font-mono overflow-x-auto">
            <p className="text-[#8c9196]"># Enhance a property image</p>
            <p className="text-[#86f8c8]">curl -X POST https://zestio.pro/api/enhance \</p>
            <p className="text-[#86f8c8] pl-4">-H &quot;Authorization: Bearer zest_your_api_key&quot; \</p>
            <p className="text-[#86f8c8] pl-4">-H &quot;Content-Type: application/json&quot; \</p>
            <p className="text-[#86f8c8] pl-4">-d {`'{"image":"...","type":"sky"}'`}</p>
          </div>
        </div>
      </section>

      {/* API features */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl text-[#1d2832] mb-12 text-center">API Endpoints</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: 'auto_awesome', title: 'POST /api/enhance', description: 'Enhance, sky replace, season change, object removal, HDR' },
              { icon: 'chair', title: 'POST /api/staging', description: 'Virtual staging with room types and furniture styles' },
              { icon: 'movie', title: 'POST /api/video-jobs', description: 'Full video pipeline: sort, animate, stitch with music' },
              { icon: 'expand', title: 'POST /api/upscale', description: '2× AI upscaling for low-resolution images' },
              { icon: 'description', title: 'POST /api/listings', description: 'AI listing description generation (EN & DE)' },
              { icon: 'vpn_key', title: 'GET /api/credits', description: 'Check credit balance and usage programmatically' },
            ].map((feature, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#edf4ff] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[#006c4d]">{feature.icon}</span>
                </div>
                <div>
                  <h3 className="font-mono text-sm font-medium text-[#006c4d] mb-1">{feature.title}</h3>
                  <p className="text-sm text-[#43474c]">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </ProductPage>
  );
}
