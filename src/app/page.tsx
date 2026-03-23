'use client';

import { Header } from '@/components/Header';
import Link from 'next/link';
import {
  Sparkles,
  Home as HomeIcon,
  Video,
  Camera,
  Zap,
  Clock,
  Euro,
  CheckCircle,
  ArrowRight,
  Star,
  Building2
} from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: 'AI Photo Enhancement',
    description: 'Transform dull property photos into stunning, professional images with one click.',
    href: '/enhance',
  },
  {
    icon: HomeIcon,
    title: 'Virtual Staging',
    description: 'Add realistic furniture to empty rooms. Help buyers visualize the potential.',
    href: '/enhance',
  },
  {
    icon: Building2,
    title: 'Floor Plan to 3D',
    description: 'Convert 2D floor plans into interactive 3D models. Coming soon.',
    href: '/floorplan',
  },
  {
    icon: Video,
    title: 'Cinematic Videos',
    description: 'Generate professional walkthrough videos from property photos. Coming soon.',
    href: '#',
  },
];

const benefits = [
  { icon: Clock, text: 'Save hours on photo editing' },
  { icon: Euro, text: 'No expensive photographer needed' },
  { icon: Zap, text: 'Results in seconds, not days' },
  { icon: CheckCircle, text: 'Stand out from 90% of listings' },
];

const testimonials = [
  {
    name: 'Maria Schmidt',
    role: 'Immobilienmaklerin, Berlin',
    text: 'PropertyPix hat meine Exposé-Erstellung von 3 Stunden auf 30 Minuten verkürzt.',
    rating: 5,
  },
  {
    name: 'Thomas Weber',
    role: 'Makler, München',
    text: 'Die virtuellen Möbelierungen sehen täuschend echt aus. Meine Kunden sind begeistert.',
    rating: 5,
  },
];

const pricingPlans = [
  {
    name: 'Free',
    price: '€0',
    period: '/monat',
    description: 'Für den Einstieg',
    features: ['5 Enhancements pro Monat', 'Auto-Enhance', 'Standard Qualität'],
    cta: 'Kostenlos starten',
    href: '/auth',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '€19',
    period: '/monat',
    description: 'Für aktive Makler',
    features: [
      '100 Enhancements pro Monat',
      'Alle Enhancement-Typen',
      'Virtual Staging',
      'Prioritätsverarbeitung',
      'HD Qualität',
    ],
    cta: 'Pro wählen',
    href: '/pricing',
    highlighted: true,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 rounded-full text-indigo-700 text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              KI-gestützte Immobilienfotografie
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Verwandeln Sie Ihre
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600"> Immobilienfotos</span>
              <br />in Verkaufsmagneten
            </h1>

            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
              Professionelle Bildverbesserung, virtuelles Home-Staging und 3D-Grundrisse –
              alles in einer Plattform. Speziell für deutsche Immobilienmakler.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/enhance"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
              >
                <Sparkles className="w-5 h-5" />
                Jetzt kostenlos testen
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors border border-gray-200"
              >
                Preise ansehen
              </Link>
            </div>

            <p className="mt-6 text-sm text-gray-500">
              Keine Kreditkarte erforderlich • 5 kostenlose Enhancements
            </p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-96 h-96 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full blur-3xl opacity-30" />
      </section>

      {/* Benefits Bar */}
      <section className="bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3 justify-center text-white">
                <benefit.icon className="w-5 h-5 text-indigo-400" />
                <span className="text-sm font-medium">{benefit.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Alles was Sie brauchen
            </h2>
            <p className="text-xl text-gray-600">
              Eine Plattform für alle Ihre Immobilien-Marketing-Bedürfnisse
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Link
                key={index}
                href={feature.href}
                className="group p-6 bg-gray-50 rounded-2xl hover:bg-indigo-50 hover:shadow-lg transition-all"
              >
                <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-200 transition-colors">
                  <feature.icon className="w-7 h-7 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              So einfach geht's
            </h2>
            <p className="text-xl text-gray-600">
              Drei Schritte zu perfekten Immobilienfotos
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Foto hochladen', desc: 'Laden Sie Ihre Immobilienfotos per Drag & Drop hoch.' },
              { step: '2', title: 'Verbesserung wählen', desc: 'Wählen Sie Auto-Enhance, Virtual Staging oder Himmelsersatz.' },
              { step: '3', title: 'Herunterladen', desc: 'Erhalten Sie professionelle Ergebnisse in Sekunden.' },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Was unsere Kunden sagen
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-8">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Einfache, transparente Preise
            </h2>
            <p className="text-xl text-gray-600">
              Keine versteckten Gebühren. Monatlich kündbar.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`bg-white rounded-2xl p-8 ${
                  plan.highlighted
                    ? 'ring-2 ring-indigo-600 shadow-xl'
                    : 'border border-gray-200'
                }`}
              >
                {plan.highlighted && (
                  <div className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full mb-4">
                    Beliebteste Wahl
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-500">{plan.period}</span>
                </div>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`block w-full text-center py-3 rounded-xl font-semibold transition-colors ${
                    plan.highlighted
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Bereit, Ihre Immobilienfotos zu transformieren?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Starten Sie kostenlos und sehen Sie den Unterschied.
          </p>
          <Link
            href="/enhance"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
          >
            <Sparkles className="w-5 h-5" />
            Jetzt kostenlos testen
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <span className="text-white font-bold text-xl">PropertyPix Pro</span>
            </div>
            <div className="flex gap-6 text-gray-400 text-sm">
              <Link href="/enhance" className="hover:text-white transition-colors">Enhance</Link>
              <Link href="/pricing" className="hover:text-white transition-colors">Preise</Link>
              <Link href="/auth" className="hover:text-white transition-colors">Anmelden</Link>
            </div>
            <p className="text-gray-500 text-sm">
              © 2026 PropertyPix Pro. Alle Rechte vorbehalten.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
