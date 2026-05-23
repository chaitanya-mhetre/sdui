/**
 * Server-side Zod validation for SDUI JSON layout nodes.
 * Enforces maxDepth, maxNodes, and structural correctness.
 */
import { z } from 'zod';

export const MAX_DEPTH = 20;
export const MAX_NODES = 500;

type ChildMode = 'none' | 'single' | 'multi' | 'slots';

// SDUI wire-format type → arity. Snake_case / lowercase keys to match
// the JSON SDK consumes. Anything not listed defaults to 'multi'
// (permissive — server-side check is a safety net, not the source of truth).
const SDUI_ARITY: Record<string, ChildMode> = {
  // leaves
  text: 'none', icon: 'none', image: 'none', sized_box: 'none', spacer: 'none',
  divider: 'none', text_input: 'none', text_area: 'none', placeholder: 'none',
  checkbox: 'none', radio: 'none', switch: 'none', slider: 'none',
  // single-child
  container: 'single', padding: 'single', center: 'single', align: 'single',
  expanded: 'single', flexible: 'single', safe_area: 'single',
  single_child_scroll_view: 'single', clip_rrect: 'single', clip_oval: 'single',
  aspect_ratio: 'single', fitted_box: 'single', opacity: 'single', card: 'single',
  gesture_detector: 'single', ink_well: 'single',
  button: 'single', icon_button: 'single', elevated_button: 'single',
  outlined_button: 'single', text_button: 'single', filled_button: 'single',
  floating_action_button: 'single',
  // multi
  column: 'multi', row: 'multi', stack: 'multi', wrap: 'multi',
  list_view: 'multi', grid_view: 'multi', page_view: 'multi',
  custom_scroll_view: 'multi', form: 'multi',
  // slots — treat as 'multi' on the server (don't strictly validate
  // slot names yet, since the SDK builder might emit them as a children array).
  scaffold: 'multi', app_bar: 'multi', list_tile: 'multi',
};

function getChildMode(type: unknown): ChildMode {
  if (typeof type !== 'string') return 'multi';
  return SDUI_ARITY[type] ?? 'multi'; // default permissive
}

const SLOT_FIELDS = [
  'body', 'appBar', 'drawer', 'floatingActionButton', 'bottomNavigationBar',
  'title', 'leading', 'actions', 'subtitle', 'trailing',
] as const;

function checkArity(node: unknown, path: string): string | null {
  if (!node || typeof node !== 'object') return null;
  const obj = node as Record<string, unknown>;
  const mode = getChildMode(obj.type);
  const children = Array.isArray(obj.children) ? obj.children : [];

  if (mode === 'none' && children.length > 0) {
    return `${path} (${obj.type}) is a leaf widget but has ${children.length} child(ren)`;
  }
  if (mode === 'single' && children.length > 1) {
    return `${path} (${obj.type}) is a single-child widget but has ${children.length} children`;
  }
  // Also check inline single-child slots like `child:` (Flutter uses `child` for the lone
  // child in single-child widgets). Some SDUI emitters use both `child` and `children`:
  if (mode === 'single' && obj.child && children.length >= 1) {
    return `${path} (${obj.type}) has both 'child' and 'children' fields — pick one`;
  }

  // Recurse into children array
  for (let i = 0; i < children.length; i++) {
    const err = checkArity(children[i], `${path}.children[${i}]`);
    if (err) return err;
  }
  // Recurse into inline child
  if (obj.child) {
    const err = checkArity(obj.child, `${path}.child`);
    if (err) return err;
  }
  // Recurse into named slot fields
  for (const slot of SLOT_FIELDS) {
    const v = obj[slot];
    if (Array.isArray(v)) {
      for (let i = 0; i < v.length; i++) {
        const err = checkArity(v[i], `${path}.${slot}[${i}]`);
        if (err) return err;
      }
    } else if (v && typeof v === 'object') {
      const err = checkArity(v, `${path}.${slot}`);
      if (err) return err;
    }
  }
  return null;
}

/** All widget types supported by the SDUI renderer. */
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

export type LayoutKind = 'full' | 'embed';

export interface ValidateOptions {
  layoutKind?: LayoutKind;
}

const EMBED_FORBIDDEN_ROOTS = new Set(['scaffold', 'appbar', 'drawer', 'floatingactionbutton']);

/**
 * Recursively validates a SDUI layout node tree.
 * Returns detailed validation result with warnings for unknown types.
 */
export function validateSduiJson(root: unknown, options: ValidateOptions = {}): ValidationResult {
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
  if (!result.valid) {
    return {
      valid: false,
      error: result.error,
      warnings,
      nodeCount,
      unknownTypes,
    };
  }

  // layoutKind enforcement: forbidden roots for embed layouts
  if (options.layoutKind === 'embed') {
    const rootObj = root as Record<string, unknown>;
    const rootType = typeof rootObj?.type === 'string' ? rootObj.type.toLowerCase() : '';
    if (EMBED_FORBIDDEN_ROOTS.has(rootType)) {
      return {
        valid: false,
        error: `"${rootObj.type}" is only valid as a full-screen root, not in an embed layout. ` +
               `Set layoutKind: "full" or use a box-shaped root (container/column/row/sizedBox).`,
        warnings,
        nodeCount,
        unknownTypes,
      };
    }
  }

  // Brace-syntax validation: {{...}} must be balanced in all string values
  const braceErr = checkBraceSyntax(root);
  if (braceErr) {
    return {
      valid: false,
      error: braceErr,
      warnings,
      nodeCount,
      unknownTypes,
    };
  }

  // Arity validation: every node's children count must match its registered arity
  const arityErr = checkArity(root, 'root');
  if (arityErr) {
    return {
      valid: false,
      error: `arity violation: ${arityErr}`,
      warnings,
      nodeCount,
      unknownTypes,
    };
  }

  return {
    valid: true,
    warnings,
    nodeCount,
    unknownTypes,
  };
}

function checkBraceSyntax(value: unknown, path: string = ''): string | null {
  if (typeof value === 'string') {
    let open = 0;
    for (let i = 0; i < value.length - 1; i++) {
      if (value[i] === '{' && value[i + 1] === '{') { open++; i++; }
      else if (value[i] === '}' && value[i + 1] === '}') { open--; i++; }
      if (open < 0) {
        return `unbalanced braces at ${path}: ${JSON.stringify(value)}`;
      }
    }
    if (open !== 0) return `unbalanced braces at ${path}: ${JSON.stringify(value)}`;
    return null;
  }
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      const e = checkBraceSyntax(value[i], `${path}[${i}]`);
      if (e) return e;
    }
    return null;
  }
  if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      const e = checkBraceSyntax(v, `${path}.${k}`);
      if (e) return e;
    }
    return null;
  }
  return null;
}

/** Lightweight Zod schema — only enforces the top-level structure. Deep validation is via validateSduiJson(). */
export const sduiNodeSchema: z.ZodType<Record<string, unknown>> = z.record(z.unknown()).refine(
  (obj) => typeof obj.type === 'string' && obj.type.trim().length > 0,
  { message: 'Root node must have a "type" string field' }
);
