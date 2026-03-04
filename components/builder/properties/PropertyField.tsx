'use client';

import { useState, useRef } from 'react';
import { PropertySchema } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ─── Common Material icon names ───────────────────────────────────────────────
const MATERIAL_ICONS = [
  'home', 'search', 'settings', 'person', 'menu', 'close', 'add', 'remove',
  'arrow_back', 'arrow_forward', 'arrow_drop_down', 'arrow_drop_up',
  'check', 'check_circle', 'cancel', 'delete', 'edit', 'favorite',
  'favorite_border', 'share', 'star', 'star_border', 'info', 'warning',
  'error', 'help', 'more_vert', 'more_horiz', 'refresh', 'send',
  'notifications', 'visibility', 'visibility_off', 'lock', 'lock_open',
  'email', 'phone', 'location_on', 'map', 'directions', 'restaurant',
  'store', 'shopping_cart', 'shopping_bag', 'payment', 'calendar_today',
  'event', 'access_time', 'language', 'public', 'cloud', 'cloud_upload',
  'cloud_download', 'download', 'upload', 'file_copy', 'folder',
  'camera', 'camera_alt', 'image', 'video_library', 'music_note',
  'play_arrow', 'pause', 'stop', 'replay', 'volume_up', 'volume_off',
  'wifi', 'bluetooth', 'battery_full', 'brightness_high', 'brightness_low',
  'chat', 'message', 'forum', 'thumb_up', 'thumb_down',
  'trending_up', 'trending_down', 'bar_chart', 'pie_chart',
  'attach_file', 'link', 'code', 'security', 'verified_user',
  'block', 'report', 'flag', 'bookmark', 'bookmark_border', 'label',
  'local_offer', 'card_giftcard', 'account_balance', 'receipt',
  'account_balance_wallet', 'monetization_on', 'face', 'group', 'groups',
  'person_add', 'business', 'work', 'school', 'fitness_center',
  'directions_run', 'directions_bike', 'flight', 'train', 'directions_bus',
  'hotel', 'house', 'kitchen', 'vpn_key', 'admin_panel_settings',
  'done', 'done_all', 'undo', 'redo', 'swap_horiz', 'swap_vert',
  'open_in_new', 'fullscreen', 'fullscreen_exit', 'zoom_in', 'zoom_out',
  'crop', 'rotate_right', 'rotate_left', 'autorenew', 'sync', 'history',
  'schedule', 'alarm', 'timer', 'chevron_right', 'chevron_left',
  'expand_more', 'expand_less', 'first_page', 'last_page',
  'keyboard_arrow_up', 'keyboard_arrow_down', 'list', 'grid_view',
  'view_list', 'view_module', 'dashboard', 'apps', 'widgets',
  'tune', 'filter_list', 'sort', 'format_list_bulleted', 'tag',
  'local_fire_department', 'bolt', 'water_drop', 'eco', 'spa',
  'self_improvement', 'psychology', 'biotech', 'science', 'explore',
];

// ─── Spacing helpers ──────────────────────────────────────────────────────────

interface SpacingValue { top: number; right: number; bottom: number; left: number }

function parseSpacing(raw: unknown): SpacingValue {
  if (typeof raw === 'number') return { top: raw, right: raw, bottom: raw, left: raw };
  if (typeof raw === 'string') {
    const parts = raw.split(/\s+/).map(Number).filter((n) => !isNaN(n));
    if (parts.length === 1) return { top: parts[0], right: parts[0], bottom: parts[0], left: parts[0] };
    if (parts.length === 2) return { top: parts[0], right: parts[1], bottom: parts[0], left: parts[1] };
    if (parts.length === 4) return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[3] };
  }
  if (typeof raw === 'object' && raw !== null) {
    const o = raw as Record<string, unknown>;
    const v = (k: string) => typeof o[k] === 'number' ? o[k] as number : 0;
    return { top: v('top'), right: v('right'), bottom: v('bottom'), left: v('left') };
  }
  return { top: 0, right: 0, bottom: 0, left: 0 };
}

