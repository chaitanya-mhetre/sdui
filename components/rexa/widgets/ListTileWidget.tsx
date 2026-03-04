'use client';

import { memo } from 'react';
import type { RexaLayoutNode, RenderChild } from '@/lib/rexa/types';

interface ListTileWidgetProps {
  node: RexaLayoutNode;
  renderChild?: RenderChild;
}

function ListTileWidgetComponent({ node, renderChild }: ListTileWidgetProps) {
  const title = node.title as RexaLayoutNode | string | undefined;
  const subtitle = node.subtitle as RexaLayoutNode | string | undefined;
  const leading = node.leading as RexaLayoutNode | undefined;
  const trailing = node.trailing as RexaLayoutNode | undefined;
  const style = node.style ?? {};
  const backgroundColor = (style.backgroundColor as string) ?? 'transparent';
  const contentPadding = (node.contentPadding as number) ?? 12;

  const renderTitle = () => {
    if (!title) return null;
    if (typeof title === 'string') {
      return <span style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>{title}</span>;
    }
    return renderChild ? renderChild(title) : null;
  };

  const renderSubtitle = () => {
    if (!subtitle) return null;
    if (typeof subtitle === 'string') {
      return <span style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{subtitle}</span>;
    }
    return renderChild ? renderChild(subtitle) : null;
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: contentPadding,
        backgroundColor,
        minHeight: 56,
      }}
    >
      {leading && renderChild && (
        <div style={{ flexShrink: 0 }}>{renderChild(leading)}</div>
      )}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {renderTitle()}
        {renderSubtitle()}
      </div>
      {trailing && renderChild && (
        <div style={{ flexShrink: 0 }}>{renderChild(trailing)}</div>
      )}
    </div>
  );
}

export const ListTileWidget = memo(ListTileWidgetComponent);
