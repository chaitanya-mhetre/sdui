'use client';

import { memo } from 'react';
import type { SduiLayoutNode, RenderChild } from '@/lib/sdui/types';

interface ScaffoldWidgetProps {
  node: SduiLayoutNode;
  renderChild?: RenderChild;
}

/**
 * Flutter Scaffold equivalent.
 *
 * Layout (exactly like Flutter):
 *   - AppBar: shrinks to its own height (56dp default) at the top
 *   - Body: flex:1 → fills ALL remaining vertical space
 *   - BottomNavigationBar: shrinks to own height at the bottom
 *   - FAB: absolutely positioned, bottom-right
 *
 * Safe-area chrome (status bar, home indicator) is rendered by DeviceFrame
 * ABOVE this scaffold, so we must NOT add extra top padding here.
 *
 * Uses flex:1 (not height:100%) so the scaffold reliably fills its parent
 * regardless of whether that parent is a flex container or a block container.
 */
function ScaffoldWidgetComponent({ node, renderChild }: ScaffoldWidgetProps) {
  const appBar = node.appBar as SduiLayoutNode | undefined;
  const body = node.body as SduiLayoutNode | undefined;
  const fab = node.floatingActionButton as SduiLayoutNode | undefined;
  const bottomNav = node.bottomNavigation as SduiLayoutNode | undefined;

  // Flutter Scaffold backgroundColor — falls through to white if unset
  const backgroundColor =
    (node.backgroundColor as string) ??
    (node.style?.backgroundColor as string) ??
    '#ffffff';

  // Body background — Flutter body defaults to transparent (scaffold bg shows through)
  const bodyBackgroundColor = (node.bodyColor as string) ?? 'transparent';

  if (!renderChild) return null;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        // flex:1 fills whatever parent gives us (flex container OR block container)
        flex: 1,
        minHeight: 0,
        backgroundColor,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ── AppBar (shrink to intrinsic height, never flex-grow) ── */}
      {appBar && (
        <div style={{ flexShrink: 0, zIndex: 10 }}>
          {renderChild(appBar)}
        </div>
      )}

      {/* ── Body (fills remaining height, scrolls if content overflows) ── */}
      {body && (
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflow: 'auto',
            backgroundColor: bodyBackgroundColor,
            position: 'relative',
          }}
        >
          {renderChild(body)}
        </div>
      )}

      {/* ── Bottom navigation bar (shrink to intrinsic height) ── */}
      {bottomNav && (
        <div style={{ flexShrink: 0, zIndex: 10 }}>
          {renderChild(bottomNav)}
        </div>
      )}

      {/* ── Floating action button (absolutely positioned) ── */}
      {fab && (
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            zIndex: 20,
          }}
        >
          {renderChild(fab)}
        </div>
      )}
    </div>
  );
}

export const ScaffoldWidget = memo(ScaffoldWidgetComponent);
