'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FileText,
  Box,
  LayoutGrid,
  DollarSign,
  BarChart3,
  Settings,
  Sparkles,
  ShieldAlert,
  Terminal,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useAdminStore } from '@/store/adminStore';

const navItems = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/users', label: 'User Registry', icon: Users },
  { href: '/admin/projects', label: 'Deployments', icon: FileText },
  { href: '/admin/components', label: 'Component Hub', icon: Box },
  { href: '/admin/templates', label: 'Schema Library', icon: LayoutGrid },
  { href: '/admin/pricing-management', label: 'Revenue', icon: DollarSign },
  { href: '/admin/analytics', label: 'Global Traffic', icon: BarChart3 },
  { href: '/admin/settings', label: 'System Config', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const sidebarOpen = useAdminStore((state) => state.sidebarOpen);

  return (
    <motion.aside
      className={cn(
        'border-r border-white font-black uppercase tracking-widest bg-[#09090b] flex flex-col transition-all duration-300 relative z-30 shadow-[40px_0_80px_rgba(0,0,0,0.5)]',
        sidebarOpen ? 'w-64' : 'w-20'
      )}
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-full h-32 bg-emerald-500/5 blur-[60px] pointer-events-none" />

      {/* Logo */}
      <motion.div
        className="p-8 border-b border-white/[0.08] flex items-center justify-between relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Link href="/admin" className="flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-emerald-500" />
          {sidebarOpen && (
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tighter uppercase italic leading-none text-white">ADMIN</span>
              <span className="text-[6px] font-black tracking-[0.4em] text-zinc-500 uppercase mt-1">Console_v4.2</span>
            </div>
          )}
        </Link>
      </motion.div>

      {/* Navigation */}
      <nav className="flex-1 p-5 space-y-2 overflow-y-auto custom-scrollbar relative z-10">
        <div className={cn("text-[9px] font-black text-zinc-600 tracking-[0.3em] uppercase mb-6 px-3", !sidebarOpen && "hidden")}>Command_Center</div>
        {navItems.map(({ href, label, icon: Icon }, idx) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <motion.div
              key={href}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: idx * 0.05 }}
            >
              <Link
                href={href}
                className={cn(
                  'flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 relative group',
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                    : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.03] border border-transparent'
                )}
              >
                <Icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-emerald-500" : "text-zinc-500 group-hover:text-zinc-300 transition-colors")} />
                {sidebarOpen && <span className="text-[10px] font-black uppercase tracking-widest truncate">{label}</span>}
                {isActive && (
                  <motion.div
                    className="absolute right-2 inset-y-2 w-1 bg-emerald-500 rounded-full"
                    layoutId="adminIndicator"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Footer / Status */}
      <motion.div
        className="p-5 border-t border-white/[0.08] relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className={cn(
          'p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] relative overflow-hidden group',
          sidebarOpen ? '' : 'flex justify-center'
        )}>
          <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          {sidebarOpen ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">Authorization</p>
                <p className="text-[10px] font-black text-emerald-500 uppercase flex items-center gap-2 italic">
                  <Terminal className="w-3.5 h-3.5" />
                  Super Admin
                </p>
              </div>
              <Activity className="w-4 h-4 text-emerald-500/20 group-hover:text-emerald-500 transition-colors animate-pulse" />
            </div>
          ) : (
            <ShieldAlert className="w-5 h-5 text-emerald-500" />
          )}
        </div>
      </motion.div>
    </motion.aside>
  );
}
