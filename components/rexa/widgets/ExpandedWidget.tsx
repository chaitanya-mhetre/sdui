'use client';

import { memo } from 'react';
import type { RexaLayoutNode, RenderChild } from '@/lib/rexa/types';

interface ExpandedWidgetProps {
  node: RexaLayoutNode;
  renderChild?: RenderChild;
}

function ExpandedWidgetComponent({ node, renderChild }: ExpandedWidgetProps) {
  const child = node.child as RexaLayoutNode | undefined;
  const flex = (node.flex as number) ?? 1;

  return (
    <div style={{ flex, minWidth: 0, minHeight: 0 }}>
      {child && renderChild ? renderChild(child) : null}
    </div>
  );
}

export const ExpandedWidget = memo(ExpandedWidgetComponent);
