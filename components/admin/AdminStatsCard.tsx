'use client';

import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface AdminStatsCardProps {
  title: string;
  value: number;
  change: number;
  icon: LucideIcon;
  color: 'blue' | 'purple' | 'green' | 'orange';
}

const colorMap = {
  blue: 'from-blue-500/20 to-blue-500/5 text-blue-600 dark:text-blue-400',
  purple: 'from-purple-500/20 to-purple-500/5 text-purple-600 dark:text-purple-400',
  green: 'from-green-500/20 to-green-500/5 text-green-600 dark:text-green-400',
  orange: 'from-orange-500/20 to-orange-500/5 text-orange-600 dark:text-orange-400',
};

const iconColorMap = {
  blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  green: 'bg-green-500/10 text-green-600 dark:text-green-400',
  orange: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
};

export function AdminStatsCard({
  title,
  value,
  change,
  icon: Icon,
  color,
}: AdminStatsCardProps) {
  const isPositive = change > 0;

  return (
    <motion.div
      className={`p-6 rounded-lg border border-border bg-gradient-to-br ${colorMap[color]} backdrop-blur-sm`}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <motion.p
            className="text-2xl font-bold mt-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {value.toLocaleString()}
          </motion.p>
        </div>

        <div className={`p-3 rounded-lg ${iconColorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4">
        <TrendingUp className={`w-4 h-4 ${isPositive ? 'text-green-600' : 'text-red-600'}`} />
        <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? '+' : ''}{change}%
        </span>
        <span className="text-xs text-muted-foreground">from last month</span>
      </div>
    </motion.div>
  );
}
