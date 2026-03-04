/**
 * REXA layout parser – validates and normalizes Flutter-style JSON.
 * Ensures schema validity before rendering in the preview.
 */

import type { RexaLayoutNode, ParseResult } from './types';
import { VALID_WIDGET_TYPES } from './validation';

export function parseLayout(json: unknown): ParseResult {
  if (json == null) {
    return { success: false, error: 'Layout is null or undefined' };
  }
  if (typeof json === 'string') {
    try {
      json = JSON.parse(json) as unknown;
    } catch {
      return { success: false, error: 'Invalid JSON' };
    }
  }
  if (typeof json !== 'object' || Array.isArray(json)) {
    return { success: false, error: 'Layout must be an object' };
  }

  const obj = json as Record<string, unknown>;
  if (typeof obj.type !== 'string') {
    return { success: false, error: 'Missing or invalid "type" field at root' };
  }

  const normalized = normalizeNode(obj as RexaLayoutNode);
  return { success: true, node: normalized };
}

function normalizeNode(node: RexaLayoutNode): RexaLayoutNode {
  const type = String(node.type).toLowerCase();
  const out: RexaLayoutNode = { ...node, type };

  // Single-child slots
  for (const slot of ['appBar', 'body', 'child', 'floatingActionButton', 'bottomNavigation', 'leading', 'trailing'] as const) {
    const val = node[slot];
    if (val != null && typeof val === 'object' && !Array.isArray(val)) {
      (out as Record<string, unknown>)[slot] = normalizeNode(val as RexaLayoutNode);
    }
  }

  // title can be a node or a string
  if (node.title != null && typeof node.title === 'object' && !Array.isArray(node.title)) {
    out.title = normalizeNode(node.title as RexaLayoutNode);
  }

  // Array slots
  if (Array.isArray(node.children)) {
    out.children = node.children.map((c) => normalizeNode(c as RexaLayoutNode));
  }
  if (Array.isArray(node.actions)) {
    out.actions = node.actions.map((a) => normalizeNode(a as RexaLayoutNode));
  }

  return out;
}

export function isKnownType(type: string): boolean {
  return VALID_WIDGET_TYPES.has(type.toLowerCase());
}
