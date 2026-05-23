'use client';

import { useEffect, useState } from 'react';
import { useBuilderStore } from '@/store/builderStore';
import { Toolbar } from './Toolbar';
import { ComponentLibrary } from './ComponentLibrary';
import { LayersPanel } from './LayersPanel';
import { Canvas } from './Canvas';
import { PropertiesPanel } from './PropertiesPanel';
import { CodeView } from './CodeView';
import { cn } from '@/lib/utils';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

interface DbLayout {
  id: string;
  name: string;
  screenName: string | null;
  isPublished: boolean;
  version: number;
  // optional full fields — present when coming from EditorPage
  projectId?: string;
  rootNode?: Record<string, unknown>;
  sduiJson?: Record<string, unknown> | null;
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface Project {
  id: string;
  name: string;
  apiKey: string;
  status: string;
}

interface EditorLayoutProps {
  project?: Project | null;
  allLayouts?: DbLayout[];
  activeLayoutId?: string | null;
  onSwitchLayout?: (layout: DbLayout) => void;
  onAddScreen?: (name: string) => void;
}

export function EditorLayout({
  project,
  allLayouts = [],
  activeLayoutId,
  onSwitchLayout,
  onAddScreen,
}: EditorLayoutProps) {
  const [leftTab, setLeftTab] = useState<'components' | 'layers'>('components');
  const sidebarOpen = useBuilderStore((state) => state.sidebarOpen);
  const propertiesPanelOpen = useBuilderStore((state) => state.propertiesPanelOpen);
  const editorViewMode = useBuilderStore((state) => state.editorViewMode);
  const undo = useBuilderStore((state) => state.undo);
  const redo = useBuilderStore((state) => state.redo);
  const historyIndex = useBuilderStore((state) => state.historyIndex);
  const historyLength = useBuilderStore((state) => state.history.length);

  // ── Keyboard shortcuts ──────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Skip when focus is inside Monaco editor or a textarea/input
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      const isEditableTarget =
        tag === 'textarea' ||
        tag === 'input' ||
        (e.target as HTMLElement)?.isContentEditable;
      if (isEditableTarget) return;
      // Monaco editor has class "monaco-editor"
      if ((e.target as HTMLElement)?.closest?.('.monaco-editor')) return;

      const meta = e.metaKey || e.ctrlKey;

      // Delete / Backspace — delete the selected node (no meta key required)
      if (!meta && (e.key === 'Delete' || e.key === 'Backspace')) {
        const state = useBuilderStore.getState();
        const selectedId = state.selection.selectedNodeId;
        const rootId = state.rootNode?.id;
        // Don't delete the root or the screen container (first child of root)
        const isScreenContainer = state.rootNode?.children?.[0]?.id === selectedId;
        if (selectedId && selectedId !== rootId && !isScreenContainer) {
          e.preventDefault();
          state.deleteNode(selectedId);
        }
        return;
      }

      // Escape — clear selection
      if (!meta && e.key === 'Escape') {
        useBuilderStore.getState().selectNode(null);
        return;
      }

      if (!meta) return;

      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (historyIndex > 0) undo();
      } else if (e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        if (historyIndex < historyLength - 1) redo();
      } else if (e.key === 'y') {
        // Ctrl+Y as alternative redo (Windows convention)
        e.preventDefault();
        if (historyIndex < historyLength - 1) redo();
      } else if (e.key === 'd') {
        // Cmd/Ctrl+D — duplicate selected node (Figma convention)
        const state = useBuilderStore.getState();
        const selectedId = state.selection.selectedNodeId;
        const rootId = state.rootNode?.id;
        const isScreenContainer = state.rootNode?.children?.[0]?.id === selectedId;
        if (selectedId && selectedId !== rootId && !isScreenContainer && typeof (state as any).duplicateNode === 'function') {
          e.preventDefault();
          (state as any).duplicateNode(selectedId);
        }
      } else if (e.key === 'c') {
        // Cmd/Ctrl+C — copy selected node
        const state = useBuilderStore.getState();
        const selectedId = state.selection.selectedNodeId;
        const rootId = state.rootNode?.id;
        const isScreenContainer = state.rootNode?.children?.[0]?.id === selectedId;
        if (selectedId && selectedId !== rootId && !isScreenContainer) {
          e.preventDefault();
          state.copyNode(selectedId);
        }
      } else if (e.key === 'x') {
        // Cmd/Ctrl+X — cut
        const state = useBuilderStore.getState();
        const selectedId = state.selection.selectedNodeId;
        const rootId = state.rootNode?.id;
        const isScreenContainer = state.rootNode?.children?.[0]?.id === selectedId;
        if (selectedId && selectedId !== rootId && !isScreenContainer) {
          e.preventDefault();
          state.cutNode(selectedId);
        }
      } else if (e.key === 'v') {
        // Cmd/Ctrl+V — paste clipboard into selected container (or root)
        const state = useBuilderStore.getState();
        if (state.clipboardNode) {
          e.preventDefault();
          // If selected is a container-like node, paste into it; otherwise paste as sibling
          const selectedId = state.selection.selectedNodeId;
          state.pasteNode(selectedId ?? undefined);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo, historyIndex, historyLength]);

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <Toolbar project={project} />

      {editorViewMode === 'code' ? (
        <div className="flex-1 flex overflow-hidden">
          <CodeView
            allLayouts={allLayouts}
            activeLayoutId={activeLayoutId}
            onSwitchLayout={onSwitchLayout}
            onAddScreen={onAddScreen}
          />
        </div>
      ) : (
        <PanelGroup direction="horizontal" className="flex-1 overflow-hidden">
          {sidebarOpen && (
            <>
              <Panel defaultSize={20} minSize={15} maxSize={30} className="bg-card flex flex-col overflow-hidden border-r border-border">
                {/* Tab bar */}
                <div className="flex shrink-0 border-b border-border">
                  <button
                    type="button"
                    onClick={() => setLeftTab('components')}
                    className={cn(
                      'flex-1 py-2 text-xs font-medium transition-colors',
                      leftTab === 'components'
                        ? 'text-primary border-b-2 border-primary bg-primary/5'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    Components
                  </button>
                  <button
                    type="button"
                    onClick={() => setLeftTab('layers')}
                    className={cn(
                      'flex-1 py-2 text-xs font-medium transition-colors',
                      leftTab === 'layers'
                        ? 'text-primary border-b-2 border-primary bg-primary/5'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    Layers
                  </button>
                </div>
                {/* Tab content */}
                <div className="flex-1 overflow-y-auto">
                  {leftTab === 'components' ? <ComponentLibrary /> : <LayersPanel />}
                </div>
              </Panel>
              <PanelResizeHandle className="w-1 bg-transparent hover:bg-primary/50 active:bg-primary transition-colors cursor-col-resize z-10" />
            </>
          )}
          
          <Panel className="flex flex-col overflow-hidden">
            <Canvas />
          </Panel>

          {propertiesPanelOpen && (
            <>
              <PanelResizeHandle className="w-1 bg-transparent hover:bg-primary/50 active:bg-primary transition-colors cursor-col-resize z-10" />
              <Panel defaultSize={25} minSize={20} maxSize={40} className="bg-card overflow-y-auto border-l border-border">
                <PropertiesPanel />
              </Panel>
            </>
          )}
        </PanelGroup>
      )}
    </div>
  );
}
