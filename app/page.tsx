'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Layout as LayoutIcon, Code2, Smartphone, GitBranch } from 'lucide-react';
import { motion } from 'framer-motion';
import { AnimatedPage } from '@/components/common/AnimatedPage';
import { containerVariants, itemVariants, slideUpVariants } from '@/lib/animations';

export default function Home() {
  return (
    <AnimatedPage className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
            BuildUI
          </div>
          <div className="flex items-center gap-8">
            <Link href="/features" className="text-sm text-muted-foreground hover:text-foreground transition">
              Features
            </Link>
            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition">
              Pricing
            </Link>
            <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition">
              Docs
            </Link>
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition">
              Sign In
            </Link>
            <Link href="/signup">
              <Button className="rounded-full" size="sm">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block px-4 py-1 rounded-full bg-primary/10 border border-primary/30 text-sm text-primary mb-8">
            Server-Driven UI Platform
          </div>

          <h1 className="text-6xl font-bold mb-6 leading-tight text-balance">
            Build Mobile UIs Faster Than Ever
          </h1>

          <p className="text-xl text-muted-foreground mb-12 text-balance max-w-2xl mx-auto">
            Design beautiful, responsive interfaces visually. Export as JSON and deploy to your iOS or Android app instantly. No code required.
          </p>

          <div className="flex items-center justify-center gap-4 mb-20">
            <Link href="/signup">
              <Button size="lg" className="rounded-full px-8">
                Start Building <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/docs">
              <Button variant="outline" size="lg" className="rounded-full px-8">
                View Documentation
              </Button>
            </Link>
          </div>

          {/* Hero Image / Canvas Preview */}
          <div className="relative rounded-2xl overflow-hidden bg-card border border-border h-96 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary/20 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <LayoutIcon className="w-10 h-10 text-primary" />
              </div>
              <p className="text-muted-foreground">Canvas Preview Coming Soon</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">50K+</div>
              <p className="text-muted-foreground">Projects Created</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">10M+</div>
              <p className="text-muted-foreground">UI Components Exported</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">99.9%</div>
              <p className="text-muted-foreground">Uptime SLA</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <p className="text-muted-foreground">Developer Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Everything You Need</h2>
          <p className="text-center text-muted-foreground mb-16 max-w-2xl mx-auto">
            A complete toolchain for designing and shipping mobile UIs at scale
          </p>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            {/* Feature 1 */}
            <motion.div
              className="p-8 rounded-xl bg-card/50 backdrop-blur-sm border border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/10"
              variants={itemVariants}
              whileHover={{ y: -4 }}
            >
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                <LayoutIcon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Visual Builder</h3>
              <p className="text-muted-foreground">
                Drag and drop components to build layouts. No Figma plugin needed.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              className="p-8 rounded-xl bg-card/50 backdrop-blur-sm border border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/10"
              variants={itemVariants}
              whileHover={{ y: -4 }}
            >
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                <Code2 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">JSON Export</h3>
              <p className="text-muted-foreground">
                Export your designs as JSON. Consume with any native SDK or custom renderer.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              className="p-8 rounded-xl bg-card/50 backdrop-blur-sm border border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/10"
              variants={itemVariants}
              whileHover={{ y: -4 }}
            >
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                <Smartphone className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Multi-Device</h3>
              <p className="text-muted-foreground">
                Preview across iOS, Android, web, and tablet sizes in real-time.
              </p>
            </motion.div>

            {/* Feature 4 */}
            <motion.div
              className="p-8 rounded-xl bg-card/50 backdrop-blur-sm border border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/10"
              variants={itemVariants}
              whileHover={{ y: -4 }}
            >
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                <GitBranch className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Version Control</h3>
              <p className="text-muted-foreground">
                Automatic version history with branching and rollback capabilities.
              </p>
            </motion.div>

            {/* Feature 5 */}
            <motion.div
              className="p-8 rounded-xl bg-card/50 backdrop-blur-sm border border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/10"
              variants={itemVariants}
              whileHover={{ y: -4 }}
            >
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Instant Deploy</h3>
              <p className="text-muted-foreground">
                Publish changes instantly to your live app. No rebuild required.
              </p>
            </motion.div>

            {/* Feature 6 */}
            <motion.div
              className="p-8 rounded-xl bg-card/50 backdrop-blur-sm border border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/10"
              variants={itemVariants}
              whileHover={{ y: -4 }}
            >
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                <Code2 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">API-First</h3>
              <p className="text-muted-foreground">
                RESTful API for programmatic access to your projects and exports.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 border-t border-border">
        <div className="max-w-4xl mx-auto text-center bg-card border border-border rounded-2xl p-12">
          <h2 className="text-4xl font-bold mb-4">Ready to Ship Faster?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of teams building mobile apps with BuildUI.
          </p>
          <Link href="/signup">
            <Button size="lg" className="rounded-full px-8">
              Get Started for Free <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li>
                  <Link href="/features" className="hover:text-foreground transition">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-foreground transition">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/docs" className="hover:text-foreground transition">
                    Documentation
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Community
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Status
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-8 flex items-center justify-between text-muted-foreground text-sm">
            <p>&copy; 2024 BuildUI. All rights reserved.</p>
            <p>Made with care for mobile developers</p>
          </div>
        </div>
      </footer>
    </AnimatedPage>
  );
}
