'use client';

import { memo } from 'react';

interface UnknownWidgetProps {
  type: string;
}

function UnknownWidgetComponent({ type }: UnknownWidgetProps) {
  return (
    <div className="rounded border-2 border-destructive/50 bg-destructive/10 px-2 py-1 text-xs text-destructive">
      Unknown widget: {type}
    </div>
  );
}

export const UnknownWidget = memo(UnknownWidgetComponent);
