'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SignIn, useAuth } from '@clerk/nextjs';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { apiRequest } from '@/lib/api-client';

export default function LoginPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const [checkingRole, setCheckingRole] = useState(false);

  // Redirect to appropriate dashboard based on role
  useEffect(() => {
    async function checkUserRole() {
      if (!isLoaded || !isSignedIn) return;
      
      setCheckingRole(true);
      try {
        const response = await apiRequest<{ user: { role: string } }>('/auth/me');
        if (response.success && response.data?.user) {
          const role = response.data.user.role;
          // Redirect admins to admin dashboard, regular users to user dashboard
          if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
            router.push('/admin');
          } else {
            router.push('/dashboard');
          }
        } else {
          // If we can't get role, default to user dashboard
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error checking user role:', error);
        router.push('/dashboard');
      } finally {
        setCheckingRole(false);
      }
    }

    checkUserRole();
  }, [isLoaded, isSignedIn, router]);

  // Show loading while checking auth or role
  if (!isLoaded || checkingRole) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Don't render SignIn if already signed in (will redirect)
  if (isSignedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex flex-col justify-between p-12 w-1/2 bg-gradient-to-br from-primary/10 via-background to-background border-r border-border">
        <Link
          href="/"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <div className="max-w-md space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              BuildUI
            </h1>
          </div>
          
          <h2 className="text-4xl font-bold leading-tight">
            Welcome Back
            <br />
            <span className="text-primary">Continue Building</span>
          </h2>
          
          <p className="text-lg text-muted-foreground leading-relaxed">
            Access your projects, manage your layouts, and keep building amazing UIs.
          </p>

          <div className="space-y-3 pt-4">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
              <span className="text-muted-foreground">Access all your projects</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
              <span className="text-muted-foreground">View analytics & insights</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
              <span className="text-muted-foreground">Manage your team & settings</span>
            </div>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>Secure authentication powered by Clerk</p>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="mb-8 lg:hidden">
            <Link
              href="/"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition text-sm mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
            <h1 className="text-3xl font-bold mb-2">Sign In</h1>
            <p className="text-muted-foreground">Welcome back to BuildUI</p>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block mb-8">
            <h1 className="text-3xl font-bold mb-2">Sign in to your account</h1>
            <p className="text-muted-foreground">Continue where you left off</p>
          </div>

          {/* Clerk SignIn Component */}
          <div className="w-full">
            <SignIn
              appearance={{
                baseTheme: 'dark',
                variables: {
                  colorBackground: 'hsl(var(--card))',
                  colorInputBackground: 'hsl(var(--input))',
                  colorInputText: 'hsl(var(--foreground))',
                  colorPrimary: 'hsl(var(--primary))',
                  colorText: 'hsl(var(--foreground))',
                  colorTextSecondary: 'hsl(var(--muted-foreground))',
                  colorDanger: 'hsl(var(--destructive))',
                  colorSuccess: 'hsl(var(--accent))',
                  borderRadius: '0.75rem',
                  fontFamily: 'inherit',
                },
                elements: {
                  rootBox: 'w-full',
                  card: 'w-full bg-card border border-border/80 shadow-2xl rounded-xl p-8',
                  headerTitle: 'text-foreground text-2xl font-semibold mb-1',
                  headerSubtitle: 'text-muted-foreground text-sm',
                  socialButtonsBlockButton: 
                    'bg-background border border-border text-foreground hover:bg-muted hover:border-primary/50 transition-all duration-200',
                  socialButtonsBlockButtonText: 'text-foreground font-medium',
                  dividerLine: 'bg-border',
                  dividerText: 'text-muted-foreground text-xs',
                  formFieldLabel: 'text-foreground text-sm font-medium mb-1.5',
                  formFieldInput: 
                    'bg-input border border-border text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all',
                  formButtonPrimary: 
                    'bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 font-medium',
                  formButtonReset: 
                    'text-muted-foreground hover:text-foreground text-sm',
                  footerActionLink: 
                    'text-primary hover:text-primary/80 transition-colors font-medium',
                  footerActionText: 'text-muted-foreground text-sm',
                  identityPreviewText: 'text-foreground',
                  identityPreviewEditButton: 'text-primary hover:text-primary/80',
                  formResendCodeLink: 'text-primary hover:text-primary/80',
                  otpCodeFieldInput: 
                    'bg-input border border-border text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20',
                  alertText: 'text-foreground text-sm',
                  alertTextDanger: 'text-destructive text-sm',
                },
              }}
              routing="path"
              path="/login"
              signUpUrl="/signup"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
