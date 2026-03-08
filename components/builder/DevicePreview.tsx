'use client';

import React, { useRef, useEffect, useState } from 'react';
import { DeviceFrame } from './DeviceFrame';
import { useBuilderStore } from '@/store/builderStore';
import { getDevicePreset } from '@/lib/devicePresets';

interface DevicePreviewProps {
  effectiveScale: number;
}

export function DevicePreview({ effectiveScale }: DevicePreviewProps) {
  const rootNode = useBuilderStore((state) => state.rootNode);
  const platformComponents = useBuilderStore((state) => state.platformComponents);
  const selectedDevicePreset = useBuilderStore((state) => state.selectedDevicePreset);
  const screenBackground = useBuilderStore((state) => state.screenBackground);
  const frameColor = useBuilderStore((state) => state.frameColor);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const preset = getDevicePreset(selectedDevicePreset);

  // Responsive mode state
  const isResponsive = selectedDevicePreset === 'responsive';
  const [responsiveWidth, setResponsiveWidth] = useState(preset?.width ?? 400);

  // Keep the iframe synced with changes in the builder state
  useEffect(() => {
    if (!iframeRef.current || !iframeRef.current.contentWindow) return;

    // We send the current state to the iframe whenever it changes
    const message = {
      type: 'SYNC_PREVIEW',
      payload: {
        rootNode,
        platformComponents,
        deviceId: selectedDevicePreset,
      },
    };
    
    // We also need to send it immediately in case the iframe just loaded
    iframeRef.current.contentWindow.postMessage(message, '*');
  }, [rootNode, platformComponents, selectedDevicePreset]);

  // Handle iframe initial load message
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'PREVIEW_READY') {
        if (!iframeRef.current || !iframeRef.current.contentWindow) return;
        iframeRef.current.contentWindow.postMessage({
          type: 'SYNC_PREVIEW',
          payload: {
            rootNode,
            platformComponents,
            deviceId: selectedDevicePreset,
          },
        }, '*');
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [rootNode, platformComponents, selectedDevicePreset]);

  // Handle responsive resize drag
  const handleDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = responsiveWidth;

    const onMouseMove = (moveEvent: MouseEvent) => {
      // Scale back the delta because of the effectiveScale
      const delta = (moveEvent.clientX - startX) / effectiveScale;
      // Mirror resize on both sides (delta * 2) or just one side?
      // Let's do a simple right-side drag: delta * 2 if dragging centered
      const newWidth = Math.max(320, Math.min(1024, startWidth + delta * 2));
      setResponsiveWidth(newWidth);
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const deviceWidth = isResponsive ? responsiveWidth : (preset?.width ?? 360);
  const deviceHeight = preset?.height ?? 640;
  
  const bezel = isResponsive ? 0 : (preset?.type === 'tablet' ? 28 : 20);
  const frameWidth = deviceWidth + bezel;
  const frameHeight = deviceHeight + bezel;

  return (
    <div
      className="relative flex flex-col items-center shrink-0 group"
      style={{
        width: frameWidth * effectiveScale,
        height: frameHeight * effectiveScale + 24,
      }}
    >
      <div
        className="absolute left-1/2 top-1/2 flex flex-col items-center"
        style={{
          width: frameWidth,
          height: frameHeight,
          transform: `translate(-50%, -50%) scale(${effectiveScale})`,
          transformOrigin: 'center center',
        }}
      >
        <DeviceFrame 
           preset={preset ?? null} 
           className="w-full h-full flex flex-col" 
           frameColor={frameColor} 
           screenBackground={screenBackground}
           responsiveWidth={isResponsive ? responsiveWidth : undefined}
        >
          <iframe
            ref={iframeRef}
            src="/preview"
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              backgroundColor: 'transparent'
            }}
            title="Device Preview"
          />
        </DeviceFrame>

        {/* Responsive Drag Handles */}
        {isResponsive && (
          <>
            <div 
              className="absolute left-[-16px] top-1/2 -translate-y-1/2 w-4 h-16 bg-border hover:bg-primary cursor-ew-resize rounded flex items-center justify-center opacity-50 hover:opacity-100 transition-all"
              onMouseDown={(e) => {
                // For left handle we negate the delta logic in the standard handler, or just reuse it and let math handle it
                e.preventDefault();
                const startX = e.clientX;
                const startWidth = responsiveWidth;
                const onMouseMove = (moveEvent: MouseEvent) => {
                  const delta = (startX - moveEvent.clientX) / effectiveScale;
                  const newWidth = Math.max(320, Math.min(1024, startWidth + delta * 2));
                  setResponsiveWidth(newWidth);
                };
                const onMouseUp = () => {
                  document.removeEventListener('mousemove', onMouseMove);
                  document.removeEventListener('mouseup', onMouseUp);
                };
                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
              }}
            >
              <div className="w-1 h-8 bg-background/50 rounded-full" />
            </div>
            
            <div 
              className="absolute right-[-16px] top-1/2 -translate-y-1/2 w-4 h-16 bg-border hover:bg-primary cursor-ew-resize rounded flex items-center justify-center opacity-50 hover:opacity-100 transition-all"
              onMouseDown={handleDrag}
            >
              <div className="w-1 h-8 bg-background/50 rounded-full" />
            </div>
          </>
        )}
      </div>
      
      
      <p className="absolute bottom-[-24px] left-1/2 -translate-x-1/2 text-xs text-muted-foreground whitespace-nowrap">
        {preset?.label ?? 'Phone (Android)'} · {Math.round(deviceWidth)}×{deviceHeight}
      </p>
    </div>
  );
}
