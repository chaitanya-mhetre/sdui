import { nanoid } from 'nanoid';
import type { LayoutNode } from '@/types';

/**
 * Stac-style code format: type, props, children (no ids in serialized form).
 */
export interface CodeNode {
  type: string;
  props?: Record<string, unknown>;
  children?: CodeNode[];
}

/**
 * Serialize layout tree to JSON code (Stac-style: type + props + children).
 */
export function layoutToCode(root: LayoutNode): string {
  function nodeToCode(node: LayoutNode): CodeNode {
    return {
      type: node.componentType,
      props: Object.keys(node.props).length ? node.props : undefined,
      children:
        node.children.length > 0
          ? node.children.map(nodeToCode)
          : undefined,
    };
  }
  const code = nodeToCode(root);
  return JSON.stringify(code, null, 2);
}

/**
 * Parse JSON code and convert to LayoutNode tree (with generated ids).
 */
export function codeToLayout(json: string): LayoutNode | null {
  try {
    const parsed = JSON.parse(json) as CodeNode;
    return codeNodeToLayout(parsed);
  } catch {
    return null;
  }
}

function codeNodeToLayout(node: CodeNode): LayoutNode {
  return {
    id: nanoid(),
    componentType: node.type,
    props: node.props ?? {},
    children: (node.children ?? []).map(codeNodeToLayout),
  };
}
