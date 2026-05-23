/**
 * renderer-utils.ts
 * Pure CSS/style helpers for the permissive renderer.
 * Extracted so renderer.tsx stays lean.
 */

// ---------------------------------------------------------------------------
// Entry-animation helpers (CT-G)
// ---------------------------------------------------------------------------

export interface AnimationMotionProps {
  initial: Record<string, unknown>;
  animate: Record<string, unknown>;
  transition: Record<string, unknown>;
}

/**
 * Convert an SDUI node animation spec:
 *   { type, duration, delay, repeat }
 * into framer-motion initial / animate / transition objects.
 * Returns null when no valid spec is present — caller skips the wrapper.
 */
export function animationProps(spec: unknown): AnimationMotionProps | null {
  if (!spec || typeof spec !== 'object' || !(spec as any).type) return null;
  const s = spec as Record<string, unknown>;
  const duration = (typeof s.duration === 'number' ? s.duration : 600) / 1000;
  const delay = (typeof s.delay === 'number' ? s.delay : 0) / 1000;
  const repeat = s.repeat === true;
  const ease = 'easeOut';

  switch (s.type) {
    case 'fade_in':
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration, delay, ease },
      };
    case 'fade_slide_up':
      return {
        initial: { opacity: 0, y: 24 },
        animate: { opacity: 1, y: 0 },
        transition: { duration, delay, ease },
      };
    case 'fade_slide_down':
      return {
        initial: { opacity: 0, y: -24 },
        animate: { opacity: 1, y: 0 },
        transition: { duration, delay, ease },
      };
    case 'fade_slide_left':
      return {
        initial: { opacity: 0, x: 24 },
        animate: { opacity: 1, x: 0 },
        transition: { duration, delay, ease },
      };
    case 'fade_slide_right':
      return {
        initial: { opacity: 0, x: -24 },
        animate: { opacity: 1, x: 0 },
        transition: { duration, delay, ease },
      };
    case 'scale_in':
      return {
        initial: { opacity: 0, scale: 0.85 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration, delay, ease },
      };
    case 'pulse':
      return {
        initial: { scale: 1 },
        animate: { scale: [1, 1.05, 1] },
        transition: {
          duration,
          delay,
          repeat: repeat ? Infinity : 0,
          ease: 'easeInOut',
        },
      };
    default:
      return null;
  }
}

/**
 * Parse a padding value that may be:
 *  - number          → {padding: N}
 *  - "24"            → {padding: 24}
 *  - "16 20"         → {padding: "16px 20px"}          (vertical horizontal)
 *  - "8 16 8 16"     → {padding: "8px 16px 8px 16px"}  (T R B L)
 *  - [8, 16]         → same as string "8 16"
 *  - {top,right,bottom,left} / {vertical,horizontal}
 */
export function parsePadding(value: unknown): React.CSSProperties {
  if (value == null) return {};
  if (typeof value === 'number') return { padding: value };
  if (typeof value === 'string') {
    const parts = value.trim().split(/\s+/).map((p) => parseFloat(p)).filter((n) => !isNaN(n));
    if (parts.length === 0) return {};
    if (parts.length === 1) return { padding: parts[0] };
    if (parts.length === 2) return { padding: `${parts[0]}px ${parts[1]}px` };
    if (parts.length === 3) return { padding: `${parts[0]}px ${parts[1]}px ${parts[2]}px ${parts[1]}px` };
    return { padding: `${parts[0]}px ${parts[1]}px ${parts[2]}px ${parts[3]}px` };
  }
  if (Array.isArray(value)) {
    const v = (value as number[]).map((n) => `${n}px`).join(' ');
    return { padding: v };
  }
  if (typeof value === 'object' && value !== null) {
    const o = value as Record<string, number>;
    const t = o.top ?? o.vertical ?? 0;
    const r = o.right ?? o.horizontal ?? 0;
    const b = o.bottom ?? o.vertical ?? 0;
    const l = o.left ?? o.horizontal ?? 0;
    return { padding: `${t}px ${r}px ${b}px ${l}px` };
  }
  return {};
}

/**
 * Parse a gap / spacing value → {gap: N} or {gap: 'Npx'}
 */
export function parseGap(value: unknown): React.CSSProperties {
  if (value == null) return {};
  if (typeof value === 'number') return { gap: value };
  if (typeof value === 'string') {
    const n = parseFloat(value);
    if (!isNaN(n)) return { gap: n };
  }
  return {};
}

/**
 * Parse a gradient object of the form used in AI-written SDUI JSON:
 *   { colors: ["#AAA","#BBB"], begin: "topLeft", end: "bottomRight" }
 * Returns {background: "linear-gradient(...)"} or {} if not a valid gradient.
 */
export function parseGradient(gradient: unknown): React.CSSProperties {
  if (!gradient || typeof gradient !== 'object') return {};
  const g = gradient as Record<string, unknown>;
  if (!Array.isArray(g.colors) || g.colors.length < 2) return {};

  const colors = (g.colors as string[]).join(', ');
  const begin = (g.begin as string) || 'top';
  const end = (g.end as string) || 'bottom';

  // Map Flutter-style alignment names to CSS gradient directions
  type Pair = `${string}_${string}`;
  const pairMap: Record<Pair, string> = {
    topLeft_bottomRight: 'to bottom right',
    topRight_bottomLeft: 'to bottom left',
    bottomLeft_topRight: 'to top right',
    bottomRight_topLeft: 'to top left',
    top_bottom: 'to bottom',
    bottom_top: 'to top',
    left_right: 'to right',
    right_left: 'to left',
    centerLeft_centerRight: 'to right',
    centerRight_centerLeft: 'to left',
  };

  const singleMap: Record<string, string> = {
    topLeft: 'to bottom right',
    topRight: 'to bottom left',
    bottomLeft: 'to top right',
    bottomRight: 'to top left',
    top: 'to bottom',
    bottom: 'to top',
    left: 'to right',
    right: 'to left',
    centerLeft: 'to right',
    centerRight: 'to left',
  };

  const key: Pair = `${begin}_${end}` as Pair;
  const dir = pairMap[key] ?? singleMap[begin] ?? 'to bottom right';
  return { background: `linear-gradient(${dir}, ${colors})` };
}

/**
 * Parse a border-radius value into an inline style.
 * Accepts number, numeric string, or "Npx".
 */
export function parseBorderRadius(value: unknown): React.CSSProperties {
  if (value == null) return {};
  const n = typeof value === 'number' ? value : parseFloat(String(value));
  if (!isNaN(n)) return { borderRadius: n };
  return {};
}

/**
 * Parse a hex color that may carry an @opacity suffix:
 *   "#FFFFFF@80"  → rgba(255,255,255,0.8)
 *   "#FF0000"     → "#FF0000"  (unchanged)
 */
export function parseColor(value: unknown): string | undefined {
  if (!value || typeof value !== 'string') return undefined;
  const atIdx = value.indexOf('@');
  if (atIdx === -1) return value;

  const hex = value.slice(0, atIdx);
  const opacityStr = value.slice(atIdx + 1);
  const opacity = parseFloat(opacityStr);
  if (isNaN(opacity)) return hex;

  // Parse hex → rgb
  const cleaned = hex.replace('#', '');
  const full = cleaned.length === 3
    ? cleaned.split('').map((c) => c + c).join('')
    : cleaned;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return hex;

  // opacity suffix: treat as percentage (0-100) if > 1, else 0-1
  const alpha = opacity > 1 ? opacity / 100 : opacity;
  return `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
}
