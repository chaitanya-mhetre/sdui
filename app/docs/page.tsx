'use client';

import { motion } from 'framer-motion';
import { Search, Book, Code2, Terminal, Lightbulb, ChevronRight, FileCode, Workflow, Share2 } from 'lucide-react';
import Badge from '@/components/marketing/Badge';
import SiteLayout from '@/components/marketing/SiteLayout';

export default function DocsPage() {
  const categories = [
    {
      title: "Getting Started",
      icon: Book,
      items: ["Introduction", "Quick Start Guide", "Architecture Overview", "Node Installation"]
    },
    {
      title: "Core Concepts",
      icon: Workflow,
      items: ["Schema Definition", "Atomic State Propagation", "Layout Materialization", "Event Bus"]
    },
    {
      title: "SDK Integration",
      icon: Code2,
      items: ["iOS Native SDK", "Android Native SDK", "React Web Integration", "Flutter Engine"]
    }
  ];

  return (
    <SiteLayout>
      <div className="pt-32 pb-24 px-6 md:px-8 lg:px-12 min-h-screen">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 md:gap-24">
          {/* Sidebar */}
          <aside className="w-full lg:w-72 space-y-12">
            <div>
              <div className="relative mb-12">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="SEARCH_DOCS..."
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-3 pl-12 pr-4 text-xs font-black uppercase tracking-widest text-zinc-300 focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>
              <nav className="space-y-12">
                {categories.map(cat => (
                  <div key={cat.title}>
                    <div className="flex items-center gap-3 mb-6">
                      <cat.icon className="w-4 h-4 text-emerald-500" />
                      <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500">{cat.title}</h3>
                    </div>
                    <ul className="space-y-4">
                      {cat.items.map(item => (
                        <li key={item} className="group">
                          <a href="#" className="flex items-center justify-between text-sm font-semibold text-zinc-400 group-hover:text-emerald-400 transition-colors">
                            {item}
                            <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 max-w-4xl">
            <Badge className="mb-8">Resource Library</Badge>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight text-white mb-10 leading-[1.05]">
              Documentation <span className="text-emerald-500 italic">v4.2</span>
            </h1>

            <div className="prose prose-invert prose-zinc max-w-none">
              <section className="mb-20">
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white mb-6 flex items-center gap-4">
                  <Terminal className="w-6 h-6 text-emerald-500" />
                  Introduction
                </h2>
                <p className="text-zinc-400 text-lg leading-relaxed mb-8">
                  SDUI Industrial is a high-performance, server-driven UI engine designed for large-scale enterprise applications. It allows you to define your application's structure, logic, and visual presentation in a unified JSON schema, which is then materialized into native components on the fly.
                </p>
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <Lightbulb className="w-5 h-5 text-amber-500" />
                    <span className="text-xs font-black uppercase tracking-widest text-zinc-300">Key Takeaway</span>
                  </div>
                  <p className="text-zinc-400 font-medium italic leading-relaxed">
                    Unlike traditional SDUI approaches that rely on heavy bridges or WebViews, SDUI Industrial uses a pre-compiled native component library and atomic state updates to achieve near-instantaneous UI materialization.
                  </p>
                </div>
              </section>

              <section className="mb-20">
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white mb-6 flex items-center gap-4">
                  <FileCode className="w-6 h-6 text-emerald-500" />
                  Quick Installation
                </h2>
                <p className="text-zinc-400 mb-8">To initialize the engine on your local node, use our global CLI wrapper:</p>
                <div className="bg-[#030303] border border-white/[0.1] rounded-2xl p-6 font-mono text-sm group relative">
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Share2 className="w-4 h-4 text-zinc-500 hover:text-white cursor-pointer" />
                  </div>
                  <div className="flex gap-4">
                    <span className="text-zinc-600 select-none">1</span>
                    <span className="text-emerald-400">npx</span>
                    <span className="text-zinc-300">@sdui-industrial/cli init</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-zinc-600 select-none">2</span>
                    <span className="text-emerald-400">sdui</span>
                    <span className="text-zinc-300">sync --region global</span>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white mb-6 flex items-center gap-4">
                  <Workflow className="w-6 h-6 text-emerald-500" />
                  Next Steps
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-all cursor-pointer group">
                    <h4 className="font-black uppercase text-white mb-2 group-hover:text-emerald-400">Schema Bible</h4>
                    <p className="text-sm text-zinc-500">Learn every possible configuration node.</p>
                  </div>
                  <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-all cursor-pointer group">
                    <h4 className="font-black uppercase text-white mb-2 group-hover:text-emerald-400">Node Cluster API</h4>
                    <p className="text-sm text-zinc-500">Scale your deployments globally.</p>
                  </div>
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>
    </SiteLayout>
  );
}
