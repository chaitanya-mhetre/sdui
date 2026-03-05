'use client';

import { useMemo, useRef, useEffect, useState } from 'react';
import { DeviceFrame } from './DeviceFrame';
import { SduiLayoutRenderer } from '@/lib/sdui/renderWidget';
import { parseLayout } from '@/lib/sdui/layoutParser';
import { LayoutRenderer } from '@/lib/renderer';
import { useBuilderStore } from '@/store/builderStore';
import { getDevicePreset } from '@/lib/devicePresets';
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
}

export function PreviewCanvas({
  rootNode,
  platformComponents = [],
  layoutJson = '',
  className = '',
  fitContainer = true,
}: PreviewCanvasProps) {
  const selectedDevicePreset = useBuilderStore((state) => state.selectedDevicePreset);
  const screenBackground = useBuilderStore((state) => state.screenBackground);
  const frameColor = useBuilderStore((state) => state.frameColor);

  const preset = getDevicePreset(selectedDevicePreset);
  const deviceW = preset?.width ?? 360;
  const deviceH = preset?.height ?? 780;

  // Auto-scale: measure the container and compute scale so the full device fits
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!fitContainer) return;
    const el = containerRef.current;
    if (!el) return;

    const obs = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      const frameW = deviceW + 8;
      const frameH = deviceH + 8;
      const scaleX = (width - 32) / frameW;
      const scaleY = (height - 48) / frameH;
      setScale(Math.min(scaleX, scaleY, 1));
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [deviceW, deviceH, fitContainer]);

  const sduiParsed = useMemo(() => {
    if (rootNode != null) return { node: null, error: null };
    if (!layoutJson?.trim()) return { node: null, error: null };
    const result = parseLayout(layoutJson);
    if (result.success) return { node: result.node, error: null };
    return { node: null, error: result.error };
  }, [rootNode, layoutJson]);

  const useBuilderTree = rootNode != null;

  // Platform-matched font family — Roboto for Android, SF Pro for iOS
  const fontFamily =
    preset?.platform === 'iphone'
      ? '-apple-system, "SF Pro Display", "SF Pro Text", sans-serif'
      : '"Roboto", "Google Sans", "Noto Sans", Arial, sans-serif';

  return (
    <div
      ref={containerRef}
      className={`flex flex-col items-center justify-center min-h-0 ${className}`}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          width: deviceW + 8,
          height: deviceH + 8,
          flexShrink: 0,
        }}
      >
        <DeviceFrame
          preset={preset ?? null}
          className="w-full h-full"
          frameColor={frameColor}
          screenBackground={screenBackground}
        >
          {useBuilderTree ? (
            <div style={{ width: '100%', height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
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
            /*
             * Content shell — flex column so ScaffoldWidget (flex:1) fills all remaining height.
             * fontFamily/fontSize mimics the target platform's default text rendering.
             */
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
        </DeviceFrame>
      </div>

      {/* Device label below frame */}
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
