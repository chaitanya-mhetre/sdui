'use client';

import { motion } from 'framer-motion';
import { Globe2, Cpu, ShieldCheck, Zap, Activity, Users, Box, Boxes, Network, Smartphone, Monitor } from 'lucide-react';
import Badge from '@/components/marketing/Badge';
import SiteLayout from '@/components/marketing/SiteLayout';

export default function PlatformPage() {
    return (
        <SiteLayout>
            <div className="pt-32 pb-24 px-6 md:px-8 lg:px-12">
                <div className="max-w-7xl mx-auto">
                    {/* Section: Architecture */}
                    <div className="grid lg:grid-cols-2 gap-16 md:gap-24 items-center mb-32 md:mb-48">
                        <div className="space-y-10">
                            <Badge>The Foundation</Badge>
                            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight text-white leading-[1.05]">
                                A Global <span className="text-emerald-500">Service</span> Architecture
                            </h1>
                            <p className="text-zinc-400 text-lg md:text-xl font-medium leading-relaxed max-w-xl">
                                SDUI Industrial isn't just a library—it's a distributed engine that bridges the gap between server state and native client rendering.
                            </p>
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <div className="text-3xl font-black text-white mb-2">99.99%</div>
                                    <div className="text-xs font-black uppercase tracking-widest text-zinc-500">Uptime Protocol</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-black text-white mb-2">&lt; 15ms</div>
                                    <div className="text-xs font-black uppercase tracking-widest text-zinc-500">Global Latency</div>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute -inset-10 bg-emerald-500/10 blur-[100px] rounded-full" />
                            <div className="p-8 md:p-12 bg-white/[0.03] border border-white/[0.1] rounded-[3rem] backdrop-blur-3xl shadow-2xl relative z-10 overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8">
                                    <Network className="w-10 h-10 text-emerald-500/20 group-hover:text-emerald-500 transition-colors" />
                                </div>
                                <div className="space-y-8">
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                                            <Boxes className="w-6 h-6 text-emerald-500" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black uppercase tracking-tight text-white">Cluster_Origin</h3>
                                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Master Node Integrity</p>
                                        </div>
                                    </div>
                                    <div className="h-0.5 bg-white/[0.05] w-full" />
                                    <div className="space-y-4">
                                        {['EU_WEST_1', 'US_EAST_2', 'AP_SOUTH_1'].map(region => (
                                            <div key={region} className="flex justify-between items-center px-6 py-4 rounded-2xl bg-black/40 border border-white/[0.05]">
                                                <span className="text-xs font-black uppercase tracking-widest text-zinc-400">{region}</span>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] font-black text-emerald-500 uppercase">ACTIVE</span>
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section: Ecosystem */}
                    <div className="mb-32">
                        <div className="text-center mb-20">
                            <Badge className="mb-8">Universal Runtime</Badge>
                            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-white mb-6">Built for the <span className="italic">Entire</span> Stack</h2>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                { icon: Smartphone, title: "Mobile Core", desc: "Highly optimized native SDKs for iOS and Android with zero-overhead rendering." },
                                { icon: Monitor, title: "Web Engine", desc: "React and Vue wrappers that handle complex server-driven schemas with ease." },
                                { icon: Zap, title: "Edge Proxy", desc: "Lightweight proxy server that handles caching and transformation at the network edge." }
                            ].map((item, i) => (
                                <div key={i} className="p-8 md:p-10 rounded-3xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-all group">
                                    <div className="w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center mb-8 border border-white/5 group-hover:scale-110 transition-transform">
                                        <item.icon className="w-6 h-6 text-zinc-400 group-hover:text-emerald-500 transition-colors" />
                                    </div>
                                    <h3 className="text-xl font-black uppercase tracking-tight text-white mb-4 italic group-hover:text-emerald-400 transition-colors">{item.title}</h3>
                                    <p className="text-zinc-500 font-medium leading-relaxed group-hover:text-zinc-400 transition-colors">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Call to Action */}
                    <div className="text-center py-20 px-8 rounded-[3rem] bg-emerald-500 text-black">
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-10">Start Building at Scale</h2>
                        <div className="flex flex-col sm:flex-row justify-center gap-6">
                            <button className="px-10 py-4 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-transform shadow-2xl">Create Account</button>
                            <button className="px-10 py-4 border-2 border-black/20 font-black uppercase tracking-widest text-sm hover:bg-black/5 transition-colors">Documentation</button>
                        </div>
                    </div>
                </div>
            </div>
        </SiteLayout>
    );
}
