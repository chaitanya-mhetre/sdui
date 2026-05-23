import type { LayoutNode, ChildrenSpec } from '@/types';
import type { ComponentDefinition } from '@/types';

export type FlutterRuleResult = { allowed: true } | { allowed: false; title: string; description: string };

/**
 * Resolve component display name (registry or platform by id/name).
 */
function getComponentName(
  componentType: string,
  getDef: (id: string) => ComponentDefinition | null,
  platformComponents: ComponentDefinition[]
): string {
  const def = getDef(componentType) ?? platformComponents.find((p) => p.id === componentType || p.name === componentType);
  return def?.name ?? componentType;
}

function isScaffold(componentType: string, getDef: (id: string) => ComponentDefinition | null, platformComponents: ComponentDefinition[]): boolean {
  const name = getComponentName(componentType, getDef, platformComponents);
  return name === 'Scaffold' || name?.toLowerCase() === 'scaffold';
}

function hasScaffoldChild(rootNode: LayoutNode, getDef: (id: string) => ComponentDefinition | null, platformComponents: ComponentDefinition[]): boolean {
  return rootNode.children.some((c) => isScaffold(c.componentType, getDef, platformComponents));
}

/**
 * Walk the tree to find a node by id. Returns null if not found.
 */
function findNode(root: LayoutNode, id: string): LayoutNode | null {
  if (root.id === id) return root;
  for (const child of root.children) {
    const found = findNode(child, id);
    if (found) return found;
  }
  return null;
}

/**
 * Resolve the ChildrenSpec for a ComponentDefinition.
 * Falls back to legacy allowChildren boolean when children field is absent.
 */
function resolveChildrenSpec(def: ComponentDefinition): ChildrenSpec {
  if (def.children !== undefined) return def.children;
  return def.allowChildren ? { mode: 'multi' } : { mode: 'none' };
}

/**
 * Validate dropping a component onto a parent. Returns allowed or a user-friendly violation message.
 */
export function validateDrop(
  parentId: string,
  rootNode: LayoutNode,
  componentDef: ComponentDefinition,
  getDef: (id: string) => ComponentDefinition | null,
  platformComponents: ComponentDefinition[]
): FlutterRuleResult {
  // ── Arity checks ────────────────────────────────────────────────────────────
  // Only enforce when the parent is not the synthetic root node itself.
  const isAddingToRoot = parentId === rootNode.id;

  if (!isAddingToRoot) {
    const parentNode = findNode(rootNode, parentId);

    if (parentNode) {
      // Resolve parent's ComponentDefinition
      const parentDef =
        getDef(parentNode.componentType) ??
        platformComponents.find((p) => p.id === parentNode.componentType || p.name === parentNode.componentType) ??
        null;

      if (parentDef !== null) {
        const spec = resolveChildrenSpec(parentDef);
        const parentName = parentDef.name;
        const childName = componentDef.name;

        if (spec.mode === 'none') {
          return {
            allowed: false,
            title: `Can't drop into ${parentName} — leaf widget doesn't accept children`,
            description: `${parentName} is a leaf widget — it doesn't accept children. Drop on a layout widget like Column, Row, or Container instead.`,
          };
        }

        if (spec.mode === 'single') {
          if (parentNode.children.length >= 1) {
            return {
              allowed: false,
              title: `${parentName} already has a child`,
              description: `${parentName} accepts only one child. Remove the existing child first, or wrap it in a Column/Row to add more.`,
            };
          }
        }

        if (spec.mode === 'multi') {
          if (spec.allowedTypes && spec.allowedTypes.length > 0) {
            const draggedName = componentDef.id ?? componentDef.name;
            if (!spec.allowedTypes.includes(draggedName)) {
              return {
                allowed: false,
                title: `Can't put ${childName} inside ${parentName}`,
                description: `${parentName} only accepts: ${spec.allowedTypes.join(', ')}. Drop a different widget.`,
              };
            }
          }
        }

        if (spec.mode === 'slots') {
          return {
            allowed: false,
            title: `${parentName} uses slots, not freeform children`,
            description: `Drop into a specific slot (body, appBar, etc.) instead of the ${parentName} itself.`,
          };
        }
      }
      // If parentDef is null (unknown component), allow gracefully — fall through.
    }
  }

  // ── Existing Scaffold checks ────────────────────────────────────────────────
  const isScaffoldDrop = isScaffold(componentDef.id, () => componentDef, platformComponents);

  // Scaffold: only as direct child of root, and only one per screen
  if (isScaffoldDrop) {
    if (!isAddingToRoot) {
      return {
        allowed: false,
        title: 'Scaffold only at root',
        description: 'Scaffold must be a direct child of the screen root (like in Flutter). Drag it onto the canvas background, not inside another widget.',
      };
    }
    if (hasScaffoldChild(rootNode, getDef, platformComponents)) {
      return {
        allowed: false,
        title: 'One Scaffold per screen',
        description: 'Flutter screens use a single Scaffold at the root. One is already present.',
      };
    }
  }

  return { allowed: true };
}

/**
 * After a delete, optionally return a warning to show (e.g. "no Scaffold on screen").
 */
export function getWarningAfterDelete(
  rootNode: LayoutNode,
  getDef: (id: string) => ComponentDefinition | null,
  platformComponents: ComponentDefinition[]
): { title: string; description: string } | null {
  const hasScaffold = hasScaffoldChild(rootNode, getDef, platformComponents);
  if (!hasScaffold && rootNode.children.length > 0) {
    return {
      title: 'Scaffold removed',
      description: 'This screen has no Scaffold. Consider adding one from the library for proper Material layout.',
    };
  }
  return null;
}
