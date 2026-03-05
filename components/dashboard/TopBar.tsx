'use client';

import { useUser, UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Bell, Search, Settings, Command, Globe, Activity } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export function TopBar() {
  const { user, isLoaded } = useUser();

  return (
    <header className="h-16 border-b border-white/[0.08] bg-[#09090b]/80 backdrop-blur-3xl flex items-center justify-between px-8 relative z-30">
      {/* Search Bar - Industrial Style */}
      <div className="flex-1 max-w-lg">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 group-hover:text-emerald-500 transition-colors" />
          <Input
            type="search"
            placeholder="EXECUTE_COMMAND_OR_SEARCH..."
            className="pl-12 bg-black/50 border-white/[0.08] focus:border-emerald-500/50 rounded-xl text-[10px] font-black uppercase tracking-widest placeholder:text-zinc-600 transition-all h-10 w-full"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 opacity-40">
            <Command className="w-3 h-3 text-zinc-400" />
            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">K</span>
          </div>
        </div>
      </div>

      {/* Stats & Actions */}
      <div className="flex items-center gap-6 ml-auto">
        <div className="hidden xl:flex items-center gap-6 px-6 border-r border-white/[0.08]">
          <div className="flex flex-col items-end">
            <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Global_Nodes</span>
            <span className="text-[10px] font-black text-emerald-500 uppercase flex items-center gap-1.5">
              <Globe className="w-3 h-3" />
              12_Active
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Latency_Ping</span>
            <span className="text-[10px] font-black text-zinc-300 uppercase flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-emerald-400" />
              14ms
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-xl hover:bg-emerald-500/5 hover:text-emerald-400 transition-colors">
            <Bell className="w-4 h-4" />
          </Button>
          <Link href="/dashboard/settings">
            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-emerald-500/5 hover:text-emerald-400 transition-colors">
              <Settings className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="h-8 w-px bg-white/[0.08] mx-2" />

        {isLoaded && user && (
          <div className="flex items-center gap-4 group cursor-pointer pl-2">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black uppercase tracking-tight text-white">{user.fullName || user.username}</span>
              <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500/60 group-hover:text-emerald-500 transition-colors italic">Operator_Level_1</span>
            </div>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                baseTheme: 'dark',
                elements: {
                  avatarBox: 'w-10 h-10 border-2 border-white/[0.1] group-hover:border-emerald-500/40 rounded-xl transition-all',
                },
              }}
            />
          </div>
        )}
      </div>
    </header>
  );
}
