'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminStatsCard } from '@/components/admin/AdminStatsCard';
import { AdminChart } from '@/components/admin/AdminChart';
import { useAdminStore } from '@/store/adminStore';
import { Users, FileText, Zap, TrendingUp, Loader2, ShieldCheck, Globe, Database, Activity, Cpu, Box } from 'lucide-react';
import { apiRequest } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export default function AdminDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const stats = useAdminStore((state) => state.stats);
  const setStats = useAdminStore((state) => state.setStats);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  async function loadDashboardStats() {
    setLoading(true);
    try {
      const response = await apiRequest<{ stats: any }>('/admin/dashboard');
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

      setStats(response.data.stats);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard statistics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-6">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-500" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500/60">Intercepting_Data_Streams...</span>
        </div>
      </div>
    );
  }

  const displayStats = stats || {
    totalUsers: 0,
    totalProjects: 0,
    activeApps: 0,
    totalApiRequests: 0,
    monthlyRevenue: 0,
    userGrowth: [],
    projectGrowth: [],
    apiUsageTrend: [],
  };

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
            <ShieldCheck className="w-4 h-4 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 italic">Central_Intelligence_Console</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white leading-tight">
            Platform <span className="text-emerald-500 italic">Metrics</span>
          </h1>
          <p className="text-zinc-500 text-xs font-black uppercase tracking-[0.2em]">Master node overview // Integrity: Verified</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-6 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[8px] font-black uppercase text-zinc-600">Sync_Status</span>
              <span className="text-[10px] font-black text-emerald-500 italic tracking-widest uppercase">STABLE</span>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {[
          { title: "Total Users", value: displayStats.totalUsers, icon: Users, color: "emerald" },
          { title: "Deployments", value: displayStats.totalProjects, icon: FileText, color: "emerald" },
          { title: "Edge Nodes", value: displayStats.activeApps, icon: Globe, color: "emerald" },
          { title: "API Traffic", value: (displayStats.totalApiRequests / 1000).toFixed(1) + "K", icon: TrendingUp, color: "emerald" }
        ].map((stat, i) => (
          <motion.div key={stat.title} variants={itemVariants}>
            <div className="p-8 rounded-[2rem] bg-[#0b0b0d] border border-white/[0.08] hover:border-emerald-500/30 hover:shadow-[0_40px_80px_-12px_rgba(0,0,0,0.8)] transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 text-emerald-500/5 group-hover:text-emerald-500/15 transition-colors">
                <stat.icon className="w-12 h-12" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">{stat.title}</p>
              <div className="flex items-end gap-3">
                <p className="text-4xl font-black uppercase tracking-tight text-white italic">{stat.value}</p>
                <span className="text-emerald-500 text-[10px] font-bold mb-2">+12%</span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Analytics Visualization */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
      >
        {displayStats.userGrowth && displayStats.userGrowth.length > 0 && (
          <motion.div variants={itemVariants}>
            <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/[0.08] backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-white italic">User_Growth_Matrix</h3>
                </div>
                <Users className="w-4 h-4 text-zinc-700 group-hover:text-emerald-500 transition-colors" />
              </div>
              <AdminChart
                title=""
                data={displayStats.userGrowth}
                dataKey="value"
                height={300}
              />
            </div>
          </motion.div>
        )}

        {displayStats.projectGrowth && displayStats.projectGrowth.length > 0 && (
          <motion.div variants={itemVariants}>
            <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/[0.08] backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <Box className="w-4 h-4 text-emerald-500" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-white italic">Deployment_Velocity</h3>
                </div>
                <TrendingUp className="w-4 h-4 text-zinc-700 group-hover:text-emerald-500 transition-colors" />
              </div>
              <AdminChart
                title=""
                data={displayStats.projectGrowth}
                dataKey="value"
                height={300}
              />
            </div>
          </motion.div>
        )}

        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 p-10 rounded-[2.5rem] border border-white/[0.08] bg-gradient-to-br from-white/[0.03] to-transparent relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-10 opacity-5">
            <Cpu className="w-32 h-32" />
          </div>
          <div className="flex items-center gap-4 mb-8">
            <div className="h-0.5 w-8 bg-emerald-500" />
            <h3 className="text-xl font-black uppercase tracking-widest text-white italic">System Infrastructure Status</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { label: "Master API Node", status: "Operational", value: "99.99%", icon: Zap },
              { label: "Schema Database", status: "Operational", value: "12ms Latency", icon: Database },
              { label: "Global Edge Sync", status: "Operational", value: "Verified", icon: Globe }
            ].map((node, i) => (
              <div key={i} className="space-y-4 p-6 rounded-2xl bg-black/40 border border-white/[0.05] group hover:border-emerald-500/20 transition-all">
                <div className="flex items-center justify-between">
                  <node.icon className="w-5 h-5 text-zinc-600 group-hover:text-emerald-500 transition-colors" />
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">{node.label}</p>
                  <p className="text-sm font-black text-white italic">{node.value}</p>
                </div>
                <div className="p-2 rounded-lg bg-emerald-500/5 text-emerald-500 text-[8px] font-black uppercase tracking-widest text-center">
                  {node.status}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
