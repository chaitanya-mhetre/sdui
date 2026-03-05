'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { ArrowRight, Plus, Loader2, LayoutGrid, Tag, Activity, Cpu, Zap, Box, Globe, Shield } from 'lucide-react';
import { apiRequest } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface User {
  id: string;
  email: string;
  name: string | null;
  plan: string;
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  layoutCount?: number;
}

interface DashboardComponent {
  id: string;
  name: string;
  category: string;
  version: string;
  visibility: string;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn, userId } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [components, setComponents] = useState<DashboardComponent[]>([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalLayouts: 0,
    totalApiCalls: 0,
  });
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn || !userId) {
      router.push('/login');
      return;
    }
    loadDashboardData();
  }, [isLoaded, isSignedIn, userId, router]);

  async function loadDashboardData() {
    setLoading(true);
    try {
      const userResponse = await apiRequest<{ user: User }>('/auth/me');
      if (!mountedRef.current) return;
      if (!userResponse.success) {
        toast({
          title: 'Error',
          description: userResponse.message || 'Failed to load user data',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }
      setUser(userResponse.data.user);

      const projectsResponse = await apiRequest<{
        projects: Project[];
        pagination: { total: number };
      }>('/projects?limit=10');
      if (!mountedRef.current) return;
      if (projectsResponse.success) {
        setProjects(projectsResponse.data.projects);
        setStats({
          totalProjects: projectsResponse.data.pagination.total,
          totalLayouts: projectsResponse.data.projects.reduce(
            (sum, p) => sum + (p.layoutCount || 0),
            0
          ),
          totalApiCalls: 0,
        });
      }

      const componentsResponse = await apiRequest<{ components: DashboardComponent[] }>('/components');
      if (!mountedRef.current) return;
      if (componentsResponse.success) {
        setComponents(componentsResponse.data.components);
      }
    } catch (error) {
      if (!mountedRef.current) return;
      console.error('Failed to load dashboard:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-6">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-500" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500/60">Fetching_System_State...</span>
        </div>
      </div>
    );
  }

  if (!isSignedIn) return null;

  return (
    <div className="space-y-12 pb-20">
      {/* Header Cluster */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Live_Dashboard_v4</span>
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tight text-white leading-tight">
            Control <span className="text-emerald-500 italic">Plane</span> Overview
          </h1>
          <p className="text-zinc-500 text-sm font-semibold uppercase tracking-widest">
            Welcome back, operator <span className="text-zinc-300">[{user?.name || user?.email}]</span>
          </p>
        </div>
        <Link href="/dashboard/projects/new">
          <Button className="bg-emerald-500 text-black hover:bg-emerald-400 font-black uppercase tracking-widest text-[10px] h-12 px-8 rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.2)] active:scale-95 transition-all gap-3">
            <Plus className="w-4 h-4" />
            Initialize Project
          </Button>
        </Link>
      </div>

      {/* Stats Topology */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Active Projects", value: stats.totalProjects, icon: Box, color: "emerald" },
          { label: "Synced Layouts", value: stats.totalLayouts, icon: Zap, color: "emerald" },
          { label: "Propagation Delay", value: "14ms", icon: Activity, color: "emerald" },
          { label: "Plan Status", value: user?.plan || 'Free', icon: Shield, color: "emerald" }
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.05] hover:border-emerald-500/30 transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
              <stat.icon className="w-8 h-8 text-emerald-500" />
            </div>
            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-2">{stat.label}</p>
            <p className="text-3xl font-black uppercase tracking-tighter text-white italic">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Primary Workspace: Projects */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-0.5 w-8 bg-emerald-500" />
          <h2 className="text-xl font-black uppercase tracking-widest text-white italic">Recent Projects</h2>
        </div>

        {projects.length === 0 ? (
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-[3rem] p-24 text-center group cursor-pointer hover:bg-white/[0.03] transition-all border-dashed">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform">
              <Plus className="w-8 h-8 text-zinc-500" />
            </div>
            <p className="text-zinc-500 font-black uppercase tracking-widest text-sm mb-10 italic">No mission data available</p>
            <Link href="/dashboard/projects/new">
              <Button size="lg" className="bg-white text-black hover:bg-emerald-400 font-black uppercase tracking-widest text-xs h-14 px-12 rounded-2xl shadow-2xl transition-all active:scale-95">
                START_YOUR_FIRST_MISSION
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, idx) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + idx * 0.05 }}
              >
                <Link href={`/dashboard/editor/${project.id}`}>
                  <div className="h-full bg-[#0b0b0d] border border-white/[0.08] rounded-[2rem] p-8 hover:border-emerald-500/40 hover:shadow-[0_40px_80px_-12px_rgba(0,0,0,0.8)] transition-all cursor-pointer group flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 text-emerald-500/5 group-hover:text-emerald-500/20 transition-colors">
                      <Cpu className="w-12 h-12" />
                    </div>
                    <div>
                      <div className="flex items-end justify-between mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.1] flex items-center justify-center group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20 transition-all">
                          <Box className="w-6 h-6 text-zinc-500 group-hover:text-emerald-500" />
                        </div>
                        <ArrowRight className="w-6 h-6 text-zinc-700 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                      </div>
                      <h3 className="text-xl font-black uppercase tracking-tight text-white mb-4 italic group-hover:text-emerald-400 transition-colors">
                        {project.name}
                      </h3>
                      {project.description && (
                        <p className="text-sm text-zinc-500 font-medium leading-relaxed line-clamp-2 italic">
                          {project.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-zinc-600 pt-8 mt-8 border-t border-white/[0.05]">
                      <span className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40" />
                        {project.layoutCount || 0} Layouts
                      </span>
                      <span>•</span>
                      <span className="group-hover:text-zinc-400 transition-colors">
                        UP_ {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Platform Protocol: Components */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-0.5 w-8 bg-emerald-500" />
          <h2 className="text-xl font-black uppercase tracking-widest text-white italic">Platform Registry</h2>
        </div>

        {components.length === 0 ? (
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-12 text-center">
            <LayoutGrid className="w-10 h-10 mx-auto text-zinc-700 mb-6" />
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 italic">No external component nodes detected</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {components.map((comp) => (
              <div
                key={comp.id}
                className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 hover:bg-white/[0.05] transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-black border border-white/5 group-hover:scale-110 transition-transform">
                    <LayoutGrid className="w-5 h-5 text-zinc-500 group-hover:text-emerald-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-black uppercase tracking-tight text-white mb-2 group-hover:text-emerald-400 truncate">{comp.name}</h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded bg-white/5 text-zinc-500 group-hover:text-zinc-300">
                        <Tag className="w-3 h-3" />
                        {comp.category}
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded bg-emerald-500/10 text-emerald-500">v{comp.version}</span>
                    </div>
                    <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-[0.2em] text-zinc-600">
                      <span>{comp.usageCount} Deployments</span>
                      <span className="text-emerald-500/60">{comp.visibility}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
