'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { slideUpVariants } from '@/lib/animations';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaOnClick?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  ctaLabel,
  ctaOnClick,
}: EmptyStateProps) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-16 px-6"
      variants={slideUpVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary"
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        {icon}
      </motion.div>
      <h3 className="text-2xl font-bold text-center mb-2">{title}</h3>
      <p className="text-muted-foreground text-center mb-8 max-w-sm">{description}</p>
      {ctaLabel && ctaOnClick && (
        <Button onClick={ctaOnClick} className="rounded-lg">
          {ctaLabel}
        </Button>
      )}
    </motion.div>
  );
}
