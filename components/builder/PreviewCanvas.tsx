'use client';

import { useMemo, useRef, useEffect, useState } from 'react';
import { DeviceFrame } from './DeviceFrame';
import type { ScreenBackground } from './DeviceFrame';
import { SduiLayoutRenderer } from '@/lib/sdui/renderWidget';
import { parseLayout } from '@/lib/sdui/layoutParser';
import { LayoutRenderer } from '@/lib/renderer';
import { useBuilderStore } from '@/store/builderStore';
import { getDevicePreset } from '@/lib/devicePresets';
import { Maximize2, Minimize2, RefreshCw, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { LayoutNode, ComponentDefinition } from '@/types';

interface PreviewCanvasProps {
  /** Builder tree (Design): when set, preview uses LayoutRenderer instead of SDUI */
  rootNode?: LayoutNode | null;
  /** Platform components for LayoutRenderer when using rootNode */
  platformComponents?: ComponentDefinition[];
  /** SDUI JSON string (only used when rootNode is not provided) */
  layoutJson?: string;
  className?: string;
  /** When true the canvas fills its container and auto-scales. */
  fitContainer?: boolean;
  /**
   * Legacy explicit scale override (used by Canvas in-canvas device frame).
   * When provided, ResizeObserver-based auto-fit is skipped.
   */
  effectiveScale?: number;
}

export function PreviewCanvas({
  rootNode,
  platformComponents = [],
  layoutJson = '',
  className = '',
  fitContainer = true,
  effectiveScale,
}: PreviewCanvasProps) {
  const selectedDevicePreset = useBuilderStore((state) => state.selectedDevicePreset);
  const screenBackground = useBuilderStore((state) => state.screenBackground);
  const frameColor = useBuilderStore((state) => state.frameColor);

  const preset = getDevicePreset(selectedDevicePreset);
  const deviceW = preset?.width ?? 360;
  const deviceH = preset?.height ?? 780;
  const bezel = preset?.type === 'tablet' ? 28 : 8;
  const frameW = deviceW + bezel;
  const frameH = deviceH + bezel;

  // Auto-scale: measure the container and compute scale so the full device fits.
  // Skipped when effectiveScale is provided (legacy Canvas path).
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [renderKey, setRenderKey] = useState(0);

  useEffect(() => {
    if (!fitContainer || effectiveScale !== undefined) return;
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setContainerSize({ width: el.clientWidth, height: el.clientHeight });
    });
    ro.observe(el);
    setContainerSize({ width: el.clientWidth, height: el.clientHeight });
    return () => ro.disconnect();
  }, [fitContainer, effectiveScale]);

  // Fit-to-container: 32px padding on each side so the frame never kisses the edges.
  // Never scale UP (cap at 1) in docked mode.
  const padding = 32;
  const availW = Math.max(0, containerSize.width - padding * 2);
  const availH = Math.max(0, containerSize.height - padding * 2);
  const fitScale =
    availW > 0 && availH > 0
      ? Math.min(availW / frameW, availH / frameH, 1)
      : 1;
  // effectiveScale takes precedence when provided (legacy path)
  const scale = effectiveScale !== undefined ? effectiveScale : fitScale;

  // Escape key closes fullscreen
  useEffect(() => {
    if (!isFullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullscreen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isFullscreen]);

  const handleReload = () => setRenderKey((k) => k + 1);
  const handleRestart = () => window.location.reload();

  const sduiParsed = useMemo(() => {
    if (rootNode != null) return { node: null, error: null };
    if (!layoutJson?.trim()) return { node: null, error: null };
    const result = parseLayout(layoutJson);
    if (result.success) return { node: result.node, error: null };
    return { node: null, error: result.error };
  }, [rootNode, layoutJson, renderKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const useBuilderTree = rootNode != null;

  // Platform-matched font family — Roboto for Android, SF Pro for iOS
  const fontFamily =
    preset?.platform === 'iphone'
      ? '-apple-system, "SF Pro Display", "SF Pro Text", sans-serif'
      : '"Roboto", "Google Sans", "Noto Sans", Arial, sans-serif';

  const deviceContent = (
    <>
      {useBuilderTree ? (
        <div
          style={{
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <LayoutRenderer
            node={rootNode}
            isInteractive={false}
            selectedNodeId={null}
            platformComponents={platformComponents}
          />
        </div>
      ) : sduiParsed.error ? (
        <div
          style={{
            padding: 12,
            fontSize: 11,
            color: '#ef4444',
            backgroundColor: 'rgba(239,68,68,0.08)',
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {sduiParsed.error}
        </div>
      ) : sduiParsed.node ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            fontFamily,
            fontSize: 16,
            WebkitFontSmoothing: 'antialiased',
          } as React.CSSProperties}
        >
          <SduiLayoutRenderer node={sduiParsed.node} />
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            fontSize: 12,
            color: '#94a3b8',
          }}
        >
          Write Flutter-style JSON to preview
        </div>
      )}
    </>
  );

  // ----------------------------------------------------------------
  // Legacy path: effectiveScale is explicitly provided — render the
  // old layout (no toolbar, no fullscreen) so Canvas isn't affected.
  // ----------------------------------------------------------------
  if (effectiveScale !== undefined) {
    return (
      <div
        className={`flex flex-col items-center justify-center min-h-0 ${className}`}
      >
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
            width: frameW,
            height: frameH,
            flexShrink: 0,
          }}
        >
          <DeviceFrame
            preset={preset ?? null}
            className="w-full h-full"
            frameColor={frameColor}
            screenBackground={screenBackground}
          >
            {deviceContent}
          </DeviceFrame>
        </div>
        <p
          style={{
            marginTop: Math.max(8, 8 * scale),
            fontSize: 11,
            color: '#94a3b8',
            userSelect: 'none',
          }}
        >
          {preset?.label ?? 'Phone'} · {deviceW}×{deviceH}
          {preset?.dpr ? ` · @${preset.dpr}x` : ''}
        </p>
      </div>
    );
  }

  // ----------------------------------------------------------------
  // Main path: fitContainer mode with toolbar + fullscreen modal
  // ----------------------------------------------------------------
  return (
    <div className={`relative flex-1 min-h-0 overflow-hidden bg-muted/30 ${className}`}>
      {/* Toolbar — top-right corner */}
      <div className="absolute top-2 right-2 z-50 flex gap-1 bg-card border border-border rounded-md shadow-sm p-1">
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7"
          onClick={handleReload}
          title="Reload preview (re-mount rendered tree)"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7"
          onClick={() => setIsFullscreen(true)}
          title="Expand preview"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7"
          onClick={handleRestart}
          title="Restart page (reload from server)"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Docked preview — uses ResizeObserver auto-fit */}
      <div
        ref={containerRef}
        key={renderKey}
        className="w-full h-full flex flex-col items-center justify-center"
      >
        <div
          style={{
            width: frameW,
            height: frameH,
            flexShrink: 0,
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
          }}
        >
          <DeviceFrame
            preset={preset ?? null}
            className="w-full h-full"
            frameColor={frameColor}
            screenBackground={screenBackground}
          >
            {deviceContent}
          </DeviceFrame>
        </div>

        {/* Device label below frame */}
        <p
          style={{
            marginTop: Math.max(8, 8 * scale),
            fontSize: 11,
            color: '#94a3b8',
            userSelect: 'none',
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
          }}
        >
          {preset?.label ?? 'Phone'} · {deviceW}×{deviceH}
          {preset?.dpr ? ` · @${preset.dpr}x` : ''}
        </p>
      </div>

      {/* Fullscreen modal */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center"
          onClick={() => setIsFullscreen(false)}
        >
          {/* Close button */}
          <div className="absolute top-4 right-4 z-10">
            <Button
              size="icon"
              variant="secondary"
              className="h-9 w-9"
              onClick={(e) => {
                e.stopPropagation();
                setIsFullscreen(false);
              }}
              title="Close (Esc)"
            >
              <Minimize2 className="w-4 h-4" />
            </Button>
          </div>

          <FullscreenPreview
            frameW={frameW}
            frameH={frameH}
            deviceW={deviceW}
            deviceH={deviceH}
            preset={preset}
            frameColor={frameColor}
            screenBackground={screenBackground}
            fontFamily={fontFamily}
            useBuilderTree={useBuilderTree}
            rootNode={rootNode}
            platformComponents={platformComponents}
            sduiParsed={sduiParsed}
          />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// FullscreenPreview — isolated component so it can measure its own viewport
// ---------------------------------------------------------------------------
interface FullscreenPreviewProps {
  frameW: number;
  frameH: number;
  deviceW: number;
  deviceH: number;
  preset: ReturnType<typeof getDevicePreset>;
  frameColor: string;
  screenBackground: ScreenBackground;
  fontFamily: string;
  useBuilderTree: boolean;
  rootNode: LayoutNode | null | undefined;
  platformComponents: ComponentDefinition[];
  sduiParsed: { node: unknown; error: string | null };
}

function FullscreenPreview({
  frameW,
  frameH,
  deviceW,
  deviceH,
  preset,
  frameColor,
  screenBackground,
  fontFamily,
  useBuilderTree,
  rootNode,
  platformComponents,
  sduiParsed,
}: FullscreenPreviewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setSize({ width: el.clientWidth, height: el.clientHeight });
    });
    ro.observe(el);
    setSize({ width: el.clientWidth, height: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  const padding = 48;
  const availW = Math.max(0, size.width - padding * 2);
  const availH = Math.max(0, size.height - padding * 2);
  // Allow up to 2.5× in fullscreen
  const scale =
    availW > 0 && availH > 0
      ? Math.min(availW / frameW, availH / frameH, 2.5)
      : 1;

  return (
    <div
      ref={ref}
      className="w-full h-full flex flex-col items-center justify-center"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        style={{
          width: frameW,
          height: frameH,
          flexShrink: 0,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
        }}
      >
        <DeviceFrame
          preset={preset ?? null}
          className="w-full h-full"
          frameColor={frameColor}
          screenBackground={screenBackground}
        >
          {useBuilderTree && rootNode ? (
            <div
              style={{
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <LayoutRenderer
                node={rootNode}
                isInteractive={false}
                selectedNodeId={null}
                platformComponents={platformComponents}
              />
            </div>
          ) : sduiParsed.error ? (
            <div
              style={{
                padding: 12,
                fontSize: 11,
                color: '#ef4444',
                backgroundColor: 'rgba(239,68,68,0.08)',
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {sduiParsed.error}
            </div>
          ) : sduiParsed.node ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                fontFamily,
                fontSize: 16,
                WebkitFontSmoothing: 'antialiased',
              } as React.CSSProperties}
            >
              <SduiLayoutRenderer node={sduiParsed.node as Parameters<typeof SduiLayoutRenderer>[0]['node']} />
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                fontSize: 12,
                color: '#94a3b8',
              }}
            >
              Write Flutter-style JSON to preview
            </div>
          )}
        </DeviceFrame>
      </div>

      <p
        style={{
          marginTop: Math.max(8, 8 * scale),
          fontSize: 11,
          color: '#94a3b8',
          userSelect: 'none',
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
        }}
      >
        {preset?.label ?? 'Phone'} · {deviceW}×{deviceH}
        {preset?.dpr ? ` · @${preset.dpr}x` : ''}
      </p>
    </div>
  );
}
