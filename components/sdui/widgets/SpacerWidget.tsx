'use client';

import { memo } from 'react';
import type { SduiLayoutNode } from '@/lib/sdui/types';

interface SpacerWidgetProps {
  node: SduiLayoutNode;
}

function SpacerWidgetComponent({ node }: SpacerWidgetProps) {
  const flex = (node.flex as number) ?? 1;
  return <div style={{ flex }} />;
}

export const SpacerWidget = memo(SpacerWidgetComponent);
