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
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary/60">Loading...</span>
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
        {...({
          className: "flex flex-col md:flex-row items-start md:items-end justify-between gap-6",
          initial: { opacity: 0, y: -20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5 }
        } as any)}
      >
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Central Console</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground leading-tight">
            Platform <span className="text-primary">Metrics</span>
          </h1>
          <p className="text-muted-foreground text-sm font-medium">Master node overview and analytics cluster.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-6 py-3 rounded-xl bg-card border border-border flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold uppercase text-muted-foreground/60">Sync Status</span>
              <span className="text-xs font-bold text-primary tracking-widest uppercase">STABLE</span>
            </div>
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" />
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        {...({
          className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6",
          variants: containerVariants,
          initial: "hidden",
          animate: "visible"
        } as any)}
      >
        {[
          { title: "Total Users", value: displayStats.totalUsers, icon: Users, color: "emerald" },
          { title: "Deployments", value: displayStats.totalProjects, icon: FileText, color: "emerald" },
          { title: "Edge Nodes", value: displayStats.activeApps, icon: Globe, color: "emerald" },
          { title: "API Traffic", value: (displayStats.totalApiRequests / 1000).toFixed(1) + "K", icon: TrendingUp, color: "emerald" }
        ].map((stat, i) => (
          <motion.div key={stat.title} variants={itemVariants}>
              <div className="p-8 rounded-3xl bg-card border border-border hover:border-primary/30 hover:shadow-xl transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 text-primary/5 group-hover:text-primary/10 transition-colors">
                <stat.icon className="w-12 h-12" />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">{stat.title}</p>
              <div className="flex items-end gap-3">
                <p className="text-4xl font-bold tracking-tight text-foreground">{stat.value}</p>
                <span className="text-primary text-xs font-bold mb-2">+12%</span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Analytics Visualization */}
      <motion.div
        {...({
          className: "grid grid-cols-1 lg:grid-cols-2 gap-8",
          variants: containerVariants,
          initial: "hidden",
          whileInView: "visible",
          viewport: { once: true, margin: '-100px' }
        } as any)}
      >
        {displayStats.userGrowth && displayStats.userGrowth.length > 0 && (
          <motion.div variants={itemVariants}>
            <div className="p-8 rounded-3xl bg-card border border-border shadow-md relative overflow-hidden group">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-primary" />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">User Growth Matrix</h3>
                </div>
                <Users className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
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
            <div className="p-8 rounded-3xl bg-card border border-border shadow-md relative overflow-hidden group">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <Box className="w-5 h-5 text-primary" />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">Deployment Velocity</h3>
                </div>
                <TrendingUp className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
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
          {...({
            variants: itemVariants,
            className: "lg:col-span-2 p-10 rounded-3xl border border-border bg-gradient-to-br from-muted/20 to-transparent relative overflow-hidden"
          } as any)}
        >
          <div className="absolute top-0 right-0 p-10 opacity-5">
            <Cpu className="w-32 h-32" />
          </div>
          <div className="flex items-center gap-4 mb-8">
            <div className="h-0.5 w-8 bg-primary" />
            <h3 className="text-lg font-bold uppercase tracking-widest text-foreground">System Infrastructure Status</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { label: "Master API Node", status: "Operational", value: "99.99%", icon: Zap },
              { label: "Schema Database", status: "Operational", value: "12ms Latency", icon: Database },
              { label: "Global Edge Sync", status: "Operational", value: "Verified", icon: Globe }
            ].map((node, i) => (
              <div key={i} className="space-y-4 p-6 rounded-2xl bg-card border border-border group hover:border-primary/20 transition-all shadow-sm">
                <div className="flex items-center justify-between">
                  <node.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <div className="w-2 h-2 rounded-full bg-primary shadow-sm" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">{node.label}</p>
                  <p className="text-sm font-semibold text-foreground">{node.value}</p>
                </div>
                <div className="p-2 rounded-lg bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest text-center">
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
