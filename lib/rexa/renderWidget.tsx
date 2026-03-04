'use client';

import React from 'react';
import { widgetRegistry } from './widgetRegistry';
import { UnknownWidget } from '@/components/rexa/widgets/UnknownWidget';
import type { RexaLayoutNode } from './types';

export type RenderChild = (node: RexaLayoutNode) => React.ReactNode;

export function renderWidget(node: RexaLayoutNode): React.ReactNode {
  if (!node || typeof node !== 'object') return null;
  const type = String((node as RexaLayoutNode).type ?? '').toLowerCase();
  const Component = widgetRegistry[type];

  if (!Component) {
    return <UnknownWidget type={type || 'empty'} />;
  }

  return <Component node={node as RexaLayoutNode} renderChild={renderWidget} />;
}

/** Wrapper for use in React tree with stable identity */
export function RexaLayoutRenderer({ node }: { node: RexaLayoutNode }) {
  if (!node) return null;
  const type = String(node.type ?? '').toLowerCase();
  const Component = widgetRegistry[type];
  if (!Component) {
    return <UnknownWidget type={type || 'empty'} />;
  }
  return <Component node={node} renderChild={renderWidget} />;
}
