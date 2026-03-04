'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, Loader2 } from 'lucide-react';
import { useAdminStore } from '@/store/adminStore';
import { AdminProjectsTable } from '@/components/admin/projects/AdminProjectsTable';
import { apiRequest } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';

export default function ProjectsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const projects = useAdminStore((state) => state.projects);
  const setProjects = useAdminStore((state) => state.setProjects);
  const setProjectsLoading = useAdminStore((state) => state.setProjectsLoading);
  const setProjectsFilter = useAdminStore((state) => state.setProjectsFilter);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    setProjectsLoading(true);
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      params.set('limit', '100');

      const response = await apiRequest<{
        projects: any[];
        pagination: { total: number };
      }>(`/admin/projects?${params.toString()}`);

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

      setProjects(response.data.projects);
    } catch (error) {
      console.error('Failed to load projects:', error);
      toast({
        title: 'Error',
        description: 'Failed to load projects',
        variant: 'destructive',
      });
    } finally {
      setProjectsLoading(false);
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== undefined) {
        loadProjects();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.userName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold">Projects Management</h1>
        <p className="text-muted-foreground mt-2">Monitor and manage all platform projects</p>
      </motion.div>

      {/* Toolbar */}
      <motion.div
        className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2 flex-1 max-w-xs">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setProjectsFilter({ search: e.target.value });
            }}
            className="border-0 bg-transparent text-sm placeholder:text-muted-foreground focus-visible:ring-0"
          />
        </div>

        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </motion.div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <AdminProjectsTable projects={filteredProjects} />
        </motion.div>
      )}
    </div>
  );
}
