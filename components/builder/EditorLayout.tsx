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

interface DbLayout {
  id: string;
  name: string;
  screenName: string | null;
  isPublished: boolean;
  version: number;
  // optional full fields — present when coming from EditorPage
  projectId?: string;
  rootNode?: Record<string, unknown>;
  rexaJson?: Record<string, unknown> | null;
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
      if (tag === 'textarea' || tag === 'input') return;
      // Monaco editor has class "monaco-editor"
      if ((e.target as HTMLElement)?.closest?.('.monaco-editor')) return;

      const meta = e.metaKey || e.ctrlKey;
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
        <div className="flex-1 flex overflow-hidden">
          {sidebarOpen && (
            <div className="w-64 border-r border-border bg-card flex flex-col overflow-hidden">
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
            </div>
          )}
          <div className="flex-1 flex flex-col overflow-hidden">
            <Canvas />
          </div>
          {propertiesPanelOpen && (
            <div className="w-80 border-l border-border bg-card overflow-y-auto">
              <PropertiesPanel />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
