'use client';

import { useUser, UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Bell, Search, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from './ThemeToggle';
import Link from 'next/link';

export function TopBar() {
  const { user, isLoaded } = useUser();

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-8">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search projects..."
            className="pl-10 rounded-lg bg-input border-border"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 ml-auto">
        <Button variant="ghost" size="icon" className="rounded-lg">
          <Bell className="w-5 h-5" />
        </Button>
        <ThemeToggle />
        <Link href="/dashboard/settings">
          <Button variant="ghost" size="icon" className="rounded-lg">
            <Settings className="w-5 h-5" />
          </Button>
        </Link>
        {isLoaded && user && (
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: 'w-10 h-10',
              },
            }}
          />
        )}
      </div>
    </header>
  );
}
