'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SignIn, useAuth } from '@clerk/nextjs';
import { ArrowLeft, Sparkles, ShieldCheck, Zap, Activity } from 'lucide-react';
import { apiRequest } from '@/lib/api-client';
import NebulaBackground from '@/components/marketing/NebulaBackground';

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
      } catch (error) {
        console.error('Error checking user role:', error);
        router.push('/dashboard');
      } finally {
        setCheckingRole(false);
      }
    }

    checkUserRole();
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || checkingRole) {
    return (
      <div className="min-h-screen bg-[#050506] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500/60">Authenticating...</span>
        </div>
      </div>
    );
  }

  if (isSignedIn) return null;

  return (
    <div className="min-h-screen bg-[#050506] text-white selection:bg-emerald-500/30 grain-texture overflow-hidden flex font-sans">
      <NebulaBackground />

      {/* Left Side - Industrial Branding */}
      <div className="hidden lg:flex flex-col justify-between p-16 w-[45%] border-r border-white/[0.08] relative z-10 bg-black/20 backdrop-blur-sm">
        <Link
          href="/"
          className="flex items-center gap-3 text-zinc-500 hover:text-emerald-400 transition-all font-black uppercase tracking-[0.3em] text-[10px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit_To_Main</span>
        </Link>

        <div className="max-w-md space-y-12">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Sparkles className="w-10 h-10 text-emerald-500" />
              <h1 className="text-4xl font-black tracking-tighter uppercase italic">SDUI</h1>
            </div>
            <h2 className="text-5xl font-black leading-[1.1] uppercase tracking-tight">
              Access the<br />
              <span className="text-emerald-500">Control Plane</span>
            </h2>
            <p className="text-zinc-400 text-lg font-medium leading-relaxed">
              Initialize your session to manage global node clusters and propagate state across the edge.
            </p>
          </div>

          <div className="space-y-6 pt-8">
            {[
              { icon: ShieldCheck, text: "Encrypted Node Handshake" },
              { icon: Zap, text: "Real-time State Monitoring" },
              { icon: Activity, text: "Cluster Health Diagnostics" }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-5 group">
                <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.1] flex items-center justify-center group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20 transition-all">
                  <item.icon className="w-5 h-5 text-zinc-500 group-hover:text-emerald-500" />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-zinc-500 group-hover:text-zinc-300 transition-colors">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">
          <p>AUTHORIZED ACCESS ONLY // CLERK_AUTH v4</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12 relative z-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-12 flex flex-col items-center">
            <Sparkles className="w-12 h-12 text-emerald-500 mb-6" />
            <h1 className="text-3xl font-black uppercase tracking-tighter text-center">Control Plane Login</h1>
          </div>

          <div className="w-full">
            <SignIn
              appearance={{
                baseTheme: 'dark',
                variables: {
                  colorPrimary: '#10b981',
                  colorBackground: '#09090b',
                  colorInputBackground: '#020202',
                  colorInputText: '#ffffff',
                  colorText: '#ffffff',
                  colorTextSecondary: '#71717a',
                  borderRadius: '1rem',
                  fontFamily: 'inherit',
                },
                elements: {
                  rootBox: 'w-full',
                  card: 'w-full bg-[#0b0b0d] border border-white/10 shadow-[0_40px_80px_rgba(0,0,0,0.8)] rounded-2xl p-8',
                  headerTitle: 'text-white text-2xl font-black uppercase tracking-tight mb-2',
                  headerSubtitle: 'text-zinc-500 text-sm font-medium',
                  socialButtonsBlockButton: 'bg-black border border-white/10 text-white hover:bg-white/5 transition-all text-xs font-black uppercase tracking-widest py-3',
                  dividerLine: 'bg-white/10',
                  dividerText: 'text-zinc-600 font-black uppercase text-[10px] tracking-widest',
                  formFieldLabel: 'text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-2',
                  formFieldInput: 'bg-black border border-white/10 text-white focus:border-emerald-500/50 transition-all py-3',
                  formButtonPrimary: 'bg-emerald-500 text-black hover:bg-emerald-400 transition-all font-black uppercase tracking-widest text-xs py-3 shadow-[0_0_20px_rgba(16,185,129,0.3)]',
                  footerActionLink: 'text-emerald-500 hover:text-emerald-400 font-black uppercase tracking-widest text-[10px]',
                  footerActionText: 'text-zinc-500 text-[10px] font-black uppercase tracking-widest',
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
