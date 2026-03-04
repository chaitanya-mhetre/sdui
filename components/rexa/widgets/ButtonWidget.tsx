'use client';

import { memo } from 'react';
import type { RexaLayoutNode, RenderChild } from '@/lib/rexa/types';

interface ButtonWidgetProps {
  node: RexaLayoutNode;
  renderChild?: RenderChild;
}

function ButtonWidgetComponent({ node, renderChild }: ButtonWidgetProps) {
  const style = node.style ?? {};
  const label = (node.label ?? node.data ?? node.text ?? 'Button') as string;
  const backgroundColor = (style.backgroundColor as string) ?? (node.color as string) ?? '#6366f1';
  const textColor = (style.color as string) ?? '#ffffff';
  const fontSize = (style.fontSize as number) ?? 14;
  const borderRadius = (style.borderRadius as number) ?? 8;
  const paddingH = (style.paddingHorizontal as number) ?? 16;
  const paddingV = (style.paddingVertical as number) ?? 10;
  const fullWidth = node.fullWidth === true;

  const child = node.child as RexaLayoutNode | undefined;

  return (
    <button
      type="button"
      style={{
        backgroundColor,
        color: textColor,
        fontSize,
        borderRadius,
        paddingLeft: paddingH,
        paddingRight: paddingH,
        paddingTop: paddingV,
        paddingBottom: paddingV,
        border: 'none',
        cursor: 'pointer',
        fontWeight: 600,
        width: fullWidth ? '100%' : undefined,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
      }}
    >
      {child && renderChild ? renderChild(child) : label}
    </button>
  );
}

export const ButtonWidget = memo(ButtonWidgetComponent);
