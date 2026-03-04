'use client';

import { memo } from 'react';
import type { RexaLayoutNode } from '@/lib/rexa/types';

interface CategoryItemWidgetProps {
  node: RexaLayoutNode;
  renderChild?: (node: RexaLayoutNode) => React.ReactNode;
}

function CategoryItemWidgetComponent({ node }: CategoryItemWidgetProps) {
  const label = (node.label as string) ?? '';
  const icon = (node.icon as string) ?? 'circle';
  return (
    <div
      className="flex flex-col items-center justify-center gap-1 rounded-xl border border-border bg-card p-3"
      style={{ minHeight: 64 }}
    >
      <span className="text-muted-foreground" title={icon}>
        <svg width={24} height={24} viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="8" />
        </svg>
      </span>
      <span className="text-xs font-medium text-center truncate w-full">{label}</span>
    </div>
  );
}

export const CategoryItemWidget = memo(CategoryItemWidgetComponent);
