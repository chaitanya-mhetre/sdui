'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useBuilderStore } from '@/store/builderStore';
import { DeviceSelector } from './DeviceSelector';
import { apiRequest } from '@/lib/api-client';
import { builderRootToSduiJson } from '@/lib/builderToSdui';
import { validateSduiJson } from '@/lib/sdui/validation';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Download,
  Send,
  Save,
  Undo2,
  Redo2,
  LayoutPanelTop,
  Code2,
  Loader2,
  CheckCircle2,
  Copy,
  Check,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Project {
  id: string;
  name: string;
  apiKey: string;
  status: string;
}

interface ToolbarProps {
  project?: Project | null;
}

export function Toolbar({ project }: ToolbarProps) {
  const currentLayout = useBuilderStore((state) => state.currentLayout);
  const rootNode = useBuilderStore((state) => state.rootNode);
  const isPreviewMode = useBuilderStore((state) => state.isPreviewMode);
  const setPreviewMode = useBuilderStore((state) => state.setPreviewMode);
  const editorViewMode = useBuilderStore((state) => state.editorViewMode);
  const setEditorViewMode = useBuilderStore((state) => state.setEditorViewMode);
  const undo = useBuilderStore((state) => state.undo);
  const redo = useBuilderStore((state) => state.redo);
  const historyIndex = useBuilderStore((state) => state.historyIndex);
  const history = useBuilderStore((state) => state.history);

  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string>('');
  const [publishedVersion, setPublishedVersion] = useState<number | null>(null);
  const [urlCopied, setUrlCopied] = useState(false);

  const layoutId = currentLayout?.id;

  async function handleSave() {
    if (!layoutId || saving) return;
    setSaving(true);
    try {
      const body: Record<string, unknown> = {};
      
      // Save rootNode if available (from Design view)
      if (rootNode) {
        body.rootNode = rootNode;
      }
      
      // Save sduiJson if available (from Code view)
      // This ensures Code view edits are saved when clicking Save button
      if (currentLayout?.sduiJson) {
        let sduiJsonToSave = currentLayout.sduiJson;
        // Ensure it's an object, not a string
        if (typeof sduiJsonToSave === 'string') {
          try {
            sduiJsonToSave = JSON.parse(sduiJsonToSave);
          } catch (e) {
            console.error('Failed to parse sduiJson for save:', e);
          }
        }
        body.sduiJson = sduiJsonToSave;
      }

      const res = await apiRequest(`/layouts/${layoutId}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      });

      if (res.success) {
        setSavedAt(new Date());
        setTimeout(() => setSavedAt(null), 3000);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    if (!layoutId || publishing) return;
    if (!rootNode) {
      alert('Nothing to publish. Add content to the layout first.');
      return;
    }

    // Pre-publish validation: convert builder tree to SDUI and validate (depth, node count, types)
    try {
      const sduiPayload = builderRootToSduiJson(rootNode);
      const validation = validateSduiJson(sduiPayload);
      if (!validation.valid) {
        alert(`Validation failed before publish:\n\n${validation.error}\n\nFix the layout and try again.`);
        return;
      }
      if (validation.warnings.length > 0) {
        const ok = window.confirm(
          `Publish with ${validation.warnings.length} warning(s)?\n\n${validation.warnings.slice(0, 3).join('\n')}${validation.warnings.length > 3 ? '\n...' : ''}`
        );
        if (!ok) return;
      }
    } catch (e) {
      alert('Validation error: ' + (e as Error).message);
      return;
    }

    setPublishing(true);
    try {
      const screenName = currentLayout?.name
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');

      // Prefer sduiJson from currentLayout if available (from Code view), otherwise use rootNode
      const publishBody: { screenName: string; rootNode?: Record<string, unknown>; sduiJson?: Record<string, unknown> } = {
        screenName,
      };

      if (currentLayout?.sduiJson) {
        // If sduiJson exists (from Code view), use it directly
        // Ensure it's an object (Prisma returns it as parsed JSON, but double-check)
        let sduiJsonObj: Record<string, unknown>;
        if (typeof currentLayout.sduiJson === 'string') {
          try {
            sduiJsonObj = JSON.parse(currentLayout.sduiJson);
          } catch (e) {
            console.error('Failed to parse sduiJson string:', e);
            alert('Invalid sduiJson format. Please check your JSON and try again.');
            setPublishing(false);
            return;
          }
        } else if (typeof currentLayout.sduiJson === 'object' && currentLayout.sduiJson !== null && !Array.isArray(currentLayout.sduiJson)) {
          sduiJsonObj = currentLayout.sduiJson as Record<string, unknown>;
        } else {
          console.error('Invalid sduiJson type:', typeof currentLayout.sduiJson);
          alert('Invalid sduiJson format. Please check your JSON and try again.');
          setPublishing(false);
          return;
        }
        
        // Validate it's a proper object before sending
        if (!sduiJsonObj || typeof sduiJsonObj !== 'object' || Array.isArray(sduiJsonObj)) {
          console.error('sduiJson is not a valid object:', sduiJsonObj);
          alert('Invalid sduiJson format. Please check your JSON and try again.');
          setPublishing(false);
          return;
        }
        
        publishBody.sduiJson = sduiJsonObj;
      } else if (rootNode) {
        // Otherwise, use rootNode (from Design view) which will be converted to SDUI on server
        publishBody.rootNode = rootNode;
      } else {
        alert('Nothing to publish. Add content to the layout first.');
        setPublishing(false);
        return;
      }

      const res = await apiRequest<{
        layout: { screenName: string; version: number };
        publicUrl: string;
      }>(`/layouts/${layoutId}/publish`, {
        method: 'POST',
        body: JSON.stringify(publishBody),
      });

      if (res.success) {
        const { layout, publicUrl } = res.data;
        const fullUrl = `${window.location.origin}${publicUrl}?apiKey=${project?.apiKey ?? ''}`;
        setPublishedUrl(fullUrl);
        setPublishedVersion(layout.version);
        setPublishDialogOpen(true);
      } else {
        alert('Failed to publish: ' + (res.message || 'Unknown error'));
      }
    } finally {
      setPublishing(false);
    }
  }

  function handleExport() {
    const data = rootNode ? JSON.stringify(rootNode, null, 2) : null;
    if (!data) return;

    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentLayout?.name ?? 'layout'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleCopyUrl() {
    try {
      await navigator.clipboard.writeText(publishedUrl);
      setUrlCopied(true);
      setTimeout(() => setUrlCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = publishedUrl;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setUrlCopied(true);
        setTimeout(() => setUrlCopied(false), 2000);
      } catch (err) {
        console.error('Fallback copy failed:', err);
      }
      document.body.removeChild(textArea);
    }
  }

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 gap-4">
      {/* Left — Back + project name */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="rounded-lg" title="Back to Dashboard">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <p className="font-semibold text-sm">{project?.name ?? currentLayout?.name ?? 'Untitled'}</p>
          {currentLayout?.name && project?.name && (
            <p className="text-xs text-muted-foreground">{currentLayout.name}</p>
          )}
        </div>
      </div>

      {/* Center — Mode toggle + device + edit controls */}
      <div className="flex items-center gap-4">
        <div className="flex rounded-lg border border-border bg-muted/30 p-0.5">
          <Button
            variant="ghost"
            size="sm"
            className={`rounded-md gap-2 h-8 ${editorViewMode === 'design' ? 'bg-primary/15 text-primary hover:bg-primary/25 hover:text-primary' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}
            onClick={() => setEditorViewMode('design')}
          >
            <LayoutPanelTop className="w-4 h-4" />
            Design
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`rounded-md gap-2 h-8 ${editorViewMode === 'code' ? 'bg-primary/15 text-primary hover:bg-primary/25 hover:text-primary' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}
            onClick={() => setEditorViewMode('code')}
          >
            <Code2 className="w-4 h-4" />
            Code
          </Button>
        </div>
        <div className="h-6 w-px bg-border" />
        <DeviceSelector />
        <div className="h-6 w-px bg-border" />
        <Button
          variant="ghost"
          size="icon"
          className="rounded-lg"
          onClick={() => undo()}
          disabled={historyIndex <= 0}
          title="Undo"
        >
          <Undo2 className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-lg"
          onClick={() => redo()}
          disabled={historyIndex >= history.length - 1}
          title="Redo"
        >
          <Redo2 className="w-5 h-5" />
        </Button>
      </div>

      {/* Right — Actions */}
      <div className="flex items-center gap-2 ml-auto">
        <Button
          variant={isPreviewMode ? 'default' : 'ghost'}
          size="sm"
          className="rounded-lg gap-2"
          onClick={() => setPreviewMode(!isPreviewMode)}
        >
          {isPreviewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {isPreviewMode ? 'Edit' : 'Preview'}
        </Button>

        {/* Save button */}
        <Button
          variant="ghost"
          size="sm"
          className="rounded-lg gap-2"
          title="Save layout to database"
          onClick={handleSave}
          disabled={saving || !layoutId}
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : savedAt ? (
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? 'Saving...' : savedAt ? 'Saved' : 'Save'}
        </Button>

        {/* Export JSON */}
        <Button
          variant="ghost"
          size="icon"
          className="rounded-lg"
          title="Export JSON"
          onClick={handleExport}
          disabled={!layoutId}
        >
          <Download className="w-5 h-5" />
        </Button>

        {/* Publish button */}
        <Button
          size="sm"
          className="rounded-lg gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          title="Publish layout — makes it live for Flutter SDK"
          onClick={handlePublish}
          disabled={publishing || !layoutId}
        >
          {publishing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          {publishing ? 'Publishing...' : 'Publish'}
        </Button>
      </div>

      {/* Publish Success Dialog */}
      <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              Published Successfully!
            </DialogTitle>
            <DialogDescription>
              {publishedVersion && (
                <span className="font-semibold">Published as v{publishedVersion}</span>
              )}
              <br />
              Your layout is now available for the Flutter SDK.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Flutter SDK URL:
              </label>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-md border border-border">
                <code className="flex-1 text-xs font-mono text-foreground break-all">
                  {publishedUrl}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 shrink-0"
                  onClick={handleCopyUrl}
                  title="Copy URL"
                >
                  {urlCopied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
            {urlCopied && (
              <p className="text-xs text-green-500 flex items-center gap-1">
                <Check className="w-3 h-3" />
                URL copied to clipboard!
              </p>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setPublishDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}
