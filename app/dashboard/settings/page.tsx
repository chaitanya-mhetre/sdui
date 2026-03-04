'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';

interface User {
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
  const [user, setUser] = useState<User | null>(null);
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
    // Wait for Clerk to load, then check authentication
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
      const response = await apiRequest<{ user: User }>('/auth/me');
      if (!response.success) {
        // Don't redirect - just show error
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
        description: 'Profile updated successfully',
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

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: 'Validation Error',
        description: 'New passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: 'Validation Error',
        description: 'Password must be at least 8 characters',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const response = await apiRequest(`/users/${user.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          password: passwordData.newPassword,
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
        description: 'Password updated successfully',
      });

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Failed to update password:', error);
      toast({
        title: 'Error',
        description: 'Failed to update password',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  }

  // Show loading while Clerk is initializing or data is loading
  if (!isLoaded || loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // If not signed in, this will be handled by the useEffect redirect
  if (!isSignedIn) {
    return null;
  }

  if (!user) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-muted-foreground">Unable to load user data. Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <div className="max-w-2xl space-y-8">
        {/* Profile Section */}
        <section className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-6">Profile</h2>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                type="text"
                placeholder="John Doe"
                className="mt-2"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={saving}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="john@example.com"
                className="mt-2"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={saving}
              />
            </div>
            <Button type="submit" className="rounded-lg" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </form>
        </section>

        {/* Account Section */}
        <section className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-6">Account</h2>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <Label>New Password</Label>
              <Input
                type="password"
                className="mt-2"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, newPassword: e.target.value })
                }
                disabled={saving}
                placeholder="Enter new password"
              />
            </div>
            <div>
              <Label>Confirm Password</Label>
              <Input
                type="password"
                className="mt-2"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                }
                disabled={saving}
                placeholder="Confirm new password"
              />
            </div>
            <Button type="submit" className="rounded-lg" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Password'
              )}
            </Button>
          </form>
        </section>

        {/* Plan Section */}
        <section className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-6">Subscription</h2>
          <div className="space-y-4">
            <div>
              <Label>Current Plan</Label>
              <div className="mt-2">
                <span className="text-lg font-semibold capitalize">{user.plan}</span>
              </div>
            </div>
            <Button variant="outline" className="rounded-lg" asChild>
              <a href="/pricing">Upgrade Plan</a>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
