'use client';

import type { DevicePresetConfig } from '@/lib/devicePresets';

export type ScreenBackground = { type: 'solid' | 'gradient'; color?: string; gradient?: string };

interface DeviceFrameProps {
  preset: DevicePresetConfig | null;
  children: React.ReactNode;
  className?: string;
  frameColor?: string;
  screenBackground?: ScreenBackground;
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
}: DeviceFrameProps) {
  const bgStyle =
    screenBackground?.type === 'gradient' && screenBackground.gradient
      ? { background: screenBackground.gradient }
      : screenBackground?.type === 'solid' && screenBackground.color
        ? { backgroundColor: screenBackground.color }
        : undefined;

  const isPhone = preset?.type === 'phone';
  const isTablet = preset?.type === 'tablet';
  const isIphone = preset?.platform === 'iphone';
  const isAndroid = preset?.platform === 'android';

  const screenRound = isPhone ? 'rounded-[2rem]' : 'rounded-xl';
  const frameRound = isPhone ? 'rounded-[2.5rem]' : 'rounded-2xl';
  const defaultFrameColor = '#1e293b';

  // Use safeArea from preset when available
  const sa = preset?.safeArea;
  const statusH = sa?.top ?? (isPhone && isIphone ? 54 : isPhone ? 28 : 24);
  const navH = sa?.bottom ?? (isPhone && isIphone ? 34 : isPhone ? 24 : 0);

  if (!preset) {
    return (
      <div className={`flex flex-col flex-1 min-h-0 overflow-hidden ${className}`}>
        <div
          className="absolute inset-0 rounded-2xl"
          style={bgStyle ?? { backgroundColor: 'var(--background)' }}
          aria-hidden
        />
        <div className="flex-1 overflow-auto min-h-0 relative">{children}</div>
      </div>
    );
  }

  return (
    <div
      className={`relative flex flex-col overflow-hidden ${frameRound} ${className}`}
      style={{
        backgroundColor: frameColor ?? defaultFrameColor,
        boxShadow:
          '0 8px 32px rgba(0,0,0,0.28), 0 2px 8px rgba(0,0,0,0.16), 0 0 0 1px rgba(255,255,255,0.06) inset',
      }}
    >
      {/* Inner screen area */}
      <div
        className={`relative flex flex-col flex-1 min-h-0 overflow-hidden ${screenRound}`}
        style={{ margin: 3, border: '1px solid rgba(0,0,0,0.12)' }}
      >
        {/* Screen background */}
        <div
          className={`absolute inset-0 ${screenRound}`}
          style={bgStyle ?? { backgroundColor: '#ffffff' }}
          aria-hidden
        />

        {/* ── Status bar ── */}
        {isPhone && isIphone && (
          <div
            className="relative z-20 shrink-0 flex items-end justify-center pb-1"
            style={{ height: statusH }}
            aria-hidden
          >
            {/* Dynamic Island */}
            <div
              className="bg-black rounded-full"
              style={{ width: 118, height: 34, marginBottom: 2 }}
            />
          </div>
        )}
        {isPhone && isAndroid && (
          <div
            className="relative z-20 shrink-0 flex items-center justify-end px-4"
            style={{ height: statusH, backgroundColor: 'rgba(0,0,0,0.04)' }}
            aria-hidden
          >
            <div className="flex gap-1.5">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-black/30" />
              ))}
            </div>
          </div>
        )}
        {isTablet && (
          <div
            className="relative z-20 shrink-0 flex items-center justify-between px-6"
            style={{ height: statusH, backgroundColor: 'rgba(0,0,0,0.03)' }}
            aria-hidden
          >
            <div className="text-[10px] text-black/30 font-medium">9:41</div>
            <div className="flex gap-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-3 h-1.5 rounded-sm bg-black/25" />
              ))}
            </div>
          </div>
        )}

        {/* ── Content area (safe zone) — NO padding; Scaffold handles layout ── */}
        <div
          className="relative flex-1 min-h-0 overflow-hidden"
          style={{ zIndex: 1 }}
        >
          {children}
        </div>

        {/* ── Bottom home indicator ── */}
        {navH > 0 && (
          <div
            className="relative z-20 shrink-0 flex items-center justify-center"
            style={{ height: navH, backgroundColor: 'rgba(0,0,0,0.02)' }}
            aria-hidden
          >
            {isIphone && (
              <div className="w-28 h-1 rounded-full bg-black/20" />
            )}
            {isAndroid && (
              <div className="flex gap-8">
                <div className="w-4 h-4 rounded-sm border border-black/20" />
                <div className="w-4 h-4 rounded-full border border-black/20" />
                <div className="w-4 h-0.5 mt-1.5 rounded-full bg-black/20" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
