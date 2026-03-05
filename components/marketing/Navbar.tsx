'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function Navbar() {
    return (
        <nav className="fixed top-3 md:top-5 left-1/2 -translate-x-1/2 z-[100] w-full max-w-5xl px-4 md:px-8">
            <div className="flex items-center justify-between px-5 md:px-7 py-2 md:py-2.5 rounded-xl bg-[#0c0c0e]/80 backdrop-blur-3xl border border-white/[0.1] shadow-2xl">
                <Link href="/" className="flex items-center gap-3 md:gap-4 group cursor-pointer">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                    <div className="flex flex-col">
                        <span className="text-base font-black tracking-tighter uppercase font-mono">SDUI</span>
                        <span className="text-[5px] font-black tracking-[0.5em] text-zinc-500 uppercase">v4.2</span>
                    </div>
                </Link>
                <div className="hidden lg:flex gap-10 xl:gap-12 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">
                    {['Platform', 'Features', 'Pricing', 'Docs'].map(label => (
                        <Link key={label} href={`/${label.toLowerCase()}`} className="hover:text-emerald-400 transition-colors relative group py-2">
                            {label}
                            <motion.div
                                {...({
                                    initial: { width: 0 },
                                    whileHover: { width: "100%" },
                                    transition: { duration: 0.3, ease: "easeOut" },
                                    className: "absolute bottom-0 left-0 h-0.5 bg-emerald-500/50"
                                } as any)}
                            />
                        </Link>
                    ))}
                </div>
                <div className="flex items-center gap-6">
                    <Link href="/login" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">Sign In</Link>
                    <motion.div {...({ whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 } } as any)}>
                        <Link href="/signup" className="px-6 py-2 rounded-lg bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-xl block">Access Console</Link>
                    </motion.div>
                </div>
            </div>
        </nav>
    );
}
