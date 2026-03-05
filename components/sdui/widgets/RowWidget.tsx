'use client';

import { memo } from 'react';
import type { SduiLayoutNode, RenderChild } from '@/lib/sdui/types';

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

interface RowWidgetProps {
  node: SduiLayoutNode;
  renderChild?: RenderChild;
}

/**
 * Flutter Row equivalent.
 * Expanded / Spacer children are handled inline — given flex:1 directly on the
 * wrapper div so the flex item participates in row sizing correctly.
 */
function RowWidgetComponent({ node, renderChild }: RowWidgetProps) {
  const children = (node.children ?? []) as SduiLayoutNode[];
  const gap = typeof node.gap === 'number' ? node.gap : 0;
  const mainAxisAlignment = mainAxisMap[node.mainAxisAlignment as string ?? 'start'] ?? 'flex-start';
  const crossAxisAlignment = crossAxisMap[node.crossAxisAlignment as string ?? 'center'] ?? 'center';
  const mainAxisSize = (node.mainAxisSize as string) ?? 'max';

  if (!renderChild) return null;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap,
        justifyContent: mainAxisAlignment,
        alignItems: crossAxisAlignment,
        flex: mainAxisSize === 'min' ? undefined : 1,
        width: mainAxisSize === 'min' ? undefined : '100%',
        minWidth: 0,
      }}
    >
      {children.map((child, i) => {
        const childType = String(child.type ?? '').toLowerCase();
        const flexVal = (child.flex as number) ?? 1;

        if (childType === 'spacer') {
          return <div key={i} style={{ flex: flexVal, minWidth: 0 }} />;
        }

        if (childType === 'expanded') {
          const expandedChild = child.child as SduiLayoutNode | undefined;
          return (
            <div key={i} style={{ flex: flexVal, minWidth: 0, minHeight: 0 }}>
              {expandedChild ? renderChild(expandedChild) : null}
            </div>
          );
        }

        return (
          <div key={i} style={{ flexShrink: 0, minWidth: 0 }}>
            {renderChild(child)}
          </div>
        );
      })}
    </div>
  );
}

export const RowWidget = memo(RowWidgetComponent);
