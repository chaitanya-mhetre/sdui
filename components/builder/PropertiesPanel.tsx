'use client';

import { useState } from 'react';
import { useBuilderStore } from '@/store/builderStore';
import { getComponentDefinition } from '@/lib/componentRegistry';
import { PropertyField } from './properties/PropertyField';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Paintbrush, Layout, FileText, Settings2, Monitor } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { PropertySchema } from '@/types';

// ─── Section config ───────────────────────────────────────────────────────────

const SECTION_CONFIG: Record<string, { label: string; icon: React.ReactNode; defaultOpen: boolean }> = {
  content:    { label: 'Content',    icon: <FileText className="h-3.5 w-3.5" />, defaultOpen: true  },
  appearance: { label: 'Appearance', icon: <Paintbrush className="h-3.5 w-3.5" />, defaultOpen: true  },
  layout:     { label: 'Layout',     icon: <Layout className="h-3.5 w-3.5" />, defaultOpen: true  },
  behavior:   { label: 'Behavior',   icon: <Settings2 className="h-3.5 w-3.5" />, defaultOpen: false },
};

const GRADIENT_DIRECTIONS = [
  { value: 'to bottom', label: 'Top → Bottom' },
  { value: 'to top',    label: 'Bottom → Top' },
  { value: 'to right',  label: 'Left → Right' },
  { value: 'to left',   label: 'Right → Left' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SectionAccordion({
  id,
  label,
  icon,
  open,
  onToggle,
  children,
}: {
  id: string;
  label: string;
  icon: React.ReactNode;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-2 px-4 py-2.5 hover:bg-muted/40 transition-colors"
      >
        <span className="text-muted-foreground">{icon}</span>
        <span className="flex-1 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.18 }}>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            {...{
              className: "overflow-hidden"
            } as any}
          >
            <div className="space-y-3 px-4 pb-4 pt-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Screen (no selection) ────────────────────────────────────────────────────

function ScreenSettings() {
  const frameColor       = useBuilderStore((s) => s.frameColor);
  const setFrameColor    = useBuilderStore((s) => s.setFrameColor);
  const screenBg         = useBuilderStore((s) => s.screenBackground);
  const setScreenBg      = useBuilderStore((s) => s.setScreenBackground);

  const [open, setOpen] = useState<Record<string, boolean>>({
    frame: true, screen: true,
  });
  const toggle = (k: string) => setOpen((p) => ({ ...p, [k]: !p[k] }));

  const gradParts = (() => {
    if (screenBg.type !== 'gradient' || !screenBg.gradient) return { dir: 'to bottom', c1: '#ffffff', c2: '#e5e5e5' };
    const m = screenBg.gradient.match(/linear-gradient\(([^,]+),\s*([^,]+),\s*([^)]+)\)/);
    return m ? { dir: m[1].trim(), c1: m[2].trim(), c2: m[3].trim() } : { dir: 'to bottom', c1: '#ffffff', c2: '#e5e5e5' };
  })();

  return (
    <div className="flex flex-col gap-0 overflow-y-auto">
      <div className="px-4 py-3 border-b border-border">
        <p className="text-xs text-muted-foreground">Select a component on the canvas to edit its properties.</p>
      </div>

      {/* Frame */}
      <SectionAccordion id="frame" label="Frame" icon={<Monitor className="h-3.5 w-3.5" />} open={open.frame} onToggle={() => toggle('frame')}>
        <div>
          <Label className="text-xs text-muted-foreground">Bezel color</Label>
          <div className="mt-1.5 flex gap-2">
            <input type="color" value={frameColor} onChange={(e) => setFrameColor(e.target.value)} className="h-8 w-10 cursor-pointer rounded border border-border p-0.5" />
            <Input value={frameColor} onChange={(e) => setFrameColor(e.target.value)} className="flex-1 font-mono text-xs" />
          </div>
        </div>
      </SectionAccordion>

      {/* Screen background */}
      <SectionAccordion id="screen" label="Screen Background" icon={<Paintbrush className="h-3.5 w-3.5" />} open={open.screen} onToggle={() => toggle('screen')}>
        <div>
          <Label className="text-xs text-muted-foreground">Type</Label>
          <Select
            value={screenBg.type}
            onValueChange={(v: 'solid' | 'gradient') =>
              setScreenBg({ ...screenBg, type: v, color: v === 'solid' ? (screenBg.color ?? '#ffffff') : undefined, gradient: v === 'gradient' ? (screenBg.gradient ?? 'linear-gradient(to bottom, #ffffff, #e5e5e5)') : undefined })
            }
          >
            <SelectTrigger className="mt-1.5 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="solid" className="text-xs">Solid</SelectItem>
              <SelectItem value="gradient" className="text-xs">Gradient</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {screenBg.type === 'solid' && (
          <div>
            <Label className="text-xs text-muted-foreground">Color</Label>
            <div className="mt-1.5 flex gap-2">
              <input type="color" value={screenBg.color ?? '#ffffff'} onChange={(e) => setScreenBg({ ...screenBg, color: e.target.value })} className="h-8 w-10 cursor-pointer rounded border border-border p-0.5" />
              <Input value={screenBg.color ?? '#ffffff'} onChange={(e) => setScreenBg({ ...screenBg, color: e.target.value })} className="flex-1 font-mono text-xs" />
            </div>
          </div>
        )}

        {screenBg.type === 'gradient' && (
          <>
            <div>
              <Label className="text-xs text-muted-foreground">Direction</Label>
              <Select value={gradParts.dir} onValueChange={(dir) => setScreenBg({ ...screenBg, gradient: `linear-gradient(${dir}, ${gradParts.c1}, ${gradParts.c2})` })}>
                <SelectTrigger className="mt-1.5 h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {GRADIENT_DIRECTIONS.map((d) => <SelectItem key={d.value} value={d.value} className="text-xs">{d.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {(['c1', 'c2'] as const).map((k, i) => (
              <div key={k}>
                <Label className="text-xs text-muted-foreground">Color {i + 1}</Label>
                <div className="mt-1.5 flex gap-2">
                  <input type="color" value={gradParts[k]} onChange={(e) => setScreenBg({ ...screenBg, gradient: `linear-gradient(${gradParts.dir}, ${k === 'c1' ? e.target.value : gradParts.c1}, ${k === 'c2' ? e.target.value : gradParts.c2})` })} className="h-8 w-10 cursor-pointer rounded border border-border p-0.5" />
                  <Input value={gradParts[k]} onChange={(e) => setScreenBg({ ...screenBg, gradient: `linear-gradient(${gradParts.dir}, ${k === 'c1' ? e.target.value : gradParts.c1}, ${k === 'c2' ? e.target.value : gradParts.c2})` })} className="flex-1 font-mono text-xs" />
                </div>
              </div>
            ))}
          </>
        )}
      </SectionAccordion>
    </div>
  );
}

