'use client';

import { memo } from 'react';
import type { RexaLayoutNode, RenderChild } from '@/lib/rexa/types';

interface ContainerWidgetProps {
  node: RexaLayoutNode;
  renderChild?: RenderChild;
}

function ContainerWidgetComponent({ node, renderChild }: ContainerWidgetProps) {
  const child = node.child as RexaLayoutNode | undefined;
  const style = node.style ?? {};
  const decoration = node.decoration as Record<string, unknown> | undefined;

  // ── Padding ──────────────────────────────────────────────────────────────
  const padding = node.padding;
  let pt = 0, pr = 0, pb = 0, pl = 0;
  if (typeof padding === 'number') {
    pt = pr = pb = pl = padding;
  } else if (padding && typeof padding === 'object') {
    const ei = padding as Record<string, number>;
    if (ei.all !== undefined) {
      pt = pr = pb = pl = ei.all;
    } else {
      pt = ei.top ?? ei.vertical ?? 0;
      pb = ei.bottom ?? ei.vertical ?? 0;
      pl = ei.left ?? ei.horizontal ?? 0;
      pr = ei.right ?? ei.horizontal ?? 0;
    }
  }

  // ── Background color ─────────────────────────────────────────────────────
  // Priority: decoration.color > node.color (Flutter direct prop) > node.style.backgroundColor
  let backgroundColor: string | undefined = decoration?.color as string | undefined;
  if (!backgroundColor) backgroundColor = node.color as string | undefined;
  if (!backgroundColor) backgroundColor = style.backgroundColor as string | undefined;

  // ── Gradient (from decoration.gradient) ──────────────────────────────────
  let background: string | undefined;
  if (decoration?.gradient) {
    const gradient = decoration.gradient as Record<string, unknown>;
    if (gradient?.colors && Array.isArray(gradient.colors)) {
      const colors = gradient.colors as string[];
      const c0 = colors[0] ?? '#fff';
      const c1 = colors[colors.length - 1] ?? c0;
      const angle = gradient.begin === 'topLeft' ? '135deg' : '180deg';
      background = `linear-gradient(${angle}, ${c0}, ${c1})`;
    }
  }

  // ── Border radius ─────────────────────────────────────────────────────────
  // Flutter: decoration.borderRadius, or style.borderRadius, or node.borderRadius
  const rawBorderRadius =
    (decoration?.borderRadius as number | string | undefined) ??
    (style.borderRadius as number | string | undefined) ??
    (node.borderRadius as number | string | undefined);
  const borderRadius = typeof rawBorderRadius === 'number' ? rawBorderRadius : rawBorderRadius;

  // ── Box shadow ────────────────────────────────────────────────────────────
  let boxShadow: string | undefined;
  if (decoration?.boxShadow) {
    const shadow = decoration.boxShadow as Record<string, unknown>;
    const blur = Number(shadow?.blurRadius ?? 8);
    const offsetX = Number(shadow?.offset?.['x' as keyof unknown] ?? 0);
    const offsetY = Number(shadow?.offset?.['y' as keyof unknown] ?? 2);
    const color = (shadow?.color as string) ?? 'rgba(0,0,0,0.1)';
    boxShadow = `${offsetX}px ${offsetY}px ${blur}px ${color}`;
  } else if (node.elevation) {
    const el = Number(node.elevation);
    boxShadow = `0 ${el}px ${el * 3}px rgba(0,0,0,${Math.min(el * 0.05, 0.24)})`;
  }

  // ── Dimensions ───────────────────────────────────────────────────────────
  const width =
    (node.width as number | string | undefined) ??
    (style.width as number | string | undefined);
  const height =
    (node.height as number | string | undefined) ??
    (style.height as number | string | undefined);

  // ── Alignment ────────────────────────────────────────────────────────────
  // Flutter Container.alignment maps to CSS flexbox centering
  let alignItems: string | undefined;
  let justifyContent: string | undefined;
  const alignment = node.alignment as string | undefined;
  if (alignment) {
    const alignMap: Record<string, [string, string]> = {
      center: ['center', 'center'],
      topCenter: ['center', 'flex-start'],
      bottomCenter: ['center', 'flex-end'],
      centerLeft: ['flex-start', 'center'],
      centerRight: ['flex-end', 'center'],
      topLeft: ['flex-start', 'flex-start'],
      topRight: ['flex-end', 'flex-start'],
      bottomLeft: ['flex-start', 'flex-end'],
      bottomRight: ['flex-end', 'flex-end'],
    };
    const mapped = alignMap[alignment];
    if (mapped) {
      [justifyContent, alignItems] = mapped;
    }
  }

  const hasAlignment = alignItems !== undefined || justifyContent !== undefined;

  return (
    <div
      style={{
        paddingTop: pt || undefined,
        paddingRight: pr || undefined,
        paddingBottom: pb || undefined,
        paddingLeft: pl || undefined,
        background: background ?? undefined,
        backgroundColor: background ? undefined : (backgroundColor ?? undefined),
        borderRadius: borderRadius ?? undefined,
        boxShadow: boxShadow ?? undefined,
        width: width ?? undefined,
        height: height ?? undefined,
        // Alignment: only add flex if alignment is specified
        display: hasAlignment ? 'flex' : undefined,
        alignItems: alignItems,
        justifyContent: justifyContent,
        overflow: (node.clipBehavior as string) === 'none' ? 'visible' : undefined,
      }}
    >
      {child && renderChild ? renderChild(child) : null}
    </div>
  );
}

export const ContainerWidget = memo(ContainerWidgetComponent);
