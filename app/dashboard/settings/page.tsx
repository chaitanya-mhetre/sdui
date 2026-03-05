'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Settings, User, Shield, Zap, Terminal, Activity, Globe } from 'lucide-react';
import { apiRequest } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

interface UserData {
  id: string;
  email: string;
  name: string | null;
  plan: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn, userId } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn || !userId) {
      router.push('/login');
      return;
    }
    loadUser();
  }, [isLoaded, isSignedIn, userId, router]);

  async function loadUser() {
    setLoading(true);
    try {
      const response = await apiRequest<{ user: UserData }>('/auth/me');
      if (!response.success) {
        toast({
          title: 'Error',
          description: response.message || 'Failed to load user data',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }
      setUser(response.data.user);
      setFormData({
        name: response.data.user.name || '',
        email: response.data.user.email,
      });
    } catch (error) {
      console.error('Failed to load user:', error);
      toast({
        title: 'Error',
        description: 'Failed to load user data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      const response = await apiRequest(`/users/${user.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: formData.name.trim() || undefined,
          email: formData.email.trim(),
        }),
      });

      if (!response.success) {
        toast({
          title: 'Error',
          description: response.message,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Success',
        description: 'Profile parameters updated',
      });
      await loadUser();
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-6">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-500" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500/60 text-center">Synchronizing_Machine_Config...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      {/* Header Cluster */}
      <motion.div
        className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Settings className="w-4 h-4 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 italic">System Configuration</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white leading-tight">
            Node <span className="text-emerald-500 italic">Settings</span>
          </h1>
          <p className="text-zinc-500 text-xs font-black uppercase tracking-[0.2em]">Adjust platform parameters // User_ID: {userId?.slice(-8)}</p>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        {/* Profile Section */}
        <motion.section
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-8 md:p-10 rounded-[2.5rem] border border-white/[0.08] bg-[#0b0b0d] backdrop-blur-3xl shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <User className="w-20 h-20 text-emerald-500" />
          </div>

          <h2 className="text-xl font-black uppercase tracking-tight text-white mb-8 flex items-center gap-4 italic text-emerald-400">
            <Terminal className="w-4 h-4" />
            Identity_Profile
          </h2>

          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Machine_Label</Label>
              <Input
                type="text"
                className="h-14 bg-white/[0.02] border-white/[0.08] rounded-2xl text-white font-bold px-6 focus:ring-emerald-500/20 focus:border-emerald-500/40 transition-all"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Registry_Email</Label>
              <Input
                type="email"
                className="h-14 bg-white/[0.02] border-white/[0.08] rounded-2xl text-white font-bold px-6 focus:ring-emerald-500/20 focus:border-emerald-500/40 transition-all"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={saving}
              />
            </div>
            <button
              type="submit"
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 shadow-xl disabled:opacity-50"
              disabled={saving}
            >
              {saving ? 'UPDATING_PARAMETERS...' : 'SAVE_CONFIG_CHANGES'}
            </button>
          </form>
        </motion.section>

        <div className="space-y-8">
          {/* Subscription Section */}
          <motion.section
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-8 md:p-10 rounded-[2.5rem] border border-white/[0.08] bg-white/[0.02] backdrop-blur-3xl shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Zap className="w-16 h-16 text-emerald-500" />
            </div>

            <h2 className="text-xl font-black uppercase tracking-tight text-white mb-8 flex items-center gap-4 italic text-emerald-400">
              <Shield className="w-4 h-4" />
              Resource_Tier
            </h2>

            <div className="flex items-center justify-between p-6 rounded-2xl bg-black/40 border border-white/5 mb-8">
              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1">Active_Subscription</p>
                <p className="text-3xl font-black text-white italic uppercase tracking-tighter">{user?.plan}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-emerald-500" />
              </div>
            </div>

            <button
              onClick={() => router.push('/pricing')}
              className="w-full py-4 border border-white/[0.1] hover:bg-white/[0.05] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
            >
              UPGRADE_ALLOCATION
            </button>
          </motion.section>

          {/* Infrastructure Metrics */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 md:p-10 rounded-[2.5rem] border border-white/[0.08] bg-white/[0.02] backdrop-blur-3xl"
          >
            <div className="space-y-6">
              {[
                { label: "Regional Node", value: "US-EAST-01", icon: Globe },
                { label: "Connection Strength", value: "99.9%", icon: Activity }
              ].map((stat, i) => (
                <div key={i} className="flex justify-between items-center group">
                  <div className="flex items-center gap-3">
                    <stat.icon className="w-4 h-4 text-zinc-600 group-hover:text-emerald-500 transition-colors" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{stat.label}</span>
                  </div>
                  <span className="text-[10px] font-black text-white italic">{stat.value}</span>
                </div>
              ))}
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
