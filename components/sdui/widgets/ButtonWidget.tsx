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
  const fontSize = (style.fontSize as number) ?? 14;
  const borderRadius = (style.borderRadius as number) ?? 8;
  const paddingH = (style.paddingHorizontal as number) ?? 16;
  const paddingV = (style.paddingVertical as number) ?? 10;
  const fullWidth = node.fullWidth === true;

  const child = node.child as SduiLayoutNode | undefined;

  return (
    <motion.div
      whileHover={{ scale: 1.02, opacity: 0.9 }}
      whileTap={{ scale: 0.98 }}
    >
      <button
        type="button"
        className="inline-flex items-center justify-center font-semibold transition-all shadow-sm hover:shadow-md cursor-pointer border-none"
        style={{
          backgroundColor,
          color: textColor,
          fontSize,
          borderRadius,
          paddingLeft: paddingH,
          paddingRight: paddingH,
          paddingTop: paddingV,
          paddingBottom: paddingV,
          width: fullWidth ? '100%' : undefined,
          gap: 6,
        }}
      >
        {child && renderChild ? renderChild(child) : label}
      </button>
    </motion.div>
  );
}

export const ButtonWidget = memo(ButtonWidgetComponent);
