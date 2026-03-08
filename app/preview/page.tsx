'use client';

import { useEffect, useState } from 'react';
import { LayoutRenderer } from '@/lib/renderer';
import type { LayoutNode, ComponentDefinition } from '@/types';
import type { SafeAreaInsets } from '@/lib/devicePresets';
import { getDevicePreset } from '@/lib/devicePresets';

export default function PreviewPage() {
  const [rootNode, setRootNode] = useState<LayoutNode | null>(null);
  const [platformComponents, setPlatformComponents] = useState<ComponentDefinition[]>([]);
  const [safeArea, setSafeArea] = useState<SafeAreaInsets | null>(null);

  useEffect(() => {
    // Listen for messages from the parent window
    const handleMessage = (event: MessageEvent) => {
      // In production, you might want to verify event.origin
      const { type, payload } = event.data;
      if (type === 'SYNC_PREVIEW') {
        const { rootNode, platformComponents, deviceId } = payload;
        setRootNode(rootNode);
        setPlatformComponents(platformComponents);
        if (deviceId) {
           const preset = getDevicePreset(deviceId);
           if (preset) setSafeArea(preset.safeArea);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Notify parent that we are ready to receive data
    window.parent.postMessage({ type: 'PREVIEW_READY' }, '*');

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  if (!rootNode) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'transparent' }}>
        <p style={{ color: '#888', fontFamily: 'sans-serif' }}>Loading preview...</p>
      </div>
    );
  }

  return (
    <div 
      style={{ 
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
        height: '100vh',
        width: '100vw',
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
        background: 'transparent'
      }}
    >
      <LayoutRenderer
        node={rootNode}
        isInteractive={false}
        selectedNodeId={null}
        platformComponents={platformComponents}
      />
    </div>
  );
}
