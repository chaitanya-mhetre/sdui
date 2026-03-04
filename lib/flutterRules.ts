import type { LayoutNode } from '@/types';
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
 * Validate dropping a component onto a parent. Returns allowed or a user-friendly violation message.
 */
export function validateDrop(
  parentId: string,
  rootNode: LayoutNode,
  componentDef: ComponentDefinition,
  getDef: (id: string) => ComponentDefinition | null,
  platformComponents: ComponentDefinition[]
): FlutterRuleResult {
  const isAddingToRoot = parentId === rootNode.id;
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
