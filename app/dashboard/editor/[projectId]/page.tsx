'use client';

import { useEffect, use, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { EditorLayout } from '@/components/builder/EditorLayout';
import { useBuilderStore } from '@/store/builderStore';
import { nanoid } from 'nanoid';
import { apiRequest } from '@/lib/api-client';
import { Loader2, AlertCircle } from 'lucide-react';
import { DEFAULT_REXA_JSON } from '@/lib/rexa/defaultLayout';
import type { Layout, LayoutNode } from '@/types';

interface DbLayout {
  id: string;
  projectId: string;
  name: string;
  screenName: string | null;
  rootNode: Record<string, unknown>;
  rexaJson: Record<string, unknown> | null;
  version: number;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Project {
  id: string;
  name: string;
  apiKey: string;
  status: string;
}

function buildDefaultRootNode(): LayoutNode {
  return {
    id: nanoid(),
    componentType: 'VStack',
    props: { gap: '16', padding: '16', width: '100%', height: '100%' },
    children: [
      {
        id: nanoid(),
        componentType: 'Text',
        props: { text: 'Welcome to REXA', fontSize: 32, fontWeight: 'bold', color: '#000000' },
        children: [],
      },
      {
        id: nanoid(),
        componentType: 'Text',
        props: { text: 'Start building your UI', fontSize: 16, color: '#666666' },
        children: [],
      },
      {
        id: nanoid(),
        componentType: 'Button',
        props: { label: 'Get Started', variant: 'primary', size: 'md' },
        children: [],
      },
    ],
  };
}

function dbLayoutToStoreLayout(db: DbLayout): Layout {
  return {
    id: db.id,
    projectId: db.projectId,
    name: db.name,
    rootNode: db.rootNode as unknown as LayoutNode,
    version: db.version,
    createdAt: new Date(db.createdAt),
    updatedAt: new Date(db.updatedAt),
  };
}

export default function EditorPage({ params }: { params: Promise<{ projectId: string }> }) {
  const resolvedParams = use(params);
  const { projectId } = resolvedParams;

  const router = useRouter();
  const setCurrentLayout = useBuilderStore((state) => state.setCurrentLayout);
  const clearSelection = useBuilderStore((state) => state.clearSelection);
  const clearHistory = useBuilderStore((state) => state.clearHistory);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [allLayouts, setAllLayouts] = useState<DbLayout[]>([]);
  const [activeLayoutId, setActiveLayoutId] = useState<string | null>(null);

  const loadProject = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch project details
      const projectRes = await apiRequest<{ project: Project }>(`/projects/${projectId}`);
      if (!projectRes.success) {
        setError(projectRes.message || 'Project not found');
        setLoading(false);
        return;
      }
      setProject(projectRes.data.project);

      // Fetch all layouts for this project
      const layoutsRes = await apiRequest<{ layouts: DbLayout[] }>(
        `/projects/${projectId}/layouts`
      );

      let layouts: DbLayout[] = [];

      if (layoutsRes.success && layoutsRes.data.layouts.length > 0) {
        layouts = layoutsRes.data.layouts;
      } else {
        // No layouts yet → create the first one
        const createRes = await apiRequest<{ layout: DbLayout }>(
          `/projects/${projectId}/layouts`,
          {
            method: 'POST',
            body: JSON.stringify({
              name: 'Home Screen',
              screenName: 'home',
              rootNode: buildDefaultRootNode(),
              rexaJson: JSON.parse(DEFAULT_REXA_JSON),
            }),
          }
        );

        if (createRes.success) {
          layouts = [createRes.data.layout];
        } else {
          // If creation failed due to duplicate, try to load existing layouts again
          if (createRes.error === 'DUPLICATE_LAYOUT_NAME' || createRes.error === 'DUPLICATE_SCREEN_NAME') {
            const retryRes = await apiRequest<{ layouts: DbLayout[] }>(
              `/projects/${projectId}/layouts`
            );
            if (retryRes.success && retryRes.data.layouts.length > 0) {
              layouts = retryRes.data.layouts;
            } else {
              setError(createRes.message || 'Failed to initialize layout');
              setLoading(false);
              return;
            }
          } else {
            setError(createRes.message || 'Failed to initialize layout');
            setLoading(false);
            return;
          }
        }
      }

      setAllLayouts(layouts);
      const first = layouts[0];
      setActiveLayoutId(first.id);
      setCurrentLayout(dbLayoutToStoreLayout(first));
    } catch (err) {
      console.error('Editor load error:', err);
      setError('Failed to load editor');
    } finally {
      setLoading(false);
    }
  }, [projectId, setCurrentLayout]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  const switchLayout = useCallback(
    (layout: DbLayout) => {
      setActiveLayoutId(layout.id);
      const storeLayout = dbLayoutToStoreLayout(layout);
      setCurrentLayout(storeLayout);
      // Clear selection and history when switching layouts
      clearSelection();
      clearHistory();
    },
    [setCurrentLayout, clearSelection, clearHistory]
  );

  const addNewScreen = useCallback(
    async (name: string) => {
      const screenName = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
      const createRes = await apiRequest<{ layout: DbLayout }>(
        `/projects/${projectId}/layouts`,
        {
          method: 'POST',
          body: JSON.stringify({
            name,
            screenName,
            rootNode: buildDefaultRootNode(),
            rexaJson: JSON.parse(DEFAULT_REXA_JSON),
          }),
        }
      );

      if (createRes.success) {
        const newLayout = createRes.data.layout;
        setAllLayouts((prev) => [newLayout, ...prev]);
        switchLayout(newLayout);
      } else {
        // Show error to user
        console.error('Failed to create layout:', createRes.message);
        alert(`Failed to create layout: ${createRes.message || 'Unknown error'}`);
      }
    },
    [projectId, switchLayout]
  );

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Loading editor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <h2 className="text-xl font-semibold">Failed to load editor</h2>
          <p className="text-muted-foreground text-sm">{error}</p>
          <div className="flex gap-3">
            <button
              onClick={loadProject}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition"
            >
              Retry
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <EditorLayout
      project={project}
      allLayouts={allLayouts}
      activeLayoutId={activeLayoutId}
      onSwitchLayout={switchLayout}
      onAddScreen={addNewScreen}
    />
  );
}
