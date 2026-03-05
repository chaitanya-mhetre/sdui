/**
 * Converts builder layout tree (LayoutNode: componentType, props, children)
 * to SDUI/Flutter-style JSON (type, body, appBar, children) for publishing.
 * The Flutter SDK and GET /api/v1/screens/:name expect SDUI format.
 */
import type { LayoutNode } from '@/types';

/** Map builder componentType to SDUI type (lowercase, snake_case where needed). */
const BUILDER_TO_SDUI_TYPE: Record<string, string> = {
  Scaffold: 'scaffold',
  VStack: 'column',
  HStack: 'row',
  Column: 'column',
  Row: 'row',
  Text: 'text',
  Button: 'elevated_button',
  Container: 'container',
  AppBar: 'app_bar',
  Icon: 'icon',
  Image: 'image',
  SingleChildScrollView: 'single_child_scroll_view',
  SizedBox: 'sized_box',
};

function toSduiType(componentType: string): string {
  return BUILDER_TO_SDUI_TYPE[componentType] ?? componentType.toLowerCase().replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
}

/**
 * Convert a single LayoutNode to a SDUI-style plain object (no id).
 */
export function layoutNodeToSduiNode(node: LayoutNode): Record<string, unknown> {
  const type = toSduiType(node.componentType);
  const props = node.props ?? {};
  const children = node.children ?? [];

  switch (node.componentType) {
    case 'Scaffold': {
      const out: Record<string, unknown> = {
        type: 'scaffold',
        backgroundColor: props.backgroundColor ?? 'transparent',
      };
      const first = children[0];
      if (first?.componentType === 'AppBar') {
        out.appBar = layoutNodeToSduiNode(first);
        const rest = children.slice(1);
        if (rest.length === 1) out.body = layoutNodeToSduiNode(rest[0]);
        else if (rest.length > 1) out.body = { type: 'column', children: rest.map(layoutNodeToSduiNode) };
      } else if (children.length === 1) {
        out.body = layoutNodeToSduiNode(children[0]);
      } else if (children.length > 1) {
        out.body = { type: 'column', children: children.map(layoutNodeToSduiNode) };
      }
      return out;
    }
    case 'AppBar': {
      const out: Record<string, unknown> = {
        type: 'app_bar',
        backgroundColor: props.backgroundColor ?? '#ffffff',
        foregroundColor: props.foregroundColor ?? '#000000',
        elevation: props.elevation ?? 0,
        centerTitle: props.centerTitle ?? false,
      };
      const [titleChild, ...actionChildren] = children;
      if (titleChild) out.title = layoutNodeToSduiNode(titleChild);
      if (actionChildren.length) out.actions = actionChildren.map(layoutNodeToSduiNode);
      return out;
    }
    case 'Text':
      return {
        type: 'text',
        data: props.text ?? '',
        style: {
          fontSize: props.fontSize ?? 16,
          fontWeight: props.fontWeight,
          color: props.color,
        },
      };
    case 'Button':
      return {
        type: 'elevated_button',
        data: props.label ?? props.data ?? 'Button',
        style: {
          backgroundColor: props.backgroundColor,
          borderRadius: props.borderRadius,
          fontSize: props.fontSize,
        },
      };
    case 'Icon':
      return {
        type: 'icon',
        name: props.name ?? props.icon ?? 'circle',
        size: props.size ?? 24,
        color: props.color ?? '#000000',
      };
    case 'Container':
    case 'VStack':
    case 'HStack':
    case 'Column':
    case 'Row': {
      const out: Record<string, unknown> = {
        type: type,
        children: children.map(layoutNodeToSduiNode),
      };
      if (props.padding) out.padding = props.padding;
      if (props.gap) out.gap = props.gap;
      if (props.backgroundColor) out.backgroundColor = props.backgroundColor;
      if (props.width) out.width = props.width;
      if (props.height) out.height = props.height;
      if (props.borderRadius) out.borderRadius = props.borderRadius;
      if (node.componentType === 'HStack' || node.componentType === 'Row') out.mainAxisAlignment = props.alignment ?? 'start';
      if (node.componentType === 'VStack' || node.componentType === 'Column') out.mainAxisSize = props.mainAxisSize ?? 'max';
      return out;
    }
    case 'SingleChildScrollView':
      return {
        type: 'single_child_scroll_view',
        child: children[0] ? layoutNodeToSduiNode(children[0]) : { type: 'column', children: [] },
      };
    case 'SizedBox':
      return {
        type: 'sized_box',
        width: props.width,
        height: props.height,
        child: children[0] ? layoutNodeToSduiNode(children[0]) : undefined,
      };
    case 'Image':
      return {
        type: props.src?.startsWith('http') ? 'image_network' : 'image',
        src: props.src ?? '',
        width: props.width,
        height: props.height,
        fit: props.objectFit ?? 'cover',
      };
    default: {
      const out: Record<string, unknown> = {
        type,
        children: children.map(layoutNodeToSduiNode),
      };
      Object.entries(props).forEach(([k, v]) => {
        if (v !== undefined && v !== null && k !== 'children') out[k] = v;
      });
      return out;
    }
  }
}

/**
 * Convert full builder root (LayoutNode) to SDUI JSON for publish/Flutter.
 * If root is Scaffold, use it as-is (converted). If root is VStack/Column with first child Scaffold, use that.
 */
export function builderRootToSduiJson(root: LayoutNode): Record<string, unknown> {
  const first = root.children?.[0];
  if (root.componentType === 'Scaffold') return layoutNodeToSduiNode(root);
  if (first?.componentType === 'Scaffold') return layoutNodeToSduiNode(first);
  return layoutNodeToSduiNode(root);
}
