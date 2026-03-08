'use client';

import { useUser, UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Bell, Search, Settings, Command } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';
import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api-client';

export function TopBar() {
  const { user, isLoaded } = useUser();
  const [latency, setLatency] = useState<number>(0);

  useEffect(() => {
    async function measureLatency() {
      const start = performance.now();
      try {
        await apiRequest('/auth/me'); // Simple heartbeat ping
        const end = performance.now();
        setLatency(Math.round(end - start));
      } catch (e) {
        console.error('Latency check failed:', e);
      }
    }

    measureLatency();
    const interval = setInterval(measureLatency, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-xl flex items-center justify-between px-8 relative z-30">
      {/* Search Bar - Industrial Style */}
      <div className="flex-1 max-w-lg">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 group-hover:text-primary transition-colors" />
          <Input
            type="search"
            placeholder="Search projects or commands..."
            className="pl-12 bg-muted/20 border-border focus:border-primary/50 rounded-xl text-xs font-medium placeholder:text-muted-foreground transition-all h-10 w-full"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 opacity-40">
            <Command className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">K</span>
          </div>
        </div>
      </div>

      {/* Stats & Actions */}
      <div className="flex items-center gap-6 ml-auto">
        <div className="hidden lg:flex items-center gap-6 px-6 border-r border-border">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">API Latency</span>
            <span className="text-[11px] font-bold text-primary tabular-nums">
              {latency}ms
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/5 hover:text-primary transition-colors">
            <Bell className="w-4 h-4" />
          </Button>
          <Link href="/dashboard/settings">
            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/5 hover:text-primary transition-colors">
              <Settings className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="h-8 w-px bg-border mx-2" />

        {isLoaded && user && (
          <div className="flex items-center gap-4 group cursor-pointer pl-2">
            <div className="flex flex-col items-end">
              <span className="text-sm font-bold text-foreground">{user.fullName || user.username}</span>
            </div>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: 'w-10 h-10 border-2 border-border group-hover:border-primary/40 rounded-xl transition-all',
                },
              }}
            />
          </div>
        )}
      </div>
    </header>
  );
}
