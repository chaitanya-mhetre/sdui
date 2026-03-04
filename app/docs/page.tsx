'use client';

import Link from 'next/link';
import { ArrowLeft, Code2, BookOpen, Zap } from 'lucide-react';

export default function DocsPage() {
  const sections = [
    {
      title: 'Getting Started',
      icon: Zap,
      items: [
        { title: 'Installation', href: '#' },
        { title: 'Quick Start', href: '#' },
        { title: 'Configuration', href: '#' },
      ],
    },
    {
      title: 'API Reference',
      icon: Code2,
      items: [
        { title: 'Projects API', href: '#' },
        { title: 'Layouts API', href: '#' },
        { title: 'Components API', href: '#' },
        { title: 'Authentication', href: '#' },
      ],
    },
    {
      title: 'Guides',
      icon: BookOpen,
      items: [
        { title: 'Building Your First UI', href: '#' },
        { title: 'Data Binding', href: '#' },
        { title: 'Custom Components', href: '#' },
        { title: 'Publishing to Production', href: '#' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-md z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center">
          <Link href="/" className="flex items-center gap-2 text-foreground hover:text-primary transition">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-20">
        {/* Hero */}
        <div className="mb-16">
          <h1 className="text-4xl font-bold mb-4">Documentation</h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Learn how to build amazing mobile UIs with BuildUI. Comprehensive guides and API reference.
          </p>
        </div>

        {/* Documentation Sections */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.title} className="bg-card border border-border rounded-lg p-8">
                <Icon className="w-8 h-8 text-primary mb-4" />
                <h2 className="text-xl font-semibold mb-4">{section.title}</h2>
                <ul className="space-y-2">
                  {section.items.map((item) => (
                    <li key={item.title}>
                      <Link href={item.href} className="text-muted-foreground hover:text-primary transition text-sm">
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Example Section */}
        <section className="bg-card border border-border rounded-lg p-8 mb-16">
          <h2 className="text-2xl font-bold mb-4">API Example</h2>
          <p className="text-muted-foreground mb-6">
            Here's a quick example of how to fetch a project layout using our API:
          </p>
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono">
            {`const response = await fetch(
  'https://api.buildui.dev/projects/{projectId}/layout',
  {
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY'
    }
  }
);

const layout = await response.json();
console.log(layout);`}
          </pre>
        </section>

        {/* Support */}
        <section className="text-center">
          <h2 className="text-2xl font-bold mb-4">Need Help?</h2>
          <p className="text-muted-foreground mb-6">
            Can't find what you're looking for? Check out our community forum or contact support.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="#" className="text-primary hover:underline">
              Community Forum
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link href="#" className="text-primary hover:underline">
              Contact Support
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link href="#" className="text-primary hover:underline">
              GitHub Issues
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
