import { ComponentDefinition, PropertySchema } from '@/types';

// ─── Shared option sets ───────────────────────────────────────────────────────

const MAIN_AXIS_ALIGNMENT = [
  { label: 'Start', value: 'start' },
  { label: 'End', value: 'end' },
  { label: 'Center', value: 'center' },
  { label: 'Space Between', value: 'spaceBetween' },
  { label: 'Space Around', value: 'spaceAround' },
  { label: 'Space Evenly', value: 'spaceEvenly' },
];

const CROSS_AXIS_ALIGNMENT = [
  { label: 'Start', value: 'start' },
  { label: 'End', value: 'end' },
  { label: 'Center', value: 'center' },
  { label: 'Stretch', value: 'stretch' },
  { label: 'Baseline', value: 'baseline' },
];

const MAIN_AXIS_SIZE = [
  { label: 'Max (fill)', value: 'max' },
  { label: 'Min (shrink)', value: 'min' },
];

const FONT_WEIGHT_OPTIONS = [
  { label: 'Thin (100)', value: '100' },
  { label: 'Extra Light (200)', value: '200' },
  { label: 'Light (300)', value: '300' },
  { label: 'Normal (400)', value: 'normal' },
  { label: 'Medium (500)', value: '500' },
  { label: 'Semi Bold (600)', value: '600' },
  { label: 'Bold (700)', value: 'bold' },
  { label: 'Extra Bold (800)', value: '800' },
  { label: 'Black (900)', value: '900' },
];

const TEXT_ALIGN_OPTIONS = [
  { label: 'Left', value: 'left' },
  { label: 'Center', value: 'center' },
  { label: 'Right', value: 'right' },
  { label: 'Justify', value: 'justify' },
  { label: 'Start', value: 'start' },
  { label: 'End', value: 'end' },
];

const TEXT_OVERFLOW_OPTIONS = [
  { label: 'Clip', value: 'clip' },
  { label: 'Ellipsis (…)', value: 'ellipsis' },
  { label: 'Fade', value: 'fade' },
  { label: 'Visible', value: 'visible' },
];

const FONT_FAMILY_OPTIONS = [
  { label: 'System Default', value: '' },
  { label: 'Roboto', value: 'Roboto' },
  { label: 'SF Pro', value: 'SF Pro' },
  { label: 'Montserrat', value: 'Montserrat' },
  { label: 'Lato', value: 'Lato' },
  { label: 'Open Sans', value: 'Open Sans' },
  { label: 'Inter', value: 'Inter' },
  { label: 'Poppins', value: 'Poppins' },
];

const IMAGE_FIT_OPTIONS = [
  { label: 'Cover', value: 'cover' },
  { label: 'Contain', value: 'contain' },
  { label: 'Fill', value: 'fill' },
  { label: 'Fit Width', value: 'fitWidth' },
  { label: 'Fit Height', value: 'fitHeight' },
  { label: 'Scale Down', value: 'scaleDown' },
  { label: 'None', value: 'none' },
];

const SCROLL_DIRECTION = [
  { label: 'Vertical', value: 'vertical' },
  { label: 'Horizontal', value: 'horizontal' },
];

const SCROLL_PHYSICS = [
  { label: 'Normal', value: 'normal' },
  { label: 'Never Scroll', value: 'never' },
  { label: 'Always Scroll', value: 'always' },
  { label: 'Bouncing', value: 'bouncing' },
  { label: 'Clamping', value: 'clamping' },
];

const ALIGNMENT_OPTIONS = [
  { label: 'Top Left', value: 'topLeft' },
  { label: 'Top Center', value: 'topCenter' },
  { label: 'Top Right', value: 'topRight' },
  { label: 'Center Left', value: 'centerLeft' },
  { label: 'Center', value: 'center' },
  { label: 'Center Right', value: 'centerRight' },
  { label: 'Bottom Left', value: 'bottomLeft' },
  { label: 'Bottom Center', value: 'bottomCenter' },
  { label: 'Bottom Right', value: 'bottomRight' },
];

// ─── Component Registry ──────────────────────────────────────────────────────

