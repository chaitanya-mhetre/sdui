import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { LayoutNode, ComponentDefinition } from '@/types';
import { getComponentDefinition } from './componentRegistry';
import { validateDrop } from './flutterRules';
import { useBuilderStore } from '@/store/builderStore';
import { parsePadding, parseGap, parseGradient, parseBorderRadius, parseColor, animationProps } from './renderer-utils';

/** Map SDUI / lowercase / snake_case type names to builder registry ids */
const SDUI_TYPE_TO_REGISTRY: Record<string, string> = {
  scaffold: 'Scaffold',
  app_bar: 'AppBar',
  row: 'HStack',
  column: 'VStack',
  text: 'Text',
  icon: 'Icon',
  single_child_scroll_view: 'SingleChildScrollView',
  scroll_view: 'SingleChildScrollView',
  scrollview: 'SingleChildScrollView',
  sized_box: 'SizedBox',
  container: 'Container',
  vstack: 'VStack',
  hstack: 'HStack',
  grid: 'GridView',
  grid_view: 'GridView',
  gridview: 'GridView',
  elevated_button: 'Button',
  elevatedbutton: 'Button',
  filled_button: 'FilledButton',
  outlined_button: 'OutlinedButton',
  text_button: 'TextButton',
  icon_button: 'IconButton',
  floating_action_button: 'FloatingActionButton',
  carousel: 'Carousel',
};

function normalizeComponentType(type: string): string {
  return SDUI_TYPE_TO_REGISTRY[type] ?? type;
}

// ---------------------------------------------------------------------------
// Canvas-internal drag helpers (node reorder / reparent)
// ---------------------------------------------------------------------------

function isDescendantOrSelf(nodeId: string, root: LayoutNode): boolean {
  if (root.id === nodeId) return true;
  return root.children.some((c) => isDescendantOrSelf(nodeId, c));
}

function startNodeDrag(e: React.DragEvent, nodeId: string) {
  e.stopPropagation();
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('application/x-sdui-node', nodeId);
  useBuilderStore.getState().setDraggedNodeId(nodeId);
}

function endNodeDrag(e: React.DragEvent) {
  e.stopPropagation();
  useBuilderStore.getState().setDraggedNodeId(null);
  useBuilderStore.getState().setDropTarget(null);
}

function handleNodeDragOver(
  e: React.DragEvent,
  parentId: string,
  indexInParent: number
) {
  const state = useBuilderStore.getState();
  if (!state.draggedNodeId) return; // only respond to canvas-internal drags
  // Prevent dropping on self or any descendant
  if (state.rootNode && isDescendantOrSelf(parentId, state.rootNode)) {
    // Allow – parentId here is the SIBLING's parent, not the node itself.
    // The descendant check is done at drop time for the actual target parent.
  }
  if (state.draggedNodeId === parentId) return;
  e.preventDefault();
  e.stopPropagation();
  e.dataTransfer.dropEffect = 'move';

  // Insert ABOVE or BELOW based on cursor Y position within the element
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  const midY = rect.top + rect.height / 2;
  const insertIndex = e.clientY < midY ? indexInParent : indexInParent + 1;
  state.setDropTarget({ parentId, index: insertIndex });
}

function handleNodeDrop(e: React.DragEvent) {
  e.preventDefault();
  e.stopPropagation();
  const state = useBuilderStore.getState();
  const draggedId = state.draggedNodeId;
  const target = state.dropTarget;
  if (!draggedId || !target) return;
  // Safety: don't allow moving into self or a descendant
  if (draggedId === target.parentId) return;

  // Find the dragged node in the tree
  const findNode = (n: LayoutNode): LayoutNode | null => {
    if (n.id === draggedId) return n;
    for (const c of n.children) { const f = findNode(c); if (f) return f; }
    return null;
  };
  const draggedNode = state.rootNode ? findNode(state.rootNode) : null;

  if (state.rootNode && draggedNode) {
    if (isDescendantOrSelf(target.parentId, draggedNode)) return;
  }

  // Arity / rule validation — mirror library-drop path
  if (draggedNode && state.rootNode) {
    const normalizedType = normalizeComponentType(draggedNode.componentType);
    const draggedDef =
      getComponentDefinition(normalizedType) ??
      getComponentDefinition(draggedNode.componentType) ??
      state.platformComponents.find(
        (p) => p.id === draggedNode.componentType || p.name === draggedNode.componentType
      ) ??
      null;

    if (draggedDef) {
      const rule = validateDrop(
        target.parentId,
        state.rootNode,
        draggedDef,
        getComponentDefinition,
        state.platformComponents
      );
      if (!rule.allowed) {
        state.setDropError(`${rule.title}: ${rule.description}`);
        state.setDraggedNodeId(null);
        state.setDropTarget(null);
        return;
      }
    }
  }

  state.moveNode(draggedId, target.parentId, target.index);
  state.setDraggedNodeId(null);
  state.setDropTarget(null);
}

// ---------------------------------------------------------------------------

interface RendererProps {
  node: LayoutNode;
  isInteractive?: boolean;
  onNodeClick?: (nodeId: string) => void;
  selectedNodeId?: string | null;
  hoverNodeId?: string | null;
  onNodeHover?: (id: string | null) => void;
  platformComponents?: ComponentDefinition[];
  /** Parent node's id — used for computing drop insertion position */
  parentId?: string;
  /** This node's index within its parent's children array */
  indexInParent?: number;
}

/**
 * Dynamic renderer that converts LayoutNode tree into React components
 */
