'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SignIn, useAuth } from '@clerk/nextjs';
import { apiRequest } from '@/lib/api-client';

export default function LoginPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const [checkingRole, setCheckingRole] = useState(false);

  useEffect(() => {
    async function checkUserRole() {
      if (!isLoaded || !isSignedIn) return;
      setCheckingRole(true);
      try {
        const response = await apiRequest<{ user: { role: string } }>('/auth/me');
        if (response.success && response.data?.user) {
          const role = response.data.user.role;
          if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
            router.push('/admin');
          } else {
            router.push('/dashboard');
          }
        } else {
          router.push('/dashboard');
        }
      } catch {
        router.push('/dashboard');
      } finally {
        setCheckingRole(false);
      }
    }
    checkUserRole();
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || checkingRole) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (isSignedIn) return null;

  return (
    <div className="login-page relative min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
      <Link
        href="/"
        className="absolute top-4 left-4 text-zinc-400 hover:text-white text-sm font-medium transition-colors"
      >
        ← Back to home
      </Link>
      <div className="w-full max-w-sm flex flex-col items-center gap-4">
        <div className="text-center">
          <h1 className="text-zinc-100 text-xl font-semibold">Sign in to SDUI</h1>
          <p className="text-zinc-500 text-sm mt-1">Welcome back! Please sign in to continue.</p>
        </div>
        <SignIn
          appearance={{
            baseTheme: undefined,
            variables: {
              colorPrimary: '#10b981',
              colorBackground: '#18181b',
              colorInputBackground: '#27272a',
              colorInputText: '#fafafa',
              colorText: '#fafafa',
              colorTextSecondary: '#a1a1aa',
              borderRadius: '0.5rem',
              fontFamily: 'inherit',
            },
            layout: {
              socialButtonsPlacement: 'top',
              socialButtonsVariant: 'blockButton',
              showOptionalFields: false,
            },
            elements: {
              rootBox: 'w-full',
              card: 'w-full bg-zinc-900/95 border border-zinc-800 rounded-xl shadow-xl p-6',
              headerTitle: 'hidden',
              headerSubtitle: 'hidden',
              socialButtonsBlockButton:
                'w-full bg-zinc-800 border border-zinc-600 text-white hover:bg-zinc-700 hover:border-zinc-500 rounded-lg py-3 text-sm font-medium transition-colors [&_span]:!text-white [&_svg]:opacity-90',
              dividerLine: 'bg-zinc-700',
              dividerText: 'text-zinc-500 text-xs',
              formFieldLabel: 'text-zinc-400 text-sm font-medium',
              formFieldInput:
                'bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500',
              formButtonPrimary:
                'w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm py-2.5 rounded-lg',
              footerActionLink: 'text-emerald-500 hover:text-emerald-400 text-sm',
              footerActionText: 'text-zinc-500 text-sm',
            },
          }}
          routing="path"
          path="/login"
          signUpUrl="/signup"
        />
      </div>
    </div>
  );
}
