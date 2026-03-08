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
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <span className="text-xs font-bold text-muted-foreground/60 uppercase tracking-[0.3em]">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isSignedIn) return null;

  return (
    <div className="space-y-12 pb-20">
      {/* Header Cluster */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 px-1">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-foreground tracking-tight leading-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            Main <span className="text-primary">Dashboard</span>
          </h1>
          <p className="text-muted-foreground text-sm font-medium">
            Welcome back, <span className="text-foreground border-b border-primary/10">{user?.name || user?.email}</span>
          </p>
        </div>
        <Link href="/dashboard/projects/new">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-wider text-[10px] h-11 px-8 rounded-xl shadow-lg shadow-primary/10 active:scale-[0.98] transition-all gap-2 border-none">
            <Plus className="w-4 h-4" />
            Create Project
          </Button>
        </Link>
      </div>

      {/* Stats Topology */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Active Projects", value: stats.totalProjects, icon: Box },
          { label: "Total Layouts", value: stats.totalLayouts, icon: Zap },
          { label: "Latency", value: "14ms", icon: Activity },
          { label: "Plan Type", value: user?.plan || 'Free', icon: Shield }
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            {...({
              initial: { opacity: 0, y: 10 },
              animate: { opacity: 1, y: 0 },
              transition: { delay: i * 0.05 },
              className: "premium-card p-6 rounded-xl border-none relative overflow-hidden group cursor-default"
            } as any)}
          >
            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
              <stat.icon className="w-8 h-8 text-primary" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-2">{stat.label}</p>
            <p className="text-2xl font-bold text-foreground tracking-tight">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Primary Workspace: Projects */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-foreground tracking-tight px-1">Recent Projects</h2>

        {projects.length === 0 ? (
          <div className="premium-card rounded-2xl p-24 text-center group cursor-pointer hover:bg-muted/30 border-dashed border">
            <div className="w-16 h-16 rounded-2xl bg-muted border border-border flex items-center justify-center mx-auto mb-8 group-hover:scale-105 group-hover:bg-primary/10 group-hover:border-primary/20 transition-all duration-300">
              <Plus className="w-8 h-8 text-muted-foreground group-hover:text-primary" />
            </div>
            <p className="text-muted-foreground font-bold text-lg mb-8">No projects found. Let's build something.</p>
            <Link href="/dashboard/projects/new">
              <Button size="lg" className="bg-primary text-primary-foreground hover:shadow-xl hover:shadow-primary/15 font-bold uppercase tracking-wider text-xs h-12 px-10 rounded-xl transition-all active:scale-[0.98]">
                Create Your First Project
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, idx) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + idx * 0.05 }}
              >
                <Link href={`/dashboard/editor/${project.id}`}>
                  <div className="premium-card h-full rounded-2xl p-8 hover:shadow-[0_15px_40px_rgba(0,0,0,0.06)] dark:hover:shadow-2xl transition-all cursor-pointer group flex flex-col justify-between relative overflow-hidden border-none text-card-foreground">
                    <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-30 transition-opacity">
                      <Cpu className="w-20 h-20 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-end justify-between mb-8">
                        <div className="w-12 h-12 rounded-xl bg-muted border border-border flex items-center justify-center group-hover:bg-primary/10 group-hover:border-primary/20 transition-all duration-300">
                          <Box className="w-6 h-6 text-muted-foreground group-hover:text-primary" />
                        </div>
                        <ArrowRight className="w-6 h-6 text-muted-foreground group-hover:text-primary group-hover:translate-x-1.5 transition-all duration-300" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                        {project.name}
                      </h3>
                      {project.description && (
                        <p className="text-sm text-muted-foreground font-medium leading-relaxed line-clamp-2">
                          {project.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-5 text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest pt-8 mt-8 border-t border-border/40">
                      <span className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary/60" />
                        {project.layoutCount || 0} Layouts
                      </span>
                      <span>•</span>
                      <span className="group-hover:text-foreground transition-colors">
                        {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
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
          <div className="h-0.5 w-8 bg-primary" />
          <h2 className="text-xl font-bold text-foreground">Platform Registry</h2>
        </div>

        {components.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <LayoutGrid className="w-10 h-10 mx-auto text-muted-foreground/30 mb-6" />
            <p className="text-xs font-medium text-muted-foreground">No platform components found</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {components.map((comp) => (
              <div
                key={comp.id}
                className="bg-card border border-border rounded-2xl p-6 hover:bg-muted/50 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-background border border-border group-hover:scale-110 transition-transform">
                    <LayoutGrid className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-foreground mb-2 group-hover:text-primary truncate">{comp.name}</h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-muted text-muted-foreground">
                        <Tag className="w-3 h-3" />
                        {comp.category}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-1 rounded bg-primary/10 text-primary">v{comp.version}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      <span>{comp.usageCount} Usage</span>
                      <span className="text-primary/80">{comp.visibility}</span>
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