export function LayoutRenderer({
  node,
  isInteractive = false,
  onNodeClick,
  selectedNodeId,
  hoverNodeId,
  onNodeHover,
  platformComponents = [],
  parentId,
  indexInParent,
}: RendererProps) {
  const normalizedType = normalizeComponentType(node.componentType);

  // Hidden nodes are tracked in the tree (so layers panel can toggle them
  // back) but skipped during rendering.
  if (node.props?.__hidden === true) {
    return null;
  }

  // 1. Direct lookup in built-in registry.
  let builtInDef = getComponentDefinition(normalizedType);

  // 2. Fall back to platform_components (DB). The dragged node may carry the
  //    DB row's id (a cuid) as componentType, not the human-readable name.
  const platformDef =
    platformComponents.find((p) => p.id === node.componentType || p.id === normalizedType) ??
    platformComponents.find((p) => p.name === node.componentType || p.name === normalizedType) ??
    null;

  // 3. If the platform component's NAME matches a built-in, prefer the built-in
  //    renderer. This is what makes a DB-seeded "Text"/"Button"/etc. render as
  //    a real styled widget instead of the `[Name]` placeholder.
  if (!builtInDef && platformDef) {
    builtInDef =
      getComponentDefinition(platformDef.name) ??
      getComponentDefinition(normalizeComponentType(platformDef.name));
  }

  const componentDef = builtInDef ?? platformDef;

  if (!componentDef) {
    return (
      <div className="border-2 border-red-500 p-2 bg-red-50">
        <p className="text-red-600 text-sm">Unknown component: {node.componentType}</p>
      </div>
    );
  }

  // Render as PlatformComponentBlock only when the resolved component has NO
  // built-in renderer at all — i.e. it's a genuinely custom DB widget.
  const isPlatformComponent = !builtInDef && !!platformDef;
  if (isPlatformComponent) {
    return (
      <PlatformComponentBlock
        node={node}
        componentDef={componentDef}
        isInteractive={isInteractive}
        onNodeClick={onNodeClick}
        selectedNodeId={selectedNodeId}
        hoverNodeId={hoverNodeId}
        onNodeHover={onNodeHover}
        platformComponents={platformComponents}
        parentId={parentId}
        indexInParent={indexInParent}
      />
    );
  }

  // Use the resolved built-in's canonical id when available so DB-name lookup
  // (e.g. a DB Text seeded with a cuid for componentType) still routes to the
  // right renderer case.
  const renderType = builtInDef?.id ?? normalizedType;

  // CT-G: entry-animation wrapping — check BEFORE switch so every widget type
  // benefits automatically.
  const anim = animationProps(node.props?.animation);

  /**
   * Wrap a rendered widget in a framer-motion div when an animation spec is
   * present.  className="contents" makes the div layout-transparent so it
   * doesn't disturb flex/grid containers.
   */
  function withAnimation(el: React.ReactElement): React.ReactElement {
    if (!anim) return el;
    return (
      <motion.div
        initial={anim.initial}
        animate={anim.animate}
        transition={anim.transition}
        className="contents"
      >
        {el}
      </motion.div>
    );
  }

  switch (renderType) {
    case 'Container':
    case 'VStack':
    case 'HStack':
    case 'Column':
    case 'Row':
    case 'Scaffold':
    case 'AppBar':
    case 'Padding':
    case 'Center':
    case 'Expanded':
    case 'SingleChildScrollView':
    case 'Card':
    case 'ListView':
    case 'GridView':
      return withAnimation(
        <LayoutContainer
          node={node}
          componentDef={componentDef}
          isInteractive={isInteractive}
          onNodeClick={onNodeClick}
          selectedNodeId={selectedNodeId}
          hoverNodeId={hoverNodeId}
          onNodeHover={onNodeHover}
          platformComponents={platformComponents}
          parentId={parentId}
          indexInParent={indexInParent}
        />
      );

    case 'Icon':
      return withAnimation(
        <IconComponent
          node={node}
          componentDef={componentDef}
          isInteractive={isInteractive}
          onNodeClick={onNodeClick}
          selectedNodeId={selectedNodeId}
          hoverNodeId={hoverNodeId}
          onNodeHover={onNodeHover}
          parentId={parentId}
          indexInParent={indexInParent}
        />
      );

    case 'Text':
      return withAnimation(
        <TextComponent
          node={node}
          componentDef={componentDef}
          isInteractive={isInteractive}
          onNodeClick={onNodeClick}
          selectedNodeId={selectedNodeId}
          hoverNodeId={hoverNodeId}
          onNodeHover={onNodeHover}
          parentId={parentId}
          indexInParent={indexInParent}
        />
      );

    case 'Button':
    case 'TextButton':
    case 'FilledButton':
    case 'OutlinedButton':
    case 'IconButton':
    case 'FloatingActionButton':
      return withAnimation(
        <ButtonComponent
          node={node}
          componentDef={componentDef}
          isInteractive={isInteractive}
          onNodeClick={onNodeClick}
          selectedNodeId={selectedNodeId}
          hoverNodeId={hoverNodeId}
          onNodeHover={onNodeHover}
          parentId={parentId}
          indexInParent={indexInParent}
        />
      );

    case 'Image':
      return withAnimation(
        <ImageComponent
          node={node}
          componentDef={componentDef}
          isInteractive={isInteractive}
          onNodeClick={onNodeClick}
          selectedNodeId={selectedNodeId}
          hoverNodeId={hoverNodeId}
          onNodeHover={onNodeHover}
          parentId={parentId}
          indexInParent={indexInParent}
        />
      );

    case 'TextInput':
    case 'TextField':
      return withAnimation(
        <TextInputComponent
          node={node}
          componentDef={componentDef}
          isInteractive={isInteractive}
          onNodeClick={onNodeClick}
          selectedNodeId={selectedNodeId}
          hoverNodeId={hoverNodeId}
          onNodeHover={onNodeHover}
          parentId={parentId}
          indexInParent={indexInParent}
        />
      );

    case 'TextArea':
      return withAnimation(
        <TextAreaComponent
          node={node}
          componentDef={componentDef}
          isInteractive={isInteractive}
          onNodeClick={onNodeClick}
          selectedNodeId={selectedNodeId}
          hoverNodeId={hoverNodeId}
          onNodeHover={onNodeHover}
          parentId={parentId}
          indexInParent={indexInParent}
        />
      );

    case 'Divider':
      return withAnimation(
        <DividerComponent
          node={node}
          isInteractive={isInteractive}
          onNodeClick={onNodeClick}
          selectedNodeId={selectedNodeId}
          hoverNodeId={hoverNodeId}
          onNodeHover={onNodeHover}
          parentId={parentId}
          indexInParent={indexInParent}
        />
      );

    case 'Spacer':
    case 'SizedBox':
      return withAnimation(
        <SpacerComponent
          node={node}
          isInteractive={isInteractive}
          onNodeClick={onNodeClick}
          selectedNodeId={selectedNodeId}
          hoverNodeId={hoverNodeId}
          onNodeHover={onNodeHover}
          parentId={parentId}
          indexInParent={indexInParent}
        />
      );

    case 'Carousel':
      return withAnimation(
        <CarouselComponent
          node={node}
          isInteractive={isInteractive}
          onNodeClick={onNodeClick}
          selectedNodeId={selectedNodeId}
          hoverNodeId={hoverNodeId}
          onNodeHover={onNodeHover}
          platformComponents={platformComponents}
          parentId={parentId}
          indexInParent={indexInParent}
        />
      );

    default:
      return withAnimation(
        <div className="border-2 border-yellow-500 p-2 bg-yellow-50">
          <p className="text-yellow-600 text-sm">Component not yet implemented: {node.componentType}</p>
        </div>
      );
  }
}

