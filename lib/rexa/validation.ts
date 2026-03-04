/**
 * Server-side Zod validation for REXA JSON layout nodes.
 * Enforces maxDepth, maxNodes, and structural correctness.
 */
import { z } from 'zod';

export const MAX_DEPTH = 20;
export const MAX_NODES = 500;

/** All widget types supported by the REXA renderer. */
export const VALID_WIDGET_TYPES = new Set([
  'scaffold',
  'container',
  'column',
  'row',
  'padding',
  'center',
  'expanded',
  'spacer',
  'sized_box',
  'sizedbox',
  'app_bar',
  'appbar',
  'text',
  'icon',
  'image',
  'image_asset',
  'image_network',
  'network_image',
  'divider',
  'button',
  'elevated_button',
  'text_button',
  'outlined_button',
  'icon_button',
  'floating_action_button',
  'single_child_scroll_view',
  'list_view',
  'listview',
  'list_tile',
  'listtile',
  'grid_view',
  'grid',
  'card',
  'category_item',
]);

export interface ValidationResult {
  valid: boolean;
  error?: string;
  warnings: string[];
  nodeCount: number;
  unknownTypes: string[];
}

/**
 * Recursively validates a REXA layout node tree.
 * Returns detailed validation result with warnings for unknown types.
 */
export function validateRexaJson(root: unknown): ValidationResult {
  const warnings: string[] = [];
  const unknownTypes: string[] = [];
  let nodeCount = 0;

  function visit(node: unknown, depth: number): { valid: boolean; error?: string } {
    if (depth > MAX_DEPTH) {
      return { valid: false, error: `Node tree exceeds maximum depth of ${MAX_DEPTH}` };
    }
    if (++nodeCount > MAX_NODES) {
      return { valid: false, error: `Node tree exceeds maximum node count of ${MAX_NODES}` };
    }
    if (!node || typeof node !== 'object' || Array.isArray(node)) {
      // Enhanced error message for debugging
      const nodeType = node === null ? 'null' : node === undefined ? 'undefined' : Array.isArray(node) ? 'array' : typeof node;
      return { 
        valid: false, 
        error: `Each node must be a plain object (found ${nodeType} at depth ${depth})` 
      };
    }

    const obj = node as Record<string, unknown>;
    if (typeof obj.type !== 'string' || !obj.type.trim()) {
      return { valid: false, error: `Node at depth ${depth} is missing a "type" field` };
    }

    const type = obj.type.toLowerCase();
    if (!VALID_WIDGET_TYPES.has(type)) {
      const msg = `Unknown widget type: "${type}" at depth ${depth}`;
      warnings.push(msg);
      unknownTypes.push(type);
    }

    // Validate single-child slots
    for (const slot of ['body', 'appBar', 'child', 'title', 'floatingActionButton', 'bottomNavigation', 'leading', 'trailing']) {
      if (obj[slot] != null) {
        // Skip validation for primitive values in slots (e.g., title could be a string)
        if (typeof obj[slot] === 'string' || typeof obj[slot] === 'number' || typeof obj[slot] === 'boolean') {
          continue; // Allow primitive values in slots
        }
        const r = visit(obj[slot], depth + 1);
        if (!r.valid) return r;
      }
    }

    // Validate array slots
    for (const slot of ['children', 'actions']) {
      if (obj[slot] != null) {
        if (!Array.isArray(obj[slot])) {
          return { valid: false, error: `"${slot}" at depth ${depth} must be an array` };
        }
        for (const child of obj[slot] as unknown[]) {
          // Skip null/undefined children
          if (child == null) continue;
          const r = visit(child, depth + 1);
          if (!r.valid) return r;
        }
      }
    }

    return { valid: true };
  }

  const result = visit(root, 0);
  return {
    valid: result.valid,
    error: result.error,
    warnings,
    nodeCount,
    unknownTypes,
  };
}

/** Lightweight Zod schema — only enforces the top-level structure. Deep validation is via validateRexaJson(). */
export const rexaNodeSchema: z.ZodType<Record<string, unknown>> = z.record(z.unknown()).refine(
  (obj) => typeof obj.type === 'string' && obj.type.trim().length > 0,
  { message: 'Root node must have a "type" string field' }
);