// ─── Main PropertiesPanel ─────────────────────────────────────────────────────

export function PropertiesPanel() {
  const selectedNodeId     = useBuilderStore((s) => s.selection.selectedNodeId);
  const rootNode           = useBuilderStore((s) => s.rootNode); // Subscribe to rootNode to trigger re-renders
  const updateNode         = useBuilderStore((s) => s.updateNode);
  const findNode           = useBuilderStore((s) => s.findNode);
  const platformComponents = useBuilderStore((s) => s.platformComponents);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(Object.entries(SECTION_CONFIG).map(([k, v]) => [k, v.defaultOpen]))
  );
  const toggleSection = (k: string) => setOpenSections((p) => ({ ...p, [k]: !p[k] }));

  // No selection
  if (!selectedNodeId) return <ScreenSettings />;

  const selectedNode = findNode(selectedNodeId);
  if (!selectedNode) {
    return <div className="p-4 text-xs text-muted-foreground">Component not found.</div>;
  }

  // Resolve component definition — try both componentType and SDUI-style "type"
  const typeKey = selectedNode.componentType ?? (selectedNode as any).type ?? '';
  const componentDef =
    getComponentDefinition(typeKey) ??
    platformComponents.find((p) => p.id === typeKey) ??
    null;

  // Helper: read a property value from the node (works for both LayoutNode.props
  // and flat SDUI-style nodes where props live at root level)
  const getPropValue = (name: string): unknown => {
    if (selectedNode.props && name in selectedNode.props) return selectedNode.props[name];
    return (selectedNode as any)[name];
  };

  // Handle property change — write to props (LayoutNode) AND root level (SDUI compat)
  const handleChange = (name: string, value: unknown) => {
    updateNode(selectedNodeId, {
      props: {
        ...selectedNode.props,
        [name]: value,
      },
      // Also patch root-level for SDUI format compatibility
      [name]: value,
    } as any);
  };

  // Group properties by category
  const properties: PropertySchema[] = componentDef?.properties ?? [];
  const grouped = properties.reduce<Record<string, PropertySchema[]>>((acc, p) => {
    const cat = p.category ?? 'appearance';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {});

  const sectionOrder = ['content', 'appearance', 'layout', 'behavior'];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-border bg-muted/30 px-4 py-3">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">Component</p>
        <p className="text-sm font-semibold text-foreground">
          {componentDef?.name ?? typeKey ?? 'Unknown'}
        </p>
        {!componentDef && (
          <p className="mt-0.5 text-[10px] text-amber-500">No schema found for "{typeKey}". Showing raw props.</p>
        )}
      </div>

      {/* Property sections */}
      <div className="flex-1 overflow-y-auto">
        {componentDef ? (
          <>
            {sectionOrder.map((cat) => {
              const props = grouped[cat];
              if (!props || props.length === 0) return null;
              const cfg = SECTION_CONFIG[cat] ?? { label: cat, icon: null, defaultOpen: true };
              return (
                <SectionAccordion
                  key={cat}
                  id={cat}
                  label={cfg.label}
                  icon={cfg.icon}
                  open={openSections[cat] ?? true}
                  onToggle={() => toggleSection(cat)}
                >
                  {props.map((p) => (
                    <PropertyField
                      key={p.name}
                      property={p}
                      value={getPropValue(p.name)}
                      onChange={(v) => handleChange(p.name, v)}
                    />
                  ))}
                </SectionAccordion>
              );
            })}

            {/* Catch-all for uncategorized props */}
            {(() => {
              const extra = properties.filter((p) => !sectionOrder.includes(p.category ?? 'appearance'));
              if (extra.length === 0) return null;
              return (
                <SectionAccordion
                  id="other"
                  label="Other"
                  icon={<Settings2 className="h-3.5 w-3.5" />}
                  open={openSections['other'] ?? false}
                  onToggle={() => toggleSection('other')}
                >
                  {extra.map((p) => (
                    <PropertyField key={p.name} property={p} value={getPropValue(p.name)} onChange={(v) => handleChange(p.name, v)} />
                  ))}
                </SectionAccordion>
              );
            })()}
          </>
        ) : (
          /* Fallback: show raw props as editable key-value pairs */
          <div className="px-4 py-3 space-y-2">
            {Object.entries({ ...selectedNode.props, ...Object.fromEntries(Object.entries(selectedNode as any).filter(([k]) => !['id', 'componentType', 'props', 'children', 'dataBindings'].includes(k))) }).map(([k, v]) => (
              <div key={k}>
                <Label className="text-xs text-muted-foreground">{k}</Label>
                <Input
                  value={String(v ?? '')}
                  onChange={(e) => handleChange(k, e.target.value)}
                  className="mt-1 text-xs font-mono"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