// Platform (DB) component: generic block with props and children
function PlatformComponentBlock({
  node,
  componentDef,
  isInteractive,
  onNodeClick,
  selectedNodeId,
  hoverNodeId,
  onNodeHover,
  platformComponents,
  parentId,
  indexInParent,
}: RendererProps & { componentDef: ComponentDefinition; platformComponents: ComponentDefinition[] }) {
  const rawPcBg = (node.props.backgroundColor as string) ?? 'transparent';
  const pcBackgroundColor = parseColor(rawPcBg) ?? rawPcBg;
  const width = (node.props.width as string) || '100%';
  const height = (node.props.height as string) || 'auto';
  const isSelected = selectedNodeId === node.id;
  const isHovered = hoverNodeId === node.id && !isSelected;
  const pcPaddingStyle = parsePadding(node.props.padding);
  const pcGapStyle = parseGap((node.props.spacing ?? node.props.gap) as unknown);
  const pcRadiusStyle = parseBorderRadius(node.props.borderRadius);

  const dragProps =
    isInteractive && parentId !== undefined && indexInParent !== undefined
      ? {
          draggable: true,
          onDragStart: (e: React.DragEvent) => startNodeDrag(e, node.id),
          onDragEnd: endNodeDrag,
          onDragOver: (e: React.DragEvent) => handleNodeDragOver(e, parentId, indexInParent),
          onDrop: handleNodeDrop,
        }
      : {};

  return (
    <div
      {...dragProps}
      onClick={(e) => {
        e.stopPropagation();
        onNodeClick?.(node.id);
      }}
      onMouseEnter={() => onNodeHover?.(node.id)}
      onMouseLeave={() => onNodeHover?.(null)}
      title={componentDef.name}
      className={`flex flex-col ${isSelected ? 'ring-2 ring-primary' : isHovered ? 'ring-1 ring-primary/40' : ''}`}
      style={{ backgroundColor: pcBackgroundColor, width, height, ...pcPaddingStyle, ...pcGapStyle, ...pcRadiusStyle }}
    >
      <span className="text-xs text-muted-foreground mb-1">[{componentDef.name}]</span>
      {node.children.map((child, i) => (
        <LayoutRenderer
          key={child.id}
          node={child}
          isInteractive={isInteractive}
          onNodeClick={onNodeClick}
          selectedNodeId={selectedNodeId}
          hoverNodeId={hoverNodeId}
          onNodeHover={onNodeHover}
          platformComponents={platformComponents}
          parentId={node.id}
          indexInParent={i}
        />
      ))}
    </div>
  );
}

