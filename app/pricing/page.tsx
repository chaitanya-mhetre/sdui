'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, ArrowLeft, Zap, Shield, Globe, Star } from 'lucide-react';
import Badge from '@/components/marketing/Badge';
import SiteLayout from '@/components/marketing/SiteLayout';

export default function PricingPage() {
  const plans = [
    {
      name: 'Standard',
      price: '$0',
      description: 'Initialize your first node clusters',
      features: ['5 Projects', 'Basic UI Materialization', 'Community Registry Access', 'Standard Node Latency'],
      cta: 'Initialize_Free',
      popular: false,
    },
    {
      name: 'Industrial',
      price: '$29',
      period: '/month',
      description: 'For high-scale distribution',
      features: [
        'Unlimited Global Projects',
        'Direct-to-Metal Rendering',
        'Atomic Priority Sync',
        'Global Edge Proxy Access',
        'Schema Logic Engine v4',
        'Industrial Support Node',
      ],
      cta: 'Start_Deployment',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For global infrastructure',
      features: [
        'Everything in Industrial',
        'Dedicated Node Clusters',
        'Military-Grade Encryption',
        'On-Premise Deployment',
        'Custom Proxy Sharding',
        'Direct Core Access',
      ],
      cta: 'Request_Access',
      popular: false,
    },
  ];

  return (
    <SiteLayout>
      <div className="pt-32 pb-24 px-6 md:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Heading */}
          <div className="text-center mb-20 md:mb-32">
            <Badge className="mb-8">Resource Allocation</Badge>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight text-white mb-8">
              Scalable <span className="text-emerald-500 italic">Protocols</span>
            </h1>
            <p className="text-zinc-400 text-lg md:text-xl font-medium max-w-3xl mx-auto leading-relaxed">
              Select the distribution tier required for your global materialization needs. Zero overhead, infinite scale.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-32">
            {plans.map((plan, idx) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`p-8 md:p-10 rounded-[2.5rem] border flex flex-col relative overflow-hidden group transition-all duration-500 ${plan.popular
                    ? 'bg-emerald-500 text-black border-transparent shadow-[0_40px_80px_rgba(16,185,129,0.2)] scale-105 z-10'
                    : 'bg-white/[0.03] border-white/[0.08] text-white hover:border-emerald-500/30'
                  }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 p-8">
                    <Star className="w-8 h-8 opacity-20" fill="currentColor" />
                  </div>
                )}

                <div className="relative z-10">
                  <h3 className="text-2xl font-black uppercase tracking-tight mb-2 italic">{plan.name}</h3>
                  <p className={`text-sm font-semibold mb-8 ${plan.popular ? 'text-black/60' : 'text-zinc-500'}`}>{plan.description}</p>

                  <div className="mb-10">
                    <span className="text-5xl font-black italic tracking-tighter">{plan.price}</span>
                    {plan.period && <span className={`text-sm font-black uppercase tracking-widest ${plan.popular ? 'text-black/60' : 'text-zinc-500'}`}>{plan.period}</span>}
                  </div>

                  <button
                    className={`w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] mb-10 transition-all active:scale-95 shadow-2xl ${plan.popular ? 'bg-black text-white hover:bg-zinc-900' : 'bg-white text-black hover:bg-emerald-400'
                      }`}
                  >
                    {plan.cta}
                  </button>

                  <div className="space-y-5">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-4">
                        <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.popular ? 'text-black' : 'text-emerald-500'}`} />
                        <span className={`text-sm font-bold ${plan.popular ? 'text-black/80' : 'text-zinc-400'}`}>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Infrastructure Metrics */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 md:p-12 rounded-[2.5rem] bg-white/[0.02] border border-white/[0.08] backdrop-blur-3xl">
              <h3 className="text-xl font-black uppercase tracking-tight text-white mb-8 flex items-center gap-4">
                <Globe className="w-5 h-5 text-emerald-500" />
                Regional Distribution
              </h3>
              <div className="space-y-6">
                {['US_CENTRAL_01', 'EU_WEST_02', 'AP_SOUTH_01'].map(id => (
                  <div key={id} className="flex items-center justify-between p-4 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{id}</span>
                    <span className="text-[10px] font-black text-emerald-500 uppercase italic">ACTIVE_NODE</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-8 md:p-12 rounded-[2.5rem] bg-white/[0.02] border border-white/[0.08] backdrop-blur-3xl">
              <h3 className="text-xl font-black uppercase tracking-tight text-white mb-8 flex items-center gap-4">
                <Zap className="w-5 h-5 text-emerald-500" />
                Performance Metrics
              </h3>
              <div className="space-y-8">
                {[
                  { label: "Materialization Time", value: "0.2ms" },
                  { label: "Consistency Factor", value: "100%" },
                  { label: "Registry Latency", value: "8ms" }
                ].map(stat => (
                  <div key={stat.label} className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-500">
                      <span>{stat.label}</span>
                      <span className="text-emerald-500">{stat.value}</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 w-full opacity-30 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
