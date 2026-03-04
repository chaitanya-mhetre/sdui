/**
 * REXA – Flutter-compatible JSON layout schema types.
 * Compatible with Flutter widget tree for future SDK rendering.
 */

import type { ReactNode } from 'react';

export type RenderChild = (node: RexaLayoutNode) => ReactNode;

export interface RexaLayoutNode {
  type: string;
  /** Text content (e.g. for text widget) */
  data?: string;
  /** Inline styles */
  style?: Record<string, unknown>;
  /** Child nodes for container widgets */
  children?: RexaLayoutNode[];
  /** Scaffold slots */
  appBar?: RexaLayoutNode;
  body?: RexaLayoutNode;
  bottomNavigation?: RexaLayoutNode;
  floatingActionButton?: RexaLayoutNode;
  /** AppBar / container props */
  title?: RexaLayoutNode;
  actions?: RexaLayoutNode[];
  backgroundColor?: string;
  /** Icon name (e.g. Material icon) */
  name?: string;
  color?: string;
  /** Layout props */
  gap?: number | string;
  mainAxisAlignment?: string;
  crossAxisAlignment?: string;
  /** Allow extra keys for extensibility */
  [key: string]: unknown;
}

export type ParseResult =
  | { success: true; node: RexaLayoutNode }
  | { success: false; error: string };
