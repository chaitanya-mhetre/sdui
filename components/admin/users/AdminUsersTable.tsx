'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Eye, Trash2, Lock, Unlock } from 'lucide-react';
import type { AdminUser } from '@/types';

interface AdminUsersTableProps {
  users: AdminUser[];
}

const planColors: Record<string, string> = {
  FREE: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  STARTER: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  PRO: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  ENTERPRISE: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
};

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  SUSPENDED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  DELETED: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
};

export function AdminUsersTable({ users }: AdminUsersTableProps) {
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
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Email</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Plan</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Projects</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">API Usage</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Created</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, idx) => (
              <motion.tr
                key={user.id}
                className="border-b border-border hover:bg-muted/30 transition-colors"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-sm">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${planColors[user.plan]}`}>
                    {user.plan}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">{user.projectCount}</td>
                <td className="px-6 py-4 text-sm">{user.apiUsageCount.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColors[user.status]}`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{formatDate(user.createdAt)}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      title={user.status === 'ACTIVE' ? 'Suspend' : 'Unsuspend'}
                    >
                      {user.status === 'ACTIVE' ? (
                        <Lock className="w-4 h-4" />
                      ) : (
                        <Unlock className="w-4 h-4" />
                      )}
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

      {users.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">No users found</p>
        </div>
      )}
    </motion.div>
  );
}
