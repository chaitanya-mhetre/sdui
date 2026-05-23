import { create } from 'zustand';
import { Layout, LayoutNode, SelectionState, HistoryEntry, ComponentDefinition } from '@/types';
import { nanoid } from 'nanoid';

interface BuilderState {
  // Layout state
  currentLayout: Layout | null;
  rootNode: LayoutNode | null;

  // Clipboard
  clipboardNode: LayoutNode | null;

  // Selection state
  selection: SelectionState;

  // History for undo/redo
  history: HistoryEntry[];
  historyIndex: number;

  // UI state
  isPreviewMode: boolean;
  selectedDevicePreset: string;
  sidebarOpen: boolean;
  propertiesPanelOpen: boolean;
  /** Editor view: 'design' = drag & drop canvas, 'code' = code editor + preview (Stac-style) */
  editorViewMode: 'design' | 'code';
  setEditorViewMode: (mode: 'design' | 'code') => void;

  /** Device frame (bezel) color - outer phone/tablet border */
  frameColor: string;
  setFrameColor: (color: string) => void;

  /** Screen area background: solid or gradient (inner canvas only) */
  screenBackground: { type: 'solid' | 'gradient'; color?: string; gradient?: string };
  setScreenBackground: (bg: { type: 'solid' | 'gradient'; color?: string; gradient?: string }) => void;

  // Platform components from DB (shown in editor left sidebar)
  platformComponents: ComponentDefinition[];

  // Drag and drop state
  isDraggingFromLibrary: boolean;
  draggedComponentType: string | null;
  dropZoneNodeId: string | null;

  // Canvas-internal drag state (node reorder / reparent)
  draggedNodeId: string | null;
  setDraggedNodeId: (id: string | null) => void;
  /** Insertion point during a canvas drag. parentId = container to insert into; index = position in parent.children. */
  dropTarget: { parentId: string; index: number } | null;
  setDropTarget: (t: { parentId: string; index: number } | null) => void;
  /** One-shot error message from canvas drag-drop arity validation. Canvas reads + clears this to show a toast. */
  dropError: string | null;
  setDropError: (e: string | null) => void;

  // Actions
  setCurrentLayout: (layout: Layout) => void;
  setRootNode: (node: LayoutNode) => void;
  selectNode: (nodeId: string | null) => void;
  deselectNode: () => void;
  updateNode: (nodeId: string, updates: Partial<LayoutNode>) => void;
  deleteNode: (nodeId: string) => void;
  addChildNode: (parentId: string, childNode: LayoutNode) => void;
  insertNodeAfter: (referenceId: string, newNode: LayoutNode) => void;
  moveNode: (nodeId: string, newParentId: string, position?: number) => void;
  duplicateNode: (nodeId: string) => void;
  copyNode: (nodeId: string) => void;
  cutNode: (nodeId: string) => void;
  pasteNode: (parentId?: string) => void;
  setNodeHidden: (nodeId: string, hidden: boolean) => void;
  setNodeProp: (nodeId: string, key: string, value: unknown) => void;

  // Preview and device
  setPreviewMode: (enabled: boolean) => void;
  setSelectedDevicePreset: (preset: string) => void;
  setSidebarOpen: (open: boolean) => void;
  setPropertiesPanelOpen: (open: boolean) => void;
  setPlatformComponents: (components: ComponentDefinition[]) => void;

  // Drag and drop
  setDraggingFromLibrary: (isDragging: boolean, componentType?: string) => void;
  setDropZoneNodeId: (nodeId: string | null) => void;

  // History management
  pushHistory: (action: string) => void;
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;

  // Hover state
  hoverNodeId: string | null;
  setHoverNodeId: (id: string | null) => void;

  // Multi-selection
  addToSelection: (nodeId: string) => void;
  removeFromSelection: (nodeId: string) => void;
  toggleSelection: (nodeId: string) => void;
  clearSelection: () => void;

