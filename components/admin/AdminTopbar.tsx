'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useClerk } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Bell, LogOut, Search, Menu, Command, Database, Activity, Globe, ShieldAlert } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/dashboard/ThemeToggle';
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
      {...({
        className: "h-16 border-b border-border bg-background/80 backdrop-blur-xl px-8 flex items-center justify-between relative z-20",
        initial: { y: -20, opacity: 0 },
        animate: { y: 0, opacity: 1 },
        transition: { duration: 0.3 }
      } as any)}
    >
      {/* Left Section: Search & Toggle */}
      <div className="flex items-center gap-6 flex-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => actualSetSidebarOpen(!useAdminStore.getState().sidebarOpen)}
          className="lg:hidden hover:bg-muted/50"
        >
          <Menu className="w-5 h-5" />
        </Button>

        <div className="hidden md:flex items-center gap-4 bg-muted/20 border border-border rounded-xl px-4 py-2 flex-1 max-w-lg group">
          <Search className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
          <Input
            placeholder="PLATFORM QUERY..."
            className="border-0 bg-transparent text-[10px] font-bold uppercase tracking-widest placeholder:text-muted-foreground focus-visible:ring-0 p-0 h-auto"
          />
          <div className="flex items-center gap-1.5 opacity-40">
            <Command className="w-3 h-3" />
            <span className="text-[10px] font-bold">F</span>
          </div>
        </div>
      </div>

      {/* Right Section: System Metrics & Profile */}
      <div className="flex items-center gap-8">
        <div className="hidden lg:flex items-center gap-8 pr-8 border-r border-border">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">System Health</span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-primary uppercase">Operational</span>
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">DB Clusters</span>
            <span className="text-[11px] font-bold text-foreground uppercase flex items-center gap-2">
              <Database className="w-3 h-3 text-primary/60" />
              100% SYNC
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/5 hover:text-primary transition-all">
            <Bell className="w-4 h-4" />
          </Button>

          <div className="h-8 w-px bg-border mx-2" />

          <div className="flex items-center gap-4 group cursor-default">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-foreground tracking-tight">{currentAdmin?.name || 'Administrator'}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary/80 transition-colors">Super Admin</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all"
            onClick={() => setShowLogoutDialog(true)}
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="bg-background border border-border rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-foreground tracking-tight">Shutdown Admin Session?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground font-semibold text-sm">
              Emergency logout sequence will be initiated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8">
            <AlertDialogCancel className="rounded-xl font-semibold">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl font-semibold"
            >
              Confirm Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.header>
  );
}
