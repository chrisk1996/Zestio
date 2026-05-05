import { Header } from '@/components/Header';

export const metadata = {
  title: 'Terms of Service - Zestio',
  description: 'Terms of Service for Zestio AI-powered real estate platform',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#f7f9ff]">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">

        <h1 className="font-serif text-4xl text-[#1d2832] mb-2">Terms of Service</h1>
        <p className="text-sm text-[#43474c] mb-10">Last updated: May 2025</p>

        <div className="bg-white rounded-lg border border-[#c4c6cd]/20 p-8 space-y-8">

          <section>
            <h2 className="font-serif text-xl text-[#1d2832] mb-3">1. Acceptance of Terms</h2>
            <p className="text-sm text-[#43474c] leading-relaxed">
              By accessing or using Zestio (&quot;the Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;).
              If you do not agree to these Terms, you may not access or use the Service. These Terms apply to all visitors,
              users, and others who access or use the Service.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-[#1d2832] mb-3">2. Description of Service</h2>
            <p className="text-sm text-[#43474c] leading-relaxed">
              Zestio is an AI-powered real estate media platform that provides image enhancement, virtual staging,
              video generation, floor plan creation, listing description generation, and social media content tools.
              The Service processes uploaded images and data using artificial intelligence models to generate
              enhanced visual and written content.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-[#1d2832] mb-3">3. Accounts &amp; Registration</h2>
            <div className="text-sm text-[#43474c] leading-relaxed space-y-2">
              <p>To use certain features, you must create an account. When registering, you agree to:</p>
              <ul className="list-disc list-inside pl-4 space-y-1">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and promptly update your account information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Accept responsibility for all activities under your account</li>
              </ul>
              <p>You must be at least 18 years old to create an account.</p>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-xl text-[#1d2832] mb-3">4. Credits &amp; Pricing</h2>
            <div className="text-sm text-[#43474c] leading-relaxed space-y-2">
              <p>Zestio uses a credit-based system. Certain features consume credits based on the processing resources required.</p>
              <ul className="list-disc list-inside pl-4 space-y-1">
                <li><strong>Free tier:</strong> Includes a limited number of credits upon registration</li>
                <li><strong>Paid plans:</strong> Monthly subscription plans with a set credit allocation</li>
                <li><strong>Credit consumption:</strong> Each feature displays its credit cost before processing</li>
                <li><strong>Expiration:</strong> Credits do not expire as long as your subscription is active</li>
                <li><strong>Downgrade:</strong> Unused credits are preserved when downgrading or cancelling</li>
              </ul>
              <p>Credit pricing and feature costs may be updated with 30 days&apos; notice.</p>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-xl text-[#1d2832] mb-3">5. Subscription &amp; Billing</h2>
            <div className="text-sm text-[#43474c] leading-relaxed space-y-2">
              <p>Paid subscriptions are billed monthly through our payment provider (Paddle). By subscribing, you agree to:</p>
              <ul className="list-disc list-inside pl-4 space-y-1">
                <li>Recurring monthly billing at the then-current rate</li>
                <li>Prorated charges when switching between plans mid-cycle</li>
                <li>Automatic renewal unless cancelled before the next billing date</li>
              </ul>
              <p><strong>Cancellation:</strong> You may cancel your subscription at any time. Upon cancellation:</p>
              <ul className="list-disc list-inside pl-4 space-y-1">
                <li>Your subscription remains active until the end of the current billing period</li>
                <li>Unused credits are preserved and remain available</li>
                <li>Your account reverts to the free tier after the billing period ends</li>
              </ul>
              <p><strong>Refunds:</strong> Prorated refunds are available within 14 days of initial purchase. After 14 days,
                subscription fees are non-refundable.</p>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-xl text-[#1d2832] mb-3">6. Acceptable Use</h2>
            <div className="text-sm text-[#43474c] leading-relaxed space-y-2">
              <p>You agree not to use the Service to:</p>
              <ul className="list-disc list-inside pl-4 space-y-1">
                <li>Generate misleading, deceptive, or fraudulent content</li>
                <li>Infringe on the intellectual property rights of others</li>
                <li>Process images you do not have the right to use</li>
                <li>Create content that is illegal, harmful, or discriminatory</li>
                <li>Attempt to reverse-engineer, scrape, or abuse the Service or its APIs</li>
                <li>Resell or redistribute access to the Service without authorization</li>
                <li>Use automated tools to access the Service beyond documented API limits</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-xl text-[#1d2832] mb-3">7. Intellectual Property</h2>
            <div className="text-sm text-[#43474c] leading-relaxed space-y-2">
              <p><strong>Your content:</strong> You retain ownership of all images and data you upload to the Service.
                By uploading content, you grant Zestio a limited, non-exclusive license to process and store
                it solely for the purpose of providing the Service.</p>
              <p><strong>Generated content:</strong> Content generated by the Service (enhanced images, videos, descriptions,
                etc.) is owned by you and may be used for your business purposes, including real estate listings,
                marketing materials, and social media.</p>
              <p><strong>Zestio IP:</strong> The Service itself, including its design, logos, branding, and underlying
                technology, is the property of Zestio and is protected by intellectual property laws.</p>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-xl text-[#1d2832] mb-3">8. User-Generated Content</h2>
            <div className="text-sm text-[#43474c] leading-relaxed space-y-2">
              <p>You are solely responsible for the content you upload and the results generated from it. You represent
                that you have all necessary rights to the images and data you submit. Zestio does not pre-screen
                uploaded content but reserves the right to remove or refuse processing of any content that
                violates these Terms.</p>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-xl text-[#1d2832] mb-3">9. Service Availability</h2>
            <div className="text-sm text-[#43474c] leading-relaxed space-y-2">
              <p>Zestio strives to provide uninterrupted service but does not guarantee 100% availability. We may experience
                downtime for maintenance, updates, or factors beyond our control. AI processing times vary based on
                complexity and demand. We are not liable for delays or failures resulting from third-party service
                providers (AI model providers, cloud infrastructure, etc.).</p>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-xl text-[#1d2832] mb-3">10. Limitation of Liability</h2>
            <div className="text-sm text-[#43474c] leading-relaxed space-y-2">
              <p>The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, either express or
                implied. To the fullest extent permitted by law, Zestio shall not be liable for any indirect, incidental,
                special, consequential, or punitive damages, including but not limited to loss of profits, data,
                or business opportunities arising from your use of the Service.</p>
              <p>Our total liability shall not exceed the amount you paid for the Service in the 12 months preceding
                the claim.</p>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-xl text-[#1d2832] mb-3">11. Indemnification</h2>
            <div className="text-sm text-[#43474c] leading-relaxed space-y-2">
              <p>You agree to indemnify and hold harmless Zestio and its operators from any claims, damages, or expenses
                arising from your use of the Service, your violation of these Terms, or your violation of any rights
                of a third party.</p>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-xl text-[#1d2832] mb-3">12. Modifications</h2>
            <div className="text-sm text-[#43474c] leading-relaxed space-y-2">
              <p>We may update these Terms from time to time. We will notify you of material changes via email or
                a notice within the Service. Continued use of the Service after changes take effect constitutes
                acceptance of the revised Terms. We encourage you to review these Terms periodically.</p>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-xl text-[#1d2832] mb-3">13. Governing Law</h2>
            <div className="text-sm text-[#43474c] leading-relaxed space-y-2">
              <p>These Terms are governed by the laws of Germany. Any disputes arising from these Terms or the Service
                shall be resolved in the courts of Berlin, Germany.</p>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-xl text-[#1d2832] mb-3">14. Contact</h2>
            <p className="text-sm text-[#43474c] leading-relaxed">
              For questions about these Terms, contact us at{' '}
              <a href="mailto:zestioai1@gmail.com" className="text-[#006c4d] underline">
                zestioai1@gmail.com
              </a>
            </p>
          </section>

        </div>
      </main>
    </div>
  );
}
