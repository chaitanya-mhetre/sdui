'use client';

import { motion } from 'framer-motion';

export default function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <motion.div
            {...({
                initial: { opacity: 0, scale: 0.9 },
                animate: { opacity: 1, scale: 1 },
                whileHover: { scale: 1.05 },
                className: `inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-2xl text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 select-none cursor-default ${className}`
            } as any)}
        >
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
            {children}
        </motion.div>
    );
}
