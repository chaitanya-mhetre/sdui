'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import type { ReactNode } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopBar } from '@/components/dashboard/TopBar';
import { apiRequest } from '@/lib/api-client';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoaded, isSignedIn } = useAuth();
  const [checkingRole, setCheckingRole] = useState(true);
  const [isRegularUser, setIsRegularUser] = useState(false);

  const isEditorPage = pathname?.includes('/editor');

  useEffect(() => {
    async function checkUserRole() {
      if (!isLoaded) return;

      if (!isSignedIn) {
        router.push('/login');
        return;
      }

      try {
        const response = await apiRequest<{ user: { role: string } }>('/auth/me');
        if (response.success && response.data?.user) {
          const role = response.data.user.role;
          if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
            router.replace('/admin');
            return;
          }
          setIsRegularUser(true);
        } else {
          setIsRegularUser(true);
        }
      } catch (error) {
        console.error('Error checking user role:', error);
        setIsRegularUser(true);
      } finally {
        setCheckingRole(false);
      }
    }

    checkUserRole();
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || checkingRole) {
    return (
      <div className="flex h-screen bg-[#050506] text-white items-center justify-center grain-texture">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500/60">Initializing_Dashboard...</span>
        </div>
      </div>
    );
  }

  if (!isSignedIn || !isRegularUser) {
    return null;
  }

  if (isEditorPage) {
    return <div className="bg-[#050506] text-white min-h-screen grain-texture">{children}</div>;
  }

  return (
    <div className="flex h-screen bg-[#050506] text-white overflow-hidden grain-texture selection:bg-emerald-500/30">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 overflow-auto bg-black/20 backdrop-blur-sm custom-scrollbar">
          <div className="max-w-7xl mx-auto py-8 px-6 md:px-8 lg:px-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
