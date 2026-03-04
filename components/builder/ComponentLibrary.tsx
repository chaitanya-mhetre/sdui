'use client';

import { useEffect, useState } from 'react';
import { LibraryItem } from './LibraryItem';
import { useBuilderStore } from '@/store/builderStore';
import { apiRequest } from '@/lib/api-client';
import type { ComponentDefinition } from '@/types';
import { Loader2 } from 'lucide-react';

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

export function ComponentLibrary() {
  const setPlatformComponents = useBuilderStore((state) => state.setPlatformComponents);
  const platformComponents = useBuilderStore((state) => state.platformComponents);
  const [loadingPlatform, setLoadingPlatform] = useState(true);

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

  return (
    <div className="p-4">
      <h2 className="font-semibold text-sm mb-4 text-foreground">Components</h2>
      {/* Only platform components from DB */}
      {loadingPlatform ? (
        <div className="flex items-center gap-2 px-2 py-3 text-muted-foreground text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading…
        </div>
      ) : platformComponents.length === 0 ? (
        <p className="text-xs text-muted-foreground px-2 py-2">No platform components yet</p>
      ) : (
        <div className="space-y-1">
          {platformComponents.map((component) => (
            <LibraryItem key={component.id} component={component} />
          ))}
        </div>
      )}
    </div>
  );
}
