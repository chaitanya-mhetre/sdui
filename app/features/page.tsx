'use client';

import { motion } from 'framer-motion';
import { Cpu, Zap, Globe, Shield, Activity, Boxes, Code2, Layers, RefreshCw } from 'lucide-react';
import Badge from '@/components/marketing/Badge';
import SiteLayout from '@/components/marketing/SiteLayout';

export default function FeaturesPage() {
  const features = [
    {
      icon: Cpu,
      title: "Native Edge Rendering",
      description: "Direct-to-metal rendering logic that bypasses standard JS bridges for maximum performance on any device."
    },
    {
      icon: Zap,
      title: "Atomic State Sync",
      description: "Surgical state propagation protocol that ensures zero-drift synchronization across global node clusters."
    },
    {
      icon: Layers,
      title: "Multi-Platform Core",
      description: "One unified schema that materializes pixel-perfect layouts on iOS, Android, and Web simultaneously."
    },
    {
      icon: RefreshCw,
      title: "Zero-Build Updates",
      description: "Push structural UI changes to production instantly without app store reviews or binary rebuilds."
    },
    {
      icon: Shield,
      title: "Industrial Security",
      description: "Military-grade encryption for schema delivery with automated node integrity verification."
    },
    {
      icon: Code2,
      title: "Semantic Logic",
      description: "Embed complex business rules directly into your UI schemas with our proprietary logic engine."
    }
  ];

  return (
    <SiteLayout>
      <div className="pt-32 pb-24 px-6 md:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-20 md:mb-32">
            <Badge className="mb-8">Core Capabilities</Badge>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight mb-8 text-white">
              Engineered for <span className="text-emerald-500 italic">Complexity</span>
            </h1>
            <p className="text-zinc-400 text-lg md:text-xl font-medium max-w-3xl mx-auto leading-relaxed">
              The SDUI Industrial Engine provides the infrastructure needed to manage complex, dynamic UIs at scale with surgical precision.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-32">
            {features.map((feature, idx) => (
              <motion.div
                key={feature.title}
                {...({
                  initial: { opacity: 0, y: 20 },
                  whileInView: { opacity: 1, y: 0 },
                  viewport: { once: true },
                  transition: { delay: idx * 0.1 },
                  className: "p-8 md:p-10 rounded-3xl bg-white/[0.03] border border-white/[0.08] hover:border-emerald-500/30 transition-all group relative overflow-hidden"
                } as any)}
              >
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/5 blur-[50px] group-hover:bg-emerald-500/10 transition-all" />
                <div className="w-14 h-14 rounded-2xl bg-black border border-white/[0.1] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-2xl">
                  <feature.icon className="w-7 h-7 text-emerald-500" />
                </div>
                <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight mb-4 text-white group-hover:text-emerald-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-zinc-400 font-medium leading-relaxed group-hover:text-zinc-300 transition-colors">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Comparison Section */}
          <div className="p-8 md:p-16 rounded-[2.5rem] md:rounded-[4rem] bg-gradient-to-br from-white/[0.05] to-transparent border border-white/[0.08] relative overflow-hidden">
            <div className="absolute top-0 right-10 w-96 h-96 bg-emerald-500/[0.02] blur-[120px]" />
            <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <Badge className="mb-8">Infrastructure</Badge>
                <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-8 text-white italic">
                  Standard vs <span className="text-emerald-500">Industrial</span>
                </h2>
                <div className="space-y-6">
                  {[
                    "Direct hardware acceleration vs WebView bridges",
                    "Atomic synchronization vs eventual consistency",
                    "Schema-embedded logic vs client-side overhead",
                    "Infinite scale multi-node clusters vs monolithic setups"
                  ].map((text, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <div className="mt-1.5 w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      </div>
                      <p className="text-zinc-300 font-semibold">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-black/40 backdrop-blur-3xl border border-white/[0.05] rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-8">
                  <Activity className="w-5 h-5 text-emerald-500" />
                  <span className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">Live_Performance_Metrics</span>
                </div>
                <div className="space-y-8">
                  {[
                    { label: "Rendering Latency", value: "0.4ms", percent: 98 },
                    { label: "Propagation Speed", value: "12ms", percent: 94 },
                    { label: "Memory Footprint", value: "2.8MB", percent: 88 }
                  ].map(stat => (
                    <div key={stat.label} className="space-y-3">
                      <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-zinc-400">
                        <span>{stat.label}</span>
                        <span className="text-emerald-500">{stat.value}</span>
                      </div>
                      <div className="h-1.5 bg-zinc-950 rounded-full overflow-hidden">
                        <motion.div
                          {...({
                            initial: { width: 0 },
                            whileInView: { width: `${stat.percent}%` },
                            transition: { duration: 1, ease: "easeOut" },
                            className: "h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                          } as any)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
