'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useBuilderStore } from '@/store/builderStore';
import { PreviewCanvas } from './PreviewCanvas';
import { layoutToCode, codeToLayout } from '@/lib/layoutCode';
import { parseLayout } from '@/lib/rexa/layoutParser';
import { apiRequest } from '@/lib/api-client';
import { FileJson, Plus, CheckCircle2, Circle, AlertCircle } from 'lucide-react';

// Lazy-load Monaco editor to avoid SSR issues
const MonacoEditor = dynamic(
  () => import('@monaco-editor/react').then((m) => m.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
        Loading editor...
      </div>
    ),
  }
);

const DEBOUNCE_MS = 400;

interface DbLayout {
  id: string;
  name: string;
  screenName: string | null;
  isPublished: boolean;
  version: number;
  projectId?: string;
  rootNode?: Record<string, unknown>;
  rexaJson?: Record<string, unknown> | null;
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface CodeViewProps {
  allLayouts?: DbLayout[];
  activeLayoutId?: string | null;
  onSwitchLayout?: (layout: DbLayout) => void;
  onAddScreen?: (name: string) => void;
}

export function CodeView({
  allLayouts = [],
  activeLayoutId,
  onSwitchLayout,
  onAddScreen,
}: CodeViewProps) {
  const rootNode = useBuilderStore((state) => state.rootNode);
  const setRootNode = useBuilderStore((state) => state.setRootNode);
  const platformComponents = useBuilderStore((state) => state.platformComponents);
  const currentLayout = useBuilderStore((state) => state.currentLayout);

  const [code, setCode] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);
  const [layoutJson, setLayoutJson] = useState<string>('');
  const [addingScreen, setAddingScreen] = useState(false);
  const [newScreenName, setNewScreenName] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevLayoutIdRef = useRef<string | null | undefined>(activeLayoutId);

