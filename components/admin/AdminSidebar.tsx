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
      {...({
        className: cn(
          'border-r border-border bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-300 relative z-30 shadow-none',
          sidebarOpen ? 'w-64' : 'w-20'
        ),
        initial: { x: -20, opacity: 0 },
        animate: { x: 0, opacity: 1 },
        transition: { duration: 0.3 }
      } as any)}
    >
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-full h-32 bg-primary/5 blur-[60px] pointer-events-none" />

      {/* Logo */}
      <motion.div
        {...({
          className: "p-8 border-b border-border flex items-center justify-between relative z-10",
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { delay: 0.1 }
        } as any)}
      >
        <Link href="/admin" className="flex items-center gap-3 group">
          <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary/10 text-primary transition-all">
            <ShieldAlert className="w-5 h-5" />
          </div>
          {sidebarOpen && (
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight uppercase leading-none">SDUI Admin</span>
            </div>
          )}
        </Link>
      </motion.div>

      {/* Navigation */}
      <nav className="flex-1 p-5 space-y-2 overflow-y-auto custom-scrollbar relative z-10">
        <div className={cn("text-[10px] font-bold text-muted-foreground tracking-widest uppercase mb-4 px-3", !sidebarOpen && "hidden")}>Command Center</div>
        {navItems.map(({ href, label, icon: Icon }, idx) => {
          const isActive = pathname === href || (href !== '/admin' && pathname.startsWith(href + '/'));
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
                  'flex items-center gap-4 px-4 py-2.5 rounded-xl transition-all duration-300 relative group',
                  isActive
                    ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_4px_20px_rgba(var(--primary-rgb),0.1)]'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent'
                )}
              >
                <Icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground transition-colors")} />
                {sidebarOpen && <span className="text-sm font-semibold truncate">{label}</span>}
                {isActive && (
                  <motion.div
                    {...({
                      className: "absolute inset-y-3 right-2 w-1 bg-primary rounded-full",
                      layoutId: "adminIndicator",
                      transition: { type: 'spring', stiffness: 300, damping: 30 }
                    } as any)}
                  />
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Footer / Status */}
      <motion.div
        {...({
          className: "p-5 border-t border-border relative z-10 space-y-4",
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { delay: 0.3 }
        } as any)}
      >
        <div className={cn(
          'p-4 rounded-xl bg-muted/30 border border-border relative overflow-hidden group',
          sidebarOpen ? '' : 'flex justify-center'
        )}>
           <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          {sidebarOpen ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-1">Authorization</p>
                <p className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-primary" />
                  Super Admin
                </p>
              </div>
              <Activity className="w-4 h-4 text-primary/40 group-hover:text-primary transition-colors animate-pulse" />
            </div>
          ) : (
            <ShieldAlert className="w-5 h-5 text-primary" />
          )}
        </div>
      </motion.div>
    </motion.aside>
  );
}
