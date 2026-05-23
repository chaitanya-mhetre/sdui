import React from 'react';
import { LayoutNode, ComponentDefinition } from '@/types';
import { getComponentDefinition } from './componentRegistry';
import { useBuilderStore } from '@/store/builderStore';

/** Map SDUI / lowercase / snake_case type names to builder registry ids */
const SDUI_TYPE_TO_REGISTRY: Record<string, string> = {
  scaffold: 'Scaffold',
  app_bar: 'AppBar',
  row: 'HStack',
  column: 'VStack',
  text: 'Text',
  icon: 'Icon',
  single_child_scroll_view: 'SingleChildScrollView',
  sized_box: 'SizedBox',
  container: 'Container',
  vstack: 'VStack',
  hstack: 'HStack',
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
  if (state.rootNode) {
    const draggedNode = state.rootNode.children.length > 0
      ? (() => {
          const find = (n: LayoutNode): LayoutNode | null => {
            if (n.id === draggedId) return n;
            for (const c of n.children) { const f = find(c); if (f) return f; }
            return null;
          };
          return find(state.rootNode);
        })()
      : null;
    if (draggedNode && isDescendantOrSelf(target.parentId, draggedNode)) return;
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
      return (
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
      return (
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
      return (
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
      return (
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
      return (
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
      return (
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
      return (
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
      return (
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
      return (
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

    default:
      return (
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
  const padding = (node.props.padding as string) || '0';
  const gap = (node.props.gap as string) || '0';
  const backgroundColor = (node.props.backgroundColor as string) || 'transparent';
  const borderRadius = (node.props.borderRadius as string) || '0';
  const width = (node.props.width as string) || '100%';
  const height = (node.props.height as string) || 'auto';
  const isSelected = selectedNodeId === node.id;
  const isHovered = hoverNodeId === node.id && !isSelected;
  const paddingClass = getPaddingClass(padding);
  const gapClass = getGapClass(gap);
  const radiusClass = getBorderRadiusClass(borderRadius);

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
      className={`flex flex-col ${paddingClass} ${gapClass} ${radiusClass} ${isSelected ? 'ring-2 ring-primary' : isHovered ? 'ring-1 ring-primary/40' : ''}`}
      style={{ backgroundColor, width, height }}
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

  const direction = (node.props.direction as string) || 'column';
  const padding = (node.props.padding as string) || '0';
  const gap = (node.props.gap as string) || '0';
  const backgroundColor = (node.props.backgroundColor as string) || 'transparent';
  const borderRadius = (node.props.borderRadius as string) || '0';
  const width = (node.props.width as string) || '100%';
  const height = (node.props.height as string) || 'auto';

  const isSelected = selectedNodeId === node.id;
  const isHovered = hoverNodeId === node.id && !isSelected;

  const flexDirection = direction === 'row' ? 'flex-row' : 'flex-col';
  const paddingClass = getPaddingClass(padding);
  const gapClass = getGapClass(gap);
  const radiusClass = getBorderRadiusClass(borderRadius);

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
      className={`flex ${flexDirection} ${paddingClass} ${gapClass} ${radiusClass} ${isSelected ? 'ring-2 ring-primary' : isHovered ? 'ring-1 ring-primary/40' : ''} ${isInteractive ? 'cursor-pointer' : ''}`}
      style={{
        backgroundColor,
        width,
        height,
      }}
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
  const getProp = (key: string, defaultVal: any) => {
    if (node.props && node.props[key] !== undefined) return node.props[key];
    if ((node as any)[key] !== undefined) return (node as any)[key];
    return defaultVal;
  };

  const text = getProp('data', getProp('text', 'Text'));
  const fontSize = getProp('fontSize', 14);
  const fontWeight = getProp('fontWeight', 'normal');
  const fontStyle = getProp('fontStyle', 'normal');
  const fontFamily = getProp('fontFamily', '');
  const color = getProp('color', '#000000');
  const textAlign = getProp('textAlign', 'left');
  const letterSpacing = getProp('letterSpacing', 0);
  const wordSpacing = getProp('wordSpacing', 0);
  const lineHeight = getProp('lineHeight', 1.5);
  const maxLines = getProp('maxLines', 0);
  const overflow = getProp('overflow', 'clip');

  const isSelected = selectedNodeId === node.id;
  const isHovered = hoverNodeId === node.id && !isSelected;

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
      className={`${isSelected ? 'ring-2 ring-primary ring-offset-1' : isHovered ? 'ring-1 ring-primary/40' : ''} ${isInteractive ? 'cursor-pointer' : ''}`}
      style={{
        fontSize: `${fontSize}px`,
        fontWeight: fontWeight === '600' ? 600 : fontWeight === 'bold' ? 'bold' : 'normal',
        fontStyle,
        fontFamily: fontFamily || 'inherit',
        color,
        textAlign: textAlign as any,
        letterSpacing: `${letterSpacing}px`,
        wordSpacing: `${wordSpacing}px`,
        lineHeight,
        ...overflowStyles,
      }}
    >
      {text}
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
  const name = (node.props.name as string) || (node.props.icon as string) || 'search';
  const size = (node.props.size as number) || 24;
  const color = (node.props.color as string) || '#000000';
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
  const getProp = (key: string, defaultVal: any) => {
    if (node.props && node.props[key] !== undefined) return node.props[key];
    if ((node as any)[key] !== undefined) return (node as any)[key];
    return defaultVal;
  };

  const label = getProp('label', 'Button');
  const backgroundColor = getProp('backgroundColor', '#6366F1');
  const color = getProp('color', '#FFFFFF');
  const fontSize = Number(getProp('fontSize', 14));
  const fwRaw = getProp('fontWeight', '600');
  const fontWeight = fwRaw === 'bold' ? 'bold' : fwRaw === 'normal' ? 'normal' : Number(fwRaw) || 600;
  const borderRadius = Number(getProp('borderRadius', 8));
  const elevation = Number(getProp('elevation', 2));
  const paddingHorizontal = Number(getProp('paddingHorizontal', 16));
  const paddingVertical = Number(getProp('paddingVertical', 12));
  
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
        paddingTop: `${paddingVertical}px`,
        paddingBottom: `${paddingVertical}px`,
        paddingLeft: `${paddingHorizontal}px`,
        paddingRight: `${paddingHorizontal}px`,
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
