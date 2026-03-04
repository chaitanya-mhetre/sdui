'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, MoreVertical, Loader2, Trash2, Copy, Check } from 'lucide-react';
import { apiRequest } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
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
    // Wait for Clerk to load, then check authentication
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
        // Don't redirect - just show error
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

      // Reload projects
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
        description: 'API key copied to clipboard',
      });
      setTimeout(() => setCopiedKeyId(null), 2000);
    } catch (error) {
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = apiKey;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
          setCopiedKeyId(projectId);
          toast({
            title: 'Copied!',
            description: 'API key copied to clipboard',
          });
          setTimeout(() => setCopiedKeyId(null), 2000);
        } else {
          throw new Error('execCommand failed');
        }
      } catch (fallbackError) {
        toast({
          title: 'Error',
          description: 'Failed to copy API key. Please copy manually.',
          variant: 'destructive',
        });
      }
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
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Projects</h1>
          <p className="text-muted-foreground">Manage and view all your projects</p>
        </div>
        <Link href="/dashboard/projects/new">
          <Button className="gap-2 rounded-lg">
            <Plus className="w-5 h-5" />
            New Project
          </Button>
        </Link>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <p className="text-muted-foreground mb-4 text-lg">No projects yet</p>
          <p className="text-sm text-muted-foreground mb-6">
            Create your first project to start building amazing UIs
          </p>
          <Link href="/dashboard/projects/new">
            <Button className="gap-2 rounded-lg">
              <Plus className="w-5 h-5" />
              Create Your First Project
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 transition group"
            >
              {/* Project Image */}
              <div className="h-40 bg-muted flex items-center justify-center">
                <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10"></div>
              </div>

              {/* Project Info */}
              <div className="p-6">
                <h3 className="font-semibold text-lg mb-1">{project.name}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {project.description || 'No description'}
                </p>

                {/* API Key */}
                {project.apiKey && (
                  <div className="mb-4 p-2 bg-muted/50 rounded-md border border-border">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground mb-1">API Key</p>
                        <p className="text-xs font-mono text-foreground truncate">
                          {project.apiKey}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 shrink-0"
                        onClick={(e) => handleCopyApiKey(project.apiKey!, project.id, e)}
                        type="button"
                      >
                        {copiedKeyId === project.id ? (
                          <Check className="w-3.5 h-3.5 text-green-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-muted-foreground">
                    {project.layoutCount || 0} layouts
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Link href={`/dashboard/editor/${project.id}`} className="flex-1">
                    <Button variant="default" size="sm" className="w-full rounded-lg">
                      Edit
                    </Button>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg px-3"
                        disabled={deletingId === project.id}
                      >
                        {deletingId === project.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <MoreVertical className="w-4 h-4" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDelete(project.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
