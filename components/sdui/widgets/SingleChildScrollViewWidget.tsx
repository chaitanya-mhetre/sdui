'use client';

import { memo } from 'react';
import type { SduiLayoutNode, RenderChild } from '@/lib/sdui/types';

interface SingleChildScrollViewWidgetProps {
  node: SduiLayoutNode;
  renderChild?: RenderChild;
}

function SingleChildScrollViewWidgetComponent({ node, renderChild }: SingleChildScrollViewWidgetProps) {
  const scrollDirection = (node.scrollDirection as string) ?? 'vertical';
  const isHorizontal = scrollDirection === 'horizontal';
  const child = node.child as SduiLayoutNode | undefined;
  if (!renderChild || !child) return null;
  return (
    <div
      style={{
        flex: 1,
        width: '100%',
        height: '100%',
        overflow: isHorizontal ? 'auto hidden' : 'hidden auto',
        minHeight: 0,
      }}
    >
      {renderChild(child)}
    </div>
  );
}

export const SingleChildScrollViewWidget = memo(SingleChildScrollViewWidgetComponent);
