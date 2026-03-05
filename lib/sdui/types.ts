/**
 * SDUI – Flutter-compatible JSON layout schema types.
 * Compatible with Flutter widget tree for future SDK rendering.
 */

import type { ReactNode } from 'react';

export type RenderChild = (node: SduiLayoutNode) => ReactNode;

export interface SduiLayoutNode {
  type: string;
  /** Text content (e.g. for text widget) */
  data?: string;
  /** Inline styles */
  style?: Record<string, unknown>;
  /** Child nodes for container widgets */
  children?: SduiLayoutNode[];
  /** Scaffold slots */
  appBar?: SduiLayoutNode;
  body?: SduiLayoutNode;
  bottomNavigation?: SduiLayoutNode;
  floatingActionButton?: SduiLayoutNode;
  /** AppBar / container props */
  title?: SduiLayoutNode;
  actions?: SduiLayoutNode[];
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
  | { success: true; node: SduiLayoutNode }
  | { success: false; error: string };
