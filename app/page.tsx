'use client';

import Link from 'next/link';
import { ArrowRight, Zap, Layout as LayoutIcon, Code2, GitBranch, Sparkles, Layers, Globe, Play, Check, Monitor, Tablet, Smartphone, RefreshCw, Shield, Users, Star } from 'lucide-react';
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { AnimatedPage } from '@/components/common/AnimatedPage';
import { useRef, useEffect, useState, useCallback } from 'react';

/* ─── mouse glow hook ─── */
function useMouseGlow() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 80, damping: 20 });
  const sy = useSpring(y, { stiffness: 80, damping: 20 });
  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - r.left);
    y.set(e.clientY - r.top);
  }, [x, y]);
  return { sx, sy, onMove };
}

function GlowCard({ children, className = '', color = '#3b82f6' }: { children: React.ReactNode; className?: string; color?: string }) {
  const { sx, sy, onMove } = useMouseGlow();
  return (
    <motion.div
      onMouseMove={onMove}
      className={`relative overflow-hidden rounded-3xl border border-white/[0.07] group ${className}`}
      style={{ background: 'rgba(12,20,44,0.55)', backdropFilter: 'blur(20px)' }}
      whileHover={{ borderColor: 'rgba(255,255,255,0.14)', y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-3xl"
        style={{ background: `radial-gradient(240px circle at ${sx}px ${sy}px, ${color}20, transparent 65%)` }}
      />
      {children}
    </motion.div>
  );
}

/* ─── rotating words ─── */
const WORDS = ['Instantly', 'Globally', 'Safely', 'Visually'];
function RotatingWord() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % WORDS.length), 2200);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="relative inline-block overflow-hidden align-middle" style={{ minWidth: '13rem' }}>
      <AnimatePresence mode="wait">
        <motion.span
          key={idx}
          initial={{ y: '110%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '-110%', opacity: 0 }}
          transition={{ duration: 0.48, ease: [0.76, 0, 0.24, 1] }}
          className="inline-block bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent"
        >
          {WORDS[idx]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/* ─── code typer ─── */
const CODE_LINES = [
  '{ "type": "stack",',
  '  "children": [',
  '    { "type": "text", "value": "Hello 👋" },',
  '    { "type": "button", "label": "CTA" }',
  '  ]',
  '}',
];
function CodeTyper() {
  const [lines, setLines] = useState<string[]>([]);
  const [cursor, setCursor] = useState(0);
  useEffect(() => {
    if (cursor >= CODE_LINES.length) {
      const t = setTimeout(() => { setLines([]); setCursor(0); }, 2500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setLines(p => [...p, CODE_LINES[cursor]]);
      setCursor(c => c + 1);
    }, 500);
    return () => clearTimeout(t);
  }, [cursor]);
  return (
    <div className="font-mono text-[11px] leading-5 text-left min-h-[80px]">
      {lines.map((line, i) => (
        <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="text-blue-300/80">
          {line}
        </motion.div>
      ))}
      <span className="inline-block w-1.5 h-3.5 bg-blue-400 animate-pulse align-middle ml-0.5" />
    </div>
  );
}

/* ─── device notif ─── */
function DeviceNotif({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 8 }}
      animate={{ opacity: [0, 1, 1, 0], scale: [0.8, 1, 1, 0.9], y: [8, 0, 0, -4] }}
      transition={{ duration: 3.2, delay, repeat: Infinity, repeatDelay: 5 }}
      className="absolute -top-3 -right-3 bg-gradient-to-br from-green-400 to-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-lg shadow-green-500/40 whitespace-nowrap z-20"
    >
      ✓ Deployed
    </motion.div>
  );
}

/* ══════════════════════ PAGE ══════════════════════ */
export default function Home() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <AnimatedPage className="min-h-screen bg-[#03050f] text-white selection:bg-blue-500/20 selection:text-blue-300 overflow-x-hidden">

      {/* ══ LIVING BACKGROUND ══ */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.18, 0.28, 0.18] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-80 left-1/2 -translate-x-1/2 w-[1100px] h-[900px] bg-blue-600 rounded-full blur-[200px]"
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.10, 0.20, 0.10], x: [0, 40, 0] }}
          transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute top-1/3 -left-60 w-[700px] h-[700px] bg-indigo-700 rounded-full blur-[160px]"
        />
        <motion.div
          animate={{ scale: [1, 1.12, 1], opacity: [0.10, 0.18, 0.10], x: [0, -40, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
          className="absolute top-1/2 -right-60 w-[700px] h-[700px] bg-violet-700 rounded-full blur-[160px]"
        />
        <motion.div
          animate={{ y: [0, -30, 0], opacity: [0.08, 0.16, 0.08] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-blue-800 rounded-full blur-[180px]"
        />
        {/* grid */}
        <div className="absolute inset-0 opacity-[0.032]"
          style={{ backgroundImage: 'linear-gradient(rgba(99,179,237,1) 1px,transparent 1px),linear-gradient(90deg,rgba(99,179,237,1) 1px,transparent 1px)', backgroundSize: '52px 52px' }} />
        {/* floating particles */}
        {[...Array(22)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              left: `${5 + (i * 4.3) % 90}%`,
              top: `${10 + (i * 7.1) % 80}%`,
              background: ['#60a5fa', '#818cf8', '#a78bfa', '#34d399', '#fb923c'][i % 5],
            }}
            animate={{ y: [0, -(50 + (i % 4) * 30), 0], opacity: [0, 0.8, 0], scale: [0, 1, 0] }}
            transition={{ duration: 5 + (i % 5), repeat: Infinity, delay: (i * 0.7) % 9, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* ══ NAV ══ */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-3rem)] max-w-6xl"
      >
        <div className="flex items-center justify-between px-6 py-3 rounded-2xl border border-white/[0.08]"
          style={{ background: 'rgba(3,5,15,0.65)', backdropFilter: 'blur(28px) saturate(180%)', boxShadow: '0 4px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2.5 cursor-pointer">
            <motion.div whileHover={{ rotate: 12, scale: 1.1 }} transition={{ type: 'spring', stiffness: 300 }}
              className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Sparkles className="w-4 h-4 text-white" />
            </motion.div>
            <span className="text-xl font-black tracking-tight">SDUI</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {['Features', 'Pricing', 'Docs'].map((item, i) => (
              <motion.div key={item} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i + 0.3 }}>
                <Link href={`/${item.toLowerCase()}`} className="text-sm font-medium text-white/50 hover:text-white transition-colors">{item}</Link>
              </motion.div>
            ))}
            <div className="h-4 w-px bg-white/10" />
            <Link href="/login" className="text-sm font-medium text-white/50 hover:text-white transition-colors">Sign In</Link>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link href="/signup">
                <button className="px-5 py-2 rounded-xl bg-gradient-to-b from-blue-500 to-blue-700 text-white text-sm font-bold shadow-lg shadow-blue-600/30 hover:shadow-blue-500/50 transition-all border border-blue-400/30">
                  Get Started
                </button>
              </Link>
            </motion.div>
          </div>
          <button className="md:hidden p-2 text-white/60"><Layers className="w-5 h-5" /></button>
        </div>
      </motion.nav>

      {/* ══ HERO ══ */}
      <section ref={heroRef} className="relative z-10 pt-36 pb-24 px-6 min-h-screen flex flex-col justify-center">
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* ── LEFT: text ── */}
            <div>
              {/* badge */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-xs font-bold tracking-widest uppercase mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-400" />
                </span>
                Modern Server-Driven UI Platform
              </motion.div>

              {/* headline stagger */}
              <div className="overflow-hidden mb-2">
                <motion.h1 initial={{ y: '105%' }} animate={{ y: 0 }} transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
                  className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.02] tracking-tight">
                  Design Once,
                </motion.h1>
              </div>
              <div className="overflow-hidden mb-8">
                <motion.h1 initial={{ y: '105%' }} animate={{ y: 0 }} transition={{ duration: 0.85, delay: 0.1, ease: [0.76, 0, 0.24, 1] }}
                  className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.02] tracking-tight bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
                  Deploy Everywhere.
                </motion.h1>
              </div>

              <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
                className="text-lg text-white/45 mb-10 max-w-lg leading-relaxed">
                The ultimate infrastructure for server-driven UIs. Build pixel-perfect mobile interfaces visually and ship updates in real-time — no app store approvals needed.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row items-start gap-4 mb-12">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <Link href="/signup">
                    <button className="group flex items-center justify-center gap-2 px-8 h-13 rounded-2xl bg-gradient-to-b from-blue-500 to-blue-700 text-white font-bold text-base shadow-xl shadow-blue-600/40 hover:shadow-blue-500/60 transition-all border border-blue-400/30" style={{ height: '52px' }}>
                      Start Building Free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <button className="group flex items-center gap-2 px-8 rounded-2xl text-white/70 font-bold text-base border border-white/10 hover:border-white/20 hover:text-white transition-all"
                    style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)', height: '52px' }}>
                    <Play className="w-4 h-4 fill-white/40 group-hover:fill-white transition-colors" /> Watch Demo
                  </button>
                </motion.div>
              </motion.div>

              {/* social proof strip */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
                className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'].map((c, i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-[#03050f] flex items-center justify-center text-[10px] font-black text-white" style={{ background: c }}>{['A', 'S', 'D', 'R'][i]}</div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-0.5 mb-0.5">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />)}
                  </div>
                  <span className="text-white/35 text-xs font-medium">Trusted by 500+ teams</span>
                </div>
              </motion.div>
            </div>

            {/* ── RIGHT: devices ── */}
            <motion.div initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1.1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}>
              <div className="relative flex items-end justify-center gap-4 md:gap-5">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/12 via-violet-600/12 to-blue-600/12 rounded-[40px] blur-3xl scale-110" />

                {/* TABLET */}
                <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.0 }} whileHover={{ y: -10 }} className="relative hidden md:block">
                  <div className="relative w-52 h-68 rounded-[22px] border-2 border-white/10 overflow-hidden"
                    style={{ background: 'rgba(10,18,40,0.75)', backdropFilter: 'blur(20px)', boxShadow: '0 24px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07)', height: '270px', width: '210px' }}>
                    <div className="p-4 space-y-2.5">
                      <div className="h-2 bg-blue-500/40 rounded-full w-3/4" />
                      <div className="h-2 bg-white/10 rounded-full w-1/2" />
                      <div className="h-16 rounded-xl bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/20 flex items-center justify-center mt-3">
                        <LayoutIcon className="w-7 h-7 text-blue-400/50" />
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        {[...Array(4)].map((_, i) => (
                          <motion.div key={i} className="h-8 rounded-lg bg-white/[0.04] border border-white/[0.06]"
                            animate={{ opacity: [0.4, 0.9, 0.4] }} transition={{ duration: 2.5, delay: i * 0.4, repeat: Infinity }} />
                        ))}
                      </div>
                      <div className="h-2 bg-white/[0.06] rounded-full" />
                      <div className="h-2 bg-white/[0.04] rounded-full w-4/5" />
                    </div>
                    <DeviceNotif delay={1.2} />
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-950/40 to-transparent pointer-events-none" />
                  </div>
                  <div className="flex justify-center mt-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/10 bg-white/[0.03] text-white/30 text-[10px] font-semibold">
                      <Tablet className="w-3 h-3" /> Tablet
                    </div>
                  </div>
                </motion.div>

                {/* DESKTOP — center, tallest */}
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.9 }} whileHover={{ y: -12 }} className="relative z-10">
                  <div className="relative rounded-[26px] border-2 border-white/10 overflow-hidden"
                    style={{ background: 'rgba(10,18,40,0.82)', backdropFilter: 'blur(24px)', boxShadow: '0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)', width: '360px', height: '380px' }}>
                    {/* browser bar */}
                    <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/[0.06]">
                      {['#ff5f56', '#ffbd2e', '#27c93f'].map(c => <div key={c} className="w-3 h-3 rounded-full" style={{ background: c }} />)}
                      <div className="flex-1 mx-3 h-5 rounded-md bg-white/[0.05] border border-white/[0.06] flex items-center px-2">
                        <span className="text-white/20 text-[9px] font-mono">app.sdui.dev/canvas</span>
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      {/* live bar chart */}
                      <div className="h-24 rounded-xl bg-gradient-to-br from-blue-600/10 to-indigo-600/10 border border-blue-500/15 p-3 flex items-end gap-1">
                        {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 72, 88].map((h, i) => (
                          <motion.div key={i}
                            className="flex-1 rounded-sm bg-gradient-to-t from-blue-600 to-blue-400"
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: [0, h / 100, (h - 10) / 100, h / 100] }}
                            transition={{ duration: 1.8, delay: i * 0.07 + 1.1, repeat: Infinity, repeatDelay: 4 }}
                            style={{ transformOrigin: 'bottom', height: `${h}%` }}
                          />
                        ))}
                      </div>
                      {/* code block */}
                      <div className="rounded-xl bg-black/50 border border-white/[0.06] p-3">
                        <CodeTyper />
                      </div>
                      {/* live status */}
                      <div className="flex items-center gap-2">
                        <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.4, repeat: Infinity }}
                          className="w-2 h-2 rounded-full bg-green-400" />
                        <span className="text-[10px] text-white/35 font-medium">Live sync · 3 devices updated</span>
                      </div>
                    </div>
                    <DeviceNotif delay={0} />
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-950/25 to-transparent pointer-events-none" />
                  </div>
                  <div className="flex justify-center mt-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/10 bg-white/[0.03] text-white/30 text-[10px] font-semibold">
                      <Monitor className="w-3 h-3" /> Desktop
                    </div>
                  </div>
                </motion.div>

                {/* MOBILE */}
                <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.05 }} whileHover={{ y: -10 }} className="relative hidden sm:block">
                  <div className="relative rounded-[28px] border-2 border-white/10 overflow-hidden"
                    style={{ background: 'rgba(10,18,40,0.75)', backdropFilter: 'blur(20px)', boxShadow: '0 24px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07)', width: '148px', height: '270px' }}>
                    <div className="flex justify-center pt-2.5 pb-1"><div className="w-14 h-4 rounded-full bg-black" /></div>
                    <div className="px-3 space-y-2">
                      <div className="h-20 rounded-xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/20 flex items-center justify-center">
                        <Smartphone className="w-6 h-6 text-violet-400/50" />
                      </div>
                      {[...Array(4)].map((_, i) => (
                        <motion.div key={i} className="h-5 rounded-lg bg-white/[0.04] border border-white/[0.05]"
                          style={{ width: `${68 + (i % 3) * 12}%` }}
                          animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 2.2, delay: i * 0.5, repeat: Infinity }} />
                      ))}
                      <motion.div
                        className="h-8 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 flex items-center justify-center"
                        animate={{ boxShadow: ['0 0 0px rgba(139,92,246,0)', '0 0 20px rgba(139,92,246,0.55)', '0 0 0px rgba(139,92,246,0)'] }}
                        transition={{ duration: 2.5, repeat: Infinity }}>
                        <span className="text-[10px] font-bold text-white">Get Started →</span>
                      </motion.div>
                    </div>
                    <DeviceNotif delay={2.2} />
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-950/40 to-transparent pointer-events-none" />
                  </div>
                  <div className="flex justify-center mt-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/10 bg-white/[0.03] text-white/30 text-[10px] font-semibold">
                      <Smartphone className="w-3 h-3" /> Mobile
                    </div>
                  </div>
                </motion.div>

                {/* floating status pills */}
                <motion.div
                  className="absolute -top-5 left-1/2 -translate-x-[230%] hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-green-500/30 bg-green-500/10 text-green-300 text-[11px] font-bold"
                  animate={{ y: [0, -7, 0], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 3.5, repeat: Infinity }}>
                  <RefreshCw className="w-3 h-3" /> OTA update pushed
                </motion.div>
                <motion.div
                  className="absolute -bottom-4 right-0 md:right-8 flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-[11px] font-bold"
                  animate={{ y: [0, 7, 0], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 4, repeat: Infinity, delay: 1 }}>
                  <Zap className="w-3 h-3" /> 0ms delivery
                </motion.div>
              </div>
            </motion.div>

        </div>{/* end grid */}
      </motion.div>
    </section>

    {/* ══ STATS ══ */}
    <section className="relative z-10 py-20 px-6">
    <div className="max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
        className="rounded-3xl border border-white/[0.06] p-10 md:p-14"
        style={{ background: 'rgba(255,255,255,0.015)', backdropFilter: 'blur(20px)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)' }}>
        <p className="text-xs font-bold uppercase tracking-widest text-white/25 mb-12">Empowering Modern Development Teams</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
          {[
            { display: '100K+', label: 'Layouts Deployed' },
            { display: '2.4M', label: 'API Requests / Day' },
            { display: '99.99%', label: 'Uptime Reliability' },
            { display: '0ms', label: 'Delivery Latency' },
          ].map(({ display, label }) => (
            <motion.div key={label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-left">
              <div className="text-4xl md:text-5xl font-black tracking-tighter bg-gradient-to-br from-blue-300 to-indigo-400 bg-clip-text text-transparent mb-2">{display}</div>
              <p className="text-xs font-semibold text-white/35 uppercase tracking-widest">{label}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  </section>

  {/* ══ INSTANT UI SECTION ══ */ }
  <section className="relative z-10 py-32 px-6">
    <div className="max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-[11px] font-bold uppercase tracking-widest mb-6">
            <Zap className="w-3 h-3" /> Instant Over-the-Air
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6 leading-tight">
            Ship UI changes<br /><RotatingWord />
          </h2>
          <p className="text-white/45 text-lg leading-relaxed mb-10">
            Push pixel-perfect updates to every device simultaneously. No app store wait. No redeployment. Just instant, live UI changes the moment you hit publish.
          </p>
          <div className="space-y-4">
            {['Skip app store review entirely', 'Target specific user segments', 'Roll back changes in one click', 'A/B test UI variants live'].map((text, i) => (
              <motion.div key={text} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 + 0.3 }}
                className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-white/60 text-sm font-medium">{text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* propagation visualizer */}
        <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
          <div className="relative">
            <div className="absolute -inset-6 bg-gradient-to-br from-violet-600/20 to-blue-600/20 rounded-[40px] blur-3xl" />
            <div className="relative rounded-3xl border border-white/[0.08] p-6"
              style={{ background: 'rgba(10,18,40,0.72)', backdropFilter: 'blur(24px)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)' }}>
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-bold text-white/50">v2.4.1 — Production</span>
                <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold shadow-lg shadow-green-500/30">
                  <Zap className="w-3.5 h-3.5" /> Push Update
                </motion.button>
              </div>
              {/* propagation */}
              <div className="relative h-48 flex items-center justify-center mb-6">
                <motion.div
                  animate={{ boxShadow: ['0 0 0 rgba(59,130,246,0.3)', '0 0 32px rgba(59,130,246,0.8)', '0 0 0 rgba(59,130,246,0.3)'] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="relative z-10 w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <Globe className="w-7 h-7 text-white" />
                </motion.div>
                {[1, 2, 3].map(i => (
                  <motion.div key={i} className="absolute rounded-full border border-blue-500/30"
                    animate={{ scale: [0.6, 2.4], opacity: [0.7, 0] }}
                    transition={{ duration: 2.5, delay: i * 0.75, repeat: Infinity, ease: 'easeOut' }}
                    style={{ width: 56, height: 56 }} />
                ))}
                {[
                  { label: 'iOS', icon: Smartphone, angle: -90, color: '#60a5fa' },
                  { label: 'Android', icon: Smartphone, angle: -22, color: '#34d399' },
                  { label: 'Web', icon: Monitor, angle: 42, color: '#a78bfa' },
                  { label: 'Tablet', icon: Tablet, angle: 130, color: '#fb923c' },
                  { label: 'TV', icon: Monitor, angle: -148, color: '#f472b6' },
                ].map(({ label, icon: Icon, angle, color }, i) => {
                  const rad = (angle * Math.PI) / 180;
                  const r = 84;
                  return (
                    <div key={label} className="absolute" style={{ transform: `translate(${Math.cos(rad) * r}px, ${Math.sin(rad) * r}px)` }}>
                      <motion.div className="relative w-11 h-11 rounded-xl border border-white/10 flex flex-col items-center justify-center gap-0.5"
                        style={{ background: `${color}18`, backdropFilter: 'blur(8px)' }}
                        animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 2, delay: i * 0.4, repeat: Infinity }}>
                        <Icon className="w-4 h-4" style={{ color }} />
                        <span className="text-[8px] font-bold" style={{ color }}>{label}</span>
                      </motion.div>
                      <motion.div className="absolute w-1.5 h-1.5 rounded-full"
                        style={{ background: color, top: '50%', left: '50%', marginTop: -3, marginLeft: -3, boxShadow: `0 0 8px ${color}` }}
                        animate={{ x: [-Math.cos(rad) * r * 0.8, 0], y: [-Math.sin(rad) * r * 0.8, 0], opacity: [0, 1, 0] }}
                        transition={{ duration: 1.5, delay: i * 0.5 + 0.6, repeat: Infinity, repeatDelay: 2.5 }} />
                    </div>
                  );
                })}
              </div>
              {/* log stream */}
              <div className="space-y-1.5">
                {[
                  { text: '→ Compiling layout schema...', color: 'text-white/30' },
                  { text: '✓ Edge nodes synced (12 regions)', color: 'text-green-400/70' },
                  { text: '✓ 98,432 devices updated', color: 'text-green-400/70' },
                  { text: '⚡ 0ms average delivery', color: 'text-blue-400/70' },
                ].map(({ text, color }, i) => (
                  <motion.div key={text} initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 + 0.5 }}
                    className={`font-mono text-[11px] ${color}`}>{text}</motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  </section>

  {/* ══ FEATURES ══ */ }
  <section className="relative z-10 py-32 px-6">
    <div className="max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16">
        <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
          Built for scale.{' '}
          <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">Designed for speed.</span>
        </h2>
        <p className="text-white/40 max-w-xl text-lg leading-relaxed">
          Everything you need to manage your application's UI infrastructure from a single, unified interface.
        </p>
      </motion.div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[
          { icon: LayoutIcon, title: 'Pixel-Perfect Builder', desc: 'Design beautiful layouts with our intuitive visual editor. No complex coding or design tools required.', color: '#3b82f6' },
          { icon: Globe, title: 'Edge Content Delivery', desc: 'Deliver UI updates globally with sub-millisecond latency using our optimized CDN infrastructure.', color: '#6366f1' },
          { icon: Smartphone, title: 'Native Rendering', desc: 'Render at 60FPS using native components. Your users won\'t know it\'s server-driven.', color: '#8b5cf6' },
          { icon: GitBranch, title: 'Safe Promotions', desc: 'Version control and environment management to safely promote changes from dev to production.', color: '#3b82f6' },
          { icon: Zap, title: 'Instant Over-the-Air', desc: 'Push critical UI fixes and experimental features instantly to any segment of your user base.', color: '#6366f1' },
          { icon: Code2, title: 'Developer SDKs', desc: 'Clean, typed SDKs for Flutter, React Native, iOS, and Android. Simple integration in minutes.', color: '#8b5cf6' },
        ].map(({ icon: Icon, title, desc, color }, i) => (
          <motion.div key={title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.09 }}>
            <GlowCard color={color} className="h-full p-8 cursor-default">
              <motion.div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border"
                style={{ background: `${color}14`, borderColor: `${color}35` }}
                whileHover={{ scale: 1.12, rotate: 8 }} transition={{ type: 'spring', stiffness: 280, damping: 18 }}>
                <Icon className="w-7 h-7" style={{ color }} />
              </motion.div>
              <h3 className="text-lg font-bold mb-3 tracking-tight text-white/90">{title}</h3>
              <p className="text-white/40 leading-relaxed text-sm">{desc}</p>
            </GlowCard>
          </motion.div>
        ))}
      </div>
    </div>
  </section>

  {/* ══ SOCIAL PROOF ══ */ }
  <section className="relative z-10 py-24 px-6">
    <div className="max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14">
        <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3">Loved by developers</h2>
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)}
          <span className="ml-2 text-white/45 text-sm font-medium">4.9 / 5 from 1,200+ reviews</span>
        </div>
      </motion.div>
      <div className="grid md:grid-cols-3 gap-5">
        {[
          { name: 'Arjun M.', role: 'CTO @ Fintech startup', text: 'We shipped a complete UI overhaul to 200K users in 30 seconds. No app store. Pure magic.', avatar: 'AM' },
          { name: 'Sarah K.', role: 'Lead Eng @ E-commerce', text: 'SDUI cut our release cycle from 2 weeks to 5 minutes. The visual builder is insanely good.', avatar: 'SK' },
          { name: 'Dev P.', role: 'Mobile Arch @ SaaS', text: 'SDK integration took 20 minutes. Now we push UI experiments daily. Absolute game changer.', avatar: 'DP' },
        ].map(({ name, role, text, avatar }, i) => (
          <motion.div key={name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}>
            <GlowCard color="#6366f1" className="p-8 h-full">
              <div className="flex items-center gap-0.5 mb-5">
                {[...Array(5)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />)}
              </div>
              <p className="text-white/55 text-sm leading-relaxed mb-6">"{text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-xs font-black">{avatar}</div>
                <div>
                  <div className="text-white/85 text-sm font-bold">{name}</div>
                  <div className="text-white/30 text-xs">{role}</div>
                </div>
              </div>
            </GlowCard>
          </motion.div>
        ))}
      </div>
    </div>
  </section>

  {/* ══ CTA ══ */ }
  <section className="relative z-10 py-32 px-6">
    <div className="max-w-5xl mx-auto">
      <div className="relative">
        <motion.div
          animate={{ opacity: [0.25, 0.55, 0.25], scale: [1, 1.06, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -inset-8 bg-gradient-to-r from-blue-600/25 via-violet-600/25 to-blue-600/25 rounded-[52px] blur-3xl"
        />
        <div className="relative text-center rounded-[44px] border border-white/[0.08] overflow-hidden"
          style={{ background: 'rgba(8,14,35,0.78)', backdropFilter: 'blur(40px)', boxShadow: '0 40px 100px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07)' }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-blue-500/70 to-transparent" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />
          <div className="relative px-10 py-20 md:py-28">
            <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 3.5, repeat: Infinity }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-green-500/30 bg-green-500/10 text-green-300 text-xs font-bold mb-10">
              <Users className="w-3.5 h-3.5" />
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
              </span>
              500+ teams building right now
            </motion.div>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 tracking-tight leading-tight">
              Ready to make your<br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
                UI unstoppable?
              </span>
            </h2>
            <p className="text-white/45 text-xl mb-14 max-w-xl mx-auto leading-relaxed">
              Join 500+ companies shipping faster, smarter UI with SDUI.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Link href="/signup">
                  <button className="group flex items-center gap-3 px-12 py-5 rounded-2xl bg-gradient-to-b from-blue-500 to-blue-700 text-white font-bold text-lg shadow-2xl shadow-blue-600/40 hover:shadow-blue-500/60 transition-all border border-blue-400/30">
                    Create Free Account <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
              </motion.div>
              <div className="flex items-center gap-2 text-white/30 text-sm font-medium">
                <Shield className="w-4 h-4" /> No credit card required
              </div>
            </div>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              {['SOC 2', 'GDPR', 'ISO 27001', 'HIPAA'].map(badge => (
                <div key={badge} className="px-3 py-1.5 rounded-lg border border-white/[0.07] bg-white/[0.03] text-white/25 text-[11px] font-bold uppercase tracking-wider">{badge}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  {/* ══ FOOTER ══ */ }
  <footer className="relative z-10 border-t border-white/[0.05] py-24 px-6">
    <div className="max-w-7xl mx-auto">
      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-20">
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight">SDUI</span>
          </div>
          <p className="text-white/28 max-w-xs text-sm leading-relaxed">
            The leading platform for server-driven UI infrastructure. Build, manage, and scale your mobile app's UI from the cloud.
          </p>
          <div className="flex gap-3">
            {['Twitter', 'GitHub', 'LinkedIn'].map(s => (
              <motion.a key={s} href="#" whileHover={{ y: -2 }}
                className="px-3 py-1.5 rounded-lg border border-white/[0.07] bg-white/[0.03] text-white/28 text-xs font-bold hover:text-white transition-colors">
                {s}
              </motion.a>
            ))}
          </div>
        </div>
        {[
          { heading: 'Product', links: ['Features', 'Pricing', 'Documentation', 'Changelog'] },
          { heading: 'Company', links: ['About Us', 'Careers', 'Blog', 'Contact'] },
          { heading: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Security'] },
        ].map(({ heading, links }) => (
          <div key={heading}>
            <h4 className="font-bold mb-6 text-xs uppercase tracking-widest text-blue-400/70">{heading}</h4>
            <ul className="space-y-4">
              {links.map(label => (
                <li key={label}><a href="#" className="text-white/32 text-sm font-medium hover:text-white transition-colors">{label}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/[0.05] pt-10 flex flex-col md:flex-row items-center justify-between gap-4 text-white/20 text-xs font-bold uppercase tracking-widest">
        <p>&copy; 2024 SDUI Platform. All rights reserved.</p>
        <div className="flex items-center gap-1.5">
          <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="w-2 h-2 rounded-full bg-green-400" />
          All systems operational
        </div>
      </div>
    </div>
  </footer>
    </AnimatedPage >
  );
}