'use client';

import { memo } from 'react';
import type { RexaLayoutNode } from '@/lib/rexa/types';

interface SpacerWidgetProps {
  node: RexaLayoutNode;
}

function SpacerWidgetComponent({ node }: SpacerWidgetProps) {
  const flex = (node.flex as number) ?? 1;
  return <div style={{ flex }} />;
}

export const SpacerWidget = memo(SpacerWidgetComponent);
