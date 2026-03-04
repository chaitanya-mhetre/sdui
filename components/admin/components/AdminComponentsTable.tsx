'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2 } from 'lucide-react';
import type { PlatformComponent } from '@/types';

interface AdminComponentsTableProps {
  components: PlatformComponent[];
}

const visibilityColors: Record<string, string> = {
  PUBLIC: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  PRIVATE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  BETA: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
};

const categoryColors: Record<string, string> = {
  layout: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  input: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  display: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  navigation: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  form: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
  media: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
};

export function AdminComponentsTable({ components }: AdminComponentsTableProps) {
  const formatDate = (date: Date) => {
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
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Component</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Category</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Version</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Visibility</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Usage</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Created</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {components.map((component, idx) => (
              <motion.tr
                key={component.id}
                className="border-b border-border hover:bg-muted/30 transition-colors"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <td className="px-6 py-4">
                  <p className="font-medium text-sm">{component.name}</p>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${categoryColors[component.category]}`}
                  >
                    {component.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-mono">{component.version}</td>
                <td className="px-6 py-4">
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${visibilityColors[component.visibility]}`}
                  >
                    {component.visibility}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">{component.usageCount.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{formatDate(component.createdAt)}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit className="w-4 h-4" />
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

      {components.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">No components found</p>
        </div>
      )}
    </motion.div>
  );
}
