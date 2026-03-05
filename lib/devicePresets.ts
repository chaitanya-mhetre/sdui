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
  {
    id: 'phone-android',
    label: 'Galaxy S24',
    shortLabel: 'S24',
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
    label: 'iPhone 17',
    shortLabel: 'iPhone 17',
    type: 'phone',
    platform: 'iphone',
    width: 393,
    height: 852,
    dpr: 3.0,
    statusBarHeight: 54,
    navigationBarHeight: 34,
    safeArea: { top: 54, bottom: 34, left: 0, right: 0 },
    frameClass: 'rounded-[2rem]',
  },
  {
    id: 'tablet-android',
    label: 'Pixel Tablet',
    shortLabel: 'Tablet',
    type: 'tablet',
    platform: 'android',
    width: 768,
    height: 1024,
    dpr: 2.0,
    statusBarHeight: 24,
    navigationBarHeight: 0,
    safeArea: { top: 24, bottom: 0, left: 0, right: 0 },
    frameClass: 'rounded-xl',
  },
  {
    id: 'tablet-iphone',
    label: 'iPad Air',
    shortLabel: 'iPad',
    type: 'tablet',
    platform: 'iphone',
    width: 820,
    height: 1180,
    dpr: 2.0,
    statusBarHeight: 24,
    navigationBarHeight: 20,
    safeArea: { top: 24, bottom: 20, left: 0, right: 0 },
    frameClass: 'rounded-2xl',
  },
];

export function getDevicePreset(id: string): DevicePresetConfig | undefined {
  return DEVICE_PRESETS.find((p) => p.id === id);
}

export const DEFAULT_DEVICE_PRESET_ID = 'phone-android';
