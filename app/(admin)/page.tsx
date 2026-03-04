'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AdminStatsCard } from '@/components/admin/AdminStatsCard';
import { AdminChart } from '@/components/admin/AdminChart';
import { useAdminStore } from '@/store/adminStore';
import { Users, FileText, Zap, TrendingUp, Loader2 } from 'lucide-react';
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
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

export default function AdminDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const stats = useAdminStore((state) => state.stats);
  const setStats = useAdminStore((state) => state.setStats);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  async function loadDashboardStats() {
    setLoading(true);
    try {
      const response = await apiRequest<{ stats: any }>('/admin/dashboard');
      if (!mountedRef.current) return;
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
      if (!mountedRef.current) return;
      console.error('Failed to load dashboard stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard statistics',
        variant: 'destructive',
      });
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
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
    <div className="p-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">Platform overview and key metrics</p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <AdminStatsCard
            title="Total Users"
            value={displayStats.totalUsers}
            change={12.5}
            icon={Users}
            color="blue"
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <AdminStatsCard
            title="Total Projects"
            value={displayStats.totalProjects}
            change={8.3}
            icon={FileText}
            color="purple"
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <AdminStatsCard
            title="Active Apps"
            value={displayStats.activeApps}
            change={15.2}
            icon={Zap}
            color="green"
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <AdminStatsCard
            title="API Requests"
            value={displayStats.totalApiRequests}
            change={22.1}
            icon={TrendingUp}
            color="orange"
          />
        </motion.div>
      </motion.div>

      {/* Charts */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
      >
        {displayStats.userGrowth && displayStats.userGrowth.length > 0 && (
          <motion.div variants={itemVariants}>
            <AdminChart
              title="User Growth"
              data={displayStats.userGrowth}
              dataKey="value"
              height={300}
            />
          </motion.div>
        )}

        {displayStats.projectGrowth && displayStats.projectGrowth.length > 0 && (
          <motion.div variants={itemVariants}>
            <AdminChart
              title="Project Growth"
              data={displayStats.projectGrowth}
              dataKey="value"
              height={300}
            />
          </motion.div>
        )}

        {displayStats.apiUsageTrend && displayStats.apiUsageTrend.length > 0 && (
          <motion.div variants={itemVariants}>
            <AdminChart
              title="API Usage Trend"
              data={displayStats.apiUsageTrend}
              dataKey="value"
              height={300}
            />
          </motion.div>
        )}

        <motion.div
          variants={itemVariants}
          className="p-6 rounded-lg border border-border bg-card/50 backdrop-blur-sm"
        >
          <h3 className="font-semibold mb-4">Platform Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">API Server</span>
              <span className="inline-flex items-center gap-2 text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Operational
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Database</span>
              <span className="inline-flex items-center gap-2 text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Operational
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Storage</span>
              <span className="inline-flex items-center gap-2 text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Operational
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
