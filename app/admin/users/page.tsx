'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Filter, Loader2, Users, Shield, Terminal, Activity } from 'lucide-react';
import { useAdminStore } from '@/store/adminStore';
import { AdminUsersTable } from '@/components/admin/users/AdminUsersTable';
import { apiRequest } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';

export default function UsersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const users = useAdminStore((state) => state.users);
  const setUsers = useAdminStore((state) => state.setUsers);
  const setUsersLoading = useAdminStore((state) => state.setUsersLoading);
  const setUsersFilter = useAdminStore((state) => state.setUsersFilter);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setUsersLoading(true);
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      params.set('limit', '100');

      const response = await apiRequest<{
        users: any[];
        pagination: { total: number };
      }>(`/users?${params.toString()}`);

      if (!response.success) {
        if (response.error === 'UNAUTHORIZED') {
          router.push('/login');
          return;
        }
        toast({
          title: 'Error',
          description: response.message,
          variant: 'destructive',
        });
        return;
      }

      setUsers(response.data.users);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      });
    } finally {
      setUsersLoading(false);
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== undefined) {
        loadUsers();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">User Directory Service</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground leading-tight">
            User <span className="text-primary">Registry</span>
          </h1>
          <p className="text-muted-foreground text-sm font-medium">Manage global identities // Total Users: {users.length}</p>
        </div>
      </motion.div>

      {/* Toolbar */}
      <motion.div
        {...({
          className: "flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between",
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { delay: 0.1 }
        } as any)}
      >
        <div className="flex items-center gap-4 bg-muted/20 border border-border rounded-xl px-4 py-2 flex-1 max-w-lg group">
          <Search className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
          <Input
            placeholder="FILTER IDENTITIES..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setUsersFilter({ search: e.target.value });
            }}
            className="border-0 bg-transparent text-xs font-semibold placeholder:text-muted-foreground focus-visible:ring-0 p-0 h-auto"
          />
        </div>

        <div className="flex gap-3">
          <button className="px-6 py-3 bg-muted/30 border border-border text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all flex items-center gap-2">
            <Filter className="w-3.5 h-3.5" />
            Apply Filters
          </button>
        </div>
      </motion.div>

      {/* Table Section */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary/60">Loading...</span>
        </div>
      ) : (
        <motion.div
          {...({
            initial: { opacity: 0, scale: 0.98, y: 20 },
            animate: { opacity: 1, scale: 1, y: 0 },
            transition: { delay: 0.2 },
            className: "rounded-2xl border border-border bg-card overflow-hidden shadow-sm"
          } as any)}
        >
          <AdminUsersTable users={filteredUsers} />
        </motion.div>
      )}

      {/* System Stats Block */}
      <div className="grid md:grid-cols-3 gap-8">
        {[
          { label: "Active Sessions", value: "1,204", icon: Activity },
          { label: "Identity Sync", value: "Verified", icon: Shield },
          { label: "Auth Latency", value: "1.2ms", icon: Terminal }
        ].map((item, i) => (
          <div key={i} className="p-6 rounded-2xl bg-card border border-border group hover:border-primary/20 transition-all shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <item.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              <div className="w-2 h-2 rounded-full bg-primary shadow-sm" />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">{item.label}</p>
            <p className="text-xl font-semibold text-foreground">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
