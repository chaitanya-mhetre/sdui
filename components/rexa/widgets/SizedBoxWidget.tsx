'use client';

import { memo } from 'react';
import type { RexaLayoutNode } from '@/lib/rexa/types';

interface SizedBoxWidgetProps {
  node: RexaLayoutNode;
  renderChild?: (node: RexaLayoutNode) => React.ReactNode;
}

function SizedBoxWidgetComponent({ node }: SizedBoxWidgetProps) {
  const w = node.width ?? node.w;
  const h = node.height ?? node.h;
  const width = typeof w === 'number' ? `${w}px` : (w as string | undefined);
  const height = typeof h === 'number' ? `${h}px` : (h as string | undefined);
  return (
    <div
      style={{
        width: width ?? undefined,
        height: height ?? undefined,
        minHeight: height,
      }}
    />
  );
}

export const SizedBoxWidget = memo(SizedBoxWidgetComponent);