// Layout Components
function LayoutContainer({
  node,
  componentDef,
  isInteractive,
  onNodeClick,
  selectedNodeId,
  hoverNodeId,
  onNodeHover,
  platformComponents = [],
  parentId,
  indexInParent,
}: RendererProps & { componentDef: any }) {
  const dropTarget = useBuilderStore((s) => s.dropTarget);

  // Derive flex direction: explicit prop, or based on renderType
  const renderType = (componentDef?.id ?? normalizeComponentType(node.componentType));
  const defaultDir = (renderType === 'HStack' || renderType === 'Row') ? 'row' : 'column';
  const direction = (node.props.direction as string) || defaultDir;

  // Width / height
  const width = (node.props.width as string) || '100%';
  const height = (node.props.height as string) || 'auto';

  // Background color — also check `color` alias
  const rawBg = (node.props.backgroundColor as string) ?? (node.props.color as string) ?? 'transparent';
  const backgroundColor = parseColor(rawBg) ?? rawBg;

  // Gradient overrides backgroundColor when present
  const gradientStyle = parseGradient(node.props.gradient);

  // Padding: prefer inline style over Tailwind class for multi-value support
  const paddingStyle = parsePadding(node.props.padding);

  // Gap: support both spacing and gap aliases
  const gapStyle = parseGap((node.props.spacing ?? node.props.gap) as unknown);

  // Border radius via inline style
  const borderRadiusStyle = parseBorderRadius(node.props.borderRadius);

  // GridView: columns alias for crossAxisCount
  const gridCols = (node.props.crossAxisCount ?? node.props.columns ?? 2) as number;

  const isSelected = selectedNodeId === node.id;
  const isHovered = hoverNodeId === node.id && !isSelected;

  // Which sibling-index slot shows the drop indicator inside this container
  const showIndicatorAt =
    dropTarget?.parentId === node.id ? dropTarget.index : -1;

  // Drag props for this node itself (as a draggable sibling within its parent)
  const selfDragProps =
    isInteractive && parentId !== undefined && indexInParent !== undefined
      ? {
          draggable: true as const,
          onDragStart: (e: React.DragEvent) => startNodeDrag(e, node.id),
          onDragEnd: endNodeDrag,
          onDragOver: (e: React.DragEvent) => handleNodeDragOver(e, parentId, indexInParent),
          onDrop: handleNodeDrop,
        }
      : {};

  // When dragging over the container body itself (not a child), append at end
  const handleContainerBodyDragOver = (e: React.DragEvent) => {
    const state = useBuilderStore.getState();
    if (!state.draggedNodeId) return;
    if (state.draggedNodeId === node.id) return;
    // check descendant safety
    const draggedNode = (() => {
      const find = (n: typeof node): typeof node | null => {
        if (n.id === state.draggedNodeId) return n;
        for (const c of n.children) { const f = find(c); if (f) return f; }
        return null;
      };
      return state.rootNode ? find(state.rootNode) : null;
    })();
    if (draggedNode && isDescendantOrSelf(node.id, draggedNode)) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    state.setDropTarget({ parentId: node.id, index: node.children.length });
  };

  // GridView renders as a CSS grid instead of flex
  const isGrid = renderType === 'GridView';

  const containerStyle: React.CSSProperties = {
    ...(isGrid
      ? {
          display: 'grid',
          gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
        }
      : {
          display: 'flex',
          flexDirection: direction === 'row' ? 'row' : 'column',
        }),
    ...paddingStyle,
    ...gapStyle,
    ...borderRadiusStyle,
    // gradient overrides plain backgroundColor
    ...(gradientStyle.background
      ? gradientStyle
      : { backgroundColor }),
    width,
    height,
  };

  return (
    <div
      {...selfDragProps}
      onClick={(e) => {
        e.stopPropagation();
        onNodeClick?.(node.id);
      }}
      onMouseEnter={() => onNodeHover?.(node.id)}
      onMouseLeave={() => onNodeHover?.(null)}
      onDragOver={isInteractive ? (e: React.DragEvent) => {
        // If a child handled it already (stopPropagation), this won't fire.
        // This fires only when cursor is over the container's own padding.
        handleContainerBodyDragOver(e);
      } : undefined}
      onDrop={isInteractive ? handleNodeDrop : undefined}
      className={`${isSelected ? 'ring-2 ring-primary' : isHovered ? 'ring-1 ring-primary/40' : ''} ${isInteractive ? 'cursor-pointer' : ''}`}
      style={containerStyle}
    >
      {node.children.map((child, i) => (
        <React.Fragment key={child.id}>
          {showIndicatorAt === i && (
            <div
              className="h-0.5 bg-primary rounded-full mx-1 pointer-events-none shrink-0"
              style={{ zIndex: 50 }}
            />
          )}
          <LayoutRenderer
            node={child}
            isInteractive={isInteractive}
            onNodeClick={onNodeClick}
            selectedNodeId={selectedNodeId}
            hoverNodeId={hoverNodeId}
            onNodeHover={onNodeHover}
            platformComponents={platformComponents}
            parentId={node.id}
            indexInParent={i}
          />
        </React.Fragment>
      ))}
      {showIndicatorAt === node.children.length && (
        <div
          className="h-0.5 bg-primary rounded-full mx-1 pointer-events-none shrink-0"
          style={{ zIndex: 50 }}
        />
      )}
    </div>
  );
}

