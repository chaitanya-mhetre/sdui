'use client';

import { memo } from 'react';
import type { SduiLayoutNode, RenderChild } from '@/lib/sdui/types';

interface CenterWidgetProps {
  node: SduiLayoutNode;
  renderChild?: RenderChild;
}

function CenterWidgetComponent({ node, renderChild }: CenterWidgetProps) {
  const child = node.child as SduiLayoutNode | undefined;
  const width = node.widthFactor ? '100%' : undefined;
  const height = node.heightFactor ? '100%' : undefined;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width,
        height,
      }}
    >
      {child && renderChild ? renderChild(child) : null}
    </div>
  );
}

export const CenterWidget = memo(CenterWidgetComponent);
