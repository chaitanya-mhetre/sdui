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
        className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Users className="w-4 h-4 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 italic">User Directory Service</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white leading-tight">
            User <span className="text-emerald-500 italic">Registry</span>
          </h1>
          <p className="text-zinc-500 text-xs font-black uppercase tracking-[0.2em]">Manage global identities // Total Node Users: {users.length}</p>
        </div>
      </motion.div>

      {/* Toolbar */}
      <motion.div
        className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-4 bg-black border border-white/[0.08] rounded-xl px-4 py-2 flex-1 max-w-lg group">
          <Search className="w-3.5 h-3.5 text-zinc-600 group-hover:text-emerald-500 transition-colors" />
          <Input
            placeholder="FILTER_IDENTITIES..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setUsersFilter({ search: e.target.value });
            }}
            className="border-0 bg-transparent text-[10px] font-black uppercase tracking-widest placeholder:text-zinc-700 focus-visible:ring-0 p-0 h-auto"
          />
        </div>

        <div className="flex gap-3">
          <button className="px-6 py-3 bg-white/5 border border-white/[0.08] text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl transition-all flex items-center gap-2">
            <Filter className="w-3.5 h-3.5" />
            Apply_Filters
          </button>
        </div>
      </motion.div>

      {/* Table Section */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-500" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500/60">Intercepting_User_Data...</span>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-[2.5rem] border border-white/[0.08] bg-[#0b0b0d] overflow-hidden backdrop-blur-3xl shadow-2xl"
        >
          <div className="p-1 bg-gradient-to-r from-emerald-500/10 via-transparent to-transparent opacity-50" />
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
          <div key={i} className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/[0.08] group hover:border-emerald-500/20 transition-all">
            <div className="flex items-center justify-between mb-4">
              <item.icon className="w-4 h-4 text-zinc-600 group-hover:text-emerald-500 transition-colors" />
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">{item.label}</p>
            <p className="text-xl font-black text-white italic">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
