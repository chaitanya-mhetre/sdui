import React from 'react';
import { LayoutNode, ComponentDefinition } from '@/types';
import { getComponentDefinition } from './componentRegistry';

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

interface RendererProps {
  node: LayoutNode;
  isInteractive?: boolean;
  onNodeClick?: (nodeId: string) => void;
  selectedNodeId?: string | null;
  hoverNodeId?: string | null;
  platformComponents?: ComponentDefinition[];
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
  platformComponents = [],
}: RendererProps) {
  const normalizedType = normalizeComponentType(node.componentType);
  const componentDef =
    getComponentDefinition(normalizedType) ??
    platformComponents.find((p) => p.id === node.componentType || p.id === normalizedType) ??
    platformComponents.find((p) => p.name === node.componentType || p.name === normalizedType);

  if (!componentDef) {
    return (
      <div className="border-2 border-red-500 p-2 bg-red-50">
        <p className="text-red-600 text-sm">Unknown component: {node.componentType}</p>
      </div>
    );
  }

  // Platform (DB) components: render as generic block
  const isPlatformComponent = platformComponents.some(
    (p) => p.id === node.componentType || p.name === node.componentType || p.id === normalizedType || p.name === normalizedType
  );
  if (isPlatformComponent) {
    return (
      <PlatformComponentBlock
        node={node}
        componentDef={componentDef}
        isInteractive={isInteractive}
        onNodeClick={onNodeClick}
        selectedNodeId={selectedNodeId}
        platformComponents={platformComponents}
      />
    );
  }

  // Handle different component types (use normalized type so "scaffold" -> "Scaffold")
  switch (normalizedType) {
    case 'Container':
    case 'VStack':
    case 'HStack':
    case 'Scaffold':
    case 'AppBar':
      return (
        <LayoutContainer
          node={node}
          componentDef={componentDef}
          isInteractive={isInteractive}
          onNodeClick={onNodeClick}
          selectedNodeId={selectedNodeId}
          platformComponents={platformComponents}
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
        />
      );

    case 'Button':
      return (
        <ButtonComponent
          node={node}
          componentDef={componentDef}
          isInteractive={isInteractive}
          onNodeClick={onNodeClick}
          selectedNodeId={selectedNodeId}
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
        />
      );

    case 'TextInput':
      return (
        <TextInputComponent
          node={node}
          componentDef={componentDef}
          isInteractive={isInteractive}
          onNodeClick={onNodeClick}
          selectedNodeId={selectedNodeId}
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
  platformComponents,
}: RendererProps & { componentDef: ComponentDefinition; platformComponents: ComponentDefinition[] }) {
  const padding = (node.props.padding as string) || '0';
  const gap = (node.props.gap as string) || '0';
  const backgroundColor = (node.props.backgroundColor as string) || 'transparent';
  const borderRadius = (node.props.borderRadius as string) || '0';
  const width = (node.props.width as string) || '100%';
  const height = (node.props.height as string) || 'auto';
  const isSelected = selectedNodeId === node.id;
  const paddingClass = getPaddingClass(padding);
  const gapClass = getGapClass(gap);
  const radiusClass = getBorderRadiusClass(borderRadius);

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onNodeClick?.(node.id);
      }}
      title={componentDef.name}
      className={`flex flex-col ${paddingClass} ${gapClass} ${radiusClass} ${isSelected ? 'ring-2 ring-primary' : ''}`}
      style={{ backgroundColor, width, height }}
    >
      <span className="text-xs text-muted-foreground mb-1">[{componentDef.name}]</span>
      {node.children.map((child) => (
        <LayoutRenderer
          key={child.id}
          node={child}
          isInteractive={isInteractive}
          onNodeClick={onNodeClick}
          selectedNodeId={selectedNodeId}
          platformComponents={platformComponents}
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
  platformComponents = [],
}: RendererProps & { componentDef: any }) {
  const direction = (node.props.direction as string) || 'column';
  const padding = (node.props.padding as string) || '0';
  const gap = (node.props.gap as string) || '0';
  const backgroundColor = (node.props.backgroundColor as string) || 'transparent';
  const borderRadius = (node.props.borderRadius as string) || '0';
  const width = (node.props.width as string) || '100%';
  const height = (node.props.height as string) || 'auto';

  const isSelected = selectedNodeId === node.id;

  const flexDirection = direction === 'row' ? 'flex-row' : 'flex-col';
  const paddingClass = getPaddingClass(padding);
  const gapClass = getGapClass(gap);
  const radiusClass = getBorderRadiusClass(borderRadius);

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onNodeClick?.(node.id);
      }}
      className={`flex ${flexDirection} ${paddingClass} ${gapClass} ${radiusClass} ${isSelected ? 'ring-2 ring-primary' : ''} ${isInteractive ? 'cursor-pointer' : ''}`}
      style={{
        backgroundColor,
        width,
        height,
      }}
    >
      {node.children.map((child) => (
        <LayoutRenderer
          key={child.id}
          node={child}
          isInteractive={isInteractive}
          onNodeClick={onNodeClick}
          selectedNodeId={selectedNodeId}
          platformComponents={platformComponents}
        />
      ))}
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

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onNodeClick?.(node.id);
      }}
      className={`${isSelected ? 'ring-2 ring-primary ring-offset-1' : ''} ${isInteractive ? 'cursor-pointer' : ''}`}
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
}: RendererProps & { componentDef: any }) {
  const name = (node.props.name as string) || (node.props.icon as string) || 'search';
  const size = (node.props.size as number) || 24;
  const color = (node.props.color as string) || '#000000';
  const isSelected = selectedNodeId === node.id;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onNodeClick?.(node.id);
      }}
      className={`inline-flex items-center justify-center ${isSelected ? 'ring-2 ring-primary' : ''}`}
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
}: RendererProps & { componentDef: any }) {
  const src = (node.props.src as string) || '';
  const alt = (node.props.alt as string) || 'Image';
  const width = (node.props.width as string) || '100%';
  const height = (node.props.height as string) || 'auto';
  const objectFit = (node.props.objectFit as string) || 'cover';

  const isSelected = selectedNodeId === node.id;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onNodeClick?.(node.id);
      }}
      className={`${isSelected ? 'ring-2 ring-primary' : ''}`}
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

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onNodeClick?.(node.id);
      }}
      disabled={disabled || !isInteractive}
      className={`transition-all ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
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
}: RendererProps & { componentDef: any }) {
  const placeholder = (node.props.placeholder as string) || 'Enter text...';
  const label = (node.props.label as string) || '';
  const required = (node.props.required as boolean) || false;
  const disabled = (node.props.disabled as boolean) || false;
  const width = (node.props.width as string) || '100%';

  const isSelected = selectedNodeId === node.id;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onNodeClick?.(node.id);
      }}
      style={{ width }}
      className={isSelected ? 'ring-2 ring-primary rounded' : ''}
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
}: RendererProps & { componentDef: any }) {
  const placeholder = (node.props.placeholder as string) || 'Enter text...';
  const label = (node.props.label as string) || '';
  const rows = (node.props.rows as number) || 4;
  const required = (node.props.required as boolean) || false;
  const width = (node.props.width as string) || '100%';

  const isSelected = selectedNodeId === node.id;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onNodeClick?.(node.id);
      }}
      style={{ width }}
      className={isSelected ? 'ring-2 ring-primary rounded' : ''}
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
