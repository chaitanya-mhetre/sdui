'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import type { SduiLayoutNode, RenderChild } from '@/lib/sdui/types';

interface ButtonWidgetProps {
  node: SduiLayoutNode;
  renderChild?: RenderChild;
}

function ButtonWidgetComponent({ node, renderChild }: ButtonWidgetProps) {
  const style = node.style ?? {};
  const label = (node.label ?? node.data ?? node.text ?? 'Button') as string;
  const backgroundColor = (style.backgroundColor as string) ?? (node.color as string) ?? '#6366f1';
  const textColor = (style.color as string) ?? '#ffffff';
  
  const fontSize = Number(style.fontSize ?? 14);
  const fwRaw = style.fontWeight ?? '600';
  const fontWeight = fwRaw === 'bold' ? 'bold' : fwRaw === 'normal' ? 'normal' : Number(fwRaw) || 600;
  
  const borderRadius = Number(style.borderRadius ?? 8);
  const elevation = Number(style.elevation ?? 2);
  const paddingH = Number(style.paddingHorizontal ?? 16);
  const paddingV = Number(style.paddingVertical ?? 12);
  
  const fullWidth = node.fullWidth === true || node.fullWidth === 'true';

  const child = node.child as SduiLayoutNode | undefined;

  // Approximate Material Elevation
  const elevationShadows = [
    'none',
    '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)'
  ];
  const shadowIndex = Math.min(Math.floor(elevation / 4), 6);
  const boxShadow = elevationShadows[Math.max(0, shadowIndex)] ?? 'none';

  return (
    <motion.div
      whileHover={{ scale: 1.02, opacity: 0.9 }}
      whileTap={{ scale: 0.98 }}
      style={{ display: fullWidth ? 'flex' : 'inline-flex', width: fullWidth ? '100%' : 'auto' }}
    >
      <button
        type="button"
        className="font-semibold transition-all cursor-pointer border-none"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor,
          color: textColor,
          fontSize: `${fontSize}px`,
          fontWeight,
          borderRadius: `${borderRadius}px`,
          paddingLeft: `${paddingH}px`,
          paddingRight: `${paddingH}px`,
          paddingTop: `${paddingV}px`,
          paddingBottom: `${paddingV}px`,
          width: '100%',
          boxShadow,
          gap: 6,
          outline: 'none',
        }}
      >
        {child && renderChild ? renderChild(child) : label}
      </button>
    </motion.div>
  );
}

export const ButtonWidget = memo(ButtonWidgetComponent);
