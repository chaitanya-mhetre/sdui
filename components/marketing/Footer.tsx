'use client';

import { Sparkles } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="border-t border-white/[0.08] bg-[#020202] pt-16 md:pt-24 pb-10 md:pb-12 px-6 md:px-8 lg:px-12 relative z-10">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-16 border-b border-white/[0.08] pb-12 md:pb-16 mb-8 md:mb-10">
                <div className="col-span-1 md:col-span-2">
                    <div className="flex items-center gap-4 mb-6 md:mb-8">
                        <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-emerald-500" />
                        <span className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic text-white">SDUI</span>
                    </div>
                    <p className="text-zinc-400 max-w-md text-base md:text-lg font-medium leading-relaxed">The industrial standard for server-driven layout management. Built for engineers who demand scale and surgical state control.</p>
                </div>
                <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-zinc-300 mb-6 md:mb-8">Core Engine</h4>
                    <ul className="space-y-4 text-zinc-500 text-sm font-medium uppercase tracking-wider">
                        {['Architecture', 'Edge State', 'Encryption', 'Registry'].map(i => <li key={i} className="hover:text-emerald-400 cursor-pointer transition-colors">{i}</li>)}
                    </ul>
                </div>
                <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-zinc-300 mb-6 md:mb-8">Resources</h4>
                    <ul className="space-y-4 text-zinc-500 text-sm font-medium uppercase tracking-wider">
                        {['Documentation', 'Console', 'SDK Tools', 'Support'].map(i => <li key={i} className="hover:text-emerald-400 cursor-pointer transition-colors">{i}</li>)}
                    </ul>
                </div>
            </div>
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-xs font-medium uppercase tracking-wider text-zinc-400 gap-6 md:gap-8">
                <span>SDUI INDUSTRIAL © 2025</span>
                <div className="flex flex-col sm:flex-row gap-6 md:gap-12 items-center">
                    <div className="flex gap-3 items-center">
                        <span className="text-emerald-500 tracking-wider">Network_Online</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                    </div>
                    <div className="flex gap-6 md:gap-10 text-zinc-400">
                        <span className="hover:text-zinc-100 cursor-pointer transition-colors">Security</span>
                        <span className="hover:text-zinc-100 cursor-pointer transition-colors">Node_Health</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
