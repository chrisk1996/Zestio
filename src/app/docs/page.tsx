import { AppLayout } from '@/components/layout';
import Link from 'next/link';

function EndpointCard({ method, path, description, params, response, credits }: {
  method: string;
  path: string;
  description: string;
  params?: { name: string; type: string; required: boolean; description: string }[];
  response?: string;
  credits?: string;
}) {
  const methodColor = method === 'POST' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700';
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${methodColor}`}>{method}</span>
          <code className="text-sm font-mono text-slate-800">{path}</code>
        </div>
        {credits && <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-lg">{credits}</span>}
      </div>
      <div className="p-6">
        <p className="text-sm text-slate-600 mb-4">{description}</p>
        {params && (
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Parameters</h4>
            <div className="bg-slate-50 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left px-4 py-2 font-medium text-slate-600">Name</th>
                    <th className="text-left px-4 py-2 font-medium text-slate-600">Type</th>
                    <th className="text-left px-4 py-2 font-medium text-slate-600">Required</th>
                    <th className="text-left px-4 py-2 font-medium text-slate-600">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {params.map((p, i) => (
                    <tr key={i} className={i < params.length - 1 ? 'border-b border-slate-100' : ''}>
                      <td className="px-4 py-2 font-mono text-xs text-indigo-600">{p.name}</td>
                      <td className="px-4 py-2 text-xs text-slate-500">{p.type}</td>
                      <td className="px-4 py-2 text-xs">{p.required ? <span className="text-red-500 font-medium">Yes</span> : <span className="text-slate-400">No</span>}</td>
                      <td className="px-4 py-2 text-xs text-slate-600">{p.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {response && (
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Response</h4>
            <pre className="bg-slate-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto"><code>{response}</code></pre>
          </div>
        )}
      </div>
    </div>
  );
}

const enhanceTypes = [
  { value: 'auto', label: 'Auto Enhance', desc: 'General enhancement' },
  { value: 'sky', label: 'Blue Sky', desc: 'Clear sunny sky' },
  { value: 'sky_sunset', label: 'Golden Sunset', desc: 'Warm golden hour' },
  { value: 'sky_dramatic', label: 'Dramatic Clouds', desc: 'Moody cinematic sky' },
  { value: 'twilight', label: 'Virtual Twilight', desc: 'Blue hour with warm glow' },
  { value: 'season_summer', label: 'Summer', desc: 'Lush green landscape' },
  { value: 'season_autumn', label: 'Autumn', desc: 'Golden fall foliage' },
  { value: 'season_winter', label: 'Winter', desc: 'Pristine snow scene' },
  { value: 'curb_appeal', label: 'Curb Appeal', desc: 'Green lawn & landscaping' },
  { value: 'facade_refresh', label: 'Facade Refresh', desc: 'Clean painted exterior' },
  { value: 'object_removal', label: 'Object Removal', desc: 'Remove unwanted items' },
  { value: 'declutter', label: 'Declutter', desc: 'Remove personal items' },
];

const stagingModels = [
  { value: 'interior-design', label: 'Interior Design', cost: '~$0.006', credits: 2, desc: 'Best value, ControlNet-based' },
  { value: 'flux-depth', label: 'FLUX Depth Pro', cost: '~$0.02', credits: 2, desc: 'Depth-based staging' },
  { value: 'decor8', label: 'Decor8 AI', cost: '~$0.20', credits: 3, desc: 'Premium professional staging' },
];

export default function DocsPage() {
  return (
    <AppLayout title="API Documentation">
      <div className="max-w-4xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <span className="text-xs font-bold tracking-widest uppercase text-purple-600 mb-2 block">Developer API</span>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-3">Zestio API Reference</h1>
          <p className="text-lg text-slate-600 max-w-2xl">
            Integrate AI-powered real estate image enhancement and virtual staging into your application.
          </p>
        </div>

        {/* Quick Start */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Quick Start</h2>
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">1. Get an API Key</h3>
              <p className="text-sm text-slate-600 mb-3">Create an API key in your <Link href="/settings" className="text-indigo-600 hover:underline">Settings</Link> page, or via the API:</p>
              <pre className="bg-slate-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto"><code>{`curl -X POST https://zestio.ai/api/keys \\
  -H "Content-Type: application/json" \\
  -d '{"name": "My App"}' \\
  -b "your-session-cookie"

# Response: { "secret": "zest_a1b2c3d4..." }`}</code></pre>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">2. Make a Request</h3>
              <pre className="bg-slate-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto"><code>{`curl -X POST https://zestio.ai/api/enhance \\
  -H "Authorization: Bearer zest_a1b2c3d4..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "image": "https://example.com/property.jpg",
    "enhancementType": "sky",
    "model": "auto"
  }'`}</code></pre>
            </div>
          </div>
        </section>

        {/* Authentication */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Authentication</h2>
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <p className="text-sm text-slate-600 mb-4">
              All API requests require authentication. Use one of:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-semibold text-slate-800 mb-2">API Key (recommended)</h4>
                <code className="text-xs bg-white px-2 py-1 rounded border block mb-2">Authorization: Bearer zest_xxxxxxxx...</code>
                <p className="text-xs text-slate-500">For server-to-server integrations. Create keys in Settings.</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-semibold text-slate-800 mb-2">Session Cookie</h4>
                <code className="text-xs bg-white px-2 py-1 rounded border block mb-2">Cookie: sb-xxx-auth-token=...</code>
                <p className="text-xs text-slate-500">For browser-based requests from the Zestio dashboard.</p>
              </div>
            </div>
          </div>
        </section>

        {/* API Key Management */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">API Key Management</h2>
          <div className="space-y-4">
            <EndpointCard
              method="GET"
              path="/api/keys"
              description="List all your API keys (secrets are never returned)"
              response={`{
  "keys": [
    {
      "id": "uuid",
      "name": "My App",
      "key_prefix": "zest_a1b",
      "last_used_at": "2026-04-21T...",
      "created_at": "2026-04-21T...",
      "is_active": true
    }
  ]
}`}
            />
            <EndpointCard
              method="POST"
              path="/api/keys"
              description="Create a new API key. The secret is only returned once."
              params={[
                { name: 'name', type: 'string', required: false, description: 'Label for the key (default: "Default Key")' },
              ]}
              response={`{
  "key": { "id": "uuid", "name": "My App", "key_prefix": "zest_a1b" },
  "secret": "zest_a1b2c3d4e5f6...",
  "warning": "Store this key securely. It cannot be retrieved again."
}`}
            />
            <EndpointCard
              method="DELETE"
              path="/api/keys"
              description="Revoke an API key"
              params={[
                { name: 'key_id', type: 'string', required: true, description: 'The key ID to revoke' },
              ]}
              response={`{ "success": true }`}
            />
          </div>
        </section>

        {/* Image Enhancement */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Image Enhancement</h2>
          <p className="text-sm text-slate-600 mb-6">Enhance, transform, and clean up property photos.</p>
          <div className="space-y-4">
            <EndpointCard
              method="POST"
              path="/api/enhance"
              description="Enhance a property image using AI. Supports sky replacement, season changes, decluttering, and more."
              credits="1-2 credits"
              params={[
                { name: 'image', type: 'string', required: true, description: 'Image URL or base64 data URL' },
                { name: 'enhancementType', type: 'string', required: false, description: 'Type of enhancement (see table below). Default: "auto"' },
                { name: 'model', type: 'string', required: false, description: 'Model: "auto", "flux-kontext", "sdxl", "ideogram"' },
                { name: 'customPrompt', type: 'string', required: false, description: 'Custom prompt (overrides enhancementType)' },
              ]}
              response={`{
  "success": true,
  "output": "https://replicate.delivery/...",
  "creditsUsed": 1,
  "model": "auto"
}`}
            />
          </div>

          {/* Enhancement Types Table */}
          <div className="mt-6 bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">Enhancement Types</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left px-6 py-3 font-medium text-slate-600">Type</th>
                    <th className="text-left px-6 py-3 font-medium text-slate-600">Name</th>
                    <th className="text-left px-6 py-3 font-medium text-slate-600">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {enhanceTypes.map((t, i) => (
                    <tr key={t.value} className={i < enhanceTypes.length - 1 ? 'border-b border-slate-100' : ''}>
                      <td className="px-6 py-2.5 font-mono text-xs text-indigo-600">{t.value}</td>
                      <td className="px-6 py-2.5 font-medium text-slate-800">{t.label}</td>
                      <td className="px-6 py-2.5 text-slate-600">{t.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Virtual Staging */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Virtual Staging</h2>
          <p className="text-sm text-slate-600 mb-6">Stage empty rooms with AI-generated furniture.</p>
          <div className="space-y-4">
            <EndpointCard
              method="POST"
              path="/api/staging"
              description="Apply virtual staging to an empty room photo."
              credits="2-3 credits"
              params={[
                { name: 'image', type: 'string', required: true, description: 'Image URL or base64 data URL of the empty room' },
                { name: 'model', type: 'string', required: false, description: 'Model: "interior-design" (default), "flux-depth", "decor8"' },
                { name: 'roomType', type: 'string', required: false, description: 'Room: living, bedroom, kitchen, dining, bathroom, office, basement, patio' },
                { name: 'furnitureStyle', type: 'string', required: false, description: 'Style: modern, scandinavian, luxury, minimalist, industrial, bohemian, midcentury, farmhouse' },
              ]}
              response={`{
  "success": true,
  "output": "https://replicate.delivery/...",
  "model": "interior-design",
  "creditsUsed": 2,
  "creditsRemaining": 48
}`}
            />
          </div>

          {/* Staging Models Table */}
          <div className="mt-6 bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">Staging Models</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left px-6 py-3 font-medium text-slate-600">Model</th>
                    <th className="text-left px-6 py-3 font-medium text-slate-600">Credits</th>
                    <th className="text-left px-6 py-3 font-medium text-slate-600">Est. Cost</th>
                    <th className="text-left px-6 py-3 font-medium text-slate-600">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {stagingModels.map((m, i) => (
                    <tr key={m.value} className={i < stagingModels.length - 1 ? 'border-b border-slate-100' : ''}>
                      <td className="px-6 py-2.5 font-mono text-xs text-indigo-600">{m.value}</td>
                      <td className="px-6 py-2.5 font-medium text-purple-600">{m.credits}</td>
                      <td className="px-6 py-2.5 text-slate-600">{m.cost}</td>
                      <td className="px-6 py-2.5 text-slate-600">{m.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Errors */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Error Responses</h2>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left px-6 py-3 font-medium text-slate-600">Status</th>
                    <th className="text-left px-6 py-3 font-medium text-slate-600">Meaning</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { code: 400, desc: 'Missing or invalid parameters' },
                    { code: 401, desc: 'Missing or invalid authentication' },
                    { code: 402, desc: 'Insufficient credits' },
                    { code: 429, desc: 'Rate limit exceeded (10 req/hr for free tier)' },
                    { code: 500, desc: 'Server error or AI model failure' },
                  ].map((e, i) => (
                    <tr key={e.code} className={i < 4 ? 'border-b border-slate-100' : ''}>
                      <td className="px-6 py-2.5 font-mono text-red-600">{e.code}</td>
                      <td className="px-6 py-2.5 text-slate-600">{e.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Rate Limits */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Rate Limits</h2>
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <p className="text-sm text-slate-600">
              All endpoints are rate limited to <strong>10 requests per hour</strong> per IP/API key.
              Enterprise plans have higher limits. Contact us for custom arrangements.
            </p>
          </div>
        </section>

        {/* Support */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-8 text-center">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Need Help?</h3>
            <p className="text-sm text-slate-600 mb-4">
              Questions about integration, custom pricing, or enterprise plans.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/help" className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors">
                Contact Support
              </Link>
              <Link href="/settings" className="px-6 py-2.5 bg-white text-indigo-600 border border-indigo-200 rounded-lg font-semibold text-sm hover:bg-indigo-50 transition-colors">
                Manage API Keys
              </Link>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
