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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useAdminStore } from '@/store/adminStore';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/projects', label: 'Projects', icon: FileText },
  { href: '/admin/components', label: 'Components', icon: Box },
  { href: '/admin/templates', label: 'Templates', icon: LayoutGrid },
  { href: '/admin/pricing-management', label: 'Pricing', icon: DollarSign },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const sidebarOpen = useAdminStore((state) => state.sidebarOpen);

  return (
    <motion.aside
      className={cn(
        'border-r border-border bg-card/50 backdrop-blur-sm flex flex-col transition-all duration-300',
        sidebarOpen ? 'w-64' : 'w-20'
      )}
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Logo */}
      <motion.div
        className="p-6 border-b border-border flex items-center justify-between"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          {sidebarOpen && <span className="font-bold text-sm hidden sm:inline">Admin</span>}
        </Link>
      </motion.div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
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
                  'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 relative group',
                  isActive
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-muted-foreground hover:bg-muted/50'
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="hidden sm:inline text-sm truncate">{label}</span>}
                {isActive && (
                  <motion.div
                    className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-lg"
                    layoutId="adminIndicator"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Footer */}
      <motion.div
        className="p-4 border-t border-border"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className={cn(
          'px-3 py-2 rounded-lg bg-primary/10 border border-primary/20',
          sidebarOpen ? '' : 'flex justify-center'
        )}>
          <div className="text-xs text-primary font-semibold">
            {sidebarOpen ? 'Super Admin' : 'SA'}
          </div>
        </div>
      </motion.div>
    </motion.aside>
  );
}
