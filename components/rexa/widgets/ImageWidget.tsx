'use client';

import { memo } from 'react';
import type { RexaLayoutNode } from '@/lib/rexa/types';

interface ImageWidgetProps {
  node: RexaLayoutNode;
}

function ImageWidgetComponent({ node }: ImageWidgetProps) {
  const src = (node.src ?? node.url ?? node.data ?? '') as string;
  const alt = (node.alt ?? node.semanticLabel ?? '') as string;
  const style = node.style ?? {};
  const width = (node.width ?? style.width) as number | string | undefined;
  const height = (node.height ?? style.height) as number | string | undefined;
  const borderRadius = (style.borderRadius as number) ?? 0;
  const fit = (node.fit as string) ?? 'cover';

  const objectFitMap: Record<string, string> = {
    cover: 'cover',
    contain: 'contain',
    fill: 'fill',
    fitWidth: 'contain',
    fitHeight: 'contain',
    none: 'none',
  };

  return (
    <div
      style={{
        width: width ?? '100%',
        height: height ?? 200,
        borderRadius,
        overflow: 'hidden',
        backgroundColor: '#e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          style={{
            width: '100%',
            height: '100%',
            objectFit: (objectFitMap[fit] ?? 'cover') as React.CSSProperties['objectFit'],
          }}
        />
      ) : (
        <div
          style={{
            color: '#9ca3af',
            fontSize: 12,
            textAlign: 'center',
            padding: 8,
          }}
        >
          Image
        </div>
      )}
    </div>
  );
}

export const ImageWidget = memo(ImageWidgetComponent);
