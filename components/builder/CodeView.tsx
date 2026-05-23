'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useBuilderStore } from '@/store/builderStore';
import { PreviewCanvas } from './PreviewCanvas';
import { layoutToCode, codeToLayout } from '@/lib/layoutCode';
import { parseLayout } from '@/lib/sdui/layoutParser';
import { validateSduiJson } from '@/lib/sdui/validation';
import { apiRequest } from '@/lib/api-client';
import { FileJson, Plus, CheckCircle2, Circle, AlertCircle, Save, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { builderRootToSduiJson } from '@/lib/builderToSdui';
import { useTheme } from 'next-themes';

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
  sduiJson?: Record<string, unknown> | null;
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
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const savedCodeRef = useRef<string>('');
  const { resolvedTheme } = useTheme();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevLayoutIdRef = useRef<string | null | undefined>(activeLayoutId);

  // Validate parsed SDUI JSON for structural warnings (depth, node count, etc.)
  const validationResult = useMemo(() => {
    if (!layoutJson?.trim()) return null;
    try {
      const parsed = JSON.parse(layoutJson);
      return validateSduiJson(parsed);
    } catch {
      return null;
    }
  }, [layoutJson]);

  // Helper to detect if JSON is SDUI format (has body/appBar) vs builder format (has children)
  const isSduiFormat = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (typeof parsed !== 'object' || Array.isArray(parsed)) return false;
      // SDUI format has body, appBar, or other scaffold slots
      return 'body' in parsed || 'appBar' in parsed || 'floatingActionButton' in parsed || 'bottomNavigation' in parsed;
    } catch {
      return false;
    }
  };

  // When Code tab opens (code empty) or user switches screen: sync code from LIVE rootNode
  useEffect(() => {
    if (prevLayoutIdRef.current !== activeLayoutId || code === '') {
      prevLayoutIdRef.current = activeLayoutId;

      if (rootNode) {
        // Design view is the source of truth for the session.
        // Convert the LIVE layout tree immediately to SDUI format.
        try {
          // You must import builderRootToSduiJson at the top
          const sduiPayload = builderRootToSduiJson(rootNode);
          const sduiCode = JSON.stringify(sduiPayload, null, 2);
          setCode(sduiCode);
          setLayoutJson(sduiCode);
          setParseError(null);
          savedCodeRef.current = sduiCode;
          setIsDirty(false);
        } catch (e) {
          console.error("Failed to convert rootNode to SDUI JSON", e);
          // Fallback if conversion fails
          const fallback = layoutToCode(rootNode);
          setCode(fallback);
          setLayoutJson('');
          setParseError(null);
          savedCodeRef.current = fallback;
          setIsDirty(false);
        }
      } else {
        setCode('');
        setLayoutJson('');
        savedCodeRef.current = '';
        setIsDirty(false);
      }
    }
  }, [activeLayoutId, rootNode, code]);

  const persistSduiJson = async (v: string) => {
    if (!currentLayout?.id) return;
    try {
      const sduiJson = JSON.parse(v);
      await apiRequest(`/layouts/${currentLayout.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ sduiJson }),
      });
      if (currentLayout) {
        const updatedLayout = { ...currentLayout, sduiJson };
        useBuilderStore.getState().setCurrentLayout(updatedLayout);
      }
      savedCodeRef.current = v;
      setIsDirty(false);
    } catch (err) {
      console.error('Failed to save sduiJson:', err);
    }
  };

  const handleSave = async () => {
    const v = code;
    if (!v.trim() || !currentLayout?.id) return;
    setIsSaving(true);
    try {
      if (isSduiFormat(v)) {
        const result = parseLayout(v);
        if (result.success) {
          await persistSduiJson(v);
        }
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCodeChange = (value: string | undefined) => {
    const v = value ?? '';
    setCode(v);
    setIsDirty(v !== savedCodeRef.current);
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

      // Check if it's SDUI format
      if (isSduiFormat(v)) {
        // Validate SDUI format
        const result = parseLayout(v);
        if (result.success) {
          setLayoutJson(v);
          setParseError(null);
          // Auto-save sduiJson to layout and update store (debounced background save)
          void persistSduiJson(v);
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
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-card">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium">{currentLayout?.name || 'Screen'}.json</span>
            {isDirty && (
              <span
                className="w-1.5 h-1.5 rounded-full bg-yellow-500"
                title="Unsaved changes"
              />
            )}
            {!isDirty && <Check className="w-3 h-3 text-green-500" />}
          </div>
          <div className="flex items-center gap-2">
            {parseError && (
              <span className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="w-3.5 h-3.5" />
                Invalid JSON
              </span>
            )}
            <span className="text-xs text-muted-foreground">SDUI · Flutter-compatible</span>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={handleSave}
              disabled={!isDirty || isSaving || !!parseError}
              title="Save (Cmd+S)"
            >
              <Save className="w-3 h-3 mr-1" />
              {isSaving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <MonacoEditor
            height="100%"
            language="json"
            value={code}
            onChange={handleCodeChange}
            theme={resolvedTheme === 'dark' ? 'vs-dark' : 'light'}
            onMount={(editor, monaco) => {
              // Strict JSON validation — no comments, no extra schemas
              monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
                validate: true,
                allowComments: false,
                schemas: [],
                enableSchemaRequest: false,
              });
              // Cmd+S / Ctrl+S: format then save
              editor.addCommand(
                monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
                () => {
                  editor.getAction('editor.action.formatDocument')?.run();
                  void handleSave();
                }
              );
              editor.focus();
            }}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              wordWrap: 'off',
              formatOnPaste: true,
              formatOnType: false,
              tabSize: 2,
              automaticLayout: true,
              padding: { top: 12, bottom: 12 },
              folding: true,
              bracketPairColorization: { enabled: true },
              glyphMargin: true,
              renderWhitespace: 'none',
              suggest: { showWords: false },
            }}
          />
        </div>

        {parseError && (
          <div className="bg-destructive/10 border-t border-destructive/40 text-destructive text-xs px-3 py-1.5 flex items-start gap-2 shrink-0">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>{parseError}</span>
          </div>
        )}
      </div>

      {/* Right — Live device preview */}
      <div className="w-[400px] shrink-0 flex flex-col border-l border-border bg-muted/20">
        <div className="px-4 py-2 border-b border-border">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Preview
          </h3>
        </div>

        {/* Inline error/warning banners */}
        {parseError && (
          <div className="mx-3 mt-2 flex items-start gap-1.5 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span><strong>JSON error:</strong> {parseError}</span>
          </div>
        )}
        {!parseError && validationResult && !validationResult.valid && (
          <div className="mx-3 mt-2 rounded-md bg-yellow-50 dark:bg-yellow-900/20 px-3 py-2 text-xs text-yellow-700 dark:text-yellow-400">
            <strong>Validation:</strong> {validationResult.error}
          </div>
        )}
        {!parseError && validationResult?.valid && validationResult.warnings.length > 0 && (
          <div className="mx-3 mt-2 rounded-md bg-yellow-50 dark:bg-yellow-900/20 px-3 py-2 text-xs text-yellow-700 dark:text-yellow-400">
            <strong>{validationResult.warnings.length} warning{validationResult.warnings.length > 1 ? 's' : ''}:</strong>{' '}
            {validationResult.warnings.slice(0, 2).join(' · ')}
            {validationResult.warnings.length > 2 && ` · +${validationResult.warnings.length - 2} more`}
          </div>
        )}

        {/* PreviewCanvas fills remaining height; auto-fit + toolbar live inside */}
        <PreviewCanvas
          rootNode={layoutJson ? null : rootNode}
          layoutJson={layoutJson}
          platformComponents={platformComponents}
          fitContainer
        />
      </div>
    </div>
  );
}
