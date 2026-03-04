'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { ArrowRight, Plus, Loader2, LayoutGrid, Tag } from 'lucide-react';
import { apiRequest } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

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
    // Wait for Clerk to load, then check authentication
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
      // Load user data
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

      // Load projects
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

      // Load platform components from DB (PUBLIC/BETA)
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

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.name || user?.email || 'User'}
          </h1>
          <p className="text-muted-foreground">
            You have {stats.totalProjects} active {stats.totalProjects === 1 ? 'project' : 'projects'}
          </p>
        </div>
        <Link href="/dashboard/projects/new">
          <Button className="gap-2 rounded-lg">
            <Plus className="w-5 h-5" />
            New Project
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-card border border-border p-6 rounded-lg hover:border-primary/50 transition-colors">
          <p className="text-muted-foreground text-sm mb-2">Total Projects</p>
          <p className="text-3xl font-bold">{stats.totalProjects}</p>
        </div>
        <div className="bg-card border border-border p-6 rounded-lg hover:border-primary/50 transition-colors">
          <p className="text-muted-foreground text-sm mb-2">Total Layouts</p>
          <p className="text-3xl font-bold">{stats.totalLayouts}</p>
        </div>
        <div className="bg-card border border-border p-6 rounded-lg hover:border-primary/50 transition-colors">
          <p className="text-muted-foreground text-sm mb-2">Plan</p>
          <p className="text-3xl font-bold capitalize">{user?.plan || 'Free'}</p>
        </div>
        <div className="bg-card border border-border p-6 rounded-lg hover:border-primary/50 transition-colors">
          <p className="text-muted-foreground text-sm mb-2">API Calls</p>
          <p className="text-3xl font-bold">{stats.totalApiCalls}</p>
        </div>
      </div>

      {/* Recent Projects */}
      <div>
        <h2 className="text-xl font-bold mb-4">Recent Projects</h2>
        {projects.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <p className="text-muted-foreground mb-6 text-lg">No projects yet</p>
            <Link href="/dashboard/projects/new">
              <Button className="gap-2 rounded-lg" size="lg">
                <Plus className="w-5 h-5" />
                Create Your First Project
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Link key={project.id} href={`/dashboard/editor/${project.id}`}>
                <div className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                        {project.name}
                      </h3>
                      {project.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {project.description}
                        </p>
                      )}
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-4 border-t border-border">
                    <span>{project.layoutCount || 0} layouts</span>
                    <span>•</span>
                    <span>Updated {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Available Components (from DB) */}
      <div>
        <h2 className="text-xl font-bold mb-4">Available Components</h2>
        {components.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <LayoutGrid className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No components available yet. Components are added by the platform and will appear here.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {components.map((comp) => (
              <div
                key={comp.id}
                className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-md bg-muted">
                    <LayoutGrid className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{comp.name}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Tag className="w-3.5 h-3.5" />
                        {comp.category}
                      </span>
                      <span className="text-xs text-muted-foreground">v{comp.version}</span>
                      {comp.visibility !== 'PUBLIC' && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-400">
                          {comp.visibility}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {comp.usageCount} use{comp.usageCount !== 1 ? 's' : ''}
                    </p>
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
