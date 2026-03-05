'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { pageTransitionVariants } from '@/lib/animations';

interface AnimatedPageProps {
  children: ReactNode;
  className?: string;
}

export function AnimatedPage({ children, className = '' }: AnimatedPageProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={pageTransitionVariants}
      style={{ willChange: 'opacity, transform' }}
    >
      <div className={className}>
        {children}
      </div>
    </motion.div>
  );
}
