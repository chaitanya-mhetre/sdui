/**
 * Device presets for the SDUI preview canvas.
 * Dimensions are logical pixels (CSS pixels), not physical pixels.
 * safeArea models Flutter's MediaQuery.padding for status/nav bars.
 */

export type DeviceType = 'phone' | 'tablet';
export type DevicePlatform = 'android' | 'iphone';

export interface SafeAreaInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface DevicePresetConfig {
  id: string;
  label: string;
  shortLabel: string;
  type: DeviceType;
  platform: DevicePlatform;
  /** Logical width in CSS px */
  width: number;
  /** Logical height in CSS px */
  height: number;
  /** Device pixel ratio (informational — not applied to CSS) */
  dpr: number;
  /** Status bar height in logical px */
  statusBarHeight: number;
  /** Bottom navigation bar height in logical px (home indicator, etc.) */
  navigationBarHeight: number;
  /** Flutter-equivalent safe area insets */
  safeArea: SafeAreaInsets;
  /** Tailwind class for the outer frame radius */
  frameClass: string;
}

export const DEVICE_PRESETS: DevicePresetConfig[] = [
  // Phones
  {
    id: 'phone-android',
    label: 'Android Standard',
    shortLabel: 'Android',
    type: 'phone',
    platform: 'android',
    width: 360,
    height: 780,
    dpr: 3.0,
    statusBarHeight: 28,
    navigationBarHeight: 24,
    safeArea: { top: 28, bottom: 24, left: 0, right: 0 },
    frameClass: 'rounded-[2rem]',
  },
  {
    id: 'phone-iphone',
    label: 'iPhone Standard',
    shortLabel: 'iPhone',
    type: 'phone',
    platform: 'iphone',
    width: 390,
    height: 844,
    dpr: 3.0,
    statusBarHeight: 47,
    navigationBarHeight: 34,
    safeArea: { top: 47, bottom: 34, left: 0, right: 0 },
    frameClass: 'rounded-[2.5rem]',
  },

  // Tablets
  {
    id: 'tablet',
    label: 'Tablet',
    shortLabel: 'Tablet',
    type: 'tablet',
    platform: 'android', // General tablet
    width: 768,
    height: 1024,
    dpr: 2.0,
    statusBarHeight: 24,
    navigationBarHeight: 0,
    safeArea: { top: 24, bottom: 0, left: 0, right: 0 },
    frameClass: 'rounded-xl',
  },
  {
    id: 'tablet-ipad-pro',
    label: 'iPad Pro',
    shortLabel: 'iPad',
    type: 'tablet',
    platform: 'iphone',
    width: 1024,
    height: 1366,
    dpr: 2.0,
    statusBarHeight: 24,
    navigationBarHeight: 20,
    safeArea: { top: 24, bottom: 20, left: 0, right: 0 },
    frameClass: 'rounded-2xl',
  },
  
  // Custom Responsive Handle
  {
    id: 'responsive',
    label: 'Responsive Resize',
    shortLabel: 'Responsive',
    type: 'tablet',
    platform: 'android', // Generic platform
    width: 400, // Default width, resizable
    height: 800, // Default height, resizable
    dpr: 2.0, // Default DPR
    statusBarHeight: 24,
    navigationBarHeight: 0,
    safeArea: { top: 24, bottom: 0, left: 0, right: 0 },
    frameClass: 'rounded-xl',
  }
];

export function getDevicePreset(id: string): DevicePresetConfig | undefined {
  return DEVICE_PRESETS.find((p) => p.id === id);
}

export const DEFAULT_DEVICE_PRESET_ID = 'phone-android';
