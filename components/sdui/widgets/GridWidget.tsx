'use client';

import { memo } from 'react';
import type { SduiLayoutNode, RenderChild } from '@/lib/sdui/types';

interface GridWidgetProps {
  node: SduiLayoutNode;
  renderChild?: RenderChild;
}

function GridWidgetComponent({ node, renderChild }: GridWidgetProps) {
  const children = node.children ?? [];
  const crossAxisCount = (node.crossAxisCount as number) ?? 2;
  if (!renderChild) return null;
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${crossAxisCount}, 1fr)`,
        gap: 12,
      }}
    >
      {children.map((child, i) => (
        <div key={i}>{renderChild(child)}</div>
      ))}
    </div>
  );
}

export const GridWidget = memo(GridWidgetComponent);
