'use client';

import { memo } from 'react';
import type { RexaLayoutNode } from '@/lib/rexa/types';

interface DividerWidgetProps {
  node: RexaLayoutNode;
}

function DividerWidgetComponent({ node }: DividerWidgetProps) {
  const color = (node.color as string) ?? '#e5e7eb';
  const thickness = (node.thickness as number) ?? 1;
  const indent = (node.indent as number) ?? 0;
  const endIndent = (node.endIndent as number) ?? 0;
  const axis = (node.axis as string) ?? 'horizontal';

  if (axis === 'vertical') {
    return (
      <div
        style={{
          width: thickness,
          height: '100%',
          backgroundColor: color,
          marginLeft: indent,
          marginRight: endIndent,
          alignSelf: 'stretch',
        }}
      />
    );
  }

  return (
    <div
      style={{
        height: thickness,
        width: '100%',
        backgroundColor: color,
        marginLeft: indent,
        marginRight: endIndent,
      }}
    />
  );
}

export const DividerWidget = memo(DividerWidgetComponent);