  // Helper to detect if JSON is REXA format (has body/appBar) vs builder format (has children)
  const isRexaFormat = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (typeof parsed !== 'object' || Array.isArray(parsed)) return false;
      // REXA format has body, appBar, or other scaffold slots
      return 'body' in parsed || 'appBar' in parsed || 'floatingActionButton' in parsed || 'bottomNavigation' in parsed;
    } catch {
      return false;
    }
  };

  // When Code tab opens (code empty) or user switches screen: sync code from rootNode or rexaJson
  useEffect(() => {
    if (prevLayoutIdRef.current !== activeLayoutId || code === '') {
      prevLayoutIdRef.current = activeLayoutId;
      // Check if we have rexaJson in the layout
      const currentLayoutData = allLayouts.find((l) => l.id === activeLayoutId) || 
        (currentLayout && { rexaJson: currentLayout.rexaJson });
      
      if (currentLayoutData?.rexaJson) {
        // Use REXA JSON if available
        const rexaCode = JSON.stringify(currentLayoutData.rexaJson, null, 2);
        setCode(rexaCode);
        setLayoutJson(rexaCode);
        setParseError(null);
      } else if (rootNode) {
        // Fall back to builder format
        setCode(layoutToCode(rootNode));
        setLayoutJson('');
        setParseError(null);
      }
    }
  }, [activeLayoutId, rootNode, code, allLayouts, currentLayout]);

  const handleCodeChange = (value: string | undefined) => {
    const v = value ?? '';
    setCode(v);
    try {
      if (v.trim()) {
        JSON.parse(v);
        setParseError(null);
      }
    } catch (e) {
      setParseError((e as Error).message);
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      
      if (!v.trim()) {
        setLayoutJson('');
        return;
      }

      // Check if it's REXA format
      if (isRexaFormat(v)) {
        // Validate REXA format
        const result = parseLayout(v);
        if (result.success) {
          setLayoutJson(v);
          setParseError(null);
          // Auto-save rexaJson to layout and update store
          if (currentLayout?.id) {
            const rexaJson = JSON.parse(v);
            apiRequest(`/layouts/${currentLayout.id}`, {
              method: 'PATCH',
              body: JSON.stringify({ rexaJson }),
            })
              .then(() => {
                // Update store with new rexaJson
                if (currentLayout) {
                  const updatedLayout = { ...currentLayout, rexaJson };
                  useBuilderStore.getState().setCurrentLayout(updatedLayout);
                }
              })
              .catch((err) => {
                console.error('Failed to auto-save rexaJson:', err);
              });
          }
        } else {
          setParseError(result.error);
          setLayoutJson('');
        }
      } else {
        // Builder format - convert to rootNode
        const parsed = codeToLayout(v);
        if (parsed) {
          setRootNode(parsed);
          setLayoutJson('');
          setParseError(null);
        } else {
          setParseError('Failed to parse layout');
          setLayoutJson('');
        }
      }
    }, DEBOUNCE_MS);
  };

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    []
  );

  const handleAddScreen = async () => {
    if (!newScreenName.trim() || !onAddScreen) return;
    await onAddScreen(newScreenName.trim());
    setNewScreenName('');
    setAddingScreen(false);
  };

  // Compose screens list
  const screens: DbLayout[] =
    allLayouts.length > 0
      ? allLayouts
      : currentLayout
      ? [
          {
            id: currentLayout.id,
            name: currentLayout.name,
            screenName: null,
            isPublished: false,
            version: currentLayout.version,
          },
        ]
      : [];

  const activeId = activeLayoutId ?? currentLayout?.id;

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left — Screens list */}
      <div className="w-56 border-r border-border bg-card flex flex-col">
        <div className="p-3 border-b border-border flex items-center justify-between">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Screens ({screens.length})
          </h3>
          {onAddScreen && (
            <button
              type="button"
              title="Add screen"
              onClick={() => setAddingScreen(true)}
              className="p-1 rounded hover:bg-muted transition text-muted-foreground hover:text-foreground"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <ul className="flex-1 overflow-y-auto p-2 space-y-1">
          {screens.map((screen) => {
            const isActive = screen.id === activeId;
            return (
              <li key={screen.id}>
                <button
                  type="button"
                  onClick={() => onSwitchLayout?.(screen)}
                  className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition ${
                    isActive
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'text-foreground hover:bg-muted border border-transparent'
                  }`}
                >
                  <FileJson className="w-4 h-4 shrink-0" />
                  <span className="truncate flex-1">{screen.name}</span>
                  {screen.isPublished ? (
                    <CheckCircle2
                      className="w-3.5 h-3.5 shrink-0 text-green-500"
                      aria-label="Published"
                    />
                  ) : (
                    <Circle
                      className="w-3.5 h-3.5 shrink-0 text-muted-foreground/40"
                      aria-label="Draft"
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        {/* Add new screen inline form */}
        {addingScreen && (
          <div className="p-2 border-t border-border space-y-2">
            <input
              autoFocus
              type="text"
              placeholder="Screen name..."
              value={newScreenName}
              onChange={(e) => setNewScreenName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddScreen();
                if (e.key === 'Escape') {
                  setAddingScreen(false);
                  setNewScreenName('');
                }
              }}
              className="w-full text-xs px-2 py-1.5 rounded border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <div className="flex gap-1">
              <button
                type="button"
                onClick={handleAddScreen}
                className="flex-1 text-xs py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setAddingScreen(false);
                  setNewScreenName('');
                }}
                className="flex-1 text-xs py-1 rounded border border-border hover:bg-muted transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Center — Monaco JSON editor */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-border">
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
          <span className="text-sm font-medium text-muted-foreground">
            {currentLayout?.name || 'Screen'}.json
          </span>
          <div className="flex items-center gap-2">
            {parseError && (
              <span className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="w-3.5 h-3.5" />
                Invalid JSON
              </span>
            )}
            <span className="text-xs text-muted-foreground">REXA · Flutter-compatible</span>
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <MonacoEditor
            height="100%"
            language="json"
            value={code}
            onChange={handleCodeChange}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              formatOnPaste: true,
              formatOnType: false,
              tabSize: 2,
              automaticLayout: true,
              padding: { top: 12, bottom: 12 },
              folding: true,
              bracketPairColorization: { enabled: true },
            }}
          />
        </div>
      </div>

      {/* Right — Live device preview */}
      <div className="w-[400px] shrink-0 flex flex-col border-l border-border bg-muted/20">
        <div className="px-4 py-2 border-b border-border">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Preview
          </h3>
        </div>
        <div className="flex-1 flex items-center justify-center min-h-0 p-4 overflow-auto">
          <PreviewCanvas
            rootNode={layoutJson ? null : rootNode}
            layoutJson={layoutJson}
            platformComponents={platformComponents}
            className="shrink-0"
          />
        </div>
      </div>
    </div>
  );
}
