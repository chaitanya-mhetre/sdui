'use client';

import { ComponentDefinition } from '@/types';
import { useBuilderStore } from '@/store/builderStore';
import { getComponentDefinition } from '@/lib/componentRegistry';
import { nanoid } from 'nanoid';
import * as LucideIcons from 'lucide-react';

interface LibraryItemProps {
  component: ComponentDefinition;
}

export function LibraryItem({ component }: LibraryItemProps) {
  const setDraggingFromLibrary = useBuilderStore((state) => state.setDraggingFromLibrary);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    setDraggingFromLibrary(true, component.id);
    // Store component type in drag data
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('componentType', component.id);
  };

  const handleDragEnd = () => {
    setDraggingFromLibrary(false);
  };

  // Get icon from Lucide
  const IconComponent =
    LucideIcons[component.icon as keyof typeof LucideIcons] || LucideIcons.Square;

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-accent hover:text-accent-foreground cursor-move transition text-sm text-muted-foreground hover:text-foreground"
    >
      <IconComponent className="w-4 h-4 flex-shrink-0" />
      <span className="truncate">{component.name}</span>
    </div>
  );
}
