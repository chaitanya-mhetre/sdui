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
} from '@/components/ui/dropdown-menu';

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
          <Loader2 className="w-12 h-12 animate-spin text-emerald-500" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500/60 text-center">Materializing_Project_Registry...</span>
        </div>
      </div>
    );
  }

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
            <Layout className="w-4 h-4 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 italic">Central Deployment Hub</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white leading-tight">
            Active <span className="text-emerald-500 italic">Projects</span>
          </h1>
          <p className="text-zinc-500 text-xs font-black uppercase tracking-[0.2em]">Manage your global UI nodes // Total: {projects.length}</p>
        </div>
        <Link href="/dashboard/projects/new">
          <button className="group relative px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 shadow-[0_20px_40px_rgba(16,185,129,0.2)] flex items-center gap-3">
            <Plus className="w-4 h-4" />
            Create_New_Node
          </button>
        </Link>
      </motion.div>

      {/* Projects Grid */}
      <AnimatePresence mode="popLayout">
        {projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-16 rounded-[3rem] border border-white/[0.08] bg-white/[0.02] flex flex-col items-center justify-center text-center backdrop-blur-3xl"
          >
            <div className="w-20 h-20 rounded-[2rem] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-10">
              <Plus className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-white mb-4 italic">Registry Empty</h2>
            <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest leading-relaxed max-w-sm mb-10">
              Initiate your first project node to begin large-scale UI distribution.
            </p>
            <Link href="/dashboard/projects/new">
              <button className="px-10 py-4 border border-white/[0.1] hover:bg-white/[0.05] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all">Initialize_Primary_Sequence</button>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1 } }
            }}
          >
            {projects.map((project) => (
              <motion.div
                key={project.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                className="group p-8 rounded-[2.5rem] bg-[#0b0b0d] border border-white/[0.08] hover:border-emerald-500/30 hover:shadow-[0_40px_80px_-12px_rgba(0,0,0,0.8)] transition-all relative overflow-hidden flex flex-col"
              >
                {/* Visual Accent */}
                <div className="absolute top-0 right-0 p-8 text-emerald-500/5 group-hover:text-emerald-500/15 transition-colors">
                  <Globe className="w-12 h-12" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500/60 italic">Node_Active</span>
                  </div>

                  <h3 className="text-2xl font-black uppercase tracking-tight text-white mb-3 italic truncate group-hover:text-emerald-400 transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-zinc-500 text-xs font-medium line-clamp-2 leading-relaxed mb-8">
                    {project.description || 'No operational parameters defined for this node cluster.'}
                  </p>

                  {/* API Configuration */}
                  {project.apiKey && (
                    <div className="mb-8 p-4 rounded-2xl bg-black border border-white/[0.05] group/key">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Terminal className="w-3 h-3 text-zinc-600" />
                          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-600">Access_Protocol_Key</span>
                        </div>
                        <button
                          onClick={(e) => handleCopyApiKey(project.apiKey!, project.id, e)}
                          className="text-emerald-500/40 hover:text-emerald-500 transition-colors"
                        >
                          {copiedKeyId === project.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <div className="text-[10px] font-black text-zinc-400 font-mono truncate tracking-tight bg-white/[0.02] p-2 rounded-lg">
                        {project.apiKey}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="space-y-1">
                      <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600">Capacity</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white italic">{project.layoutCount || 0}</span>
                        <span className="text-[8px] font-black text-zinc-500 uppercase">Layouts</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600">Last_Sync</span>
                      <div className="flex items-center gap-2 text-zinc-500">
                        <Clock className="w-3 h-3" />
                        <span className="text-[8px] font-black uppercase tracking-widest truncate">
                          {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Link href={`/dashboard/editor/${project.id}`} className="flex-1">
                    <button className="w-full py-3.5 bg-white text-black hover:bg-emerald-400 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all active:scale-95">
                      Configure_Control_Plane
                    </button>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="w-12 h-12 flex items-center justify-center bg-white/5 border border-white/[0.1] text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                        {deletingId === project.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                        ) : (
                          <MoreVertical className="w-4 h-4" />
                        )}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#0b0b0d] border-white/10 rounded-xl p-2 min-w-[160px]">
                      <DropdownMenuItem
                        className="text-red-400 focus:text-red-400 focus:bg-red-500/10 cursor-pointer rounded-lg font-black uppercase tracking-widest text-[9px] p-3 gap-3"
                        onClick={() => handleDelete(project.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Decommission_Node
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
