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
    <aside className="w-64 border-r border-border bg-sidebar text-sidebar-foreground flex flex-col relative z-20">
      {/* Glow Effect */}
      <div className="absolute top-0 left-0 w-full h-32 bg-primary/5 blur-[60px] pointer-events-none" />

      {/* Logo */}
      <motion.div
        {...({
          className: "p-8 border-b border-border relative z-10",
          initial: { opacity: 0, y: -10 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.35 }
        } as any)}
      >
        <Link href="/" className="flex items-center gap-3 group">
            <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl hover:bg-primary/5 hover:text-primary transition-all">
              <Sparkles className="w-4 h-4" />
            </Button>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight uppercase leading-none">SDUI</span>
          </div>
        </Link>
      </motion.div>

      {/* Navigation */}
      <nav className="flex-1 p-5 space-y-2 relative z-10">
        <div className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase mb-4 px-3">Main Menu</div>
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
                  'flex items-center gap-4 px-4 py-2.5 rounded-xl transition-all duration-300 relative group',
                  isActive
                    ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_4px_20px_rgba(var(--primary-rgb),0.1)]'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent'
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground transition-colors")} />
                <span className="text-sm font-semibold">{label}</span>
                {isActive && (
                  <motion.div
                    {...({
                      className: "absolute inset-y-3 right-2 w-1 bg-primary rounded-full",
                      layoutId: "sidebarIndicator",
                      transition: { type: 'spring', stiffness: 300, damping: 30 }
                    } as any)}
                  />
                )}
              </Link>
            </motion.div>
          );
        })}


      </nav>

      {/* Footer */}
      <motion.div
        {...({
          className: "p-5 border-t border-border space-y-4 relative z-10",
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.35, delay: 0.2 }
        } as any)}
      >
        <div className="p-4 rounded-xl bg-muted/30 border border-border relative overflow-hidden group">
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-1">Active Plan</p>
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-foreground flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              Standard
            </p>
            <span className="text-[10px] font-bold text-primary/80 uppercase group-hover:text-primary transition-colors cursor-pointer">Upgrade</span>
          </div>
        </div>

        <button
          onClick={() => setShowLogoutDialog(true)}
          className="w-full flex items-center gap-4 px-4 py-2.5 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive border border-transparent hover:border-destructive/20 transition-all group"
        >
          <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          <span className="text-sm font-semibold">Log out</span>
        </button>
      </motion.div>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="bg-background border border-border rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-foreground">Sign out?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground font-medium">
              Are you sure you want to sign out of your SDUI account?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl font-semibold">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl font-semibold"
            >
              Sign out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </aside>
  );
}
