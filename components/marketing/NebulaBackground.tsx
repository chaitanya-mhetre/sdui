'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function NebulaBackground() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none">
            <motion.div
                {...({
                    animate: {
                        scale: [1, 1.1, 1],
                        opacity: [0.05, 0.08, 0.05],
                        x: [0, 50, 0],
                        y: [0, 30, 0]
                    },
                    transition: { duration: 20, repeat: Infinity, ease: "linear" },
                    className: "absolute top-0 right-0 w-[80%] h-[80%] bg-emerald-500/5 blur-[180px] rounded-full"
                } as any)}
            />
            <motion.div
                {...({
                    animate: {
                        scale: [1, 1.2, 1],
                        opacity: [0.02, 0.04, 0.02],
                        x: [0, -40, 0],
                        y: [0, -20, 0]
                    },
                    transition: { duration: 15, repeat: Infinity, ease: "linear" },
                    className: "absolute -bottom-[10%] -left-[10%] w-[60%] h-[60%] bg-white/[0.02] blur-[160px] rounded-full"
                } as any)}
            />
            {mounted && [...Array(20)].map((_, i) => (
                <motion.div
                    key={i}
                    {...({
                        initial: { opacity: 0, y: Math.random() * 1000 },
                        animate: {
                            opacity: [0, 0.3, 0],
                            y: [0, -1000],
                            x: Math.random() * 100 - 50
                        },
                        transition: {
                            duration: Math.random() * 10 + 10,
                            repeat: Infinity,
                            ease: "linear",
                            delay: Math.random() * 10
                        },
                        className: "absolute w-0.5 h-0.5 bg-emerald-500/40 rounded-full"
                    } as any)}
                    style={{
                        left: `${Math.random() * 100}%`,
                        bottom: "-5%"
                    }}
                />
            ))}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
        </div>
    );
}
