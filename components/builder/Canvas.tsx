'use client';

import { useState, useRef, useEffect } from 'react';
import { useBuilderStore } from '@/store/builderStore';
import { LayoutRenderer } from '@/lib/renderer';
import { getComponentDefinition } from '@/lib/componentRegistry';
import { getDevicePreset } from '@/lib/devicePresets';
import { nanoid } from 'nanoid';
import type { LayoutNode } from '@/types';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { DeviceFrame } from './DeviceFrame';
import { validateDrop } from '@/lib/flutterRules';

export function Canvas() {
  const [zoom, setZoom] = useState(1);
  
  const rootNode = useBuilderStore((state) => state.rootNode);
  const selectedNodeId = useBuilderStore((state) => state.selection.selectedNodeId);
  const isPreviewMode = useBuilderStore((state) => state.isPreviewMode);
  const isDraggingFromLibrary = useBuilderStore((state) => state.isDraggingFromLibrary);
  const draggedComponentType = useBuilderStore((state) => state.draggedComponentType);
  const dropZoneNodeId = useBuilderStore((state) => state.dropZoneNodeId);

  const selectNode = useBuilderStore((state) => state.selectNode);
  const addChildNode = useBuilderStore((state) => state.addChildNode);
  const setDropZoneNodeId = useBuilderStore((state) => state.setDropZoneNodeId);
  const platformComponents = useBuilderStore((state) => state.platformComponents);
  const selectedDevicePreset = useBuilderStore((state) => state.selectedDevicePreset);
  const screenBackground = useBuilderStore((state) => state.screenBackground);
  const frameColor = useBuilderStore((state) => state.frameColor);
  const { toast } = useToast();

  const devicePreset = getDevicePreset(selectedDevicePreset);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const deviceWidth = devicePreset?.width ?? 360;
  const deviceHeight = devicePreset?.height ?? 640;
  const bezel = devicePreset?.type === 'tablet' ? 28 : 20;
  const frameWidth = deviceWidth + bezel;
  const frameHeight = deviceHeight + bezel;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setContainerSize({ width: el.clientWidth, height: el.clientHeight });
    });
    ro.observe(el);
    setContainerSize({ width: el.clientWidth, height: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  // Fit device frame (with bezel) in canvas; then apply user zoom
  const fitScale =
    containerSize.width > 0 && containerSize.height > 0
      ? Math.min(containerSize.width / frameWidth, containerSize.height / frameHeight, 1.2)
      : 1;
  const effectiveScale = fitScale * zoom;

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (isPreviewMode) return;
    // Click on canvas itself deselects
    if (e.target === e.currentTarget) {
      selectNode(null);
    }
  };

  const handleNodeClick = (nodeId: string) => {
    if (isPreviewMode) return;
    // Clicking root or the screen container (Scaffold) = select "entire screen" so user can change page background
    const isRoot = nodeId === rootNode?.id;
    const isScreenContainer = rootNode?.children?.[0]?.id === nodeId;
    if (isRoot || isScreenContainer) {
      selectNode(null);
      return;
    }
    selectNode(nodeId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();

    if (!isDraggingFromLibrary || !draggedComponentType || !rootNode) return;

    const componentDef =
      getComponentDefinition(draggedComponentType) ??
      platformComponents.find((p) => p.id === draggedComponentType) ??
      platformComponents.find((p) => p.name === draggedComponentType);
    if (!componentDef) return;

    const parentId = selectedNodeId ?? rootNode.id;
    const rule = validateDrop(parentId, rootNode, componentDef, getComponentDefinition, platformComponents);
    if (!rule.allowed) {
      toast({
        title: rule.title,
        description: rule.description,
        variant: 'destructive',
      });
      return;
    }

    const newNode: LayoutNode = {
      id: nanoid(),
      componentType: draggedComponentType,
      props: { ...(componentDef.defaultProps || {}) },
      children: [],
    };

    addChildNode(parentId, newNode);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget === e.target) {
      setDropZoneNodeId(null);
    }
  };

  if (!rootNode) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.1, 2));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.1, 0.5));
  const handleZoomReset = () => setZoom(1);

  return (
    <div
      ref={containerRef}
      className="flex-1 min-h-0 overflow-hidden flex items-center justify-center relative"
      onClick={handleCanvasClick}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragLeave={handleDragLeave}
    >
      {/* Zoom Controls */}
      <motion.div
        className="absolute bottom-4 right-4 flex items-center gap-2 bg-card border border-border rounded-lg shadow-lg p-2 z-50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Button
          size="icon"
          variant="ghost"
          onClick={handleZoomOut}
          className="h-9 w-9"
          disabled={zoom <= 0.5}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className="w-12 text-center text-sm font-medium text-muted-foreground">
          {Math.round(zoom * 100)}%
        </span>
        <Button
          size="icon"
          variant="ghost"
          onClick={handleZoomIn}
          className="h-9 w-9"
          disabled={zoom >= 2}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
      </motion.div>

      {/* Device centered, fit to available height/width - no scroll */}
      <div
        className="relative flex flex-col items-center shrink-0"
        style={{
          width: frameWidth * effectiveScale,
          height: frameHeight * effectiveScale + 24,
        }}
      >
        <div
          className="absolute left-1/2 top-0 flex flex-col items-center"
          style={{
            width: frameWidth,
            height: frameHeight,
            transform: `translateX(-50%) scale(${effectiveScale})`,
            transformOrigin: 'top center',
          }}
        >
          <DeviceFrame preset={devicePreset} className="w-full h-full flex flex-col" frameColor={frameColor} screenBackground={screenBackground}>
            {isPreviewMode ? (
              <LayoutRenderer
                node={rootNode}
                isInteractive={false}
                selectedNodeId={selectedNodeId}
                platformComponents={platformComponents}
              />
            ) : (
              <LayoutRenderer
                node={rootNode}
                isInteractive={true}
                onNodeClick={handleNodeClick}
                selectedNodeId={selectedNodeId}
                platformComponents={platformComponents}
              />
            )}
          </DeviceFrame>
        </div>
        <p className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xs text-muted-foreground whitespace-nowrap">
          {devicePreset?.label ?? 'Phone (Android)'} · {deviceWidth}×{deviceHeight}
        </p>
      </div>
    </div>
  );
}
