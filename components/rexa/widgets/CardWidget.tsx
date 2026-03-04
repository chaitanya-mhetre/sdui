'use client';

import { memo } from 'react';
import type { RexaLayoutNode, RenderChild } from '@/lib/rexa/types';

interface CardWidgetProps {
  node: RexaLayoutNode;
  renderChild?: RenderChild;
}

function CardWidgetComponent({ node, renderChild }: CardWidgetProps) {
  const style = node.style ?? {};
  const child = node.child as RexaLayoutNode | undefined;
  const children = (node.children ?? []) as RexaLayoutNode[];
  const elevation = (node.elevation as number) ?? 2;
  const borderRadius = (style.borderRadius as number) ?? (node.shape === 'circle' ? 9999 : 12);
  const backgroundColor = (style.backgroundColor as string) ?? '#ffffff';
  const padding = (node.padding as number) ?? (style.padding as number) ?? 12;
  const margin = (node.margin as number) ?? (style.margin as number) ?? 0;

  const shadowIntensity = Math.min(elevation * 0.05, 0.3);

  return (
    <div
      style={{
        backgroundColor,
        borderRadius,
        padding,
        margin,
        boxShadow: `0 ${elevation}px ${elevation * 3}px rgba(0,0,0,${shadowIntensity})`,
        overflow: 'hidden',
      }}
    >
      {child && renderChild ? renderChild(child) : null}
      {children.length > 0 && renderChild
        ? children.map((c, i) => <div key={i}>{renderChild(c)}</div>)
        : null}
    </div>
  );
}

export const CardWidget = memo(CardWidgetComponent);