  // Utility
  findNode: (nodeId: string) => LayoutNode | null;
  findNodePath: (nodeId: string) => LayoutNode[];
}

// Helper function to deep clone a layout node
function cloneNode(node: LayoutNode): LayoutNode {
  return {
    ...node,
    children: node.children.map(cloneNode),
  };
}

// Helper function to find a node in the tree
function findNodeInTree(nodeId: string, rootNode: LayoutNode | null): LayoutNode | null {
  if (!rootNode) return null;
  if (rootNode.id === nodeId) return rootNode;

  for (const child of rootNode.children) {
    const found = findNodeInTree(nodeId, child);
    if (found) return found;
  }

  return null;
}

// Helper function to find node path (breadcrumb)
function findNodePath(nodeId: string, rootNode: LayoutNode | null, path: LayoutNode[] = []): LayoutNode[] {
  if (!rootNode) return [];
  if (rootNode.id === nodeId) return [...path, rootNode];

  for (const child of rootNode.children) {
    const result = findNodePath(nodeId, child, [...path, rootNode]);
    if (result.length > 0) return result;
  }

  return [];
}

// Helper function to update a node in the tree
function updateNodeInTree(nodeId: string, updates: Partial<LayoutNode>, rootNode: LayoutNode): LayoutNode {
  if (rootNode.id === nodeId) {
    return { ...rootNode, ...updates };
  }

  return {
    ...rootNode,
    children: rootNode.children.map((child) => updateNodeInTree(nodeId, updates, child)),
  };
}

// Helper function to delete a node from the tree
function deleteNodeFromTree(nodeId: string, rootNode: LayoutNode): LayoutNode {
  return {
    ...rootNode,
    children: rootNode.children.filter((child) => child.id !== nodeId).map((child) => deleteNodeFromTree(nodeId, child)),
  };
}

// Helper function to add a child to a node
function addChildToNode(parentId: string, child: LayoutNode, rootNode: LayoutNode): LayoutNode {
  if (rootNode.id === parentId) {
    return {
      ...rootNode,
      children: [...rootNode.children, child],
    };
  }

  return {
    ...rootNode,
    children: rootNode.children.map((node) => addChildToNode(parentId, child, node)),
  };
}

// Helper: deep clone a node with fresh ids for all nodes
function cloneNodeDeep(node: LayoutNode): LayoutNode {
  return {
    ...node,
    id: nanoid(),
    props: { ...node.props },
    children: node.children.map(cloneNodeDeep),
  };
}

// Helper: find a node and its direct parent
function findNodeAndParent(
  root: LayoutNode,
  targetId: string,
  parent: LayoutNode | null = null
): { node: LayoutNode; parent: LayoutNode | null } | null {
  if (root.id === targetId) return { node: root, parent };
  for (const child of root.children) {
    const found = findNodeAndParent(child, targetId, root);
    if (found) return found;
  }
  return null;
}

// Helper: apply a mutator to a single node in the tree (immutably)
function setNodePropInTree(
  root: LayoutNode,
  targetId: string,
  mutator: (n: LayoutNode) => LayoutNode
): LayoutNode {
  if (root.id === targetId) return mutator(root);
  return { ...root, children: root.children.map((c) => setNodePropInTree(c, targetId, mutator)) };
}

