'use client';

import { Trash2, Copy } from 'lucide-react';
import { useBuilderStore } from '@/store/builderStore';

interface SelectionToolbarProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function SelectionToolbar({ containerRef }: SelectionToolbarProps) {
  const selectedNodeId = useBuilderStore((s) => s.selection.selectedNodeId);
  const rootNode = useBuilderStore((s) => s.rootNode);
  const deleteNode = useBuilderStore((s) => s.deleteNode);
  const duplicateNode = useBuilderStore((s) => s.duplicateNode);

  if (!selectedNodeId) return null;
  // Don't show toolbar on the root or screen container
  if (selectedNodeId === rootNode?.id) return null;
  if (rootNode?.children?.[0]?.id === selectedNodeId) return null;

  return (
    <div
      className="absolute top-2 right-2 z-50 flex gap-1 bg-card border border-border rounded-md shadow-lg p-1 pointer-events-auto"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="p-1.5 rounded hover:bg-muted text-foreground transition-colors"
        onClick={() => duplicateNode(selectedNodeId)}
        title="Duplicate (Cmd+D)"
        aria-label="Duplicate selected"
      >
        <Copy className="w-4 h-4" />
      </button>
      <button
        type="button"
        className="p-1.5 rounded hover:bg-destructive hover:text-destructive-foreground text-destructive transition-colors"
        onClick={() => deleteNode(selectedNodeId)}
        title="Delete (Del)"
        aria-label="Delete selected"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
