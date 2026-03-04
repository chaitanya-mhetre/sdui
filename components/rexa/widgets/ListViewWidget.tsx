'use client';

import { memo } from 'react';
import type { RexaLayoutNode, RenderChild } from '@/lib/rexa/types';

interface ListViewWidgetProps {
  node: RexaLayoutNode;
  renderChild?: RenderChild;
}

function ListViewWidgetComponent({ node, renderChild }: ListViewWidgetProps) {
  const children = (node.children ?? []) as RexaLayoutNode[];
  const padding = node.padding as number | undefined;
  const shrinkWrap = node.shrinkWrap === true;
  const scrollDirection = (node.scrollDirection as string) ?? 'vertical';
  const gap = (node.itemExtent as number) ?? 0;
  const separator = node.separator as RexaLayoutNode | undefined;

  const isHorizontal = scrollDirection === 'horizontal';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isHorizontal ? 'row' : 'column',
        overflow: shrinkWrap ? 'visible' : isHorizontal ? 'hidden auto' : 'auto hidden',
        padding: padding,
        gap,
        height: shrinkWrap ? undefined : isHorizontal ? undefined : '100%',
      }}
    >
      {children.map((child, i) => (
        <div key={i}>
          {renderChild ? renderChild(child) : null}
          {separator && i < children.length - 1 && renderChild ? renderChild(separator) : null}
        </div>
      ))}
    </div>
  );
}

export const ListViewWidget = memo(ListViewWidgetComponent);
