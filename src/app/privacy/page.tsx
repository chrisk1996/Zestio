import { Header } from '@/components/Header';

export const metadata = {
  title: 'Privacy Policy - Zestio',
  description: 'Privacy Policy for Zestio AI-powered real estate platform',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#f7f9ff]">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">

        <h1 className="font-serif text-4xl text-[#1d2832] mb-2">Privacy Policy</h1>
        <p className="text-sm text-[#43474c] mb-10">Last updated: May 2025</p>

        <div className="bg-white rounded-lg border border-[#c4c6cd]/20 p-8 space-y-8">

          <section>
            <h2 className="font-serif text-xl text-[#1d2832] mb-3">1. Introduction</h2>
            <div className="text-sm text-[#43474c] leading-relaxed space-y-2">
              <p>
                Zestio (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates the website zestio.pro and the associated AI-powered
                real estate media platform. This Privacy Policy explains how we collect, use, store, and protect
                your personal data when you use our Service.
              </p>
              <p>
                We are committed to protecting your privacy and comply with the European General Data Protection
                Regulation (GDPR) and the German Federal Data Protection Act (BDSG).
              </p>
              <p>
                <strong>Responsible party:</strong> Zestio, contactable at{' '}
                <a href="mailto:zestioai1@gmail.com" className="text-[#006c4d] underline">zestioai1@gmail.com</a>
              </p>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-xl text-[#1d2832] mb-3">2. Data We Collect</h2>
            <div className="text-sm text-[#43474c] leading-relaxed space-y-2">
              <p><strong>Account data:</strong> When you register, we collect your email address, name, and
                authentication credentials (managed by Supabase Auth).</p>
              <p><strong>Content you upload:</strong> Images, listing data, and scripts you submit for processing.
                These are stored temporarily in Supabase Storage and on our processing infrastructure.</p>
              <p><strong>Usage data:</strong> Information about how you use the Service, including features used,
                credits consumed, and processing results. This is stored in our PostgreSQL database.</p>
              <p><strong>Payment data:</strong> Subscription and billing information processed by Paddle (our
                payment provider). We do not store credit card details — Paddle handles all payment data
                in compliance with PCI-DSS.</p>
              <p><strong>Technical data:</strong> Essential cookies for authentication (Supabase session tokens).
                We do not use tracking cookies, analytics cookies, or advertising cookies.</p>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-xl text-[#1d2832] mb-3">3. How We Use Your Data</h2>
            <div className="text-sm text-[#43474c] leading-relaxed space-y-2">
              <p>We process your data for the following purposes:</p>
              <ul className="list-disc list-inside pl-4 space-y-1">
                <li><strong>Service delivery:</strong> To process your images, generate videos, create descriptions,
                  and provide all features of the platform</li>
                <li><strong>Account management:</strong> To authenticate you, manage your subscription, and track credits</li>
                <li><strong>Communication:</strong> To send service-related notifications (billing, account updates)</li>
                <li><strong>Security:</strong> To protect against fraud and unauthorized access</li>
                <li><strong>Legal compliance:</strong> To meet our legal obligations under applicable law</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-xl text-[#1d2832] mb-3">4. Legal Basis for Processing (GDPR Art. 6)</h2>
            <div className="text-sm text-[#43474c] leading-relaxed space-y-2">
              <p>We process your data based on the following legal grounds:</p>
              <ul className="list-disc list-inside pl-4 space-y-1">
                <li><strong>Contract performance:</strong> Processing necessary to provide the Service you signed up for</li>
                <li><strong>Legitimate interest:</strong> Security, fraud prevention, and service improvement</li>
                <li><strong>Consent:</strong> Where you have given explicit consent for specific processing</li>
                <li><strong>Legal obligation:</strong> Where processing is required by law</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-xl text-[#1d2832] mb-3">5. AI Processing &amp; Third-Party Services</h2>
            <div className="text-sm text-[#43474c] leading-relaxed space-y-2">
              <p>Your uploaded images and data are processed by third-party AI service providers to generate results:</p>
              <ul className="list-disc list-inside pl-4 space-y-1">
                <li><strong>Replicate Inc.</strong> — AI image enhancement, virtual staging, and upscaling</li>
                <li><strong>Kling (Kuaishou)</strong> — Video animation from static images</li>
                <li><strong>MiniMax (via Replicate)</strong> — Text-to-speech voiceover generation</li>
              </ul>
              <p>These providers process your data solely on our instructions and under data processing agreements
                (DPA) that ensure GDPR compliance. Images are transmitted securely via HTTPS and are not retained
                by these providers beyond the processing period.</p>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-xl text-[#1d2832] mb-3">6. Data Storage &amp; Retention</h2>
            <div className="text-sm text-[#43474c] leading-relaxed space-y-2">
              <ul className="list-disc list-inside pl-4 space-y-1">
                <li><strong>Account data:</strong> Retained for the duration of your account plus 30 days after deletion</li>
                <li><strong>Uploaded images:</strong> Stored in Supabase Storage until you delete them or close your account</li>
                <li><strong>Generated content:</strong> Stored in your account until you delete it</li>
                <li><strong>AI processing data:</strong> Not stored by AI providers after processing completes</li>
                <li><strong>Payment records:</strong> Retained as required by tax and accounting regulations (typically 10 years)</li>
              </ul>
              <p>All data is stored on Supabase Cloud infrastructure (hosted in the EU) and Vercel (which processes
                requests in the EU region by default).</p>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-xl text-[#1d2832] mb-3">7. Cookies</h2>
            <div className="text-sm text-[#43474c] leading-relaxed space-y-2">
              <p>Zestio uses only <strong>essential cookies</strong> required for the functioning of the Service:</p>
              <ul className="list-disc list-inside pl-4 space-y-1">
                <li><strong>Authentication cookies:</strong> Supabase session tokens (HTTP-only, secure) — necessary
                  to keep you logged in and secure your account</li>
              </ul>
              <p>We do <strong>not</strong> use:</p>
              <ul className="list-disc list-inside pl-4 space-y-1">
                <li>Analytics cookies (Google Analytics, etc.)</li>
                <li>Advertising or tracking cookies</li>
                <li>Social media tracking pixels</li>
              </ul>
              <p>Because we only use essential cookies, no consent mechanism is required under the ePrivacy Directive.
                Our cookie notice serves as informational disclosure.</p>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-xl text-[#1d2832] mb-3">8. Data Sharing</h2>
            <div className="text-sm text-[#43474c] leading-relaxed space-y-2">
              <p>We do not sell, rent, or share your personal data with third parties for marketing purposes.
                We share data only with:</p>
              <ul className="list-disc list-inside pl-4 space-y-1">
                <li><strong>Service providers:</strong> Companies that help us operate the platform (Supabase, Vercel,
                  Paddle, AI model providers) — bound by data processing agreements</li>
                <li><strong>Legal requirements:</strong> When required by law, regulation, or legal process</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-xl text-[#1d2832] mb-3">9. Data Security</h2>
            <div className="text-sm text-[#43474c] leading-relaxed space-y-2">
              <p>We implement appropriate technical and organizational measures to protect your data:</p>
              <ul className="list-disc list-inside pl-4 space-y-1">
                <li>All data transmitted via HTTPS/TLS encryption</li>
                <li>Database protected by Supabase Row Level Security (RLS)</li>
                <li>Authentication managed by Supabase Auth with secure session handling</li>
                <li>Payment data processed by Paddle (PCI-DSS Level 1 compliant)</li>
                <li>Regular security reviews and dependency updates</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-xl text-[#1d2832] mb-3">10. Your Rights (GDPR)</h2>
            <div className="text-sm text-[#43474c] leading-relaxed space-y-2">
              <p>Under GDPR, you have the following rights:</p>
              <ul className="list-disc list-inside pl-4 space-y-1">
                <li><strong>Access (Art. 15):</strong> Request a copy of your personal data</li>
                <li><strong>Rectification (Art. 16):</strong> Correct inaccurate or incomplete data</li>
                <li><strong>Erasure (Art. 17):</strong> Request deletion of your personal data (&quot;right to be forgotten&quot;)</li>
                <li><strong>Restriction (Art. 18):</strong> Limit how we process your data</li>
                <li><strong>Portability (Art. 20):</strong> Receive your data in a structured, machine-readable format</li>
                <li><strong>Objection (Art. 21):</strong> Object to processing based on legitimate interest</li>
                <li><strong>Withdraw consent (Art. 7):</strong> Withdraw consent at any time where processing is based on consent</li>
                <li><strong>Complaint:</strong> Lodge a complaint with a supervisory authority (e.g., Berliner Beauftragte für Datenschutz)</li>
              </ul>
              <p>To exercise any of these rights, contact us at{' '}
                <a href="mailto:zestioai1@gmail.com" className="text-[#006c4d] underline">zestioai1@gmail.com</a>.
                We will respond within 30 days.</p>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-xl text-[#1d2832] mb-3">11. International Data Transfers</h2>
            <div className="text-sm text-[#43474c] leading-relaxed space-y-2">
              <p>Some of our AI processing partners are located outside the EU/EEA (United States). Data transfers
                to these partners are covered by Standard Contractual Clauses (SCCs) and the EU-US Data Privacy
                Framework where applicable. We ensure that all transfers include adequate safeguards as required
                by GDPR Chapter V.</p>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-xl text-[#1d2832] mb-3">12. Children&apos;s Privacy</h2>
            <div className="text-sm text-[#43474c] leading-relaxed space-y-2">
              <p>The Service is not intended for use by persons under 18 years of age. We do not knowingly collect
                personal data from children. If we become aware that we have collected data from a person under 18,
                we will take steps to delete it promptly.</p>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-xl text-[#1d2832] mb-3">13. Changes to This Policy</h2>
            <div className="text-sm text-[#43474c] leading-relaxed space-y-2">
              <p>We may update this Privacy Policy from time to time. We will notify you of material changes via email
                or a prominent notice on the Service. We encourage you to review this page periodically.</p>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-xl text-[#1d2832] mb-3">14. Contact</h2>
            <div className="text-sm text-[#43474c] leading-relaxed space-y-2">
              <p>For privacy questions, data requests, or to exercise your rights, contact us at:</p>
              <p>
                <a href="mailto:zestioai1@gmail.com" className="text-[#006c4d] underline">
                  zestioai1@gmail.com
                </a>
              </p>
              <p className="text-xs text-[#43474c]/70 mt-4">
                If you are not satisfied with our response, you have the right to lodge a complaint with a
                supervisory authority in your EU member state.
              </p>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
