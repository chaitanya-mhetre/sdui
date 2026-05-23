'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronRight, Loader2, Search } from 'lucide-react';
import { LibraryItem } from './LibraryItem';
import { useBuilderStore } from '@/store/builderStore';
import { apiRequest } from '@/lib/api-client';
import type { ComponentDefinition } from '@/types';

interface ApiComponent {
  id: string;
  name: string;
  category: string;
  propsSchema: unknown;
  defaultProps: Record<string, unknown>;
  version: string;
  visibility: string;
  usageCount: number;
}

function mapApiComponentToDefinition(comp: ApiComponent): ComponentDefinition {
  const propsSchema = Array.isArray(comp.propsSchema) ? comp.propsSchema : [];
  return {
    id: comp.id,
    name: comp.name,
    category: comp.category as ComponentDefinition['category'],
    icon: 'LayoutGrid',
    description: '',
    properties: propsSchema as ComponentDefinition['properties'],
    defaultProps: comp.defaultProps || {},
    allowChildren: true,
  };
}

const CATEGORY_ORDER = ['layout', 'display', 'input', 'feedback', 'navigation', 'media', 'other'];

export function ComponentLibrary() {
  const setPlatformComponents = useBuilderStore((state) => state.setPlatformComponents);
  const platformComponents = useBuilderStore((state) => state.platformComponents);
  const [loadingPlatform, setLoadingPlatform] = useState(true);
  const [query, setQuery] = useState('');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let mounted = true;
    apiRequest<{ components: ApiComponent[] }>('/components')
      .then((res) => {
        if (!mounted || !res.success) return;
        const defs = res.data.components.map(mapApiComponentToDefinition);
        setPlatformComponents(defs);
      })
      .finally(() => {
        if (mounted) setLoadingPlatform(false);
      });
    return () => { mounted = false; };
  }, [setPlatformComponents]);

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = platformComponents.filter((c) => {
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        (c.description ?? '').toLowerCase().includes(q) ||
        (c.category ?? '').toLowerCase().includes(q)
      );
    });

    const groups: Record<string, typeof platformComponents> = {};
    for (const c of filtered) {
      const cat = (c.category ?? 'other').toString().toLowerCase();
      groups[cat] = groups[cat] ?? [];
      groups[cat].push(c);
    }

    const inOrder = CATEGORY_ORDER
      .filter((k) => groups[k]?.length)
      .map((k) => ({ category: k, items: groups[k].sort((a, b) => a.name.localeCompare(b.name)) }));

    const extra = Object.keys(groups)
      .filter((k) => !CATEGORY_ORDER.includes(k))
      .map((k) => ({ category: k, items: groups[k].sort((a, b) => a.name.localeCompare(b.name)) }));

    return [...inOrder, ...extra];
  }, [platformComponents, query]);

  const toggleCategory = (cat: string) => {
    setCollapsed((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  if (loadingPlatform) {
    return (
      <div className="flex items-center gap-2 px-4 py-4 text-muted-foreground text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading…
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="px-3 pt-3 pb-2 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search components…"
            className="w-full pl-7 pr-2 py-1.5 text-sm bg-muted/40 border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Grouped list */}
      <div className="flex-1 overflow-y-auto">
        {grouped.length === 0 && (
          <p className="px-3 py-6 text-xs text-muted-foreground text-center">
            No components match &ldquo;{query}&rdquo;
          </p>
        )}
        {grouped.map(({ category, items }) => {
          const isCollapsed = collapsed[category];
          return (
            <div key={category} className="py-1">
              <button
                type="button"
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center gap-1 px-3 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronRight
                  className={`w-3 h-3 transition-transform ${isCollapsed ? '' : 'rotate-90'}`}
                />
                <span>{category}</span>
                <span className="ml-1 opacity-50">({items.length})</span>
              </button>
              {!isCollapsed && (
                <div className="px-1">
                  {items.map((item) => (
                    <LibraryItem key={item.id} component={item} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