function spacingToValue(s: SpacingValue): unknown {
  if (s.top === s.right && s.right === s.bottom && s.bottom === s.left) return s.top;
  return `${s.top} ${s.right} ${s.bottom} ${s.left}`;
}

// ─── Sub-editors ──────────────────────────────────────────────────────────────

function ColorEditor({ property, value, onChange }: { property: PropertySchema; value: unknown; onChange: (v: unknown) => void }) {
  const raw = (typeof value === 'string' && value) || (property.default as string) || '#000000';
  const PRESETS = ['#000000','#FFFFFF','#F5F5F5','#E0E0E0','#9E9E9E','#6366F1','#8B5CF6','#06B6D4','#10B981','#F59E0B','#EF4444','#EC4899'];
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{property.label}</Label>
      <div className="mt-1.5 flex items-center gap-2">
        <input
          type="color"
          value={raw.startsWith('#') && raw.length === 7 ? raw : '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-10 flex-shrink-0 cursor-pointer rounded border border-border p-0.5"
        />
        <Input
          value={raw}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000 or rgba()"
          className="flex-1 font-mono text-xs"
        />
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {PRESETS.map((c) => (
          <button
            key={c}
            onClick={() => onChange(c)}
            title={c}
            style={{ backgroundColor: c, borderColor: raw === c ? '#6366F1' : '#d1d5db' }}
            className="h-5 w-5 flex-shrink-0 rounded border-2 transition-transform hover:scale-110"
          />
        ))}
      </div>
    </div>
  );
}

