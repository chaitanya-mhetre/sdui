'use client';

import React from 'react';
import type { RexaLayoutNode } from './types';

// Core layout widgets
import { TextWidget } from '@/components/rexa/widgets/TextWidget';
import { RowWidget } from '@/components/rexa/widgets/RowWidget';
import { ColumnWidget } from '@/components/rexa/widgets/ColumnWidget';
import { ScaffoldWidget } from '@/components/rexa/widgets/ScaffoldWidget';
import { ContainerWidget } from '@/components/rexa/widgets/ContainerWidget';
import { PaddingWidget } from '@/components/rexa/widgets/PaddingWidget';
import { CenterWidget } from '@/components/rexa/widgets/CenterWidget';
import { ExpandedWidget } from '@/components/rexa/widgets/ExpandedWidget';
import { SpacerWidget } from '@/components/rexa/widgets/SpacerWidget';
import { SizedBoxWidget } from '@/components/rexa/widgets/SizedBoxWidget';

// Navigation
import { AppBarWidget } from '@/components/rexa/widgets/AppBarWidget';

// Display
import { IconWidget } from '@/components/rexa/widgets/IconWidget';
import { ImageWidget } from '@/components/rexa/widgets/ImageWidget';
import { DividerWidget } from '@/components/rexa/widgets/DividerWidget';

// Input
import { ButtonWidget } from '@/components/rexa/widgets/ButtonWidget';

// Scrollable / Lists
import { SingleChildScrollViewWidget } from '@/components/rexa/widgets/SingleChildScrollViewWidget';
import { ListViewWidget } from '@/components/rexa/widgets/ListViewWidget';
import { ListTileWidget } from '@/components/rexa/widgets/ListTileWidget';
import { GridWidget } from '@/components/rexa/widgets/GridWidget';

// Composite
import { CardWidget } from '@/components/rexa/widgets/CardWidget';
import { CategoryItemWidget } from '@/components/rexa/widgets/CategoryItemWidget';

// Fallback
import { UnknownWidget } from '@/components/rexa/widgets/UnknownWidget';

export type { RenderChild } from './types';

export interface WidgetComponentProps {
  node: RexaLayoutNode;
  renderChild?: (node: RexaLayoutNode) => React.ReactNode;
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
