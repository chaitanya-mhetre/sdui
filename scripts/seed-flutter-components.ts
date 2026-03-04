import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface PropertySchema {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'color' | 'enum';
  label: string;
  description?: string;
  required?: boolean;
  default?: unknown;
  options?: string[]; // For enum type
  properties?: PropertySchema[]; // For object/array types
}

async function seedFlutterComponents() {
  console.log('🌱 Seeding Flutter UI components...');

  // 1. Carousel Component
  const carouselPropsSchema: PropertySchema[] = [
    {
      name: 'images',
      type: 'array',
      label: 'Images',
      description: 'Array of image URLs to display in the carousel',
      required: true,
      default: [],
      properties: [
        {
          name: 'url',
          type: 'string',
          label: 'Image URL',
          required: true,
        },
        {
          name: 'title',
          type: 'string',
          label: 'Image Title',
          required: false,
        },
        {
          name: 'description',
          type: 'string',
          label: 'Image Description',
          required: false,
        },
      ],
    },
    {
      name: 'height',
      type: 'number',
      label: 'Height',
      description: 'Height of the carousel in pixels',
      required: false,
      default: 200,
    },
    {
      name: 'autoPlay',
      type: 'boolean',
      label: 'Auto Play',
      description: 'Automatically scroll through images',
      required: false,
      default: true,
    },
    {
      name: 'autoPlayInterval',
      type: 'number',
      label: 'Auto Play Interval',
      description: 'Time in milliseconds between auto-play transitions',
      required: false,
      default: 3000,
    },
    {
      name: 'showIndicators',
      type: 'boolean',
      label: 'Show Indicators',
      description: 'Show dot indicators at the bottom',
      required: false,
      default: true,
    },
    {
      name: 'indicatorColor',
      type: 'color',
      label: 'Indicator Color',
      description: 'Color of the active indicator',
      required: false,
      default: '#FFFFFF',
    },
    {
      name: 'indicatorActiveColor',
      type: 'color',
      label: 'Active Indicator Color',
      description: 'Color of the active indicator',
      required: false,
      default: '#000000',
    },
    {
      name: 'aspectRatio',
      type: 'number',
      label: 'Aspect Ratio',
      description: 'Aspect ratio of the carousel (width/height)',
      required: false,
      default: 16 / 9,
    },
    {
      name: 'fit',
      type: 'enum',
      label: 'Image Fit',
      description: 'How the image should be fitted',
      required: false,
      default: 'cover',
      options: ['cover', 'contain', 'fill', 'fitWidth', 'fitHeight', 'none', 'scaleDown'],
    },
    {
      name: 'borderRadius',
      type: 'number',
      label: 'Border Radius',
      description: 'Border radius in pixels',
      required: false,
      default: 0,
    },
    {
      name: 'enablePageView',
      type: 'boolean',
      label: 'Enable Page View',
      description: 'Allow swiping between images',
      required: false,
      default: true,
    },
  ];

  const carouselDefaultProps = {
    images: [],
    height: 200,
    autoPlay: true,
    autoPlayInterval: 3000,
    showIndicators: true,
    indicatorColor: '#FFFFFF',
    indicatorActiveColor: '#000000',
    aspectRatio: 16 / 9,
    fit: 'cover',
    borderRadius: 0,
    enablePageView: true,
  };

  // 2. AppBar Component
  const appBarPropsSchema: PropertySchema[] = [
    {
      name: 'title',
      type: 'string',
      label: 'Title',
      description: 'Title text to display in the app bar',
      required: false,
      default: '',
    },
    {
      name: 'backgroundColor',
      type: 'color',
      label: 'Background Color',
      description: 'Background color of the app bar',
      required: false,
      default: '#FFFFFF',
    },
    {
      name: 'foregroundColor',
      type: 'color',
      label: 'Foreground Color',
      description: 'Text and icon color',
      required: false,
      default: '#000000',
    },
    {
      name: 'elevation',
      type: 'number',
      label: 'Elevation',
      description: 'Shadow elevation (0-24)',
      required: false,
      default: 4,
    },
    {
      name: 'centerTitle',
      type: 'boolean',
      label: 'Center Title',
      description: 'Center the title text',
      required: false,
      default: false,
    },
    {
      name: 'leading',
      type: 'object',
      label: 'Leading Widget',
      description: 'Widget to display before the title',
      required: false,
      default: { type: 'backButton', visible: true },
      properties: [
        {
          name: 'type',
          type: 'enum',
          label: 'Type',
          options: ['backButton', 'menu', 'custom', 'none'],
          required: true,
          default: 'backButton',
        },
        {
          name: 'visible',
          type: 'boolean',
          label: 'Visible',
          required: false,
          default: true,
        },
        {
          name: 'icon',
          type: 'string',
          label: 'Icon Name',
          description: 'Icon name for custom leading (e.g., menu, arrow_back)',
          required: false,
        },
        {
          name: 'onPressed',
          type: 'string',
          label: 'On Pressed Action',
          description: 'Action to perform when pressed',
          required: false,
        },
      ],
    },
    {
      name: 'actions',
      type: 'array',
      label: 'Actions',
      description: 'List of action buttons to display on the right',
      required: false,
      default: [],
      properties: [
        {
          name: 'icon',
          type: 'string',
          label: 'Icon Name',
          description: 'Icon name (e.g., search, more_vert, favorite)',
          required: true,
        },
        {
          name: 'label',
          type: 'string',
          label: 'Label',
          description: 'Accessibility label',
          required: false,
        },
        {
          name: 'onPressed',
          type: 'string',
          label: 'On Pressed Action',
          description: 'Action to perform when pressed',
          required: false,
        },
        {
          name: 'tooltip',
          type: 'string',
          label: 'Tooltip',
          description: 'Tooltip text',
          required: false,
        },
      ],
    },
    {
      name: 'flexibleSpace',
      type: 'object',
      label: 'Flexible Space',
      description: 'Flexible space widget (for sliver app bar)',
      required: false,
      default: null,
      properties: [
        {
          name: 'enabled',
          type: 'boolean',
          label: 'Enabled',
          required: false,
          default: false,
        },
        {
          name: 'backgroundImage',
          type: 'string',
          label: 'Background Image URL',
          required: false,
        },
      ],
    },
    {
      name: 'bottom',
      type: 'object',
      label: 'Bottom Widget',
      description: 'Widget to display below the app bar',
      required: false,
      default: null,
      properties: [
        {
          name: 'type',
          type: 'enum',
          label: 'Type',
          options: ['tabBar', 'searchBar', 'custom', 'none'],
          required: false,
          default: 'none',
        },
      ],
    },
  ];

  const appBarDefaultProps = {
    title: 'App Title',
    backgroundColor: '#FFFFFF',
    foregroundColor: '#000000',
    elevation: 4,
    centerTitle: false,
    leading: {
      type: 'backButton',
      visible: true,
    },
    actions: [],
    flexibleSpace: null,
    bottom: null,
  };

  // 3. Button Component (Enhanced)
  const buttonPropsSchema: PropertySchema[] = [
    {
      name: 'label',
      type: 'string',
      label: 'Label',
      description: 'Button text',
      required: true,
      default: 'Button',
    },
    {
      name: 'variant',
      type: 'enum',
      label: 'Variant',
      description: 'Button style variant',
      required: false,
      default: 'elevated',
      options: ['elevated', 'filled', 'outlined', 'text', 'icon', 'fab'],
    },
    {
      name: 'size',
      type: 'enum',
      label: 'Size',
      description: 'Button size',
      required: false,
      default: 'medium',
      options: ['small', 'medium', 'large'],
    },
    {
      name: 'backgroundColor',
      type: 'color',
      label: 'Background Color',
      description: 'Background color of the button',
      required: false,
      default: '#6200EE',
    },
    {
      name: 'foregroundColor',
      type: 'color',
      label: 'Foreground Color',
      description: 'Text and icon color',
      required: false,
      default: '#FFFFFF',
    },
    {
      name: 'borderColor',
      type: 'color',
      label: 'Border Color',
      description: 'Border color (for outlined variant)',
      required: false,
      default: '#6200EE',
    },
    {
      name: 'borderRadius',
      type: 'number',
      label: 'Border Radius',
      description: 'Border radius in pixels',
      required: false,
      default: 4,
    },
    {
      name: 'elevation',
      type: 'number',
      label: 'Elevation',
      description: 'Shadow elevation (0-24)',
      required: false,
      default: 2,
    },
    {
      name: 'icon',
      type: 'string',
      label: 'Icon',
      description: 'Icon name to display (e.g., add, delete, edit)',
      required: false,
    },
    {
      name: 'iconPosition',
      type: 'enum',
      label: 'Icon Position',
      description: 'Position of the icon relative to text',
      required: false,
      default: 'leading',
      options: ['leading', 'trailing'],
    },
    {
      name: 'disabled',
      type: 'boolean',
      label: 'Disabled',
      description: 'Whether the button is disabled',
      required: false,
      default: false,
    },
    {
      name: 'fullWidth',
      type: 'boolean',
      label: 'Full Width',
      description: 'Make button take full available width',
      required: false,
      default: false,
    },
    {
      name: 'onPressed',
      type: 'string',
      label: 'On Pressed Action',
      description: 'Action to perform when button is pressed',
      required: false,
    },
  ];

  const buttonDefaultProps = {
    label: 'Button',
    variant: 'elevated',
    size: 'medium',
    backgroundColor: '#6200EE',
    foregroundColor: '#FFFFFF',
    borderColor: '#6200EE',
    borderRadius: 4,
    elevation: 2,
    icon: null,
    iconPosition: 'leading',
    disabled: false,
    fullWidth: false,
    onPressed: null,
  };

  try {
    // Check if components already exist
    const existingCarousel = await prisma.platformComponent.findFirst({
      where: { name: 'Carousel' },
    });
    const existingAppBar = await prisma.platformComponent.findFirst({
      where: { name: 'AppBar' },
    });
    const existingButton = await prisma.platformComponent.findFirst({
      where: { name: 'Button' },
    });

    // Create Carousel
    if (!existingCarousel) {
      await prisma.platformComponent.create({
        data: {
          name: 'Carousel',
          category: 'media',
          propsSchema: carouselPropsSchema as any,
          defaultProps: carouselDefaultProps as any,
          version: '1.0.0',
          visibility: 'PUBLIC',
        },
      });
      console.log('✅ Created Carousel component');
    } else {
      console.log('⏭️  Carousel component already exists');
    }

    // Create AppBar
    if (!existingAppBar) {
      await prisma.platformComponent.create({
        data: {
          name: 'AppBar',
          category: 'navigation',
          propsSchema: appBarPropsSchema as any,
          defaultProps: appBarDefaultProps as any,
          version: '1.0.0',
          visibility: 'PUBLIC',
        },
      });
      console.log('✅ Created AppBar component');
    } else {
      console.log('⏭️  AppBar component already exists');
    }

    // Create/Update Button
    if (!existingButton) {
      await prisma.platformComponent.create({
        data: {
          name: 'Button',
          category: 'input',
          propsSchema: buttonPropsSchema as any,
          defaultProps: buttonDefaultProps as any,
          version: '1.0.0',
          visibility: 'PUBLIC',
        },
      });
      console.log('✅ Created Button component');
    } else {
      // Update existing button with enhanced properties
      await prisma.platformComponent.update({
        where: { id: existingButton.id },
        data: {
          propsSchema: buttonPropsSchema as any,
          defaultProps: buttonDefaultProps as any,
          version: '1.1.0',
        },
      });
      console.log('✅ Updated Button component with enhanced properties');
    }

    console.log('🎉 Flutter components seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding components:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedFlutterComponents()
  .then(() => {
    console.log('✅ Seed completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  });