function SliderEditor({ property, value, onChange }: { property: PropertySchema; value: unknown; onChange: (v: unknown) => void }) {
  const current = typeof value === 'number' ? value : (property.default as number ?? 0);
  const min = property.min ?? 0;
  const max = property.max ?? 100;
  const step = property.step ?? 1;
  return (
    <div>
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">{property.label}</Label>
        <Input
          type="number"
          value={current}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="h-6 w-16 text-right text-xs"
          min={min} max={max} step={step}
        />
      </div>
      <Slider
        value={[current]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
        className="mt-2"
      />
    </div>
  );
}

function SpacingEditor({ property, value, onChange }: { property: PropertySchema; value: unknown; onChange: (v: unknown) => void }) {
  const [linked, setLinked] = useState(true);
  const sp = parseSpacing(value ?? property.default ?? 0);

  const update = (side: keyof SpacingValue, val: number) => {
    if (linked) {
      onChange(spacingToValue({ top: val, right: val, bottom: val, left: val }));
    } else {
      onChange(spacingToValue({ ...sp, [side]: val }));
    }
  };

  const InputBox = ({ side, label }: { side: keyof SpacingValue; label: string }) => (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-[10px] text-muted-foreground">{label}</span>
      <Input
        type="number"
        value={sp[side]}
        onChange={(e) => update(side, parseFloat(e.target.value) || 0)}
        className="h-7 w-14 text-center text-xs"
        min={0}
      />
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">{property.label}</Label>
        <button
          onClick={() => setLinked(!linked)}
          className={`rounded px-1.5 py-0.5 text-[10px] transition-colors ${linked ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
        >
          {linked ? 'Linked' : 'Custom'}
        </button>
      </div>
      <div className="mt-2">
        {linked ? (
          <div className="flex flex-col items-center">
            <InputBox side="top" label="All" />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1 place-items-center">
            <div />
            <InputBox side="top" label="T" />
            <div />
            <InputBox side="left" label="L" />
            <div className="h-8 w-8 rounded border border-border bg-muted/50" />
            <InputBox side="right" label="R" />
            <div />
            <InputBox side="bottom" label="B" />
            <div />
          </div>
        )}
      </div>
    </div>
  );
}

function ImageEditor({ property, value, onChange }: { property: PropertySchema; value: unknown; onChange: (v: unknown) => void }) {
  const url = (typeof value === 'string' ? value : (property.default as string)) || '';
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{property.label}</Label>
      <Input
        value={url}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://example.com/image.jpg"
        className="mt-1.5 text-xs"
      />
      {url && (
        <div className="mt-2 overflow-hidden rounded border border-border" style={{ maxHeight: 120 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="Preview" className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        </div>
      )}
    </div>
  );
}

function IconEditor({ property, value, onChange }: { property: PropertySchema; value: unknown; onChange: (v: unknown) => void }) {
  const current = (typeof value === 'string' ? value : (property.default as string)) || '';
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const filtered = query ? MATERIAL_ICONS.filter((i) => i.includes(query.toLowerCase())) : MATERIAL_ICONS;

  return (
    <div>
      <Label className="text-xs text-muted-foreground">{property.label}</Label>
      <div className="mt-1.5 flex items-center gap-2">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded border border-border bg-muted text-xs font-mono text-muted-foreground">
          {current ? current.slice(0, 2) : '?'}
        </div>
        <Input
          value={current}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="e.g. search, home, star"
          className="flex-1 text-xs"
        />
      </div>
      {open && (
        <div className="mt-1 rounded-md border border-border bg-popover shadow-md">
          <div className="border-b border-border p-2">
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search icons…"
              className="h-7 text-xs"
            />
          </div>
          <div className="max-h-40 overflow-y-auto p-1">
            {filtered.slice(0, 60).map((icon) => (
              <button
                key={icon}
                onClick={() => { onChange(icon); setOpen(false); setQuery(''); }}
                className={`w-full rounded px-2 py-1 text-left text-xs hover:bg-muted ${current === icon ? 'bg-primary/10 text-primary' : ''}`}
              >
                {icon}
              </button>
            ))}
            {filtered.length === 0 && <p className="p-2 text-xs text-muted-foreground">No icons found</p>}
          </div>
          <div className="border-t border-border p-1">
            <button onClick={() => setOpen(false)} className="w-full rounded px-2 py-1 text-xs text-muted-foreground hover:bg-muted">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main PropertyField component ─────────────────────────────────────────────

interface PropertyFieldProps {
  property: PropertySchema;
  value: unknown;
  onChange: (value: unknown) => void;
}

export function PropertyField({ property, value, onChange }: PropertyFieldProps) {
  switch (property.type) {

    case 'textarea':
      return (
        <div>
          <Label className="text-xs text-muted-foreground">{property.label}</Label>
          <textarea
            value={(value as string) ?? (property.default as string) ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={property.description ?? ''}
            rows={3}
            className="mt-1.5 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      );

    case 'string':
      return (
        <div>
          <Label className="text-xs text-muted-foreground">{property.label}</Label>
          <Input
            value={(value as string) ?? (property.default as string) ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={(property.default as string) ?? ''}
            className="mt-1.5 text-xs"
          />
        </div>
      );

    case 'number':
      return (
        <div>
          <Label className="text-xs text-muted-foreground">{property.label}</Label>
          <Input
            type="number"
            value={typeof value === 'number' ? value : (property.default as number ?? 0)}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            min={property.min}
            max={property.max}
            step={property.step ?? 1}
            className="mt-1.5 text-xs"
          />
        </div>
      );

    case 'boolean':
      return (
        <div className="flex items-center justify-between py-0.5">
          <Label className="text-xs text-muted-foreground cursor-pointer">{property.label}</Label>
          <Switch
            checked={typeof value === 'boolean' ? value : (property.default as boolean ?? false)}
            onCheckedChange={(checked) => onChange(checked)}
          />
        </div>
      );

    case 'select':
      return (
        <div>
          <Label className="text-xs text-muted-foreground">{property.label}</Label>
          <Select
            value={String(value ?? property.default ?? '')}
            onValueChange={(v) => onChange(v)}
          >
            <SelectTrigger className="mt-1.5 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {property.options?.map((opt) => (
                <SelectItem key={String(opt.value)} value={String(opt.value)} className="text-xs">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );

    case 'color':
      return <ColorEditor property={property} value={value} onChange={onChange} />;

    case 'slider':
      return <SliderEditor property={property} value={value} onChange={onChange} />;

    case 'spacing':
      return <SpacingEditor property={property} value={value} onChange={onChange} />;

    case 'image':
      return <ImageEditor property={property} value={value} onChange={onChange} />;

    case 'icon':
      return <IconEditor property={property} value={value} onChange={onChange} />;

    default:
      return null;
  }
}
