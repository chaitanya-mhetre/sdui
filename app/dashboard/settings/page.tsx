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
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <span className="text-xs font-bold text-muted-foreground/60 uppercase tracking-[0.3em] text-center">Loading Settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      {/* Header Cluster */}
      <motion.div
        {...({
          className: "flex flex-col md:flex-row items-start md:items-end justify-between gap-6",
          initial: { opacity: 0, y: -20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5 }
        } as any)}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Settings className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Account Control</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight leading-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            Account <span className="text-primary">Settings</span>
          </h1>
          <p className="text-muted-foreground text-sm font-medium">Manage your personal profile and subscription</p>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        {/* Profile Section */}
        <motion.section
          {...({
            initial: { opacity: 0, x: -20 },
            animate: { opacity: 1, x: 0 },
            className: "p-8 md:p-10 rounded-2xl border border-border bg-card backdrop-blur-3xl shadow-2xl relative overflow-hidden"
          } as any)}
        >
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <User className="w-20 h-20 text-primary" />
          </div>

          <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-3">
            <User className="w-4 h-4 text-primary" />
            Profile Information
          </h2>

          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 ml-1">Full Name</Label>
              <Input
                type="text"
                className="h-11 bg-muted/15 border-border rounded-xl font-medium px-4 focus:ring-primary/20 transition-all text-sm"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 ml-1">Email Address</Label>
              <Input
                type="email"
                className="h-11 bg-muted/15 border-border rounded-xl font-medium px-4 focus:ring-primary/20 transition-all text-sm"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={saving}
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-bold uppercase tracking-wider text-[10px] transition-all active:scale-[0.98] shadow-md shadow-primary/10 disabled:opacity-50 border-none"
              disabled={saving}
            >
              {saving ? 'Updating...' : 'Save Profile'}
            </Button>
          </form>
        </motion.section>

        <div className="space-y-8">
          {/* Subscription Section */}
          <motion.section
            {...({
              initial: { opacity: 0, x: 20 },
              animate: { opacity: 1, x: 0 },
              className: "p-8 md:p-10 rounded-2xl border border-border bg-card backdrop-blur-3xl shadow-2xl relative overflow-hidden"
            } as any)}
          >
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Zap className="w-16 h-16 text-primary" />
            </div>

            <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-3">
              <Zap className="w-4 h-4 text-primary" />
              Subscription Plan
            </h2>

            <div className="flex items-center justify-between p-5 rounded-xl bg-muted/20 border border-border mb-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-1">Active Subscription</p>
                <p className="text-2xl font-bold text-foreground tracking-tight">{user?.plan}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
            </div>

            <Button
              onClick={() => router.push('/pricing')}
              className="w-full h-11 border border-border bg-transparent hover:bg-muted/50 text-foreground rounded-xl font-bold uppercase tracking-wider text-[10px] transition-all"
            >
              Upgrade Plan
            </Button>
          </motion.section>


        </div>
      </div>
    </div>
  );
}
