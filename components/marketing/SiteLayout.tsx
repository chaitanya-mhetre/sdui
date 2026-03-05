'use client';

import Navbar from './Navbar';
import Footer from './Footer';
import NebulaBackground from './NebulaBackground';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#050506] text-white selection:bg-emerald-500/30 grain-texture overflow-x-hidden">
            <NebulaBackground />
            <Navbar />
            <main className="relative z-10">
                {children}
            </main>
            <Footer />
        </div>
    );
}
