'use client';

import React from 'react';
import type { SduiLayoutNode } from './types';

// Core layout widgets
import { TextWidget } from '@/components/sdui/widgets/TextWidget';
import { RowWidget } from '@/components/sdui/widgets/RowWidget';
import { ColumnWidget } from '@/components/sdui/widgets/ColumnWidget';
import { ScaffoldWidget } from '@/components/sdui/widgets/ScaffoldWidget';
import { ContainerWidget } from '@/components/sdui/widgets/ContainerWidget';
import { PaddingWidget } from '@/components/sdui/widgets/PaddingWidget';
import { CenterWidget } from '@/components/sdui/widgets/CenterWidget';
import { ExpandedWidget } from '@/components/sdui/widgets/ExpandedWidget';
import { SpacerWidget } from '@/components/sdui/widgets/SpacerWidget';
import { SizedBoxWidget } from '@/components/sdui/widgets/SizedBoxWidget';

// Navigation
import { AppBarWidget } from '@/components/sdui/widgets/AppBarWidget';

// Display
import { IconWidget } from '@/components/sdui/widgets/IconWidget';
import { ImageWidget } from '@/components/sdui/widgets/ImageWidget';
import { DividerWidget } from '@/components/sdui/widgets/DividerWidget';

// Input
import { ButtonWidget } from '@/components/sdui/widgets/ButtonWidget';

// Scrollable / Lists
import { SingleChildScrollViewWidget } from '@/components/sdui/widgets/SingleChildScrollViewWidget';
import { ListViewWidget } from '@/components/sdui/widgets/ListViewWidget';
import { ListTileWidget } from '@/components/sdui/widgets/ListTileWidget';
import { GridWidget } from '@/components/sdui/widgets/GridWidget';

// Composite
import { CardWidget } from '@/components/sdui/widgets/CardWidget';
import { CategoryItemWidget } from '@/components/sdui/widgets/CategoryItemWidget';

// Fallback
import { UnknownWidget } from '@/components/sdui/widgets/UnknownWidget';

export type { RenderChild } from './types';

export interface WidgetComponentProps {
  node: SduiLayoutNode;
  renderChild?: (node: SduiLayoutNode) => React.ReactNode;
}

export const widgetRegistry: Record<string, React.ComponentType<WidgetComponentProps>> = {
  // Layout
  scaffold: ScaffoldWidget,
  container: ContainerWidget,
  column: ColumnWidget,
  row: RowWidget,
  padding: PaddingWidget,
  center: CenterWidget,
  expanded: ExpandedWidget,
  spacer: SpacerWidget,
  sized_box: SizedBoxWidget,
  sizedbox: SizedBoxWidget,

  // Navigation
  app_bar: AppBarWidget,
  appbar: AppBarWidget,

  // Display
  text: TextWidget,
  icon: IconWidget,
  image: ImageWidget,
  image_asset: ImageWidget,
  image_network: ImageWidget,
  network_image: ImageWidget,
  divider: DividerWidget,

  // Input
  button: ButtonWidget,
  elevated_button: ButtonWidget,
  text_button: ButtonWidget,
  outlined_button: ButtonWidget,
  icon_button: ButtonWidget,
  floating_action_button: ButtonWidget,

  // Scrollable / Lists
  single_child_scroll_view: SingleChildScrollViewWidget,
  list_view: ListViewWidget,
  listview: ListViewWidget,
  list_tile: ListTileWidget,
  listtile: ListTileWidget,
  grid_view: GridWidget,
  grid: GridWidget,

  // Composite
  card: CardWidget,
  category_item: CategoryItemWidget,
};

export function getWidgetComponent(
  type: string
): React.ComponentType<WidgetComponentProps> | undefined {
  return widgetRegistry[type?.toLowerCase()];
}

export function renderUnknown(type: string): React.ReactElement {
  return <UnknownWidget type={type || 'empty'} />;
}
