'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useClerk } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Layout as LayoutIcon, Settings, Home, FileText, Zap, LogOut, Sparkles, Activity, Boxes, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function Sidebar() {
  const router = useRouter();
  const { signOut } = useClerk();
  const { toast } = useToast();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/');
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: 'Error',
        description: 'Failed to log out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const links = [
    { href: '/dashboard', label: 'Overview', icon: Home },
    { href: '/dashboard/projects', label: 'Projects', icon: LayoutIcon },
    { href: '/dashboard/api-manager', label: 'APIs', icon: Zap },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-white/[0.08] bg-[#09090b] text-white flex flex-col relative z-20">
      {/* Glow Effect */}
      <div className="absolute top-0 left-0 w-full h-32 bg-emerald-500/5 blur-[60px] pointer-events-none" />

      {/* Logo */}
      <motion.div
        className="p-8 border-b border-white/[0.08] relative z-10"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <Link href="/" className="flex items-center gap-3 group">
          <Sparkles className="w-6 h-6 text-emerald-500 group-hover:scale-110 transition-transform" />
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tighter uppercase italic leading-none">SDUI</span>
            <span className="text-[6px] font-black tracking-[0.4em] text-zinc-500 uppercase mt-1">v4.2 Industrial</span>
          </div>
        </Link>
      </motion.div>

      {/* Navigation */}
      <nav className="flex-1 p-5 space-y-2 relative z-10">
        <div className="text-[10px] font-black text-zinc-500 tracking-[0.3em] uppercase mb-4 px-3">Main_Menu</div>
        {links.map(({ href, label, icon: Icon }, idx) => {
          const isActive = pathname === href;
          return (
            <motion.div
              key={href}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
            >
              <Link
                href={href}
                className={cn(
                  'flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 relative group',
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                    : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.03] border border-transparent'
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-emerald-500" : "text-zinc-500 group-hover:text-zinc-300 transition-colors")} />
                <span className="text-[11px] font-black uppercase tracking-widest">{label}</span>
                {isActive && (
                  <motion.div
                    className="absolute inset-y-2 right-2 w-1 bg-emerald-500 rounded-full"
                    layoutId="sidebarIndicator"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            </motion.div>
          );
        })}

        <div className="pt-8 px-3">
          <div className="text-[10px] font-black text-zinc-500 tracking-[0.3em] uppercase mb-4">Diagnostics</div>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-zinc-600">
              <span>Cluster Status</span>
              <span className="text-emerald-500 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Secure
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Footer */}
      <motion.div
        className="p-5 border-t border-white/[0.08] space-y-4 relative z-10"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.2 }}
      >
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] relative overflow-hidden group">
          <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Active_Plan</p>
          <div className="flex items-center justify-between">
            <p className="text-xs font-black uppercase text-white tracking-widest italic flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              Standard
            </p>
            <span className="text-[9px] font-black text-emerald-500/60 uppercase group-hover:text-emerald-400 transition-colors">Upgrade</span>
          </div>
        </div>

        <button
          onClick={() => setShowLogoutDialog(true)}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-zinc-500 hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/20 transition-all group"
        >
          <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          <span className="text-[11px] font-black uppercase tracking-widest">Terminate_Session</span>
        </button>
      </motion.div>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="bg-[#0b0b0d] border border-white/10 rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black uppercase text-white tracking-tight">Terminate Session?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400 font-medium">
              You are about to terminate your authenticated session with the SDUI Control Plane.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl font-black uppercase tracking-widest text-[10px]">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-red-500 text-white hover:bg-red-600 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-[0_0_20px_rgba(239,68,68,0.2)]"
            >
              Confirm_Log_Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </aside>
  );
}
