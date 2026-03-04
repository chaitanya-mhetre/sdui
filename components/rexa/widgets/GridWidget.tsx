'use client';

import { memo } from 'react';
import type { RexaLayoutNode, RenderChild } from '@/lib/rexa/types';

interface GridWidgetProps {
  node: RexaLayoutNode;
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
