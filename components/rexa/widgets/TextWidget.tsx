'use client';

import { memo } from 'react';
import type { RexaLayoutNode } from '@/lib/rexa/types';
import type { RenderChild } from '@/lib/rexa/types';

interface TextWidgetProps {
  node: RexaLayoutNode;
  renderChild?: RenderChild;
}

function TextWidgetComponent({ node }: TextWidgetProps) {
  const data = node.data ?? '';
  const style = node.style ?? {};
  const fontSize = (style.fontSize as number) ?? 16;
  const color = (style.color as string) ?? '#000000';
  const fontWeight = (style.fontWeight as string) ?? 'normal';

  return (
    <span
      style={{
        fontSize,
        color,
        fontWeight,
        lineHeight: (style.lineHeight as string) ?? 1.5,
        textAlign: (style.textAlign as 'left' | 'center' | 'right') ?? 'left',
      }}
    >
      {data}
    </span>
  );
}

export const TextWidget = memo(TextWidgetComponent);
