'use client';

import { memo } from 'react';
import type { SduiLayoutNode } from '@/lib/sdui/types';
import type { RenderChild } from '@/lib/sdui/types';

interface TextWidgetProps {
  node: SduiLayoutNode;
  renderChild?: RenderChild;
}

function TextWidgetComponent({ node }: TextWidgetProps) {
  const data = node.data ?? node.text ?? '';
  const style = node.style ?? {};
  
  const fontSize = Number(style.fontSize ?? 14);
  const fwRaw = style.fontWeight ?? 'normal';
  const fontWeight = fwRaw === 'bold' ? 'bold' : fwRaw === 'normal' ? 'normal' : Number(fwRaw) || 600;
  
  const color = (style.color as string) ?? '#000000';
  const fontStyle = (style.fontStyle as string) ?? 'normal';
  const fontFamily = (style.fontFamily as string) ?? 'inherit';
  const textAlign = (style.textAlign as 'left' | 'center' | 'right') ?? 'left';
  const letterSpacing = Number(style.letterSpacing ?? 0);
  const wordSpacing = Number(style.wordSpacing ?? 0);
  const lineHeight = Number(style.lineHeight ?? 1.5);
  const maxLines = Number(style.maxLines ?? 0);
  const overflow = (style.overflow as string) ?? 'clip';

  const overflowStyles: React.CSSProperties =
    maxLines > 0
      ? {
          display: '-webkit-box',
          WebkitLineClamp: maxLines,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: overflow === 'ellipsis' ? 'ellipsis' : 'clip',
        }
      : {};

  return (
    <span
      style={{
        fontSize: `${fontSize}px`,
        color,
        fontWeight,
        fontStyle,
        fontFamily,
        lineHeight,
        textAlign,
        letterSpacing: `${letterSpacing}px`,
        wordSpacing: `${wordSpacing}px`,
        ...overflowStyles,
      } as React.CSSProperties}
    >
      {typeof data === 'string' || typeof data === 'number' ? data : String(data)}
    </span>
  );
}

export const TextWidget = memo(TextWidgetComponent);
