'use client';

import { memo } from 'react';
import type { SduiLayoutNode, RenderChild } from '@/lib/sdui/types';

interface AppBarWidgetProps {
  node: SduiLayoutNode;
  renderChild?: RenderChild;
}

function AppBarWidgetComponent({ node, renderChild }: AppBarWidgetProps) {
  const title = node.title as SduiLayoutNode | undefined;
  const actions = (node.actions ?? []) as SduiLayoutNode[];
  const leading = node.leading as SduiLayoutNode | undefined;
  const backgroundColor = (node.backgroundColor as string) ?? '#ffffff';
  // Auto-derive foreground: if background is dark, use white; otherwise black
  const defaultFg = isDarkColor(backgroundColor) ? '#ffffff' : '#000000';
  const foregroundColor = (node.foregroundColor as string) ?? defaultFg;
  const elevation = (node.elevation as number) ?? 0;
  const centerTitle = node.centerTitle !== false; // default true (Material 3)
  const titleText = typeof title === 'string' ? title : undefined;

  if (!renderChild) return null;

  return (
    <div
      style={{
        backgroundColor,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 56,
        paddingLeft: 4,
        paddingRight: 4,
        boxShadow:
          elevation > 0
            ? `0 ${Math.min(elevation * 2, 8)}px ${elevation * 4}px rgba(0,0,0,0.1)`
            : elevation === 0
              ? '0 1px 0 rgba(0,0,0,0.07)'
              : undefined,
        position: 'relative',
        zIndex: 10,
      }}
    >
      {/* Leading (back button / menu icon) */}
      <div style={{ flexShrink: 0, padding: '0 4px' }}>
        {leading ? (
          renderChild(leading)
        ) : (
          // Default back arrow (Material chevron_left style)
          <div
            style={{
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: foregroundColor,
              opacity: 0.8,
            }}
          >
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </div>
        )}
      </div>

      {/* Title */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          justifyContent: centerTitle ? 'center' : 'flex-start',
          paddingLeft: centerTitle ? 0 : 4,
          paddingRight: centerTitle ? 0 : 4,
        }}
      >
        {titleText ? (
          <span
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: foregroundColor,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              letterSpacing: 0.15,
            }}
          >
            {titleText}
          </span>
        ) : title ? (
          renderChild(title)
        ) : null}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, flexShrink: 0 }}>
        {actions.map((action, i) => (
          <div key={i} style={{ padding: '0 4px' }}>
            {renderChild(action)}
          </div>
        ))}
      </div>
    </div>
  );
}

export const AppBarWidget = memo(AppBarWidgetComponent);

/** Returns true if a hex/rgb color is perceptually dark (luminance < 0.5) */
function isDarkColor(hex: string): boolean {
  try {
    const c = hex.replace('#', '');
    if (c.length < 6) return false;
    const r = parseInt(c.slice(0, 2), 16) / 255;
    const g = parseInt(c.slice(2, 4), 16) / 255;
    const b = parseInt(c.slice(4, 6), 16) / 255;
    // Relative luminance (WCAG)
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luminance < 0.4;
  } catch {
    return false;
  }
}
