'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTopbar } from '@/components/admin/AdminTopbar';
import { apiRequest } from '@/lib/api-client';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const [checkingRole, setCheckingRole] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAdminRole() {
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
            setIsAdmin(true);
          } else {
            router.push('/dashboard');
          }
        } else {
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error checking admin role:', error);
        router.push('/dashboard');
      } finally {
        setCheckingRole(false);
      }
    }

    checkAdminRole();
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || checkingRole) {
    return (
      <div className="flex h-screen bg-background text-foreground items-center justify-center grain-texture">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary/60 text-center">Materializing Admin Console...</span>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden grain-texture selection:bg-emerald-500/30">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-background/50">
        <AdminTopbar />
        <main className="flex-1 overflow-auto custom-scrollbar">
          <div className="max-w-[1600px] mx-auto py-10 px-6 md:px-10 lg:px-16">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
