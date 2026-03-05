'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useClerk } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Bell, LogOut, Search, Menu, Command, Database, Activity, Globe, ShieldAlert } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { useAdminStore } from '@/store/adminStore';
import { useToast } from '@/hooks/use-toast';
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

export function AdminTopbar() {
  const router = useRouter();
  const { signOut } = useClerk();
  const { toast } = useToast();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const setSidebarOpen = useAdminStore((state) => (val: any) => {
    // Note: The store might have a setSidebarOpen function, but here we're using a functional update
    // Checking the previous view_file, it uses setSidebarOpen((prev) => !prev).
    // Let's stick to that pattern.
  });
  const actualSetSidebarOpen = useAdminStore((state) => (state as any).setSidebarOpen);
  const currentAdmin = useAdminStore((state) => state.currentAdmin);

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

  return (
    <motion.header
      className="h-16 border-b border-white/[0.08] bg-[#09090b]/80 backdrop-blur-3xl px-8 flex items-center justify-between relative z-20"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Left Section: Search & Toggle */}
      <div className="flex items-center gap-6 flex-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => actualSetSidebarOpen(!useAdminStore.getState().sidebarOpen)}
          className="lg:hidden hover:bg-white/5"
        >
          <Menu className="w-5 h-5" />
        </Button>

        <div className="hidden md:flex items-center gap-4 bg-black border border-white/[0.08] rounded-xl px-4 py-2 flex-1 max-w-lg group">
          <Search className="w-3.5 h-3.5 text-zinc-600 group-hover:text-emerald-500 transition-colors" />
          <Input
            placeholder="PLATFORM_QUERY..."
            className="border-0 bg-transparent text-[10px] font-black uppercase tracking-widest placeholder:text-zinc-700 focus-visible:ring-0 p-0 h-auto"
          />
          <div className="flex items-center gap-1.5 opacity-30">
            <Command className="w-3 h-3" />
            <span className="text-[8px] font-black italic">F</span>
          </div>
        </div>
      </div>

      {/* Right Section: System Metrics & Profile */}
      <div className="flex items-center gap-8">
        <div className="hidden lg:flex items-center gap-8 pr-8 border-r border-white/[0.08]">
          <div className="flex flex-col items-end">
            <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">System_Health</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-emerald-400 uppercase">Operational</span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">DB_Clusters</span>
            <span className="text-[10px] font-black text-white uppercase flex items-center gap-2 italic">
              <Database className="w-3 h-3 text-emerald-500/60" />
              100%_SYNC
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-xl hover:bg-emerald-500/5 hover:text-emerald-400 transition-all">
            <Bell className="w-4 h-4" />
          </Button>

          <div className="h-8 w-px bg-white/[0.08]" />

          <div className="flex items-center gap-4 group cursor-default">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-black uppercase tracking-tight text-white">{currentAdmin?.name || 'Administrator'}</p>
              <p className="text-[8px] font-black uppercase tracking-widest text-emerald-500/60 transition-colors">Super_Admin_v4</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)] group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-all"
            onClick={() => setShowLogoutDialog(true)}
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="bg-[#0b0b0d] border border-white/10 rounded-2xl shadow-[0_40px_80px_rgba(0,0,0,0.8)]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black uppercase text-white tracking-tight italic">Shutdown_Admin_Session?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">
              Emergency logout sequence will be initiated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8">
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl font-black uppercase tracking-widest text-[9px] px-6">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-red-500 text-white hover:bg-red-600 rounded-xl font-black uppercase tracking-widest text-[9px] px-6 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
            >
              Confirm_Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.header>
  );
}
