'use client';

import React from 'react';
import { widgetRegistry } from './widgetRegistry';
import { UnknownWidget } from '@/components/sdui/widgets/UnknownWidget';
import type { SduiLayoutNode } from './types';

export type RenderChild = (node: SduiLayoutNode) => React.ReactNode;

export function renderWidget(node: SduiLayoutNode): React.ReactNode {
  if (!node || typeof node !== 'object') return null;
  const type = String((node as SduiLayoutNode).type ?? '').toLowerCase();
  const Component = widgetRegistry[type];

  if (!Component) {
    return <UnknownWidget type={type || 'empty'} />;
  }

  return <Component node={node as SduiLayoutNode} renderChild={renderWidget} />;
}

/** Wrapper for use in React tree with stable identity */
export function SduiLayoutRenderer({ node }: { node: SduiLayoutNode }) {
  if (!node) return null;
  const type = String(node.type ?? '').toLowerCase();
  const Component = widgetRegistry[type];
  if (!Component) {
    return <UnknownWidget type={type || 'empty'} />;
  }
  return <Component node={node} renderChild={renderWidget} />;
}
