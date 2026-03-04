'use client';

import { useBuilderStore } from '@/store/builderStore';
import { DEVICE_PRESETS, getDevicePreset } from '@/lib/devicePresets';
import { Smartphone, Tablet, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export function DeviceSelector() {
  const selectedDevicePreset = useBuilderStore((state) => state.selectedDevicePreset);
  const setSelectedDevicePreset = useBuilderStore((state) => state.setSelectedDevicePreset);
  const current = getDevicePreset(selectedDevicePreset) ?? DEVICE_PRESETS[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 rounded-lg min-w-[140px]">
          {current.type === 'phone' ? (
            <Smartphone className="w-4 h-4" />
          ) : (
            <Tablet className="w-4 h-4" />
          )}
          <span className="truncate">{current.shortLabel}</span>
          <span className="text-muted-foreground text-xs">({current.type})</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-56">
        <DropdownMenuLabel>Device & platform</DropdownMenuLabel>
        {DEVICE_PRESETS.map((preset) => (
          <DropdownMenuItem
            key={preset.id}
            onClick={() => setSelectedDevicePreset(preset.id)}
            className="gap-2"
          >
            {preset.type === 'phone' ? (
              <Smartphone className="w-4 h-4" />
            ) : (
              <Tablet className="w-4 h-4" />
            )}
            <span className="flex-1">{preset.label}</span>
            {selectedDevicePreset === preset.id && <Check className="w-4 h-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
