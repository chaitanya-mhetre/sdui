'use client';

import type { DevicePresetConfig } from '@/lib/devicePresets';

import { AndroidMockup, IPhoneMockup, IPadMockup, AndroidTabMockup } from 'react-device-mockup';

export type ScreenBackground = { type: 'solid' | 'gradient'; color?: string; gradient?: string };

interface DeviceFrameProps {
  preset: DevicePresetConfig | null;
  children: React.ReactNode;
  className?: string;
  frameColor?: string;
  screenBackground?: ScreenBackground;
  responsiveWidth?: number;
}

/**
 * Renders a minimal device chrome (rounded rect + status/nav bar areas)
 * and applies the correct safe-area insets so SDUI widgets render exactly
 * as they would inside a Flutter Scaffold.
 */
export function DeviceFrame({
  preset,
  children,
  className = '',
  frameColor,
  screenBackground,
  responsiveWidth,
}: DeviceFrameProps) {
  const bgStyle: React.CSSProperties | undefined =
    screenBackground?.type === 'gradient' && screenBackground.gradient
      ? { background: screenBackground.gradient }
      : screenBackground?.type === 'solid' && screenBackground.color
        ? { backgroundColor: screenBackground.color }
        : undefined;

  const defaultFrameColor = '#1e293b';

  if (!preset || preset.id === 'responsive') {
    // For responsive mode or no preset, just render a generic container
    return (
      <div 
        className={`relative flex flex-col overflow-hidden ${className}`}
        style={{
          width: responsiveWidth ? `${responsiveWidth}px` : '100%',
          backgroundColor: frameColor ?? defaultFrameColor,
          borderRadius: preset?.id === 'responsive' ? '12px' : '0',
          boxShadow: preset?.id === 'responsive' ? '0 8px 32px rgba(0,0,0,0.15)' : 'none',
        }}
      >
        <div className="relative flex flex-col flex-1 overflow-hidden" style={bgStyle ?? { backgroundColor: '#ffffff' }}>
          {children}
        </div>
      </div>
    );
  }

  const MockupComponent = (() => {
    switch (preset.id) {
      case 'phone-iphone':
      case 'phone-iphone-max':
        return IPhoneMockup;
      case 'tablet':
        return AndroidTabMockup;
      case 'tablet-ipad-pro':
        return IPadMockup;
      case 'phone-android-small':
      case 'phone-android':
      case 'phone-android-large':
      default:
        return AndroidMockup;
    }
  })();

  // react-device-mockup determines height based on width ratio automatically if not explicitly given
  // Since we rely on perfect iframe mapping, we pass down the exact scale via the device frame mapping
  return (
    <MockupComponent
      screenWidth={preset.width}
      isLandscape={false}
      hideStatusBar={true} // We handle safe areas internally inside our preview canvas via Flutter mapping
      hideNavBar={true}
    >
      <div className="w-full h-full relative" style={bgStyle ?? { backgroundColor: '#ffffff', width: preset.width, height: preset.height }}>
        {children}
      </div>
    </MockupComponent>
  );
}