const componentRegistry: Record<string, ComponentDefinition> = {

  // ── Scaffold ────────────────────────────────────────────────────────────────
  Scaffold: {
    id: 'Scaffold',
    name: 'Scaffold',
    category: 'layout',
    icon: 'LayoutTemplate',
    description: 'Root screen container (Material Design). Use once per screen.',
    allowChildren: true,
    children: {
      mode: 'slots',
      slots: [
        { name: 'appBar', mode: 'single' },
        { name: 'body', mode: 'single', required: true },
        { name: 'drawer', mode: 'single' },
        { name: 'floatingActionButton', mode: 'single' },
        { name: 'bottomNavigationBar', mode: 'single' },
      ],
    },
    properties: [
      { name: 'backgroundColor', type: 'color', label: 'Background Color', default: '#F5F5F5', category: 'appearance' },
      { name: 'extendBodyBehindAppBar', type: 'boolean', label: 'Extend behind AppBar', default: false, category: 'behavior' },
      { name: 'resizeToAvoidBottomInset', type: 'boolean', label: 'Resize on keyboard', default: true, category: 'behavior' },
    ],
    defaultProps: { backgroundColor: '#F5F5F5' },
  },

  // ── AppBar ──────────────────────────────────────────────────────────────────
  AppBar: {
    id: 'AppBar',
    name: 'App Bar',
    category: 'navigation',
    icon: 'PanelTop',
    description: 'Material top app bar with title and actions.',
    allowChildren: true,
    children: {
      mode: 'slots',
      slots: [
        { name: 'leading', mode: 'single' },
        { name: 'title', mode: 'single' },
        { name: 'actions', mode: 'multi', allowedTypes: ['IconButton', 'Icon', 'Button'] },
      ],
    },
    properties: [
      { name: 'title', type: 'string', label: 'Title Text', default: 'Screen Title', category: 'content' },
      { name: 'backgroundColor', type: 'color', label: 'Background Color', default: '#6366F1', category: 'appearance' },
      { name: 'foregroundColor', type: 'color', label: 'Foreground (Icon + Text)', default: '#FFFFFF', category: 'appearance' },
      { name: 'elevation', type: 'slider', label: 'Elevation (Shadow)', default: 0, min: 0, max: 20, step: 1, category: 'appearance' },
      { name: 'centerTitle', type: 'boolean', label: 'Center Title', default: false, category: 'layout' },
    ],
    defaultProps: { title: 'Screen Title', backgroundColor: '#6366F1', foregroundColor: '#FFFFFF', elevation: 0 },
  },

  // ── Container ───────────────────────────────────────────────────────────────
  Container: {
    id: 'Container',
    name: 'Container',
    category: 'layout',
    icon: 'Square',
    description: 'Flexible box with color, size, padding, border radius and elevation.',
    allowChildren: true,
    children: { mode: 'single' },
    properties: [
      { name: 'color', type: 'color', label: 'Background Color', default: '', category: 'appearance' },
      { name: 'opacity', type: 'slider', label: 'Opacity', default: 1, min: 0, max: 1, step: 0.01, category: 'appearance' },
      { name: 'borderRadius', type: 'number', label: 'Border Radius', default: 0, min: 0, max: 100, category: 'appearance' },
      { name: 'elevation', type: 'slider', label: 'Elevation (Shadow)', default: 0, min: 0, max: 24, step: 1, category: 'appearance' },
      { name: 'width', type: 'number', label: 'Width (0 = auto)', default: 0, min: 0, category: 'layout' },
      { name: 'height', type: 'number', label: 'Height (0 = auto)', default: 0, min: 0, category: 'layout' },
      { name: 'padding', type: 'spacing', label: 'Padding', default: 0, category: 'layout' },
      { name: 'margin', type: 'spacing', label: 'Margin', default: 0, category: 'layout' },
      { name: 'alignment', type: 'select', label: 'Align Child', default: '', options: [{ label: 'None', value: '' }, ...ALIGNMENT_OPTIONS], category: 'layout' },
    ],
    defaultProps: { color: '', borderRadius: 0, elevation: 0 },
  },

  // ── Column ──────────────────────────────────────────────────────────────────
  Column: {
    id: 'Column',
    name: 'Column',
    category: 'layout',
    icon: 'AlignCenterVertical',
    description: 'Vertical list of children.',
    allowChildren: true,
    children: { mode: 'multi' },
    properties: [
      { name: 'mainAxisAlignment', type: 'select', label: 'Main Axis Alignment', default: 'start', options: MAIN_AXIS_ALIGNMENT, category: 'layout' },
      { name: 'crossAxisAlignment', type: 'select', label: 'Cross Axis Alignment', default: 'stretch', options: CROSS_AXIS_ALIGNMENT, category: 'layout' },
      { name: 'mainAxisSize', type: 'select', label: 'Main Axis Size', default: 'max', options: MAIN_AXIS_SIZE, category: 'layout' },
      { name: 'gap', type: 'number', label: 'Gap Between Children', default: 0, min: 0, max: 200, category: 'layout' },
      { name: 'padding', type: 'spacing', label: 'Padding', default: 0, category: 'layout' },
    ],
    defaultProps: { mainAxisAlignment: 'start', crossAxisAlignment: 'stretch', mainAxisSize: 'max', gap: 0 },
  },

  // ── Row ─────────────────────────────────────────────────────────────────────
  Row: {
    id: 'Row',
    name: 'Row',
    category: 'layout',
    icon: 'AlignCenterHorizontal',
    description: 'Horizontal list of children.',
    allowChildren: true,
    children: { mode: 'multi' },
    properties: [
      { name: 'mainAxisAlignment', type: 'select', label: 'Main Axis Alignment', default: 'start', options: MAIN_AXIS_ALIGNMENT, category: 'layout' },
      { name: 'crossAxisAlignment', type: 'select', label: 'Cross Axis Alignment', default: 'center', options: CROSS_AXIS_ALIGNMENT, category: 'layout' },
      { name: 'mainAxisSize', type: 'select', label: 'Main Axis Size', default: 'max', options: MAIN_AXIS_SIZE, category: 'layout' },
      { name: 'gap', type: 'number', label: 'Gap Between Children', default: 0, min: 0, max: 200, category: 'layout' },
      { name: 'padding', type: 'spacing', label: 'Padding', default: 0, category: 'layout' },
    ],
    defaultProps: { mainAxisAlignment: 'start', crossAxisAlignment: 'center', mainAxisSize: 'max', gap: 0 },
  },

  // ── Padding ─────────────────────────────────────────────────────────────────
  Padding: {
    id: 'Padding',
    name: 'Padding',
    category: 'layout',
    icon: 'SquareDashed',
    description: 'Adds padding around a single child.',
    allowChildren: true,
    children: { mode: 'single' },
    properties: [
      { name: 'padding', type: 'spacing', label: 'Padding', default: 16, category: 'layout' },
    ],
    defaultProps: { padding: 16 },
  },

  // ── Center ──────────────────────────────────────────────────────────────────
  Center: {
    id: 'Center',
    name: 'Center',
    category: 'layout',
    icon: 'Crosshair',
    description: 'Centers a single child within itself.',
    allowChildren: true,
    children: { mode: 'single' },
    properties: [
      { name: 'widthFactor', type: 'number', label: 'Width Factor (0 = fill)', default: 0, min: 0, step: 0.1, category: 'layout' },
      { name: 'heightFactor', type: 'number', label: 'Height Factor (0 = fill)', default: 0, min: 0, step: 0.1, category: 'layout' },
    ],
    defaultProps: {},
  },

  // ── Expanded ────────────────────────────────────────────────────────────────
  Expanded: {
    id: 'Expanded',
    name: 'Expanded',
    category: 'layout',
    icon: 'Maximize2',
    description: 'Expands a child to fill available space.',
    allowChildren: true,
    children: { mode: 'single' },
    properties: [
      { name: 'flex', type: 'number', label: 'Flex Factor', default: 1, min: 1, max: 12, category: 'layout' },
    ],
    defaultProps: { flex: 1 },
  },

  // ── Spacer ──────────────────────────────────────────────────────────────────
  Spacer: {
    id: 'Spacer',
    name: 'Spacer',
    category: 'layout',
    icon: 'Space',
    description: 'Flexible space between widgets.',
    allowChildren: false,
    children: { mode: 'none' },
    properties: [
      { name: 'flex', type: 'number', label: 'Flex Factor', default: 1, min: 1, max: 12, category: 'layout' },
    ],
    defaultProps: { flex: 1 },
  },

  // ── SizedBox ────────────────────────────────────────────────────────────────
  SizedBox: {
    id: 'SizedBox',
    name: 'Sized Box',
    category: 'layout',
    icon: 'RectangleHorizontal',
    description: 'Fixed-size box; use for spacing or constraining a child.',
    allowChildren: true,
    children: { mode: 'none' },
    properties: [
      { name: 'width', type: 'number', label: 'Width (px)', default: 0, min: 0, category: 'layout' },
      { name: 'height', type: 'number', label: 'Height (px)', default: 0, min: 0, category: 'layout' },
    ],
    defaultProps: { width: 0, height: 16 },
  },

  // ── SingleChildScrollView ───────────────────────────────────────────────────
  SingleChildScrollView: {
    id: 'SingleChildScrollView',
    name: 'Scroll View',
    category: 'layout',
    icon: 'ScrollText',
    description: 'Scrollable container for a single child.',
    allowChildren: true,
    children: { mode: 'single' },
    properties: [
      { name: 'scrollDirection', type: 'select', label: 'Scroll Direction', default: 'vertical', options: SCROLL_DIRECTION, category: 'behavior' },
      { name: 'padding', type: 'spacing', label: 'Inner Padding', default: 0, category: 'layout' },
      { name: 'physics', type: 'select', label: 'Scroll Physics', default: 'normal', options: SCROLL_PHYSICS, category: 'behavior' },
    ],
    defaultProps: { scrollDirection: 'vertical' },
  },

  // ── Text ────────────────────────────────────────────────────────────────────
  Text: {
    id: 'Text',
    name: 'Text',
    category: 'display',
    icon: 'Type',
    description: 'Renders text with full typography control.',
    allowChildren: false,
    children: { mode: 'none' },
    properties: [
      { name: 'data', type: 'textarea', label: 'Text Content', default: 'Hello World', category: 'content' },
      { name: 'color', type: 'color', label: 'Color', default: '#000000', category: 'appearance' },
      { name: 'fontSize', type: 'slider', label: 'Font Size', default: 14, min: 8, max: 96, step: 1, category: 'appearance' },
      { name: 'fontWeight', type: 'select', label: 'Font Weight', default: 'normal', options: FONT_WEIGHT_OPTIONS, category: 'appearance' },
      { name: 'fontStyle', type: 'select', label: 'Font Style', default: 'normal', options: [{ label: 'Normal', value: 'normal' }, { label: 'Italic', value: 'italic' }], category: 'appearance' },
      { name: 'fontFamily', type: 'select', label: 'Font Family', default: '', options: FONT_FAMILY_OPTIONS, category: 'appearance' },
      { name: 'letterSpacing', type: 'number', label: 'Letter Spacing', default: 0, min: -10, max: 50, step: 0.5, category: 'appearance' },
      { name: 'wordSpacing', type: 'number', label: 'Word Spacing', default: 0, min: -10, max: 100, step: 0.5, category: 'appearance' },
      { name: 'lineHeight', type: 'number', label: 'Line Height', default: 1.5, min: 0.5, max: 5, step: 0.1, category: 'appearance' },
      { name: 'textAlign', type: 'select', label: 'Text Align', default: 'left', options: TEXT_ALIGN_OPTIONS, category: 'layout' },
      { name: 'maxLines', type: 'number', label: 'Max Lines (0 = unlimited)', default: 0, min: 0, max: 100, category: 'behavior' },
      { name: 'overflow', type: 'select', label: 'Overflow', default: 'clip', options: TEXT_OVERFLOW_OPTIONS, category: 'behavior' },
    ],
    defaultProps: { data: 'Text', fontSize: 14, color: '#000000', fontWeight: 'normal' },
  },

  // ── Icon ────────────────────────────────────────────────────────────────────
  Icon: {
    id: 'Icon',
    name: 'Icon',
    category: 'display',
    icon: 'Smile',
    description: 'Material Design icon.',
    allowChildren: false,
    children: { mode: 'none' },
    properties: [
      { name: 'name', type: 'icon', label: 'Icon', default: 'search', category: 'content' },
      { name: 'size', type: 'slider', label: 'Size', default: 24, min: 8, max: 96, step: 1, category: 'appearance' },
      { name: 'color', type: 'color', label: 'Color', default: '#000000', category: 'appearance' },
    ],
    defaultProps: { name: 'search', size: 24, color: '#000000' },
  },

  // ── Image ───────────────────────────────────────────────────────────────────
  Image: {
    id: 'Image',
    name: 'Image',
    category: 'media',
    icon: 'ImageIcon',
    description: 'Network or asset image.',
    allowChildren: false,
    children: { mode: 'none' },
    properties: [
      { name: 'url', type: 'image', label: 'Image URL', default: '', category: 'content' },
      { name: 'fit', type: 'select', label: 'Fit Mode', default: 'cover', options: IMAGE_FIT_OPTIONS, category: 'appearance' },
      { name: 'borderRadius', type: 'number', label: 'Border Radius', default: 0, min: 0, max: 200, category: 'appearance' },
      { name: 'width', type: 'number', label: 'Width (0 = fill)', default: 0, min: 0, category: 'layout' },
      { name: 'height', type: 'number', label: 'Height (0 = auto)', default: 200, min: 0, category: 'layout' },
    ],
    defaultProps: { url: '', fit: 'cover', height: 200 },
  },

  // ── Divider ─────────────────────────────────────────────────────────────────
  Divider: {
    id: 'Divider',
    name: 'Divider',
    category: 'display',
    icon: 'Minus',
    description: 'Horizontal separator line.',
    allowChildren: false,
    children: { mode: 'none' },
    properties: [
      { name: 'color', type: 'color', label: 'Color', default: '#E0E0E0', category: 'appearance' },
      { name: 'thickness', type: 'number', label: 'Thickness (px)', default: 1, min: 0.5, max: 20, step: 0.5, category: 'appearance' },
      { name: 'height', type: 'number', label: 'Height (spacing + line)', default: 16, min: 0, max: 100, category: 'layout' },
      { name: 'indent', type: 'number', label: 'Leading Indent', default: 0, min: 0, max: 200, category: 'layout' },
      { name: 'endIndent', type: 'number', label: 'Trailing Indent', default: 0, min: 0, max: 200, category: 'layout' },
    ],
    defaultProps: { color: '#E0E0E0', thickness: 1, height: 16 },
  },

  // ── Card ────────────────────────────────────────────────────────────────────
  Card: {
    id: 'Card',
    name: 'Card',
    category: 'display',
    icon: 'CreditCard',
    description: 'Material card with elevation and rounded corners.',
    allowChildren: true,
    children: { mode: 'single' },
    properties: [
      { name: 'backgroundColor', type: 'color', label: 'Background Color', default: '#FFFFFF', category: 'appearance' },
      { name: 'elevation', type: 'slider', label: 'Elevation (Shadow)', default: 2, min: 0, max: 24, step: 1, category: 'appearance' },
      { name: 'borderRadius', type: 'number', label: 'Border Radius', default: 12, min: 0, max: 100, category: 'appearance' },
      { name: 'padding', type: 'spacing', label: 'Inner Padding', default: 0, category: 'layout' },
      { name: 'margin', type: 'spacing', label: 'Margin', default: 0, category: 'layout' },
    ],
    defaultProps: { backgroundColor: '#FFFFFF', elevation: 2, borderRadius: 12 },
  },

  // ── ListTile ─────────────────────────────────────────────────────────────────
  ListTile: {
    id: 'ListTile',
    name: 'List Tile',
    category: 'display',
    icon: 'List',
    description: 'Material list tile with leading, title, subtitle, and trailing.',
    allowChildren: false,
    children: {
      mode: 'slots',
      slots: [
        { name: 'leading', mode: 'single' },
        { name: 'title', mode: 'single' },
        { name: 'subtitle', mode: 'single' },
        { name: 'trailing', mode: 'single' },
      ],
    },
    properties: [
      { name: 'title', type: 'string', label: 'Title', default: 'Title', category: 'content' },
      { name: 'subtitle', type: 'string', label: 'Subtitle', default: '', category: 'content' },
      { name: 'backgroundColor', type: 'color', label: 'Background Color', default: '', category: 'appearance' },
      { name: 'contentPadding', type: 'spacing', label: 'Content Padding', default: 16, category: 'layout' },
      { name: 'minHeight', type: 'number', label: 'Min Height', default: 56, min: 40, max: 200, category: 'layout' },
      { name: 'dense', type: 'boolean', label: 'Dense (compact)', default: false, category: 'behavior' },
      { name: 'isThreeLine', type: 'boolean', label: 'Three Lines', default: false, category: 'behavior' },
      { name: 'enabled', type: 'boolean', label: 'Enabled', default: true, category: 'behavior' },
    ],
    defaultProps: { title: 'Title', minHeight: 56, enabled: true },
  },

  // ── ListView ─────────────────────────────────────────────────────────────────
  ListView: {
    id: 'ListView',
    name: 'List View',
    category: 'display',
    icon: 'ListOrdered',
    description: 'Scrollable list of widgets.',
    allowChildren: true,
    children: { mode: 'multi' },
    properties: [
      { name: 'scrollDirection', type: 'select', label: 'Scroll Direction', default: 'vertical', options: SCROLL_DIRECTION, category: 'behavior' },
      { name: 'padding', type: 'spacing', label: 'Padding', default: 0, category: 'layout' },
      { name: 'itemExtent', type: 'number', label: 'Item Extent (0 = auto)', default: 0, min: 0, category: 'layout' },
      { name: 'shrinkWrap', type: 'boolean', label: 'Shrink Wrap', default: false, category: 'behavior' },
      { name: 'physics', type: 'select', label: 'Scroll Physics', default: 'normal', options: SCROLL_PHYSICS, category: 'behavior' },
      { name: 'separatorHeight', type: 'number', label: 'Separator Height', default: 0, min: 0, max: 40, category: 'appearance' },
    ],
    defaultProps: { scrollDirection: 'vertical', shrinkWrap: false },
  },

  // ── GridView ─────────────────────────────────────────────────────────────────
  GridView: {
    id: 'GridView',
    name: 'Grid View',
    category: 'display',
    icon: 'LayoutGrid',
    description: 'Scrollable grid of widgets.',
    allowChildren: true,
    children: { mode: 'multi' },
    properties: [
      { name: 'crossAxisCount', type: 'number', label: 'Columns', default: 2, min: 1, max: 10, category: 'layout' },
      { name: 'mainAxisSpacing', type: 'number', label: 'Row Spacing', default: 8, min: 0, max: 100, category: 'layout' },
      { name: 'crossAxisSpacing', type: 'number', label: 'Column Spacing', default: 8, min: 0, max: 100, category: 'layout' },
      { name: 'childAspectRatio', type: 'number', label: 'Child Aspect Ratio (W/H)', default: 1.0, min: 0.1, max: 10, step: 0.1, category: 'layout' },
      { name: 'padding', type: 'spacing', label: 'Padding', default: 0, category: 'layout' },
      { name: 'scrollDirection', type: 'select', label: 'Scroll Direction', default: 'vertical', options: SCROLL_DIRECTION, category: 'behavior' },
      { name: 'shrinkWrap', type: 'boolean', label: 'Shrink Wrap', default: false, category: 'behavior' },
      { name: 'physics', type: 'select', label: 'Scroll Physics', default: 'normal', options: SCROLL_PHYSICS, category: 'behavior' },
    ],
    defaultProps: { crossAxisCount: 2, mainAxisSpacing: 8, crossAxisSpacing: 8, childAspectRatio: 1.0 },
  },

  // ── Elevated Button ──────────────────────────────────────────────────────────
  Button: {
    id: 'Button',
    name: 'Button',
    category: 'input',
    icon: 'RectangleEllipsis',
    description: 'Elevated Material button.',
    allowChildren: false,
    children: { mode: 'single' },
    properties: [
      { name: 'label', type: 'string', label: 'Label Text', default: 'Button', category: 'content' },
      { name: 'backgroundColor', type: 'color', label: 'Background Color', default: '#6366F1', category: 'appearance' },
      { name: 'color', type: 'color', label: 'Text / Icon Color', default: '#FFFFFF', category: 'appearance' },
      { name: 'fontSize', type: 'slider', label: 'Font Size', default: 14, min: 8, max: 32, step: 1, category: 'appearance' },
      { name: 'fontWeight', type: 'select', label: 'Font Weight', default: '600', options: FONT_WEIGHT_OPTIONS, category: 'appearance' },
      { name: 'borderRadius', type: 'number', label: 'Border Radius', default: 8, min: 0, max: 100, category: 'appearance' },
      { name: 'elevation', type: 'slider', label: 'Elevation', default: 2, min: 0, max: 20, step: 1, category: 'appearance' },
      { name: 'paddingHorizontal', type: 'number', label: 'Horizontal Padding', default: 16, min: 0, max: 100, category: 'layout' },
      { name: 'paddingVertical', type: 'number', label: 'Vertical Padding', default: 12, min: 0, max: 100, category: 'layout' },
      { name: 'fullWidth', type: 'boolean', label: 'Full Width', default: false, category: 'layout' },
      { name: 'disabled', type: 'boolean', label: 'Disabled', default: false, category: 'behavior' },
    ],
    defaultProps: { label: 'Button', backgroundColor: '#6366F1', color: '#FFFFFF', borderRadius: 8, elevation: 2 },
  },

  // ── Text Button ──────────────────────────────────────────────────────────────
  TextButton: {
    id: 'TextButton',
    name: 'Text Button',
    category: 'input',
    icon: 'AlignJustify',
    description: 'Flat text button with no elevation.',
    allowChildren: false,
    children: { mode: 'single' },
    properties: [
      { name: 'label', type: 'string', label: 'Label Text', default: 'Cancel', category: 'content' },
      { name: 'color', type: 'color', label: 'Text Color', default: '#6366F1', category: 'appearance' },
      { name: 'fontSize', type: 'slider', label: 'Font Size', default: 14, min: 8, max: 32, step: 1, category: 'appearance' },
      { name: 'fontWeight', type: 'select', label: 'Font Weight', default: '500', options: FONT_WEIGHT_OPTIONS, category: 'appearance' },
      { name: 'paddingHorizontal', type: 'number', label: 'Horizontal Padding', default: 8, min: 0, max: 100, category: 'layout' },
      { name: 'paddingVertical', type: 'number', label: 'Vertical Padding', default: 8, min: 0, max: 100, category: 'layout' },
      { name: 'fullWidth', type: 'boolean', label: 'Full Width', default: false, category: 'layout' },
      { name: 'disabled', type: 'boolean', label: 'Disabled', default: false, category: 'behavior' },
    ],
    defaultProps: { label: 'Cancel', color: '#6366F1', fontSize: 14 },
  },

  // ── Outlined Button ──────────────────────────────────────────────────────────
  OutlinedButton: {
    id: 'OutlinedButton',
    name: 'Outlined Button',
    category: 'input',
    icon: 'SquareDashed',
    description: 'Button with a visible border and no fill.',
    allowChildren: false,
    children: { mode: 'single' },
    properties: [
      { name: 'label', type: 'string', label: 'Label Text', default: 'Outlined', category: 'content' },
      { name: 'color', type: 'color', label: 'Text Color', default: '#6366F1', category: 'appearance' },
      { name: 'borderColor', type: 'color', label: 'Border Color', default: '#6366F1', category: 'appearance' },
      { name: 'borderWidth', type: 'number', label: 'Border Width', default: 1.5, min: 0.5, max: 10, step: 0.5, category: 'appearance' },
      { name: 'fontSize', type: 'slider', label: 'Font Size', default: 14, min: 8, max: 32, step: 1, category: 'appearance' },
      { name: 'borderRadius', type: 'number', label: 'Border Radius', default: 8, min: 0, max: 100, category: 'appearance' },
      { name: 'paddingHorizontal', type: 'number', label: 'Horizontal Padding', default: 16, min: 0, max: 100, category: 'layout' },
      { name: 'paddingVertical', type: 'number', label: 'Vertical Padding', default: 12, min: 0, max: 100, category: 'layout' },
      { name: 'fullWidth', type: 'boolean', label: 'Full Width', default: false, category: 'layout' },
      { name: 'disabled', type: 'boolean', label: 'Disabled', default: false, category: 'behavior' },
    ],
    defaultProps: { label: 'Outlined', color: '#6366F1', borderColor: '#6366F1', borderRadius: 8 },
  },

  // ── Icon Button ──────────────────────────────────────────────────────────────
  IconButton: {
    id: 'IconButton',
    name: 'Icon Button',
    category: 'input',
    icon: 'CircleDot',
    description: 'Tappable icon button.',
    allowChildren: false,
    children: { mode: 'single' },
    properties: [
      { name: 'name', type: 'icon', label: 'Icon', default: 'search', category: 'content' },
      { name: 'tooltip', type: 'string', label: 'Tooltip', default: '', category: 'content' },
      { name: 'color', type: 'color', label: 'Icon Color', default: '#000000', category: 'appearance' },
      { name: 'size', type: 'slider', label: 'Icon Size', default: 24, min: 8, max: 96, step: 1, category: 'appearance' },
      { name: 'disabled', type: 'boolean', label: 'Disabled', default: false, category: 'behavior' },
    ],
    defaultProps: { name: 'search', color: '#000000', size: 24 },
  },

  // ── Floating Action Button ────────────────────────────────────────────────────
  FloatingActionButton: {
    id: 'FloatingActionButton',
    name: 'FAB',
    category: 'input',
    icon: 'PlusCircle',
    description: 'Floating action button.',
    allowChildren: false,
    children: { mode: 'single' },
    properties: [
      { name: 'name', type: 'icon', label: 'Icon', default: 'add', category: 'content' },
      { name: 'tooltip', type: 'string', label: 'Tooltip', default: '', category: 'content' },
      { name: 'backgroundColor', type: 'color', label: 'Background Color', default: '#6366F1', category: 'appearance' },
      { name: 'foregroundColor', type: 'color', label: 'Icon Color', default: '#FFFFFF', category: 'appearance' },
      { name: 'mini', type: 'boolean', label: 'Mini Size', default: false, category: 'layout' },
      { name: 'elevation', type: 'slider', label: 'Elevation', default: 6, min: 0, max: 20, step: 1, category: 'appearance' },
    ],
    defaultProps: { name: 'add', backgroundColor: '#6366F1', foregroundColor: '#FFFFFF', elevation: 6 },
  },

  // ── Category Item ─────────────────────────────────────────────────────────────
  CategoryItem: {
    id: 'CategoryItem',
    name: 'Category Item',
    category: 'display',
    icon: 'Tag',
    description: 'Icon + label category chip.',
    allowChildren: false,
    children: { mode: 'none' },
    properties: [
      { name: 'label', type: 'string', label: 'Label', default: 'Category', category: 'content' },
      { name: 'name', type: 'icon', label: 'Icon', default: 'star', category: 'content' },
      { name: 'color', type: 'color', label: 'Icon Color', default: '#6366F1', category: 'appearance' },
      { name: 'backgroundColor', type: 'color', label: 'Background Color', default: '#EEF2FF', category: 'appearance' },
      { name: 'borderRadius', type: 'number', label: 'Border Radius', default: 12, min: 0, max: 100, category: 'appearance' },
      { name: 'padding', type: 'spacing', label: 'Padding', default: 8, category: 'layout' },
    ],
    defaultProps: { label: 'Category', name: 'star', color: '#6366F1', backgroundColor: '#EEF2FF', borderRadius: 12 },
  },

  // ── Stack ────────────────────────────────────────────────────────────────────
  Stack: {
    id: 'Stack',
    name: 'Stack',
    category: 'layout',
    icon: 'Layers',
    description: 'Overlay children on top of each other.',
    allowChildren: true,
    children: { mode: 'multi' },
    properties: [
      { name: 'alignment', type: 'select', label: 'Alignment', default: 'topLeft', options: ALIGNMENT_OPTIONS, category: 'layout' },
      { name: 'fit', type: 'select', label: 'Fit', default: 'loose', options: [
        { label: 'Loose', value: 'loose' },
        { label: 'Expand', value: 'expand' },
        { label: 'Passthrough', value: 'passthrough' },
      ], category: 'layout' },
      { name: 'clipBehavior', type: 'select', label: 'Clip Behavior', default: 'hardEdge', options: [
        { label: 'None', value: 'none' },
        { label: 'Hard Edge', value: 'hardEdge' },
        { label: 'Anti-alias', value: 'antiAlias' },
      ], category: 'layout' },
    ],
    defaultProps: { alignment: 'topLeft', fit: 'loose', clipBehavior: 'hardEdge' },
  },

  // ── Positioned ────────────────────────────────────────────────────────────────
  Positioned: {
    id: 'Positioned',
    name: 'Positioned',
    category: 'layout',
    icon: 'Move',
    description: 'Positions a child at specific coordinates inside a Stack.',
    allowChildren: true,
    children: { mode: 'single' },
    properties: [
      { name: 'top', type: 'number', label: 'Top', default: 0, min: 0, category: 'layout' },
      { name: 'left', type: 'number', label: 'Left', default: 0, min: 0, category: 'layout' },
      { name: 'right', type: 'number', label: 'Right', default: 0, min: 0, category: 'layout' },
      { name: 'bottom', type: 'number', label: 'Bottom', default: 0, min: 0, category: 'layout' },
      { name: 'width', type: 'number', label: 'Width (0 = auto)', default: 0, min: 0, category: 'layout' },
      { name: 'height', type: 'number', label: 'Height (0 = auto)', default: 0, min: 0, category: 'layout' },
    ],
    defaultProps: { top: 0, left: 0 },
  },

  // ── Wrap ──────────────────────────────────────────────────────────────────────
  Wrap: {
    id: 'Wrap',
    name: 'Wrap',
    category: 'layout',
    icon: 'AlignJustify',
    description: 'Displays children in a flow that wraps to the next line.',
    allowChildren: true,
    children: { mode: 'multi' },
    properties: [
      { name: 'direction', type: 'select', label: 'Direction', default: 'horizontal', options: SCROLL_DIRECTION, category: 'layout' },
      { name: 'alignment', type: 'select', label: 'Alignment', default: 'start', options: MAIN_AXIS_ALIGNMENT, category: 'layout' },
      { name: 'spacing', type: 'number', label: 'Spacing (main axis)', default: 8, min: 0, max: 200, category: 'layout' },
      { name: 'runSpacing', type: 'number', label: 'Run Spacing (cross axis)', default: 8, min: 0, max: 200, category: 'layout' },
    ],
    defaultProps: { direction: 'horizontal', alignment: 'start', spacing: 8, runSpacing: 8 },
  },

  // ── SafeArea ──────────────────────────────────────────────────────────────────
  SafeArea: {
    id: 'SafeArea',
    name: 'Safe Area',
    category: 'layout',
    icon: 'Smartphone',
    description: 'Insets a child to avoid OS intrusions (notch, home bar).',
    allowChildren: true,
    children: { mode: 'single' },
    properties: [
      { name: 'top', type: 'boolean', label: 'Top inset', default: true, category: 'layout' },
      { name: 'bottom', type: 'boolean', label: 'Bottom inset', default: true, category: 'layout' },
      { name: 'left', type: 'boolean', label: 'Left inset', default: true, category: 'layout' },
      { name: 'right', type: 'boolean', label: 'Right inset', default: true, category: 'layout' },
    ],
    defaultProps: { top: true, bottom: true, left: true, right: true },
  },

  // ── CircularProgressIndicator ─────────────────────────────────────────────────
  CircularProgressIndicator: {
    id: 'CircularProgressIndicator',
    name: 'Circular Progress',
    category: 'display',
    icon: 'Loader',
    description: 'Circular spinner for loading / progress states.',
    allowChildren: false,
    children: { mode: 'none' },
    properties: [
      { name: 'value', type: 'slider', label: 'Value (empty = indeterminate)', default: 0, min: 0, max: 1, step: 0.01, category: 'content' },
      { name: 'color', type: 'color', label: 'Color', default: '#6366F1', category: 'appearance' },
      { name: 'strokeWidth', type: 'slider', label: 'Stroke Width', default: 4, min: 1, max: 20, step: 0.5, category: 'appearance' },
    ],
    defaultProps: { color: '#6366F1', strokeWidth: 4 },
  },

  // ── LinearProgressIndicator ───────────────────────────────────────────────────
  LinearProgressIndicator: {
    id: 'LinearProgressIndicator',
    name: 'Linear Progress',
    category: 'display',
    icon: 'Loader2',
    description: 'Horizontal bar for loading / progress states.',
    allowChildren: false,
    children: { mode: 'none' },
    properties: [
      { name: 'value', type: 'slider', label: 'Value (empty = indeterminate)', default: 0, min: 0, max: 1, step: 0.01, category: 'content' },
      { name: 'color', type: 'color', label: 'Indicator Color', default: '#6366F1', category: 'appearance' },
      { name: 'minHeight', type: 'number', label: 'Min Height', default: 4, min: 1, max: 40, category: 'layout' },
    ],
    defaultProps: { color: '#6366F1', minHeight: 4 },
  },

  // ── Checkbox ──────────────────────────────────────────────────────────────────
  Checkbox: {
    id: 'Checkbox',
    name: 'Checkbox',
    category: 'input',
    icon: 'SquareCheck',
    description: 'Boolean checkbox with optional label.',
    allowChildren: false,
    children: { mode: 'none' },
    properties: [
      { name: 'id', type: 'string', label: 'Field ID', default: 'checkbox', category: 'content' },
      { name: 'value', type: 'boolean', label: 'Checked', default: false, category: 'content' },
      { name: 'label', type: 'string', label: 'Label', default: 'Checkbox', category: 'content' },
      { name: 'activeColor', type: 'color', label: 'Active Color', default: '#6366F1', category: 'appearance' },
    ],
    defaultProps: { id: 'checkbox', value: false, label: 'Checkbox', activeColor: '#6366F1' },
  },

  // ── Switch ────────────────────────────────────────────────────────────────────
  Switch: {
    id: 'Switch',
    name: 'Switch',
    category: 'input',
    icon: 'ToggleLeft',
    description: 'Toggle switch for on/off states.',
    allowChildren: false,
    children: { mode: 'none' },
    properties: [
      { name: 'id', type: 'string', label: 'Field ID', default: 'switch', category: 'content' },
      { name: 'value', type: 'boolean', label: 'On', default: false, category: 'content' },
      { name: 'label', type: 'string', label: 'Label', default: 'Switch', category: 'content' },
      { name: 'activeColor', type: 'color', label: 'Active Color', default: '#6366F1', category: 'appearance' },
    ],
    defaultProps: { id: 'switch', value: false, label: 'Switch', activeColor: '#6366F1' },
  },

  // ── Slider ────────────────────────────────────────────────────────────────────
  Slider: {
    id: 'Slider',
    name: 'Slider',
    category: 'input',
    icon: 'Sliders',
    description: 'Range slider for numeric input.',
    allowChildren: false,
    children: { mode: 'none' },
    properties: [
      { name: 'id', type: 'string', label: 'Field ID', default: 'slider', category: 'content' },
      { name: 'value', type: 'number', label: 'Value', default: 0.5, min: 0, max: 1, step: 0.01, category: 'content' },
      { name: 'min', type: 'number', label: 'Min', default: 0, category: 'content' },
      { name: 'max', type: 'number', label: 'Max', default: 1, category: 'content' },
      { name: 'divisions', type: 'number', label: 'Divisions (0 = continuous)', default: 0, min: 0, max: 100, category: 'behavior' },
      { name: 'label', type: 'string', label: 'Label (shown on thumb)', default: '', category: 'content' },
      { name: 'activeColor', type: 'color', label: 'Active Color', default: '#6366F1', category: 'appearance' },
    ],
    defaultProps: { id: 'slider', value: 0.5, min: 0, max: 1, activeColor: '#6366F1' },
  },

  // ── Radio ─────────────────────────────────────────────────────────────────────
  Radio: {
    id: 'Radio',
    name: 'Radio',
    category: 'input',
    icon: 'CircleDot',
    description: 'Single radio button within a named group.',
    allowChildren: false,
    children: { mode: 'none' },
    properties: [
      { name: 'id', type: 'string', label: 'Field ID', default: 'radio', category: 'content' },
      { name: 'name', type: 'string', label: 'Group Name', default: 'group', category: 'content' },
      { name: 'value', type: 'string', label: 'Value', default: 'option1', category: 'content' },
      { name: 'label', type: 'string', label: 'Label', default: 'Option', category: 'content' },
      { name: 'activeColor', type: 'color', label: 'Active Color', default: '#6366F1', category: 'appearance' },
    ],
    defaultProps: { id: 'radio', name: 'group', value: 'option1', label: 'Option', activeColor: '#6366F1' },
  },

  // ── Chip ──────────────────────────────────────────────────────────────────────
  Chip: {
    id: 'Chip',
    name: 'Chip',
    category: 'display',
    icon: 'Tag',
    description: 'Compact element for tags, filters, or attributes.',
    allowChildren: false,
    children: { mode: 'none' },
    properties: [
      { name: 'label', type: 'string', label: 'Label', default: 'Chip', category: 'content' },
      { name: 'backgroundColor', type: 'color', label: 'Background Color', default: '#E8EAF6', category: 'appearance' },
      { name: 'labelColor', type: 'color', label: 'Label Color', default: '#3949AB', category: 'appearance' },
      { name: 'borderRadius', type: 'number', label: 'Border Radius', default: 16, min: 0, max: 50, category: 'appearance' },
    ],
    defaultProps: { label: 'Chip', backgroundColor: '#E8EAF6', labelColor: '#3949AB', borderRadius: 16 },
  },

  // ── Badge ─────────────────────────────────────────────────────────────────────
  Badge: {
    id: 'Badge',
    name: 'Badge',
    category: 'display',
    icon: 'Bell',
    description: 'Small badge overlaid on a child widget (e.g. notification count).',
    allowChildren: true,
    children: { mode: 'single' },
    properties: [
      { name: 'label', type: 'string', label: 'Label', default: '1', category: 'content' },
      { name: 'backgroundColor', type: 'color', label: 'Background Color', default: '#EF4444', category: 'appearance' },
      { name: 'textColor', type: 'color', label: 'Text Color', default: '#FFFFFF', category: 'appearance' },
    ],
    defaultProps: { label: '1', backgroundColor: '#EF4444', textColor: '#FFFFFF' },
  },

  // ── Tooltip ───────────────────────────────────────────────────────────────────
  Tooltip: {
    id: 'Tooltip',
    name: 'Tooltip',
    category: 'display',
    icon: 'MessageCircle',
    description: 'Shows a floating message when a child is long-pressed.',
    allowChildren: true,
    children: { mode: 'single' },
    properties: [
      { name: 'message', type: 'string', label: 'Message', default: 'Tooltip text', category: 'content' },
      { name: 'preferBelow', type: 'boolean', label: 'Prefer Below', default: true, category: 'behavior' },
    ],
    defaultProps: { message: 'Tooltip text', preferBelow: true },
  },

  // ── Form ──────────────────────────────────────────────────────────────────────
  Form: {
    id: 'Form',
    name: 'Form',
    category: 'input',
    icon: 'ClipboardEdit',
    description: 'Groups form fields and manages validation state.',
    allowChildren: true,
    children: { mode: 'single' },
    properties: [
      { name: 'id', type: 'string', label: 'Form ID', default: 'form', category: 'content' },
    ],
    defaultProps: { id: 'form' },
  },

  // ── TextFormField ─────────────────────────────────────────────────────────────
  TextFormField: {
    id: 'TextFormField',
    name: 'Text Form Field',
    category: 'input',
    icon: 'PenSquare',
    description: 'Validated text input for use inside a Form.',
    allowChildren: false,
    children: { mode: 'none' },
    properties: [
      { name: 'id', type: 'string', label: 'Field ID', default: 'field', category: 'content' },
      { name: 'label', type: 'string', label: 'Label', default: 'Label', category: 'content' },
      { name: 'hintText', type: 'string', label: 'Hint Text', default: '', category: 'content' },
      { name: 'obscureText', type: 'boolean', label: 'Password (hide text)', default: false, category: 'behavior' },
      { name: 'keyboardType', type: 'select', label: 'Keyboard Type', default: 'text', options: [
        { label: 'Text', value: 'text' },
        { label: 'Email', value: 'emailAddress' },
        { label: 'Number', value: 'number' },
        { label: 'Phone', value: 'phone' },
        { label: 'Multiline', value: 'multiline' },
        { label: 'URL', value: 'url' },
      ], category: 'behavior' },
      { name: 'validatorRules', type: 'textarea', label: 'Validator Rules (JSON)', default: '', category: 'behavior' },
    ],
    defaultProps: { id: 'field', label: 'Label', obscureText: false, keyboardType: 'text' },
  },

  // ── Legacy / alternate names ──────────────────────────────────────────────────
  // HStack → alias for Row
  HStack: {
    id: 'HStack',
    name: 'HStack',
    category: 'layout',
    icon: 'AlignCenterHorizontal',
    description: 'Horizontal stack (alias for Row).',
    allowChildren: true,
    children: { mode: 'multi' },
    properties: [
      { name: 'mainAxisAlignment', type: 'select', label: 'Main Axis Alignment', default: 'start', options: MAIN_AXIS_ALIGNMENT, category: 'layout' },
      { name: 'crossAxisAlignment', type: 'select', label: 'Cross Axis Alignment', default: 'center', options: CROSS_AXIS_ALIGNMENT, category: 'layout' },
      { name: 'gap', type: 'number', label: 'Gap', default: 0, min: 0, max: 200, category: 'layout' },
      { name: 'padding', type: 'spacing', label: 'Padding', default: 0, category: 'layout' },
      { name: 'backgroundColor', type: 'color', label: 'Background Color', default: '', category: 'appearance' },
    ],
    defaultProps: { gap: 0 },
  },

  // VStack → alias for Column
  VStack: {
    id: 'VStack',
    name: 'VStack',
    category: 'layout',
    icon: 'AlignCenterVertical',
    description: 'Vertical stack (alias for Column).',
    allowChildren: true,
    children: { mode: 'multi' },
    properties: [
      { name: 'mainAxisAlignment', type: 'select', label: 'Main Axis Alignment', default: 'start', options: MAIN_AXIS_ALIGNMENT, category: 'layout' },
      { name: 'crossAxisAlignment', type: 'select', label: 'Cross Axis Alignment', default: 'stretch', options: CROSS_AXIS_ALIGNMENT, category: 'layout' },
      { name: 'gap', type: 'number', label: 'Gap', default: 8, min: 0, max: 200, category: 'layout' },
      { name: 'padding', type: 'spacing', label: 'Padding', default: 0, category: 'layout' },
      { name: 'backgroundColor', type: 'color', label: 'Background Color', default: '', category: 'appearance' },
    ],
    defaultProps: { gap: 8 },
  },

  // TextInput (form element)
  TextInput: {
    id: 'TextInput',
    name: 'Text Field',
    category: 'input',
    icon: 'TextCursorInput',
    description: 'Single-line text input field.',
    allowChildren: false,
    children: { mode: 'none' },
    properties: [
      { name: 'placeholder', type: 'string', label: 'Placeholder', default: 'Enter text…', category: 'content' },
      { name: 'label', type: 'string', label: 'Label', default: '', category: 'content' },
      { name: 'helperText', type: 'string', label: 'Helper Text', default: '', category: 'content' },
      { name: 'backgroundColor', type: 'color', label: 'Fill Color', default: '#F5F5F5', category: 'appearance' },
      { name: 'borderColor', type: 'color', label: 'Border Color', default: '#E0E0E0', category: 'appearance' },
      { name: 'textColor', type: 'color', label: 'Text Color', default: '#000000', category: 'appearance' },
      { name: 'fontSize', type: 'slider', label: 'Font Size', default: 14, min: 8, max: 32, step: 1, category: 'appearance' },
      { name: 'borderRadius', type: 'number', label: 'Border Radius', default: 8, min: 0, max: 100, category: 'appearance' },
      { name: 'padding', type: 'spacing', label: 'Inner Padding', default: 12, category: 'layout' },
      { name: 'required', type: 'boolean', label: 'Required', default: false, category: 'behavior' },
      { name: 'disabled', type: 'boolean', label: 'Disabled', default: false, category: 'behavior' },
      { name: 'obscureText', type: 'boolean', label: 'Password (hide text)', default: false, category: 'behavior' },
    ],
    defaultProps: { placeholder: 'Enter text…', borderRadius: 8, fontSize: 14 },
  },

  // TextArea
  TextArea: {
    id: 'TextArea',
    name: 'Text Area',
    category: 'input',
    icon: 'FileText',
    description: 'Multi-line text input.',
    allowChildren: false,
    children: { mode: 'none' },
    properties: [
      { name: 'placeholder', type: 'string', label: 'Placeholder', default: 'Enter text…', category: 'content' },
      { name: 'label', type: 'string', label: 'Label', default: '', category: 'content' },
      { name: 'rows', type: 'number', label: 'Rows', default: 4, min: 2, max: 20, category: 'layout' },
      { name: 'backgroundColor', type: 'color', label: 'Fill Color', default: '#F5F5F5', category: 'appearance' },
      { name: 'borderColor', type: 'color', label: 'Border Color', default: '#E0E0E0', category: 'appearance' },
      { name: 'fontSize', type: 'slider', label: 'Font Size', default: 14, min: 8, max: 32, step: 1, category: 'appearance' },
      { name: 'borderRadius', type: 'number', label: 'Border Radius', default: 8, min: 0, max: 100, category: 'appearance' },
      { name: 'required', type: 'boolean', label: 'Required', default: false, category: 'behavior' },
      { name: 'disabled', type: 'boolean', label: 'Disabled', default: false, category: 'behavior' },
    ],
    defaultProps: { placeholder: 'Enter text…', rows: 4, borderRadius: 8 },
  },

  // Navigation (bottom/top nav bar)
  Navigation: {
    id: 'Navigation',
    name: 'Navigation Bar',
    category: 'navigation',
    icon: 'NavigationIcon',
    description: 'Material bottom / top navigation bar.',
    allowChildren: false,
    children: { mode: 'none' },
    properties: [
      { name: 'backgroundColor', type: 'color', label: 'Background Color', default: '#FFFFFF', category: 'appearance' },
      { name: 'selectedColor', type: 'color', label: 'Selected Item Color', default: '#6366F1', category: 'appearance' },
      { name: 'unselectedColor', type: 'color', label: 'Unselected Color', default: '#9E9E9E', category: 'appearance' },
      { name: 'elevation', type: 'slider', label: 'Elevation', default: 8, min: 0, max: 20, step: 1, category: 'appearance' },
      { name: 'padding', type: 'spacing', label: 'Padding', default: 0, category: 'layout' },
      { name: 'height', type: 'number', label: 'Height', default: 60, min: 48, max: 120, category: 'layout' },
    ],
    defaultProps: { backgroundColor: '#FFFFFF', selectedColor: '#6366F1', elevation: 8, height: 60 },
  },
};

