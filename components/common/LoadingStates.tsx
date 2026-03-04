'use client';

import { motion } from 'framer-motion';
import { pulseVariants, rotateVariants } from '@/lib/animations';

export function SkeletonLoader() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="h-12 bg-muted rounded-lg"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      ))}
    </div>
  );
}

export function SpinnerLoader({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <motion.div
      className={`${sizes[size]} border-2 border-primary/30 border-t-primary rounded-full`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
  );
}

export function PulseLoader() {
  return (
    <motion.div
      className="w-3 h-3 bg-primary rounded-full"
      variants={pulseVariants}
      animate="animate"
    />
  );
}
