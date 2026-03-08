'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, MoreVertical, Loader2, Trash2, Copy, Check, Layout, Clock, Globe, Shield, Terminal } from 'lucide-react';
import { apiRequest } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface Project {
  id: string;
  name: string;
  description: string | null;
  apiKey?: string;
  createdAt: string;
  updatedAt: string;
  layoutCount?: number;
  apiEndpointCount?: number;
  apiCallsCount?: number;
}

export default function ProjectsPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn, userId } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [selectedProjectForKey, setSelectedProjectForKey] = useState<Project | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn || !userId) {
      router.push('/login');
      return;
    }
    loadProjects();
  }, [isLoaded, isSignedIn, userId, router]);

  async function loadProjects() {
    setLoading(true);
    try {
      const response = await apiRequest<{
        projects: Project[];
        pagination: { total: number };
      }>('/projects');

      if (!response.success) {
        toast({
          title: 'Error',
          description: response.message || 'Failed to load projects',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }
      setProjects(response.data.projects);
    } catch (error) {
      console.error('Failed to load projects:', error);
      toast({
        title: 'Error',
        description: 'Failed to load projects',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(projectId: string) {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    setDeletingId(projectId);
    try {
      const response = await apiRequest(`/projects/${projectId}`, {
        method: 'DELETE',
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
        description: 'Project deleted successfully',
      });
      await loadProjects();
    } catch (error) {
      console.error('Failed to delete project:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete project',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  }

  async function handleCopyApiKey(apiKey: string, projectId: string, e?: React.MouseEvent) {
    e?.preventDefault();
    e?.stopPropagation();

    if (!apiKey) {
      toast({
        title: 'Error',
        description: 'API key is not available',
        variant: 'destructive',
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(apiKey);
      setCopiedKeyId(projectId);
      toast({
        title: 'Copied!',
        description: 'API key copied successfully',
      });
      setTimeout(() => setCopiedKeyId(null), 2000);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy API key',
        variant: 'destructive',
      });
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-6">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <span className="text-xs font-bold text-muted-foreground/60 uppercase tracking-[0.3em] text-center">Loading Projects...</span>
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
            <Layout className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Project Workspace</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight leading-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            Your <span className="text-primary">Projects</span>
          </h1>
          <p className="text-muted-foreground text-sm font-medium">Manage and build your UI project collection</p>
        </div>
        <Link href="/dashboard/projects/new">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-wider text-[10px] h-11 px-8 rounded-xl shadow-lg shadow-primary/10 active:scale-[0.98] transition-all gap-2 border-none">
            <Plus className="w-4 h-4" />
            New Project
          </Button>
        </Link>
      </motion.div>

      {/* Projects Grid */}
      <AnimatePresence mode="popLayout">
        {projects.length === 0 ? (
          <motion.div
            {...({
              initial: { opacity: 0, scale: 0.95 },
              animate: { opacity: 1, scale: 1 },
              className: "rounded-2xl border border-border bg-card overflow-hidden backdrop-blur-3xl shadow-xl p-16 flex flex-col items-center justify-center text-center"
            } as any)}
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-8">
              <Plus className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-3">No Projects</h2>
            <p className="text-muted-foreground text-sm font-medium leading-relaxed max-w-sm mb-8">
              Create your first project to start building and distributing your UI.
            </p>
            <Link href="/dashboard/projects/new">
              <button className="px-8 py-3 border border-border hover:bg-muted text-foreground rounded-xl font-bold uppercase tracking-wider text-[10px] transition-all">Create Project</button>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            {...({
              className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8",
              initial: "hidden",
              animate: "visible",
              variants: {
                visible: { transition: { staggerChildren: 0.1 } }
              }
            } as any)}
          >
            {projects.map((project) => (
              <motion.div
                key={project.id}
                {...({
                  variants: {
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  },
                  className: "group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-xl transition-all relative overflow-hidden flex flex-col"
                } as any)}
              >


                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-6">
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-primary/10 text-primary">Live</span>
                  </div>

                  <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors truncate">
                    {project.name}
                  </h3>
                  <p className="text-muted-foreground text-sm font-medium line-clamp-2 leading-relaxed mb-8">
                    {project.description || 'No description available for this project.'}
                  </p>



                  <div className="grid grid-cols-2 gap-4 mb-8 text-xs font-semibold text-muted-foreground">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Capacity</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground">{project.layoutCount || 0}</span>
                        <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Layouts</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Last Update</span>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="truncate">
                          {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Link href={`/dashboard/editor/${project.id}`} className="flex-1">
                    <Button className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-bold uppercase tracking-wider text-[10px] transition-all active:scale-[0.98] border-none">
                      Open Editor
                    </Button>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="w-12 h-12 flex items-center justify-center bg-muted/50 border border-border text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all">
                        {deletingId === project.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        ) : (
                          <MoreVertical className="w-4 h-4" />
                        )}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-card border-border rounded-xl p-2 min-w-[200px]">
                      <DropdownMenuItem
                        className="cursor-pointer rounded-lg font-bold uppercase tracking-wider text-[10px] p-3 gap-3"
                        onClick={() => setSelectedProjectForKey(project)}
                      >
                        <Shield className="w-4 h-4 text-primary" />
                        View API Key
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer rounded-lg font-bold uppercase tracking-wider text-[10px] p-3 gap-3"
                        onClick={(e) => handleCopyApiKey(project.apiKey!, project.id, e as any)}
                      >
                        {copiedKeyId === project.id ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                        Copy API Key
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-border/50" />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer rounded-lg font-bold uppercase tracking-wider text-[10px] p-3 gap-3"
                        onClick={() => handleDelete(project.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Project
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      {/* API Key Dialog */}
      <Dialog open={!!selectedProjectForKey} onOpenChange={(open) => !open && setSelectedProjectForKey(null)}>
        <DialogContent className="sm:max-w-md bg-card border-border rounded-3xl p-8">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-bold tracking-tight">Project API Key</DialogTitle>
            <DialogDescription className="text-muted-foreground font-medium pt-2">
              Use this key to authenticate your requests from the SDK or direct API calls for <span className="text-foreground font-bold">{selectedProjectForKey?.name}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-muted/50 border border-border group relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Production Key</span>
                </div>
                <button
                  onClick={(e) => handleCopyApiKey(selectedProjectForKey?.apiKey!, selectedProjectForKey?.id!, e as any)}
                  className="p-2 rounded-lg bg-background border border-border hover:border-primary/50 text-muted-foreground hover:text-primary transition-all shadow-sm"
                >
                  {copiedKeyId === selectedProjectForKey?.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="text-xs font-semibold text-foreground break-all bg-background/50 p-4 rounded-xl border border-border leading-relaxed tracking-tight group-hover:border-primary/20 transition-all">
                {selectedProjectForKey?.apiKey}
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
              <Shield className="w-5 h-5 text-primary flex-shrink-0" />
              <p className="text-[11px] font-bold text-primary/80 leading-snug">
                KEEP THIS KEY SECURE. Do not share it in public repositories or client-side code where it might be exposed.
              </p>
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button 
              onClick={() => setSelectedProjectForKey(null)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 rounded-xl h-12"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
