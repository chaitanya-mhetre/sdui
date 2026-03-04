'use client';

import { memo } from 'react';
import type { RexaLayoutNode, RenderChild } from '@/lib/rexa/types';

interface PaddingWidgetProps {
  node: RexaLayoutNode;
  renderChild?: RenderChild;
}

function PaddingWidgetComponent({ node, renderChild }: PaddingWidgetProps) {
  const child = node.child as RexaLayoutNode | undefined;

  // Support both a number and EdgeInsets-style object
  let pt = 0, pr = 0, pb = 0, pl = 0;
  const p = node.padding;

  if (typeof p === 'number') {
    pt = pr = pb = pl = p;
  } else if (p && typeof p === 'object') {
    const ei = p as Record<string, number>;
    if (ei.all !== undefined) {
      pt = pr = pb = pl = ei.all;
    } else {
      pt = ei.top ?? ei.vertical ?? 0;
      pb = ei.bottom ?? ei.vertical ?? 0;
      pl = ei.left ?? ei.horizontal ?? 0;
      pr = ei.right ?? ei.horizontal ?? 0;
    }
  }

  return (
    <div
      style={{
        paddingTop: pt,
        paddingRight: pr,
        paddingBottom: pb,
        paddingLeft: pl,
      }}
    >
      {child && renderChild ? renderChild(child) : null}
    </div>
  );
}

export const PaddingWidget = memo(PaddingWidgetComponent);