// ─── Lookup with normalization ────────────────────────────────────────────────

/** Normalizes a widget type string to a registry key:
 *  "app_bar" → "AppBar", "listview" → "ListView", "scaffold" → "Scaffold", etc. */
function normalizeKey(type: string): string {
  // Already a registry key?
  if (componentRegistry[type]) return type;

  // Common snake_case → TitleCase mappings
  const aliasMap: Record<string, string> = {
    scaffold: 'Scaffold',
    container: 'Container',
    column: 'Column',
    row: 'Row',
    padding: 'Padding',
    center: 'Center',
    expanded: 'Expanded',
    spacer: 'Spacer',
    sized_box: 'SizedBox',
    sizedbox: 'SizedBox',
    app_bar: 'AppBar',
    appbar: 'AppBar',
    text: 'Text',
    icon: 'Icon',
    image: 'Image',
    image_network: 'Image',
    image_asset: 'Image',
    network_image: 'Image',
    divider: 'Divider',
    button: 'Button',
    elevated_button: 'Button',
    elevatedbutton: 'Button',
    text_button: 'TextButton',
    textbutton: 'TextButton',
    outlined_button: 'OutlinedButton',
    outlinedbutton: 'OutlinedButton',
    icon_button: 'IconButton',
    iconbutton: 'IconButton',
    floating_action_button: 'FloatingActionButton',
    floatingactionbutton: 'FloatingActionButton',
    single_child_scroll_view: 'SingleChildScrollView',
    singlechildscrollview: 'SingleChildScrollView',
    list_view: 'ListView',
    listview: 'ListView',
    list_tile: 'ListTile',
    listtile: 'ListTile',
    grid_view: 'GridView',
    grid: 'GridView',
    gridview: 'GridView',
    card: 'Card',
    category_item: 'CategoryItem',
    categoryitem: 'CategoryItem',
    hstack: 'HStack',
    vstack: 'VStack',
    textinput: 'TextInput',
    textarea: 'TextArea',
    navigation: 'Navigation',
    // PG4 SDK widgets
    stack: 'Stack',
    positioned: 'Positioned',
    wrap: 'Wrap',
    safe_area: 'SafeArea',
    safearea: 'SafeArea',
    circular_progress_indicator: 'CircularProgressIndicator',
    circularprogress: 'CircularProgressIndicator',
    circularprogressindicator: 'CircularProgressIndicator',
    linear_progress_indicator: 'LinearProgressIndicator',
    linearprogress: 'LinearProgressIndicator',
    linearprogressindicator: 'LinearProgressIndicator',
    checkbox: 'Checkbox',
    switch: 'Switch',
    switch_: 'Switch',
    slider: 'Slider',
    radio: 'Radio',
    chip: 'Chip',
    badge: 'Badge',
    tooltip: 'Tooltip',
    form: 'Form',
    text_form_field: 'TextFormField',
    textformfield: 'TextFormField',
  };

  const lower = type.toLowerCase();
  if (aliasMap[lower]) return aliasMap[lower];

  // Try Title Case
  const titleCase = type.charAt(0).toUpperCase() + type.slice(1);
  if (componentRegistry[titleCase]) return titleCase;

  return type;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** All built-in component definitions indexed by their registry key.
 *  Exported so seed scripts and other tooling can iterate without duplicating data. */
export const BUILT_IN_COMPONENTS: Record<string, ComponentDefinition> = componentRegistry;

export function getComponentDefinition(componentId: string): ComponentDefinition | null {
  if (!componentId) return null;
  const key = normalizeKey(componentId);
  return componentRegistry[key] ?? null;
}

export function getAllComponents(): ComponentDefinition[] {
  return Object.values(componentRegistry);
}

export function getComponentsByCategory(category: string): ComponentDefinition[] {
  return Object.values(componentRegistry).filter((c) => c.category === category);
}

export function registerComponent(definition: ComponentDefinition): void {
  componentRegistry[definition.id] = definition;
}

export function getComponentRegistry(): Record<string, ComponentDefinition> {
  return componentRegistry;
}

export const COMPONENT_CATEGORIES = [
  { id: 'layout', label: 'Layout', icon: 'Layout' },
  { id: 'display', label: 'Display', icon: 'Eye' },
  { id: 'input', label: 'Input', icon: 'ToggleLeft' },
  { id: 'navigation', label: 'Navigation', icon: 'Navigation' },
  { id: 'media', label: 'Media', icon: 'Image' },
];