// Display Components
function TextComponent({
  node,
  componentDef,
  isInteractive,
  onNodeClick,
  selectedNodeId,
  hoverNodeId,
  onNodeHover,
  parentId,
  indexInParent,
}: RendererProps & { componentDef: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const editRef = useRef<HTMLSpanElement>(null);

  const styleObj = (node.props.style as Record<string, unknown>) ?? {};

  const getProp = (key: string, defaultVal: any) => {
    if (node.props && node.props[key] !== undefined) return node.props[key];
    if (styleObj[key] !== undefined) return styleObj[key];
    if ((node as any)[key] !== undefined) return (node as any)[key];
    return defaultVal;
  };

  const text = getProp('data', getProp('text', 'Text'));
  const fontSize = getProp('fontSize', 14);
  const fontWeight = getProp('fontWeight', 'normal');
  const fontStyle = getProp('fontStyle', 'normal');
  const fontFamily = getProp('fontFamily', '');
  const rawColor = getProp('color', '#000000') as string;
  const color = parseColor(rawColor) ?? rawColor;
  const textAlign = getProp('textAlign', 'left');
  const letterSpacing = getProp('letterSpacing', 0);
  const wordSpacing = getProp('wordSpacing', 0);
  const lineHeight = getProp('lineHeight', 1.5);
  const maxLines = getProp('maxLines', 0);
  const overflow = getProp('overflow', 'clip');

  const isSelected = selectedNodeId === node.id;
  const isHovered = hoverNodeId === node.id && !isSelected;

  // Focus and select all text when entering edit mode
  useEffect(() => {
    if (isEditing && editRef.current) {
      editRef.current.focus();
      const range = document.createRange();
      range.selectNodeContents(editRef.current);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [isEditing]);

  const commit = (newValue: string) => {
    useBuilderStore.getState().setNodeProp(node.id, 'data', newValue);
    setIsEditing(false);
  };

  const cancel = () => {
    setIsEditing(false);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (!isInteractive) return;
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Stop propagation so global Delete handler doesn't fire while typing
    e.stopPropagation();
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      commit(editRef.current?.textContent ?? '');
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancel();
    }
  };

  const overflowStyles: React.CSSProperties =
    maxLines > 0
      ? {
          display: '-webkit-box',
          WebkitLineClamp: maxLines,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: overflow === 'ellipsis' ? 'ellipsis' : 'clip',
        }
      : {};

  const resolvedFontWeight: React.CSSProperties['fontWeight'] =
    fontWeight === 'bold' ? 'bold'
    : fontWeight === 'normal' ? 'normal'
    : typeof fontWeight === 'number' ? fontWeight
    : (Number(fontWeight) || 'normal') as any;

  const textStyle: React.CSSProperties = {
    fontSize: typeof fontSize === 'number' ? `${fontSize}px` : `${parseFloat(String(fontSize)) || 14}px`,
    fontWeight: resolvedFontWeight,
    fontStyle,
    fontFamily: fontFamily || 'inherit',
    color,
    textAlign: textAlign as any,
    letterSpacing: `${letterSpacing}px`,
    wordSpacing: `${wordSpacing}px`,
    lineHeight,
    ...overflowStyles,
  };

  const dragProps =
    isInteractive && !isEditing && parentId !== undefined && indexInParent !== undefined
      ? {
          draggable: true as const,
          onDragStart: (e: React.DragEvent) => startNodeDrag(e, node.id),
          onDragEnd: endNodeDrag,
          onDragOver: (e: React.DragEvent) => handleNodeDragOver(e, parentId, indexInParent),
          onDrop: handleNodeDrop,
        }
      : {};

  return (
    <div
      {...dragProps}
      onClick={(e) => {
        if (isEditing) { e.stopPropagation(); return; }
        e.stopPropagation();
        onNodeClick?.(node.id);
      }}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => onNodeHover?.(node.id)}
      onMouseLeave={() => onNodeHover?.(null)}
      className={`${isSelected ? 'ring-2 ring-primary ring-offset-1' : isHovered ? 'ring-1 ring-primary/40' : ''} ${isInteractive ? (isEditing ? 'cursor-text' : 'cursor-pointer') : ''}`}
    >
      {isEditing ? (
        <span
          ref={editRef}
          contentEditable
          suppressContentEditableWarning
          spellCheck={false}
          onBlur={(e) => commit(e.currentTarget.textContent ?? '')}
          onKeyDown={handleKeyDown}
          style={textStyle}
          className="outline-none ring-2 ring-primary px-0.5 rounded-sm block"
        >
          {text}
        </span>
      ) : (
        <div style={textStyle}>
          {text}
        </div>
      )}
    </div>
  );
}

function IconComponent({
  node,
  componentDef,
  isInteractive,
  onNodeClick,
  selectedNodeId,
  hoverNodeId,
  onNodeHover,
  parentId,
  indexInParent,
}: RendererProps & { componentDef: any }) {
  const iconStyleObj = (node.props.style as Record<string, unknown>) ?? {};
  const name = (node.props.name as string)
    ?? (node.props.icon as string)
    ?? (node.props.data as string)
    ?? (iconStyleObj.iconType as string)
    ?? 'search';
  const size = (node.props.size as number)
    ?? (iconStyleObj.size as number)
    ?? 24;
  const rawIconColor = (node.props.color as string)
    ?? (iconStyleObj.color as string)
    ?? '#000000';
  const color = parseColor(rawIconColor) ?? rawIconColor;
  const isSelected = selectedNodeId === node.id;
  const isHovered = hoverNodeId === node.id && !isSelected;

  const dragProps =
    isInteractive && parentId !== undefined && indexInParent !== undefined
      ? {
          draggable: true as const,
          onDragStart: (e: React.DragEvent) => startNodeDrag(e, node.id),
          onDragEnd: endNodeDrag,
          onDragOver: (e: React.DragEvent) => handleNodeDragOver(e, parentId, indexInParent),
          onDrop: handleNodeDrop,
        }
      : {};

  return (
    <div
      {...dragProps}
      onClick={(e) => {
        e.stopPropagation();
        onNodeClick?.(node.id);
      }}
      onMouseEnter={() => onNodeHover?.(node.id)}
      onMouseLeave={() => onNodeHover?.(null)}
      className={`inline-flex items-center justify-center ${isSelected ? 'ring-2 ring-primary' : isHovered ? 'ring-1 ring-primary/40' : ''}`}
      style={{ width: size, height: size, color }}
      title={name}
    >
      <span className="text-[10px] font-mono" style={{ fontSize: Math.max(10, size - 4) }}>
        {name}
      </span>
    </div>
  );
}

function ImageComponent({
  node,
  componentDef,
  isInteractive,
  onNodeClick,
  selectedNodeId,
  hoverNodeId,
  onNodeHover,
  parentId,
  indexInParent,
}: RendererProps & { componentDef: any }) {
  const src = (node.props.src as string) || '';
  const alt = (node.props.alt as string) || 'Image';
  const width = (node.props.width as string) || '100%';
  const height = (node.props.height as string) || 'auto';
  const objectFit = (node.props.objectFit as string) || 'cover';

  const isSelected = selectedNodeId === node.id;
  const isHovered = hoverNodeId === node.id && !isSelected;

  const dragProps =
    isInteractive && parentId !== undefined && indexInParent !== undefined
      ? {
          draggable: true as const,
          onDragStart: (e: React.DragEvent) => startNodeDrag(e, node.id),
          onDragEnd: endNodeDrag,
          onDragOver: (e: React.DragEvent) => handleNodeDragOver(e, parentId, indexInParent),
          onDrop: handleNodeDrop,
        }
      : {};

  return (
    <div
      {...dragProps}
      onClick={(e) => {
        e.stopPropagation();
        onNodeClick?.(node.id);
      }}
      onMouseEnter={() => onNodeHover?.(node.id)}
      onMouseLeave={() => onNodeHover?.(null)}
      className={`${isSelected ? 'ring-2 ring-primary' : isHovered ? 'ring-1 ring-primary/40' : ''}`}
      style={{ width, height, overflow: 'hidden' }}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          style={{
            width: '100%',
            height: '100%',
            objectFit: objectFit as any,
          }}
        />
      ) : (
        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
          <p className="text-gray-500">No image</p>
        </div>
      )}
    </div>
  );
}

