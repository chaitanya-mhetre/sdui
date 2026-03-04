'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Eye, Trash2, Lock } from 'lucide-react';
import type { AdminProject } from '@/types';

interface AdminProjectsTableProps {
  projects: AdminProject[];
}

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  SUSPENDED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  ARCHIVED: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
};

export function AdminProjectsTable({ projects }: AdminProjectsTableProps) {
  const formatDate = (date?: Date) => {
    if (!date) return '-';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date));
  };

  return (
    <motion.div
      className="border border-border rounded-lg overflow-hidden bg-card/50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Project</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Owner</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Layouts</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">API Calls</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Last Activity</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project, idx) => (
              <motion.tr
                key={project.id}
                className="border-b border-border hover:bg-muted/30 transition-colors"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-sm">{project.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{project.apiKey}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">{project.userName}</td>
                <td className="px-6 py-4 text-sm">{project.layoutCount}</td>
                <td className="px-6 py-4 text-sm">{project.apiCallsCount.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColors[project.status]}`}
                  >
                    {project.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {formatDate(project.lastApiCall)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      title={project.status === 'ACTIVE' ? 'Suspend' : 'Unsuspend'}
                    >
                      <Lock className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {projects.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">No projects found</p>
        </div>
      )}
    </motion.div>
  );
}
