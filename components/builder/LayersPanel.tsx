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
  GripVertical,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

// Helper: find the parent and index of a node in the tree.
function findParentAndIndex(
  root: LayoutNode,
  id: string
): { parentId: string; index: number } | null {
  for (let i = 0; i < root.children.length; i++) {
    if (root.children[i].id === id) return { parentId: root.id, index: i };
    const found = findParentAndIndex(root.children[i], id);
    if (found) return found;
  }
  return null;
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

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: node.id });

  const sortableStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={sortableStyle}>
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
        {/* drag handle — hidden until row hover, not shown on root */}
        {!isRoot && (
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing p-0.5 rounded shrink-0"
            tabIndex={-1}
            aria-label="Drag to reorder"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="w-3 h-3 text-muted-foreground" />
          </button>
        )}

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

// Build a flat list of all visible node ids (respects expand state via TreeNode).
// We need this for the SortableContext items list.
function flattenVisibleIds(node: LayoutNode, expandedSet?: Set<string>): string[] {
  // Without access to individual TreeNode expand state, we flatten all ids.
  // The SortableContext items list just needs all draggable ids registered.
  const ids: string[] = [node.id];
  for (const child of node.children) {
    ids.push(...flattenVisibleIds(child, expandedSet));
  }
  return ids;
}

export function LayersPanel() {
  const rootNode = useBuilderStore((state) => state.rootNode);
  const selectedNodeId = useBuilderStore((state) => state.selection.selectedNodeId);
  const selectNode = useBuilderStore((state) => state.selectNode);
  const deleteNode = useBuilderStore((state) => state.deleteNode);
  const moveNode = useBuilderStore((state) => state.moveNode);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        // Require 8px movement before drag starts — avoids accidental drags on clicks.
        distance: 8,
      },
    })
  );

  const handleDragEnd = useCallback(
    (e: DragEndEvent) => {
      const { active, over } = e;
      if (!over || active.id === over.id) return;
      if (!rootNode) return;

      const draggedId = active.id as string;
      const overId = over.id as string;

      const draggedInfo = findParentAndIndex(rootNode, draggedId);
      const overInfo = findParentAndIndex(rootNode, overId);

      if (!draggedInfo || !overInfo) return;

      // v1: only support reorder within the same parent.
      if (draggedInfo.parentId !== overInfo.parentId) {
        return; // cross-parent reparenting not supported in v1
      }

      // Move to the target index (store handles same-parent index adjustment).
      moveNode(draggedId, draggedInfo.parentId, overInfo.index);
    },
    [rootNode, moveNode]
  );

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
  const allIds = flattenVisibleIds(rootNode);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3 border-b border-border shrink-0 flex items-center justify-between">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Layers
        </h3>
        <span className="text-xs text-muted-foreground">{nodeCount} nodes</span>
      </div>
      <div className="flex-1 overflow-y-auto py-1 px-1">
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <SortableContext items={allIds} strategy={verticalListSortingStrategy}>
            <TreeNode
              node={rootNode}
              depth={0}
              selectedNodeId={selectedNodeId}
              onSelect={handleSelect}
              onDelete={handleDelete}
              isRoot
            />
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}

function countNodes(node: LayoutNode): number {
  return 1 + node.children.reduce((acc, c) => acc + countNodes(c), 0);
}
