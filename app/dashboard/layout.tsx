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
  
  // Don't show sidebar on editor pages
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
          console.log('User role from /auth/me:', role);
          // If user is admin, redirect to admin dashboard
          if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
            console.log('User is admin, redirecting to /admin');
            router.replace('/admin');
            return;
          }
          // Regular user, allow access to dashboard
          console.log('User is regular user, allowing dashboard access');
          setIsRegularUser(true);
        } else {
          // Can't verify role, allow access (will show error if needed)
          setIsRegularUser(true);
        }
      } catch (error) {
        console.error('Error checking user role:', error);
        // On error, allow access (will show error if needed)
        setIsRegularUser(true);
      } finally {
        setCheckingRole(false);
      }
    }

    checkUserRole();
  }, [isLoaded, isSignedIn, router]);

  // Show loading while checking auth or role
  if (!isLoaded || checkingRole) {
    return (
      <div className="flex h-screen bg-background text-foreground items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // If not signed in or not a regular user, don't render (will redirect)
  if (!isSignedIn || !isRegularUser) {
    return null;
  }

  // Editor pages have their own layout, don't show sidebar
  if (isEditorPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <TopBar />

        {/* Content Area */}
        <main className="flex-1 overflow-auto bg-background">{children}</main>
      </div>
    </div>
  );
}
