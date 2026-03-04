'use client';

import { useState, useCallback } from 'react';
import { useBuilderStore } from '@/store/builderStore';
import type { LayoutNode } from '@/types';
import {
  ChevronRight,
  ChevronDown,
  Trash2,
  Square,
  Type,
  MousePointerClick,
  LayoutTemplate,
  Smartphone,
  ImageIcon,
  Zap,
  Minus,
  CreditCard,
  List,
  AlignCenter,
  Columns2,
  Rows3,
  Box,
  Maximize2,
  AlignJustify,
  MoreHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Icon mapping for component types
function getNodeIcon(componentType: string) {
  const t = componentType.toLowerCase();
  if (t === 'scaffold') return Smartphone;
  if (t === 'appbar' || t === 'app_bar' || t === 'navigationbar') return LayoutTemplate;
  if (t === 'column') return Columns2;
  if (t === 'row') return Rows3;
  if (t.includes('text') && !t.includes('button')) return Type;
  if (t.includes('button')) return MousePointerClick;
  if (t.includes('image')) return ImageIcon;
  if (t === 'icon') return Zap;
  if (t === 'card') return CreditCard;
  if (t.includes('list')) return List;
  if (t === 'center') return AlignCenter;
  if (t === 'divider') return Minus;
  if (t === 'padding') return Box;
  if (t === 'sizedbox' || t === 'sized_box') return Maximize2;
  if (t === 'expanded') return AlignJustify;
  if (t === 'spacer') return MoreHorizontal;
  if (t === 'container') return Square;
  return Square;
}

interface TreeNodeProps {
  node: LayoutNode;
  depth: number;
  selectedNodeId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  isRoot?: boolean;
}

function TreeNode({ node, depth, selectedNodeId, onSelect, onDelete, isRoot }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children.length > 0;
  const isSelected = node.id === selectedNodeId;
  const Icon = getNodeIcon(node.componentType);

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-selected={isSelected}
        className={cn(
          'group flex items-center gap-1 py-1 rounded-md cursor-pointer text-xs select-none transition-colors',
          'hover:bg-muted/70',
          isSelected
            ? 'bg-primary/10 text-primary border-l-2 border-primary pl-[6px]'
            : 'border-l-2 border-transparent'
        )}
        style={{ paddingLeft: `${depth * 14 + 8}px` }}
        onClick={() => onSelect(node.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') onSelect(node.id);
        }}
      >
        {/* expand/collapse toggle */}
        <button
          type="button"
          className="w-4 h-4 flex items-center justify-center shrink-0 rounded hover:bg-muted"
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) setExpanded((v) => !v);
          }}
          tabIndex={-1}
          aria-label={expanded ? 'Collapse' : 'Expand'}
        >
          {hasChildren ? (
            expanded ? (
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
            )
          ) : (
            <span className="w-3" />
          )}
        </button>

        {/* widget icon */}
        <Icon
          className={cn(
            'w-3.5 h-3.5 shrink-0',
            isSelected ? 'text-primary' : 'text-muted-foreground'
          )}
        />

        {/* label */}
        <span className="flex-1 truncate font-medium">{node.componentType}</span>

        {/* delete (hidden unless hovered; root node cannot be deleted) */}
        {!isRoot && (
          <button
            type="button"
            className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:text-destructive transition-opacity mr-1"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(node.id);
            }}
            tabIndex={-1}
            aria-label={`Delete ${node.componentType}`}
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* children */}
      {hasChildren && expanded && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedNodeId={selectedNodeId}
              onSelect={onSelect}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function LayersPanel() {
  const rootNode = useBuilderStore((state) => state.rootNode);
  const selectedNodeId = useBuilderStore((state) => state.selection.selectedNodeId);
  const selectNode = useBuilderStore((state) => state.selectNode);
  const deleteNode = useBuilderStore((state) => state.deleteNode);

  const handleSelect = useCallback(
    (id: string) => {
      selectNode(id);
    },
    [selectNode]
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteNode(id);
    },
    [deleteNode]
  );

  if (!rootNode) {
    return (
      <div className="p-4 text-sm text-muted-foreground">No layout loaded</div>
    );
  }

  const nodeCount = countNodes(rootNode);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3 border-b border-border shrink-0 flex items-center justify-between">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Layers
        </h3>
        <span className="text-xs text-muted-foreground">{nodeCount} nodes</span>
      </div>
      <div className="flex-1 overflow-y-auto py-1 px-1">
        <TreeNode
          node={rootNode}
          depth={0}
          selectedNodeId={selectedNodeId}
          onSelect={handleSelect}
          onDelete={handleDelete}
          isRoot
        />
      </div>
    </div>
  );
}

function countNodes(node: LayoutNode): number {
  return 1 + node.children.reduce((acc, c) => acc + countNodes(c), 0);
}
