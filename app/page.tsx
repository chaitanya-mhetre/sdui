'use client';

import Link from 'next/link';
import { ArrowRight, Zap, Layout as LayoutIcon, Code2, GitBranch, Sparkles, Layers, Globe, Check, Monitor, Tablet, Smartphone, RefreshCw, Shield, Users, Star, Settings, Bell, Search, Menu, Command, Layers2, SquareTerminal, Cpu, Network, Plus, Play, ExternalLink, Share2, Globe2, MousePointer2, Loader2, PieChart, Activity, Fingerprint, Database, HardDrive, Infinity as InfinityIcon, Workflow, Terminal, Box, Boxes, Code } from 'lucide-react';
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { useRef, useEffect, useState, useCallback, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Badge from '@/components/marketing/Badge';
import SiteLayout from '@/components/marketing/SiteLayout';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/* ─── Real-time Device UI ─── */
function DeviceMockup({ active, type = "phone", loading = false, id_prefix = "" }: { active: boolean, type?: "phone" | "tab", loading?: boolean, id_prefix?: string }) {
  const showContent = true;

  return (
    <div className="absolute inset-0 p-4 md:p-6 flex flex-col pt-10 md:pt-14 h-full overflow-hidden">
      <div className="absolute top-4 left-0 w-full flex justify-between px-8 text-[8px] font-bold text-zinc-400">
        <span>9:41</span>
        <div className="flex gap-2 items-center">
          <Network className="w-3 h-3 text-zinc-500" />
          <div className="w-4 h-2 bg-emerald-500/30 rounded-sm border border-emerald-500/40" />
        </div>
      </div>

      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" {...({ initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "absolute inset-0 flex flex-col items-center justify-center gap-4" } as any)}>
              <div className="relative">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                <div className="absolute inset-0 bg-emerald-500/20 blur-xl animate-pulse" />
              </div>
              <span className="text-[8px] font-black uppercase tracking-[0.4em] text-emerald-500/60">Materializing Snapshots...</span>
            </motion.div>
          ) : showContent ? (
            <motion.div key="content" {...({ initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, className: "space-y-5" } as any)}>
              <div id={`${id_prefix}-header`} className="flex items-center gap-3 bg-white/[0.03] p-3 rounded-2xl border border-white/[0.05] shadow-inner">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Users className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="h-2 w-2/3 bg-zinc-800 rounded-full" />
                  <div className="h-1.5 w-1/3 bg-zinc-800/40 rounded-full" />
                </div>
              </div>

              <div id={`${id_prefix}-chart`} className="h-32 w-full rounded-2xl bg-[#030303] border border-white/[0.05] p-5 flex items-end gap-1.5 relative overflow-hidden group shadow-2xl">
                <div className="absolute top-3 right-4 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[7px] font-black uppercase tracking-widest text-zinc-500">Live Traffic</span>
                </div>
                {/* ... existing chart code ... */}
                {[45, 75, 40, 95, 65, 85, 70].map((h, i) => (
                  <motion.div key={i} {...({ initial: { height: 0 }, animate: { height: `${h}%` }, transition: { delay: i * 0.05, ease: "easeOut" }, className: "flex-1 bg-gradient-to-t from-emerald-500/30 to-emerald-500/5 rounded-t-md hover:from-emerald-400 transition-all cursor-pointer", "aria-label": `Bar chart data ${i}` } as any)} />
                ))}
              </div>

              <div id={`${id_prefix}-actions`} className="grid grid-cols-2 gap-3">
                <button className="h-10 rounded-xl bg-emerald-500 text-black text-[10px] font-black flex items-center justify-center uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform">Execute</button>
                <button className="h-10 rounded-xl bg-[#0a0a0b] border border-white/[0.1] text-zinc-500 text-[10px] font-black flex items-center justify-center uppercase tracking-widest">Protocol</button>
              </div>

              <div id={`${id_prefix}-feed`} className="space-y-3">
                {[1, 2].map(i => (
                  <div key={i} className="h-14 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex items-center px-5 gap-4 hover:bg-white/[0.04] transition-colors">
                    <div className="w-7 h-7 rounded-full bg-zinc-900 flex items-center justify-center"><Check className="w-3.5 h-3.5 text-zinc-500" /></div>
                    <div className="space-y-1.5 flex-1">
                      <div className="h-2 w-1/2 bg-zinc-800 rounded-full" />
                      <div className="h-1.5 w-1/4 bg-zinc-800/50 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="space-y-6 opacity-5 filter blur-[2px]">
              <div className="h-14 w-full bg-zinc-900 rounded-2xl" />
              <div className="h-32 w-full bg-zinc-900 rounded-2xl" />
              <div className="grid grid-cols-2 gap-3"><div className="h-10 bg-zinc-900 rounded-xl" /><div className="h-10 bg-zinc-900 rounded-xl" /></div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ─── Unified IDE Workspace ─── */
function UnifiedIDE({ active, onComplete }: { active: boolean, onComplete: () => void }) {
  return (
    <div className="w-full h-[400px] md:h-[500px] lg:h-[550px] bg-[#09090b] border border-white/[0.08] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden flex flex-col shadow-[0_80px_160px_-12px_rgba(0,0,0,1)] relative group/workspace">
      <div className="absolute top-[20%] -left-[5%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] pointer-events-none group-hover/workspace:bg-emerald-500/8 transition-colors duration-500" />

      <div className="h-14 border-b border-white/[0.06] flex items-center px-8 justify-between bg-[#0b0b0d]/90 backdrop-blur-2xl relative z-10">
        <div className="flex items-center gap-6 md:gap-8">
          <div className="flex gap-2.5">
            <div className="w-3 h-3 rounded-full bg-red-400/20 border border-red-400/10" />
            <div className="w-3 h-3 rounded-full bg-amber-400/20 border border-amber-400/10" />
            <div className="w-3 h-3 rounded-full bg-emerald-400/20 border border-emerald-400/10" />
          </div>
          <div className="h-9 px-5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-4 group/file">
            <Boxes className="w-3.5 h-3.5 text-zinc-500 group-hover/file:text-emerald-500 transition-colors" />
            <span className="text-[11px] font-black tracking-[0.3em] text-zinc-300 uppercase">infrastructure/core_cluster.yaml</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-3 px-4 py-1.5 bg-emerald-500/5 border border-emerald-500/15 rounded-xl">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse" />
            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">HA_SYNC_UP</span>
          </div>
          <button
            onClick={onComplete}
            className="group/btn px-6 py-2 rounded-xl bg-white text-black text-[11px] font-black flex items-center gap-2.5 uppercase tracking-tighter hover:bg-emerald-400 hover:scale-[1.05] transition-all relative overflow-hidden shadow-2xl active:scale-95"
          >
            <div className="absolute inset-0 bg-emerald-500 translate-x-[-100%] group-hover/btn:translate-x-0 transition-transform duration-300 -z-10" />
            <Zap className="w-4 h-4 fill-current" />
            Push
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative z-10">
        <div className="w-60 border-r border-white/[0.06] bg-[#0a0a0c] py-6 px-5 hidden xl:flex flex-col gap-6">
          <div>
            <div className="text-[10px] font-black text-zinc-400 tracking-[0.4em] mb-6 uppercase px-2">Project Registry</div>
            <div className="space-y-1">
              {['ClusterManager', 'MobileEdge_01', 'NetworkTopology', 'UserPropagation', 'SecurityTunnel'].map((scr, idx) => (
                <motion.div
                  key={scr}
                  {...({
                    initial: { opacity: 0, x: -10 },
                    animate: { opacity: 1, x: 0 },
                    transition: { delay: 0.5 + idx * 0.1 },
                    className: `flex items-center justify-between px-3 py-2 rounded-lg transition-all cursor-pointer group ${scr === 'ClusterManager' ? 'bg-white/[0.04] border border-white/[0.08] shadow-xl' : 'hover:bg-white/[0.02] text-zinc-500 hover:text-zinc-300'}`
                  } as any)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-1.5 h-1.5 rounded-full ${scr === 'ClusterManager' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-zinc-800'}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{scr}</span>
                  </div>
                  {scr === 'ClusterManager' && <Activity className="w-3.5 h-3.5 text-emerald-500/80 animate-pulse" />}
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mt-auto space-y-8">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-3">
              <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-zinc-400">
                <span>Latency</span>
                <span className="text-emerald-500">8.2ms</span>
              </div>
              <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                <motion.div {...({ className: "h-full bg-emerald-500", initial: { width: 0 }, animate: { width: "92%" }, transition: { duration: 1.2, delay: 0.3 } } as any)} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 relative bg-black/50 overflow-hidden flex flex-col">
          <div className="h-12 border-b border-white/[0.06] flex items-center px-8 bg-[#0c0c0e]/80">
            <div className="flex items-center gap-3">
              <Terminal className="w-3.5 h-3.5 text-emerald-500/60" />
              <div className="text-[10px] font-black tracking-widest text-zinc-400 uppercase">Engine Source</div>
            </div>
          </div>
          <div className="flex-1 overflow-auto custom-scrollbar bg-black/20">
            <CodeTyper onComplete={onComplete} />
          </div>
        </div>

        <div className="w-[300px] lg:w-[350px] border-l border-white/[0.06] bg-[#0a0a0c] p-6 hidden lg:flex flex-col gap-6 items-center relative">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4 text-zinc-500">
              <div className="w-10 h-10 rounded-2xl bg-[#030303] border border-white/5 flex items-center justify-center">
                <Activity className="w-5 h-5 text-emerald-500" />
              </div>
              <span className="text-[12px] font-black tracking-[0.4em] uppercase">Stage_Instance</span>
            </div>
            <div className="flex gap-5 text-zinc-600"><Monitor className="w-5 h-5" /><Smartphone className="w-5 h-5 text-emerald-500" /></div>
          </div>

          <div id="source-preview" className="flex-1 w-full bg-[#030303] rounded-[3.5rem] border border-white/[0.07] flex items-center justify-center relative shadow-[inset_0_8px_48px_rgba(0,0,0,1)] overflow-hidden group/preview">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(52,211,153,0.02)_0%,transparent_70%)]" />
            <BlueprintDevice active={active} mini={true} id_prefix="ide" />
          </div>

          <div className="w-full flex items-center gap-8 px-8 py-5 bg-white/[0.03] border border-white/[0.07] rounded-3xl shadow-2xl">
            <div className="flex-1 space-y-3">
              <div className="flex justify-between text-[10px] font-black uppercase text-zinc-400 tracking-widest"><span>Global Propagation</span><span>100% SUCCESS</span></div>
              <div className="h-1.5 bg-zinc-950 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 w-full shadow-[0_0_15px_rgba(16,185,129,0.5)]" /></div>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-lg"><Check className="w-5 h-5 text-emerald-500" /></div>
          </div>
        </div>
      </div>
    </div>
  )
}

function BlueprintDevice({ active, type = "phone", mini = false, loading = false, id_prefix = "" }: { active: boolean, type?: "phone" | "tab", mini?: boolean, loading?: boolean, id_prefix?: string }) {
  const isVisible = true;

  return (
    <div
      className={`relative ${mini
        ? "w-64 h-[420px]"
        : type === "phone"
          ? "w-64 h-[420px] md:w-72 md:h-[500px]"
          : "w-[380px] h-[320px]"
        } rounded-[2.5rem] md:rounded-[3rem] bg-gradient-to-br from-zinc-800 via-zinc-900 to-black border-2 border-zinc-700/60 shadow-[0_25px_80px_-10px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-1px_0_rgba(0,0,0,0.5)] p-2.5 md:p-3 overflow-visible transition-all duration-300 opacity-100 scale-100`}
    >
      <div className="absolute inset-0 rounded-[2.2rem] md:rounded-[2.6rem] bg-gradient-to-b from-zinc-700/40 via-zinc-800/30 to-zinc-900/50 pointer-events-none" />
      <div className="absolute inset-[3px] rounded-[1.9rem] md:rounded-[2.3rem] bg-black/60 pointer-events-none" />

      <div className="relative w-full h-full rounded-[1.8rem] md:rounded-[2.2rem] bg-[#000000] border border-zinc-800/90 overflow-hidden shadow-[inset_0_0_30px_rgba(0,0,0,1),inset_0_2px_4px_rgba(0,0,0,0.5)]">
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-transparent pointer-events-none z-10" />
        <DeviceMockup active={isVisible} type={type} loading={loading} id_prefix={id_prefix} />
        {type === "phone" && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-b-xl border-x border-b border-zinc-900/70 z-20" />
        )}
      </div>

      {active && (
        <div className="absolute -inset-2 rounded-[2.5rem] md:rounded-[3rem] bg-emerald-500/15 blur-2xl pointer-events-none" />
      )}
    </div>
  );
}

const CODE_LINES = [
  '{',
  '  "version": "4.0.0-industrial",',
  '  "registry": "GLOBAL_EDGE_DIST",',
  '  "nodes": {',
  '    "origin": "CLUSTER_SF_01",',
  '    "replication": ["LON", "TYO", "NYC"],',
  '    "ttl": "unlimited"',
  '  },',
  '  "sync_protocol": "AtomicState_v2"',
  '}'
];

function CodeTyper({ onComplete }: { onComplete: () => void }) {
  const [lines, setLines] = useState<string[]>([]);
  const [cursor, setCursor] = useState(0);

  useEffect(() => {
    if (cursor >= CODE_LINES.length) {
      onComplete();
      const t = setTimeout(() => { setLines([]); setCursor(0); }, 6000);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setLines(p => [...p, CODE_LINES[cursor]]);
      setCursor(c => c + 1);
    }, 200);
    return () => clearTimeout(t);
  }, [cursor, onComplete]);

  return (
    <div className="font-mono text-[13px] leading-7 p-10 text-zinc-400">
      {lines.map((l, i) => (
        <motion.div key={i} {...({ className: "flex gap-6", initial: { opacity: 0, x: -10 }, animate: { opacity: 1, x: 0 } } as any)}>
          <span className="text-zinc-600 w-8 select-none text-right">{i + 1}</span>
          <span className={l.includes('"') ? "text-emerald-400 font-bold" : "text-zinc-500"}>{l}</span>
        </motion.div>
      ))}
      {cursor < CODE_LINES.length && <span className="inline-block w-2 h-5 bg-emerald-500 animate-pulse ml-18" />}
    </div>
  );
}

const RDS_WORDS = ['Instantly', 'Globally', 'Safely', 'Reliably'];
function RotatingWord() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % RDS_WORDS.length), 2600);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="relative inline-block overflow-hidden align-middle">
      <AnimatePresence mode="wait">
        <motion.span
          key={idx}
          {...({
            className: "inline-block bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent font-black",
            initial: { y: '110%', opacity: 0 },
            animate: { y: 0, opacity: 1 },
            exit: { y: '-110%', opacity: 0 },
            transition: { duration: 0.5, ease: [0.76, 0, 0.24, 1] }
          } as any)}
        >
          {RDS_WORDS[idx]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function BentoCard({ title, desc, icon: Icon, className }: { title: string; desc: string; icon: any; className?: string }) {
  return (
    <motion.div
      {...({
        initial: { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.2 },
        whileHover: { y: -8, transition: { duration: 0.3, ease: "easeOut" } },
        transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] },
        className: `p-6 md:p-8 rounded-2xl md:rounded-3xl bg-white/[0.02] border border-white/[0.06] hover:border-emerald-500/40 transition-all duration-300 group relative overflow-hidden backdrop-blur-sm shadow-2xl flex flex-col ${className}`
      } as any)}
    >
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/5 blur-[80px] group-hover:bg-emerald-500/15 transition-all duration-300" />
      <div className="w-12 h-12 rounded-xl bg-[#09090b] border border-white/[0.08] flex items-center justify-center mb-5 md:mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-xl relative z-10">
        <Icon className="w-6 h-6 text-emerald-400 group-hover:text-emerald-300 group-hover:drop-shadow-[0_0_8px_rgba(52,211,153,0.5)] transition-all" />
      </div>
      <h3 className="text-lg md:text-xl font-black mb-3 uppercase tracking-tight text-white group-hover:text-emerald-400 transition-colors relative z-10">{title}</h3>
      <p className="text-zinc-400 text-sm md:text-base leading-relaxed font-medium flex-1 group-hover:text-zinc-300 transition-all relative z-10">{desc}</p>
    </motion.div>
  );
}

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [beamActive, setBeamActive] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useLayoutEffect(() => {
    return;
  }, []);

  return (
    <SiteLayout>
      <div ref={containerRef} className="pt-12">
        <motion.div
          {...({
            style: { scaleX },
            className: "fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 origin-left z-[201] shadow-[0_0_10px_rgba(16,185,129,0.5)]"
          } as any)}
        />

        {/* ══ HERO CLUSTER ══ */}
        <section className="hero-section relative z-10 pt-32 md:pt-40 pb-16 md:pb-24 px-6 md:px-8 lg:px-12 min-h-screen flex flex-col items-center justify-center">
          <div className="max-w-7xl mx-auto w-full flex flex-col items-center">
            <div className="text-center mb-12 md:mb-16 max-w-4xl">
              <motion.div
                {...({
                  initial: { opacity: 0, y: 20 },
                  animate: { opacity: 1, y: 0 },
                  transition: { duration: 0.8, ease: "easeOut" }
                } as any)}
              >
                <motion.div
                  {...({
                    animate: { y: [0, -5, 0] },
                    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                  } as any)}
                >
                  <Badge className="mb-8 md:mb-10">Propagating Across 420 Edge Nodes</Badge>
                </motion.div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5rem] font-black tracking-[-0.03em] leading-[1.05] mb-6 md:mb-8 text-white select-none">
                  Build Native UI<br />
                  Orchestrated <RotatingWord />
                </h1>
                <div className="flex flex-col items-center gap-6 md:gap-8">
                  <p className="text-zinc-300 max-w-2xl mx-auto text-base md:text-lg lg:text-xl font-medium leading-relaxed">
                    Orchestrate native layouts with surgical precision. The first server-driven engine built for high-scale industrial distribution.
                  </p>
                  <motion.div
                    {...({
                      initial: { opacity: 0 },
                      animate: { opacity: 1 },
                      transition: { delay: 0.5 },
                      className: "flex gap-3 items-center"
                    } as any)}
                  >
                    <div className="h-0.5 w-12 bg-emerald-500/30 rounded-full" />
                    <div className="h-0.5 w-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                    <div className="h-0.5 w-12 bg-emerald-500/50 rounded-full" />
                  </motion.div>
                </div>
              </motion.div>
            </div>

            <div className="hero-workspace w-full max-w-6xl relative px-4 md:px-6 mt-8 md:mt-12">
              <UnifiedIDE active={beamActive} onComplete={() => { setBeamActive(true); setTimeout(() => setBeamActive(false), 2000); }} />
            </div>
          </div>
        </section>

        {/* ══ INDUSTRIAL BENTO GRID ══ */}
        <section className="features-section relative z-10 py-20 md:py-28 px-6 md:px-8 lg:px-12 bg-gradient-to-b from-transparent via-[#080809] to-transparent">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              <div className="lg:col-span-2 p-8 md:p-10 lg:p-12 rounded-3xl bg-white/[0.03] border border-white/[0.07] flex flex-col justify-between group bento-item min-h-[400px]">
                <div className="max-w-lg">
                  <Badge className="mb-6">System Protocol</Badge>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tighter mb-5 leading-[1.05] text-white">Atomic State<br />Propagation</h2>
                  <p className="text-zinc-300 text-base md:text-lg font-medium leading-relaxed">Our proprietary protocol ensures that UI snapshots are materialized on target devices with zero-drift state integrity.</p>
                </div>
                <div className="mt-6 group-hover:translate-x-3 transition-transform duration-300"><ArrowRight className="w-8 h-8 md:w-10 md:h-10 text-emerald-500" /></div>
              </div>
              <BentoCard className="bento-item min-h-[400px]" icon={Cpu} title="Edge Native" desc="Run layouts directly on the metal with native rendering performance, bypassing JS bridges." />
              <BentoCard className="bento-item min-h-[400px]" icon={Workflow} title="Schema Logic" desc="Complex business logic embedded directly into your JSON schemas for dynamic interaction." />
              <motion.div
                {...({
                  initial: { opacity: 0, scale: 0.95 },
                  whileInView: { opacity: 1, scale: 1 },
                  viewport: { once: true },
                  transition: { duration: 0.7 },
                  className: "lg:col-span-2 p-8 md:p-10 lg:p-12 rounded-3xl bg-emerald-500 text-black group bento-item relative overflow-hidden min-h-[300px]"
                } as any)}
              >
                <motion.div
                  {...({
                    animate: {
                      x: [0, 20, 0],
                      y: [0, -20, 0],
                      rotate: [0, 5, 0]
                    },
                    transition: { duration: 8, repeat: Infinity, ease: "linear" },
                    className: "absolute -bottom-20 -right-20 w-80 h-80 bg-black/10 blur-[100px]"
                  } as any)}
                />
                <div className="relative z-10">
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tighter mb-5 leading-[1.05]">Universal Support</h2>
                  <p className="text-black/80 text-base md:text-lg font-semibold max-w-lg mb-6 leading-relaxed">One schema. Zero forks. Deploy to iOS, Android, HarmonyOS, and Web simultaneously with 100% fidelity.</p>
                  <motion.button
                    {...({
                      whileHover: { scale: 1.05, boxShadow: "0 10px 30px rgba(0,0,0,0.15)" },
                      whileTap: { scale: 0.95 },
                      className: "px-6 py-3 bg-black text-white rounded-xl font-black uppercase tracking-widest text-xs transition-shadow"
                    } as any)}
                  >
                    View Registry
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ══ UNIFIED SYNC ══ */}
        <section className="relative z-10 py-16 md:py-24 px-6 md:px-8 lg:px-12 overflow-visible">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 xl:gap-20 items-center">
            <div className="flex flex-col gap-8 lg:gap-10">
              <Badge>Propagation Engine v4</Badge>
              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-[-0.03em] uppercase leading-[1.05] text-white select-none">
                Unified<br />Sync
              </h2>
              <div className="p-8 md:p-10 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-3xl max-w-md shadow-[0_40px_80px_rgba(0,0,0,0.5)]">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center"><Network className="w-5 h-5 text-emerald-400" /></div>
                  <p className="text-zinc-300 text-base md:text-lg uppercase tracking-widest font-black">Snapshot Materialization</p>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs font-black uppercase text-zinc-400 tracking-wider"><span>Cluster Integrity</span><span className="text-emerald-500">Verified</span></div>
                  <div className="h-1.5 bg-black/50 rounded-full overflow-hidden"><div className="h-full bg-emerald-500/30 w-full" /></div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-8 md:gap-12 items-center lg:items-end pt-4 lg:pt-8">
              <div className="text-center lg:text-right relative group">
                <div className="absolute -top-10 lg:-top-12 right-0 lg:right-4 text-xs font-black text-emerald-400/50 uppercase tracking-wider mb-3">Node_Mobile_01</div>
                <BlueprintDevice active={true} loading={isSyncing} id_prefix="target" />
              </div>
              <div className="text-center lg:text-right relative group">
                <div className="absolute -top-10 lg:-top-12 right-0 lg:right-4 text-xs font-black text-zinc-400 uppercase tracking-wider mb-3">Node_Tablet_02</div>
                <BlueprintDevice active={true} type="tab" loading={isSyncing} />
              </div>
            </div>
          </div>
        </section>

        {/* ══ NETWORK REPLICA ══ */}
        <section className="py-20 md:py-28 px-6 md:px-8 lg:px-12 relative overflow-hidden border-t border-white/[0.05]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(52,211,153,0.03)_0%,transparent_70%)]" />
          <div className="max-w-7xl mx-auto flex flex-col items-center">
            <Badge className="mb-8 md:mb-12">Global Distribution</Badge>
            <h2 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black uppercase tracking-tighter mb-12 md:mb-16 text-center leading-[1.05] text-white">Engineered for<br />Native Distribution</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full max-w-5xl">
              {['TOKYO_v4', 'LONDON_v4', 'NEWYORK_v4', 'MUMBAI_v4'].map((node, i) => (
                <motion.div
                  key={node}
                  {...({
                    initial: { opacity: 0, y: 20 },
                    whileInView: { opacity: 1, y: 0 },
                    viewport: { once: true },
                    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
                    whileHover: { y: -8, backgroundColor: "rgba(255, 255, 255, 0.04)", borderColor: "rgba(16, 185, 129, 0.4)" },
                    className: "p-6 md:p-8 lg:p-10 border border-white/[0.05] rounded-2xl md:rounded-3xl flex flex-col items-center gap-4 md:gap-6 transition-all group cursor-default"
                  } as any)}
                >
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-[#030303] flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-500/10 transition-all border border-transparent group-hover:border-emerald-500/20">
                    <Globe className="w-6 h-6 md:w-7 md:h-7 text-zinc-500 group-hover:text-emerald-500 transition-colors" />
                  </div>
                  <span className="text-xs md:text-[11px] font-black uppercase tracking-wider text-zinc-400 group-hover:text-zinc-200 transition-colors">{node}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ FINAL PROTOCOL ══ */}
        <section className="py-20 md:py-28 px-6 md:px-8 lg:px-12 relative overflow-hidden bg-[#030304]">
          <motion.div
            {...({
              initial: { opacity: 0, scale: 0.95 },
              whileInView: { opacity: 1, scale: 1 },
              viewport: { once: true },
              transition: { duration: 0.8 },
              className: "max-w-6xl mx-auto text-center relative z-10"
            } as any)}
          >
            <Badge className="mb-10 md:mb-12">Final Deployment</Badge>
            <h2 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-[-0.04em] uppercase mb-10 md:mb-12 leading-[1.05] text-white">Scale your UI.</h2>
            <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center">
              <motion.button {...({ whileHover: { scale: 1.05, y: -5 }, whileTap: { scale: 0.95 }, className: "px-8 md:px-10 py-3 md:py-4 rounded-xl bg-white text-black font-black uppercase tracking-widest text-xs md:text-sm shadow-2xl w-full sm:w-auto" } as any)}>Initialize Engine</motion.button>
              <motion.button {...({ whileHover: { scale: 1.05, y: -5 }, whileTap: { scale: 0.95 }, className: "px-8 md:px-10 py-3 md:py-4 rounded-xl border border-white/[0.15] text-white font-black uppercase tracking-widest text-xs md:text-sm hover:bg-white/[0.03] transition-colors w-full sm:w-auto" } as any)}>Developer SDK</motion.button>
            </div>
          </motion.div>
        </section>
      </div>
    </SiteLayout>
  );
}