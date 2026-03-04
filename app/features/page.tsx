'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-md z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-foreground hover:text-primary transition">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
          <h1 className="text-2xl font-bold">Features</h1>
          <div></div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12 mb-20">
          <div>
            <h2 className="text-3xl font-bold mb-4">Visual Component Builder</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Drag and drop pre-built components to create complex layouts. No coding required. Supports nested components, responsive sizing, and pixel-perfect alignment.
            </p>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <span className="text-primary">✓</span>
                <span>25+ pre-built components</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">✓</span>
                <span>Custom component support</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">✓</span>
                <span>Responsive design tools</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">✓</span>
                <span>Real-time preview</span>
              </li>
            </ul>
          </div>
          <div className="bg-card border border-border rounded-xl p-8 h-80 flex items-center justify-center">
            <p className="text-muted-foreground text-center">Component preview area</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-20">
          <div className="bg-card border border-border rounded-xl p-8 h-80 flex items-center justify-center order-2 md:order-1">
            <p className="text-muted-foreground text-center">Data binding preview</p>
          </div>
          <div className="order-1 md:order-2">
            <h2 className="text-3xl font-bold mb-4">Dynamic Data Binding</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Connect your UIs to APIs and databases. Bind data to components with simple configuration. Support for transformations and computed properties.
            </p>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <span className="text-primary">✓</span>
                <span>REST API integration</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">✓</span>
                <span>Real-time data updates</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">✓</span>
                <span>Data transformation</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">✓</span>
                <span>Error handling</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold mb-4">Instant Publishing</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Deploy your designs instantly to production without rebuilding your app. Changes are live within seconds.
            </p>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <span className="text-primary">✓</span>
                <span>Zero-downtime deployment</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">✓</span>
                <span>Instant rollback</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">✓</span>
                <span>Version history</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">✓</span>
                <span>A/B testing support</span>
              </li>
            </ul>
          </div>
          <div className="bg-card border border-border rounded-xl p-8 h-80 flex items-center justify-center">
            <p className="text-muted-foreground text-center">Publishing flow preview</p>
          </div>
        </div>
      </main>

      {/* CTA */}
      <section className="border-t border-border py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <Link href="/signup">
            <Button size="lg" className="rounded-full px-8">
              Start Building <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