// Helper function to move a node
function moveNodeInTree(
  nodeId: string,
  newParentId: string,
  position: number | undefined,
  rootNode: LayoutNode
): LayoutNode {
  // First, find and remove the node from its current location
  let nodeToMove: LayoutNode | null = null;
  const removeNode = (node: LayoutNode): LayoutNode => {
    if (node.id === nodeId) {
      nodeToMove = cloneNode(node);
      return node;
    }

    return {
      ...node,
      children: node.children.filter((child) => child.id !== nodeId).map(removeNode),
    };
  };

  let newTree = removeNode(rootNode);

  if (!nodeToMove) return newTree;

  // Then, add the node to the new parent
  const addNode = (node: LayoutNode): LayoutNode => {
    if (node.id === newParentId) {
      const children = [...node.children];
      if (position !== undefined && position >= 0 && position <= children.length) {
        children.splice(position, 0, nodeToMove!);
      } else {
        children.push(nodeToMove!);
      }
      return {
        ...node,
        children,
      };
    }

    return {
      ...node,
      children: node.children.map(addNode),
    };
  };

  newTree = addNode(newTree);
  return newTree;
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
  // Initial state
  currentLayout: null,
  rootNode: null,
  clipboardNode: null,
  selection: {
    selectedNodeId: null,
    selectedNodes: [],
    hoveredNodeId: null,
  },
  history: [],
  historyIndex: -1,
  isPreviewMode: false,
  selectedDevicePreset: 'phone-android',
  sidebarOpen: true,
  propertiesPanelOpen: true,
  editorViewMode: 'design',
  frameColor: '#475569',
  screenBackground: { type: 'solid', color: '#ffffff' },
  platformComponents: [],
  isDraggingFromLibrary: false,
  draggedComponentType: null,
  dropZoneNodeId: null,
  draggedNodeId: null,
  dropTarget: null,
  dropError: null,
  hoverNodeId: null,

  // Layout actions
  setCurrentLayout: (layout: Layout) => {
    set({ currentLayout: layout, rootNode: layout.rootNode });
  },

  setRootNode: (node: LayoutNode) => {
    set({ rootNode: node });
  },

  // Selection actions
  selectNode: (nodeId: string | null) => {
    set((state) => ({
      selection: {
        ...state.selection,
        selectedNodeId: nodeId,
        selectedNodes: nodeId ? [nodeId] : [],
      },
    }));
  },

  deselectNode: () => {
    set((state) => ({
      selection: {
        ...state.selection,
        selectedNodeId: null,
        selectedNodes: [],
      },
    }));
  },

  // Node manipulation
  updateNode: (nodeId: string, updates: Partial<LayoutNode>) => {
    set((state) => {
      if (!state.rootNode) return state;
      return {
        rootNode: updateNodeInTree(nodeId, updates, state.rootNode),
      };
    });
  },

  deleteNode: (nodeId: string) => {
    set((state) => {
      if (!state.rootNode) return state;
      return {
        rootNode: deleteNodeFromTree(nodeId, state.rootNode),
        selection:
          state.selection.selectedNodeId === nodeId
            ? { ...state.selection, selectedNodeId: null, selectedNodes: [] }
            : state.selection,
      };
    });
  },

  addChildNode: (parentId: string, childNode: LayoutNode) => {
    set((state) => {
      if (!state.rootNode) return state;
      return {
        rootNode: addChildToNode(parentId, childNode, state.rootNode),
      };
    });
  },

  insertNodeAfter: (referenceId: string, newNode: LayoutNode) => {
    set((state) => {
      if (!state.rootNode) return state;

      let inserted = false;
      const insertNode = (node: LayoutNode): LayoutNode => {
        if (inserted) return node;

        const childIndex = node.children.findIndex((child) => child.id === referenceId);
        if (childIndex !== -1) {
          const newChildren = [...node.children];
          newChildren.splice(childIndex + 1, 0, newNode);
          inserted = true;
          return { ...node, children: newChildren };
        }

        return {
          ...node,
          children: node.children.map(insertNode),
        };
      };

      return {
        rootNode: insertNode(state.rootNode),
      };
    });
  },

  moveNode: (nodeId: string, newParentId: string, position?: number) => {
    set((state) => {
      if (!state.rootNode) return state;
      if (nodeId === newParentId) return state; // can't parent to self
      const found = findNodeAndParent(state.rootNode, nodeId);
      if (!found) return state;
      const sameParent = found.parent?.id === newParentId;
      // 1. remove from current location
      let nextTree = deleteNodeFromTree(nodeId, state.rootNode);
      // 2. insert into new parent at index (or append)
      // When moving within the same parent, the removal shifts indices by -1
      // for positions after the removed item, so adjust the target index.
      const insert = (root: LayoutNode): LayoutNode => {
        if (root.id === newParentId) {
          const children = [...root.children];
          let at: number;
          if (typeof position === 'number') {
            let adjusted = position;
            if (sameParent && found.parent) {
              const origIdx = found.parent.children.findIndex((c) => c.id === nodeId);
              if (origIdx < position) adjusted = position - 1;
            }
            at = Math.max(0, Math.min(adjusted, children.length));
          } else {
            at = children.length;
          }
          children.splice(at, 0, found.node);
          return { ...root, children };
        }
        return { ...root, children: root.children.map(insert) };
      };
      nextTree = insert(nextTree);
      return { rootNode: nextTree };
    });
  },

  duplicateNode: (nodeId: string) => {
    set((state) => {
      if (!state.rootNode) return state;
      const found = findNodeAndParent(state.rootNode, nodeId);
      if (!found || !found.parent) return state;
      const clone = cloneNodeDeep(found.node);
      const insert = (root: LayoutNode): LayoutNode => {
        if (root.id === found.parent!.id) {
          const idx = root.children.findIndex((c) => c.id === nodeId);
          const children = [...root.children];
          children.splice(idx + 1, 0, clone);
          return { ...root, children };
        }
        return { ...root, children: root.children.map(insert) };
      };
      return {
        rootNode: insert(state.rootNode),
        selection: { ...state.selection, selectedNodeId: clone.id, selectedNodes: [clone.id] },
      };
    });
  },

  copyNode: (nodeId: string) => {
    set((state) => {
      if (!state.rootNode) return state;
      const found = findNodeAndParent(state.rootNode, nodeId);
      if (!found) return state;
      return { clipboardNode: cloneNodeDeep(found.node) };
    });
  },

  cutNode: (nodeId: string) => {
    const state = get();
    state.copyNode(nodeId);
    state.deleteNode(nodeId);
  },

  pasteNode: (parentId?: string) => {
    set((state) => {
      if (!state.rootNode || !state.clipboardNode) return state;
      const target = parentId ?? state.selection.selectedNodeId ?? state.rootNode.id;
      const fresh = cloneNodeDeep(state.clipboardNode);
      const insert = (root: LayoutNode): LayoutNode => {
        if (root.id === target) {
          return { ...root, children: [...root.children, fresh] };
        }
        return { ...root, children: root.children.map(insert) };
      };
      return {
        rootNode: insert(state.rootNode),
        selection: { ...state.selection, selectedNodeId: fresh.id, selectedNodes: [fresh.id] },
      };
    });
  },

  setNodeHidden: (nodeId: string, hidden: boolean) => {
    set((state) => {
      if (!state.rootNode) return state;
      const nextTree = setNodePropInTree(state.rootNode, nodeId, (n) => ({
        ...n,
        props: { ...n.props, __hidden: hidden },
      }));
      return { rootNode: nextTree };
    });
  },

  setNodeProp: (nodeId: string, key: string, value: unknown) => {
    set((state) => {
      if (!state.rootNode) return state;
      const nextTree = setNodePropInTree(state.rootNode, nodeId, (n) => ({
        ...n,
        props: { ...n.props, [key]: value },
      }));
      return { rootNode: nextTree };
    });
  },

  // Preview and UI state
  setPreviewMode: (enabled: boolean) => {
    set({ isPreviewMode: enabled });
  },

  setSelectedDevicePreset: (preset: string) => {
    set({ selectedDevicePreset: preset });
  },

  setSidebarOpen: (open: boolean) => {
    set({ sidebarOpen: open });
  },

  setPropertiesPanelOpen: (open: boolean) => {
    set({ propertiesPanelOpen: open });
  },

  setEditorViewMode: (editorViewMode) => {
    set({ editorViewMode });
  },

  setFrameColor: (frameColor) => {
    set({ frameColor });
  },

  setScreenBackground: (screenBackground) => {
    set({ screenBackground });
  },

  setPlatformComponents: (components: ComponentDefinition[]) => {
    set({ platformComponents: components });
  },

  // Drag and drop
  setDraggingFromLibrary: (isDragging: boolean, componentType?: string) => {
    set({
      isDraggingFromLibrary: isDragging,
      draggedComponentType: componentType || null,
    });
  },

  setDropZoneNodeId: (nodeId: string | null) => {
    set({ dropZoneNodeId: nodeId });
  },

  setDraggedNodeId: (id: string | null) => {
    set({ draggedNodeId: id });
  },

  setDropTarget: (t: { parentId: string; index: number } | null) => {
    set({ dropTarget: t });
  },

  setDropError: (e: string | null) => {
    set({ dropError: e });
  },

  setHoverNodeId: (id: string | null) => {
    set({ hoverNodeId: id });
  },

  // History management
  pushHistory: (action: string) => {
    set((state) => {
      if (!state.currentLayout || !state.rootNode) return state;

      const newHistory = state.history.slice(0, state.historyIndex + 1);
      const entry: HistoryEntry = {
        layout: { ...state.currentLayout, rootNode: cloneNode(state.rootNode) },
        timestamp: new Date(),
        action,
      };

      return {
        history: [...newHistory, entry],
        historyIndex: newHistory.length,
      };
    });
  },

  undo: () => {
    set((state) => {
      if (state.historyIndex <= 0) return state;

      const newIndex = state.historyIndex - 1;
      const entry = state.history[newIndex];

      return {
        currentLayout: entry.layout,
        rootNode: cloneNode(entry.layout.rootNode),
        historyIndex: newIndex,
        selection: { selectedNodeId: null, selectedNodes: [], hoveredNodeId: null },
      };
    });
  },

  redo: () => {
    set((state) => {
      if (state.historyIndex >= state.history.length - 1) return state;

      const newIndex = state.historyIndex + 1;
      const entry = state.history[newIndex];

      return {
        currentLayout: entry.layout,
        rootNode: cloneNode(entry.layout.rootNode),
        historyIndex: newIndex,
        selection: { selectedNodeId: null, selectedNodes: [], hoveredNodeId: null },
      };
    });
  },

  clearHistory: () => {
    set({ history: [], historyIndex: -1 });
  },

  // Multi-selection
  addToSelection: (nodeId: string) => {
    set((state) => {
      const newSelectedNodes = Array.from(new Set([...state.selection.selectedNodes, nodeId]));
      return {
        selection: {
          ...state.selection,
          selectedNodeId: nodeId,
          selectedNodes: newSelectedNodes,
        },
      };
    });
  },

  removeFromSelection: (nodeId: string) => {
    set((state) => {
      const newSelectedNodes = state.selection.selectedNodes.filter((id) => id !== nodeId);
      return {
        selection: {
          ...state.selection,
          selectedNodeId: newSelectedNodes.length > 0 ? newSelectedNodes[0] : null,
          selectedNodes: newSelectedNodes,
        },
      };
    });
  },

  toggleSelection: (nodeId: string) => {
    set((state) => {
      const isSelected = state.selection.selectedNodes.includes(nodeId);
      if (isSelected) {
        return get().removeFromSelection(nodeId);
      } else {
        return get().addToSelection(nodeId);
      }
    });
  },

  clearSelection: () => {
    set({
      selection: {
        selectedNodeId: null,
        selectedNodes: [],
        hoveredNodeId: null,
      },
    });
  },

  // Utility functions
  findNode: (nodeId: string) => {
    const state = get();
    return state.rootNode ? findNodeInTree(nodeId, state.rootNode) : null;
  },

  findNodePath: (nodeId: string) => {
    const state = get();
    return state.rootNode ? findNodePath(nodeId, state.rootNode) : [];
  },
}));