// Input Components
function ButtonComponent({
  node,
  componentDef,
  isInteractive,
  onNodeClick,
  selectedNodeId,
  hoverNodeId,
  onNodeHover,
  parentId,
  indexInParent,
}: RendererProps & { componentDef: any }) {
  const btnStyleObj = (node.props.style as Record<string, unknown>) ?? {};

  const getProp = (key: string, defaultVal: any) => {
    if (node.props && node.props[key] !== undefined) return node.props[key];
    if (btnStyleObj[key] !== undefined) return btnStyleObj[key];
    if ((node as any)[key] !== undefined) return (node as any)[key];
    return defaultVal;
  };

  // `data` is a common label alias in AI-generated JSON
  const label = getProp('label', getProp('data', 'Button'));
  const rawBtnBg = getProp('backgroundColor', btnStyleObj.backgroundColor ?? '#6366F1') as string;
  const backgroundColor = parseColor(rawBtnBg) ?? rawBtnBg;
  // `textColor` is used by some SDUI flavours
  const rawBtnColor = getProp('color', btnStyleObj.textColor ?? btnStyleObj.color ?? '#FFFFFF') as string;
  const color = parseColor(rawBtnColor) ?? rawBtnColor;
  const fontSize = Number(getProp('fontSize', 14));
  const fwRaw = getProp('fontWeight', btnStyleObj.fontWeight ?? '600');
  const fontWeight = fwRaw === 'bold' ? 'bold' : fwRaw === 'normal' ? 'normal' : Number(fwRaw) || 600;
  const borderRadius = Number(getProp('borderRadius', btnStyleObj.borderRadius ?? 8));
  const elevation = Number(getProp('elevation', 2));

  // Padding: prefer nested style.padding (may be "16 20"), then explicit H/V
  const rawPadding = node.props.padding ?? btnStyleObj.padding;
  const parsedPaddingStyle = parsePadding(rawPadding);
  const hasParsedPadding = Object.keys(parsedPaddingStyle).length > 0;
  const paddingHorizontal = hasParsedPadding ? undefined : Number(getProp('paddingHorizontal', 16));
  const paddingVertical = hasParsedPadding ? undefined : Number(getProp('paddingVertical', 12));

  // Try to parse fullWidth as boolean safely
  const rawFW = getProp('fullWidth', false);
  const fullWidth = rawFW === true || rawFW === 'true';
  const disabled = getProp('disabled', false) === true || getProp('disabled', false) === 'true';

  const isSelected = selectedNodeId === node.id;
  const isHovered = hoverNodeId === node.id && !isSelected;

  // Approximate Material Elevation shadows mapping
  const elevationShadows = [
    'none',
    '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)'
  ];
  const shadowIndex = Math.min(Math.floor(elevation / 4), 6);
  const boxShadow = elevationShadows[Math.max(0, shadowIndex)] ?? 'none';

  const dragProps =
    isInteractive && parentId !== undefined && indexInParent !== undefined
      ? {
          draggable: true as const,
          onDragStart: (e: React.DragEvent) => startNodeDrag(e, node.id),
          onDragEnd: endNodeDrag,
          onDragOver: (e: React.DragEvent) => handleNodeDragOver(e, parentId, indexInParent),
          onDrop: handleNodeDrop,
        }
      : {};

  return (
    <button
      {...dragProps}
      onClick={(e) => {
        e.stopPropagation();
        onNodeClick?.(node.id);
      }}
      onMouseEnter={() => onNodeHover?.(node.id)}
      onMouseLeave={() => onNodeHover?.(null)}
      disabled={disabled || !isInteractive}
      className={`transition-all ${isSelected ? 'ring-2 ring-primary ring-offset-2' : isHovered ? 'ring-1 ring-primary/40' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
      style={{
        backgroundColor,
        color,
        fontSize: `${fontSize}px`,
        fontWeight,
        borderRadius: `${borderRadius}px`,
        ...(hasParsedPadding
          ? parsedPaddingStyle
          : {
              paddingTop: `${paddingVertical}px`,
              paddingBottom: `${paddingVertical}px`,
              paddingLeft: `${paddingHorizontal}px`,
              paddingRight: `${paddingHorizontal}px`,
            }),
        width: fullWidth ? '100%' : 'auto',
        boxShadow,
        display: fullWidth ? 'flex' : 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: 'none',
        outline: 'none',
      }}
    >
      {label}
    </button>
  );
}

function TextInputComponent({
  node,
  componentDef,
  isInteractive,
  onNodeClick,
  selectedNodeId,
  hoverNodeId,
  onNodeHover,
  parentId,
  indexInParent,
}: RendererProps & { componentDef: any }) {
  const placeholder = (node.props.placeholder as string) || 'Enter text...';
  const label = (node.props.label as string) || '';
  const required = (node.props.required as boolean) || false;
  const disabled = (node.props.disabled as boolean) || false;
  const width = (node.props.width as string) || '100%';

  const isSelected = selectedNodeId === node.id;
  const isHovered = hoverNodeId === node.id && !isSelected;

  const dragProps =
    isInteractive && parentId !== undefined && indexInParent !== undefined
      ? {
          draggable: true as const,
          onDragStart: (e: React.DragEvent) => startNodeDrag(e, node.id),
          onDragEnd: endNodeDrag,
          onDragOver: (e: React.DragEvent) => handleNodeDragOver(e, parentId, indexInParent),
          onDrop: handleNodeDrop,
        }
      : {};

  return (
    <div
      {...dragProps}
      onClick={(e) => {
        e.stopPropagation();
        onNodeClick?.(node.id);
      }}
      onMouseEnter={() => onNodeHover?.(node.id)}
      onMouseLeave={() => onNodeHover?.(null)}
      style={{ width }}
      className={isSelected ? 'ring-2 ring-primary rounded' : isHovered ? 'ring-1 ring-primary/40 rounded' : ''}
    >
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type="text"
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

function TextAreaComponent({
  node,
  componentDef,
  isInteractive,
  onNodeClick,
  selectedNodeId,
  hoverNodeId,
  onNodeHover,
  parentId,
  indexInParent,
}: RendererProps & { componentDef: any }) {
  const placeholder = (node.props.placeholder as string) || 'Enter text...';
  const label = (node.props.label as string) || '';
  const rows = (node.props.rows as number) || 4;
  const required = (node.props.required as boolean) || false;
  const width = (node.props.width as string) || '100%';

  const isSelected = selectedNodeId === node.id;
  const isHovered = hoverNodeId === node.id && !isSelected;

  const dragProps =
    isInteractive && parentId !== undefined && indexInParent !== undefined
      ? {
          draggable: true as const,
          onDragStart: (e: React.DragEvent) => startNodeDrag(e, node.id),
          onDragEnd: endNodeDrag,
          onDragOver: (e: React.DragEvent) => handleNodeDragOver(e, parentId, indexInParent),
          onDrop: handleNodeDrop,
        }
      : {};

  return (
    <div
      {...dragProps}
      onClick={(e) => {
        e.stopPropagation();
        onNodeClick?.(node.id);
      }}
      onMouseEnter={() => onNodeHover?.(node.id)}
      onMouseLeave={() => onNodeHover?.(null)}
      style={{ width }}
      className={isSelected ? 'ring-2 ring-primary rounded' : isHovered ? 'ring-1 ring-primary/40 rounded' : ''}
    >
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <textarea
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

function DividerComponent({
  node,
  isInteractive,
  onNodeClick,
  selectedNodeId,
  hoverNodeId,
  onNodeHover,
  parentId,
  indexInParent,
}: RendererProps) {
  const getProp = (key: string, defaultVal: any) =>
    node.props && node.props[key] !== undefined ? node.props[key] : defaultVal;
  const color = (getProp('color', '#E5E7EB') as string) || '#E5E7EB';
  const thickness = Number(getProp('thickness', 1)) || 1;
  const indent = Number(getProp('indent', 0)) || 0;
  const endIndent = Number(getProp('endIndent', 0)) || 0;
  const isSelected = selectedNodeId === node.id;
  const isHovered = hoverNodeId === node.id && !isSelected;

  const dragProps =
    isInteractive && parentId !== undefined && indexInParent !== undefined
      ? {
          draggable: true as const,
          onDragStart: (e: React.DragEvent) => startNodeDrag(e, node.id),
          onDragEnd: endNodeDrag,
          onDragOver: (e: React.DragEvent) => handleNodeDragOver(e, parentId, indexInParent),
          onDrop: handleNodeDrop,
        }
      : {};

  return (
    <div
      {...dragProps}
      onClick={(e) => {
        e.stopPropagation();
        onNodeClick?.(node.id);
      }}
      onMouseEnter={() => onNodeHover?.(node.id)}
      onMouseLeave={() => onNodeHover?.(null)}
      className={`w-full ${isSelected ? 'ring-2 ring-primary rounded' : isHovered ? 'ring-1 ring-primary/40 rounded' : ''} ${isInteractive ? 'cursor-pointer' : ''}`}
      style={{ marginLeft: indent, marginRight: endIndent, paddingTop: 4, paddingBottom: 4 }}
    >
      <div style={{ height: thickness, backgroundColor: color, width: '100%' }} />
    </div>
  );
}

function SpacerComponent({
  node,
  isInteractive,
  onNodeClick,
  selectedNodeId,
  hoverNodeId,
  onNodeHover,
  parentId,
  indexInParent,
}: RendererProps) {
  const getProp = (key: string, defaultVal: any) =>
    node.props && node.props[key] !== undefined ? node.props[key] : defaultVal;
  const width = Number(getProp('width', 0)) || 0;
  const height = Number(getProp('height', 0)) || 0;
  const flex = Number(getProp('flex', 0)) || 0;
  const isSelected = selectedNodeId === node.id;
  const isHovered = hoverNodeId === node.id && !isSelected;
  // Spacer (flex > 0) takes up flex space; SizedBox uses width/height
  const style: React.CSSProperties = flex > 0
    ? { flex: flex }
    : { width: width || undefined, height: height || undefined, minWidth: width || undefined, minHeight: height || undefined };

  const dragProps =
    isInteractive && parentId !== undefined && indexInParent !== undefined
      ? {
          draggable: true as const,
          onDragStart: (e: React.DragEvent) => startNodeDrag(e, node.id),
          onDragEnd: endNodeDrag,
          onDragOver: (e: React.DragEvent) => handleNodeDragOver(e, parentId, indexInParent),
          onDrop: handleNodeDrop,
        }
      : {};

  return (
    <div
      {...dragProps}
      onClick={(e) => {
        e.stopPropagation();
        onNodeClick?.(node.id);
      }}
      onMouseEnter={() => onNodeHover?.(node.id)}
      onMouseLeave={() => onNodeHover?.(null)}
      className={`${isSelected ? 'ring-2 ring-primary' : isHovered ? 'ring-1 ring-primary/40' : ''} ${isInteractive ? 'cursor-pointer' : ''}`}
      style={style}
      title={node.componentType}
    />
  );
}

// ─── Carousel ────────────────────────────────────────────────────────────────

function CarouselComponent({
  node,
  isInteractive,
  onNodeClick,
  selectedNodeId,
  hoverNodeId,
  onNodeHover,
  platformComponents = [],
  parentId,
  indexInParent,
}: RendererProps) {
  const variant = (node.props.variant as string) ?? 'basic';
  const height = Number(node.props.height) || 200;
  const autoPlay = Boolean(node.props.autoPlay);
  const interval = Number(node.props.interval) || 3000;
  const loop = node.props.loop !== false;
  const showDots = node.props.showDots !== false;
  const items = node.children ?? [];
  const [active, setActive] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-play
  useEffect(() => {
    if (!autoPlay || items.length <= 1) return;
    const id = setInterval(() => {
      setActive((i) => {
        const next = i + 1;
        if (next >= items.length) return loop ? 0 : i;
        return next;
      });
    }, interval);
    return () => clearInterval(id);
  }, [autoPlay, interval, loop, items.length]);

  // Scroll to active item
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const child = el.children[active] as HTMLElement | undefined;
    if (child) {
      el.scrollTo({ left: child.offsetLeft, behavior: 'smooth' });
    }
  }, [active]);

  const isSelected = selectedNodeId === node.id;
  const isHovered = hoverNodeId === node.id && !isSelected;

  const itemWidthClass =
    variant === 'snap' ? 'min-w-[85%] mr-3' :
    variant === 'fullscreen' ? 'min-w-full' :
    'min-w-full';

  const dragProps =
    isInteractive && parentId !== undefined && indexInParent !== undefined
      ? {
          draggable: true as const,
          onDragStart: (e: React.DragEvent) => startNodeDrag(e, node.id),
          onDragEnd: endNodeDrag,
          onDragOver: (e: React.DragEvent) => handleNodeDragOver(e, parentId, indexInParent),
          onDrop: handleNodeDrop,
        }
      : {};

  return (
    <div
      {...dragProps}
      onClick={(e) => { e.stopPropagation(); onNodeClick?.(node.id); }}
      onMouseEnter={() => onNodeHover?.(node.id)}
      onMouseLeave={() => onNodeHover?.(null)}
      className={`relative w-full ${isSelected ? 'ring-2 ring-primary' : isHovered ? 'ring-1 ring-primary/40' : ''} ${isInteractive ? 'cursor-pointer' : ''}`}
      style={{ height }}
    >
      <div
        ref={scrollRef}
        className="w-full h-full overflow-x-auto flex snap-x snap-mandatory scroll-smooth"
        style={{ scrollbarWidth: 'none' }}
        onScroll={() => {
          const el = scrollRef.current;
          if (!el || !el.children[0]) return;
          const itemWidth = (el.children[0] as HTMLElement).offsetWidth;
          if (itemWidth === 0) return;
          const idx = Math.round(el.scrollLeft / itemWidth);
          setActive(Math.max(0, Math.min(idx, items.length - 1)));
        }}
      >
        {items.map((child, i) => (
          <div
            key={child.id}
            className={`${itemWidthClass} h-full snap-start flex-shrink-0`}
          >
            <LayoutRenderer
              node={child}
              isInteractive={isInteractive}
              onNodeClick={onNodeClick}
              selectedNodeId={selectedNodeId}
              hoverNodeId={hoverNodeId}
              onNodeHover={onNodeHover}
              platformComponents={platformComponents}
              parentId={node.id}
              indexInParent={i}
            />
          </div>
        ))}
      </div>
      {showDots && items.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setActive(i); }}
              className={`h-2 rounded-full transition-all ${
                i === active ? 'bg-primary w-4' : 'bg-gray-400/60 w-2'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Utility functions for converting props to Tailwind classes
function getPaddingClass(padding: string): string {
  const num = parseInt(padding);
  const paddingMap: Record<number, string> = {
    0: 'p-0',
    4: 'p-1',
    8: 'p-2',
    12: 'p-3',
    16: 'p-4',
    20: 'p-5',
    24: 'p-6',
    28: 'p-7',
    32: 'p-8',
  };
  return paddingMap[num] || `p-4`;
}

function getGapClass(gap: string): string {
  const num = parseInt(gap);
  const gapMap: Record<number, string> = {
    0: 'gap-0',
    4: 'gap-1',
    8: 'gap-2',
    12: 'gap-3',
    16: 'gap-4',
    20: 'gap-5',
    24: 'gap-6',
    28: 'gap-7',
    32: 'gap-8',
  };
  return gapMap[num] || `gap-2`;
}

function getBorderRadiusClass(radius: string): string {
  const num = parseInt(radius);
  const radiusMap: Record<number, string> = {
    0: 'rounded-none',
    2: 'rounded-sm',
    4: 'rounded',
    6: 'rounded-md',
    8: 'rounded-lg',
    12: 'rounded-xl',
    16: 'rounded-2xl',
  };
  return radiusMap[num] || 'rounded-none';
}
