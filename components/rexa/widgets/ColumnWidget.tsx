'use client';

import { memo } from 'react';
import type { RexaLayoutNode, RenderChild } from '@/lib/rexa/types';

const mainAxisMap: Record<string, string> = {
  start: 'flex-start',
  end: 'flex-end',
  center: 'center',
  spaceBetween: 'space-between',
  spaceAround: 'space-around',
  spaceEvenly: 'space-evenly',
};

const crossAxisMap: Record<string, string> = {
  start: 'flex-start',
  end: 'flex-end',
  center: 'center',
  stretch: 'stretch',
};

interface ColumnWidgetProps {
  node: RexaLayoutNode;
  renderChild?: RenderChild;
}

/**
 * Flutter Column equivalent.
 * - Expanded children (type==="expanded") get flex:1 applied via their own widget.
 * - Spacer children get flex:1 with no content.
 * - mainAxisSize: "min" collapses height; default is "max" (fills parent).
 */
function ColumnWidgetComponent({ node, renderChild }: ColumnWidgetProps) {
  const children = (node.children ?? []) as RexaLayoutNode[];
  const gap = typeof node.gap === 'number' ? node.gap : 0;
  const padding = node.padding;
  const mainAxisAlignment = mainAxisMap[node.mainAxisAlignment as string ?? 'start'] ?? 'flex-start';
  const crossAxisAlignment = crossAxisMap[node.crossAxisAlignment as string ?? 'stretch'] ?? 'stretch';
  const mainAxisSize = (node.mainAxisSize as string) ?? 'max';

  if (!renderChild) return null;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap,
        justifyContent: mainAxisAlignment,
        alignItems: crossAxisAlignment,
        // mainAxisSize=min → shrink-wrap; max → fill parent
        flex: mainAxisSize === 'min' ? undefined : 1,
        height: mainAxisSize === 'min' ? undefined : '100%',
        minHeight: 0,
        width: '100%',
        padding: typeof padding === 'number'
          ? padding
          : typeof padding === 'string'
            ? padding
            : undefined,
      }}
    >
      {children.map((child, i) => {
        const childType = String(child.type ?? '').toLowerCase();
        const flexVal = (child.flex as number) ?? 1;

        if (childType === 'spacer') {
          // Spacer: empty flex gap, no content
          return <div key={i} style={{ flex: flexVal, minHeight: 0 }} />;
        }

        if (childType === 'expanded') {
          // Expanded: flex wrapper that renders its child inside
          const expandedChild = child.child as RexaLayoutNode | undefined;
          return (
            <div key={i} style={{ flex: flexVal, minHeight: 0, minWidth: 0 }}>
              {expandedChild ? renderChild(expandedChild) : null}
            </div>
          );
        }

        return (
          <div key={i} style={{ minWidth: 0, flexShrink: 0, width: '100%' }}>
            {renderChild(child)}
          </div>
        );
      })}
    </div>
  );
}

export const ColumnWidget = memo(ColumnWidgetComponent);
