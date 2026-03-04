import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/api-middleware';
import { prisma } from '@/lib/db';
import { successResponse, serverErrorResponse } from '@/lib/api-response';
import type { AuthenticatedRequest } from '@/lib/api-middleware';

interface PropertySchema {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'color' | 'enum';
  label: string;
  description?: string;
  required?: boolean;
  default?: unknown;
  options?: string[];
  properties?: PropertySchema[];
}

async function seedComponents(request: AuthenticatedRequest) {
  try {
    const results = [];

    // Helper function to create or update component
    async function upsertComponent(
      name: string,
      category: 'layout' | 'input' | 'display' | 'navigation' | 'form' | 'media',
      propsSchema: PropertySchema[],
      defaultProps: Record<string, unknown>,
      version: string = '1.0.0'
    ) {
      const existing = await prisma.platformComponent.findFirst({
        where: { name },
      });

      if (!existing) {
        const component = await prisma.platformComponent.create({
          data: {
            name,
            category,
            propsSchema: propsSchema as any,
            defaultProps: defaultProps as any,
            version,
            visibility: 'PUBLIC',
            createdBy: request.user.id,
          },
        });
        results.push({ component: name, action: 'created', id: component.id });
      } else {
        const component = await prisma.platformComponent.update({
          where: { id: existing.id },
          data: {
            propsSchema: propsSchema as any,
            defaultProps: defaultProps as any,
            version,
          },
        });
        results.push({ component: name, action: 'updated', id: component.id });
      }
    }

    // 1. Scaffold - Main container
    await upsertComponent(
      'Scaffold',
      'layout',
      [
        {
          name: 'appBar',
          type: 'object',
          label: 'App Bar',
          description: 'App bar configuration',
          required: false,
          properties: [
            { name: 'title', type: 'string', label: 'Title' },
            { name: 'visible', type: 'boolean', label: 'Visible', default: true },
          ],
        },
        {
          name: 'body',
          type: 'object',
          label: 'Body',
          description: 'Main body content',
          required: true,
        },
        {
          name: 'backgroundColor',
          type: 'color',
          label: 'Background Color',
          default: '#FFFFFF',
        },
        {
          name: 'floatingActionButton',
          type: 'object',
          label: 'Floating Action Button',
          required: false,
          properties: [
            { name: 'icon', type: 'string', label: 'Icon' },
            { name: 'onPressed', type: 'string', label: 'On Pressed' },
          ],
        },
      ],
      {
        backgroundColor: '#FFFFFF',
      }
    );

    // 2. AppBar - Navigation bar
    await upsertComponent(
      'AppBar',
      'navigation',
      [
        {
          name: 'title',
          type: 'string',
          label: 'Title',
          description: 'App bar title text',
          default: '',
        },
        {
          name: 'leading',
          type: 'object',
          label: 'Leading Widget',
          description: 'Widget to display before the title',
          required: false,
          properties: [
            {
              name: 'type',
              type: 'enum',
              label: 'Type',
              options: ['backButton', 'menu', 'custom', 'none'],
              default: 'backButton',
            },
            { name: 'icon', type: 'string', label: 'Icon Name' },
            { name: 'onPressed', type: 'string', label: 'On Pressed Action' },
          ],
        },
        {
          name: 'actions',
          type: 'array',
          label: 'Actions',
          description: 'List of action buttons',
          default: [],
          properties: [
            { name: 'icon', type: 'string', label: 'Icon Name', required: true },
            { name: 'label', type: 'string', label: 'Label' },
            { name: 'onPressed', type: 'string', label: 'On Pressed Action' },
            { name: 'tooltip', type: 'string', label: 'Tooltip' },
          ],
        },
        {
          name: 'backgroundColor',
          type: 'color',
          label: 'Background Color',
          default: '#FFFFFF',
        },
        {
          name: 'foregroundColor',
          type: 'color',
          label: 'Foreground Color',
          default: '#000000',
        },
        {
          name: 'elevation',
          type: 'number',
          label: 'Elevation',
          default: 4,
        },
        {
          name: 'centerTitle',
          type: 'boolean',
          label: 'Center Title',
          default: false,
        },
      ],
      {
        title: 'App Title',
        backgroundColor: '#FFFFFF',
        foregroundColor: '#000000',
        elevation: 4,
        centerTitle: false,
        leading: { type: 'backButton' },
        actions: [],
      }
    );

    // 3. Text - Text widget
    await upsertComponent(
      'Text',
      'display',
      [
        {
          name: 'data',
          type: 'string',
          label: 'Text',
          description: 'Text content to display',
          required: true,
          default: 'Text',
        },
        {
          name: 'style',
          type: 'object',
          label: 'Text Style',
          required: false,
          properties: [
            { name: 'fontSize', type: 'number', label: 'Font Size', default: 14 },
            { name: 'fontWeight', type: 'enum', label: 'Font Weight', options: ['normal', 'bold', 'w100', 'w200', 'w300', 'w400', 'w500', 'w600', 'w700', 'w800', 'w900'] },
            { name: 'color', type: 'color', label: 'Color', default: '#000000' },
            { name: 'textAlign', type: 'enum', label: 'Text Align', options: ['left', 'right', 'center', 'justify'] },
          ],
        },
        {
          name: 'maxLines',
          type: 'number',
          label: 'Max Lines',
          description: 'Maximum number of lines',
          default: null,
        },
        {
          name: 'overflow',
          type: 'enum',
          label: 'Overflow',
          options: ['clip', 'ellipsis', 'fade', 'visible'],
          default: 'ellipsis',
        },
      ],
      {
        data: 'Text',
        style: {
          fontSize: 14,
          fontWeight: 'normal',
          color: '#000000',
          textAlign: 'left',
        },
      }
    );

    // 4. Button - Button widget
    await upsertComponent(
      'Button',
      'input',
      [
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
          options: ['elevated', 'filled', 'outlined', 'text', 'icon', 'fab'],
          default: 'elevated',
        },
        {
          name: 'size',
          type: 'enum',
          label: 'Size',
          options: ['small', 'medium', 'large'],
          default: 'medium',
        },
        {
          name: 'backgroundColor',
          type: 'color',
          label: 'Background Color',
          default: '#6200EE',
        },
        {
          name: 'foregroundColor',
          type: 'color',
          label: 'Foreground Color',
          default: '#FFFFFF',
        },
        {
          name: 'icon',
          type: 'string',
          label: 'Icon',
          description: 'Icon name (e.g., add, delete, edit)',
        },
        {
          name: 'onPressed',
          type: 'string',
          label: 'On Pressed Action',
          description: 'Action to perform when pressed',
        },
        {
          name: 'disabled',
          type: 'boolean',
          label: 'Disabled',
          default: false,
        },
        {
          name: 'fullWidth',
          type: 'boolean',
          label: 'Full Width',
          default: false,
        },
      ],
      {
        label: 'Button',
        variant: 'elevated',
        size: 'medium',
        backgroundColor: '#6200EE',
        foregroundColor: '#FFFFFF',
        disabled: false,
        fullWidth: false,
      }
    );

    // 5. FilledButton
    await upsertComponent(
      'FilledButton',
      'input',
      [
        {
          name: 'label',
          type: 'string',
          label: 'Label',
          required: true,
          default: 'Button',
        },
        {
          name: 'backgroundColor',
          type: 'color',
          label: 'Background Color',
          default: '#6200EE',
        },
        {
          name: 'foregroundColor',
          type: 'color',
          label: 'Foreground Color',
          default: '#FFFFFF',
        },
        {
          name: 'onPressed',
          type: 'string',
          label: 'On Pressed Action',
        },
        {
          name: 'disabled',
          type: 'boolean',
          label: 'Disabled',
          default: false,
        },
      ],
      {
        label: 'Button',
        backgroundColor: '#6200EE',
        foregroundColor: '#FFFFFF',
        disabled: false,
      }
    );

    // 6. TextButton
    await upsertComponent(
      'TextButton',
      'input',
      [
        {
          name: 'label',
          type: 'string',
          label: 'Label',
          required: true,
          default: 'Button',
        },
        {
          name: 'foregroundColor',
          type: 'color',
          label: 'Text Color',
          default: '#6200EE',
        },
        {
          name: 'onPressed',
          type: 'string',
          label: 'On Pressed Action',
        },
        {
          name: 'disabled',
          type: 'boolean',
          label: 'Disabled',
          default: false,
        },
      ],
      {
        label: 'Button',
        foregroundColor: '#6200EE',
        disabled: false,
      }
    );

    // 7. IconButton
    await upsertComponent(
      'IconButton',
      'input',
      [
        {
          name: 'icon',
          type: 'string',
          label: 'Icon',
          description: 'Icon name (e.g., add, delete, menu)',
          required: true,
        },
        {
          name: 'size',
          type: 'number',
          label: 'Size',
          default: 24,
        },
        {
          name: 'color',
          type: 'color',
          label: 'Color',
          default: '#000000',
        },
        {
          name: 'onPressed',
          type: 'string',
          label: 'On Pressed Action',
        },
        {
          name: 'tooltip',
          type: 'string',
          label: 'Tooltip',
        },
      ],
      {
        icon: 'add',
        size: 24,
        color: '#000000',
      }
    );

    // 8. TextField - Text input
    await upsertComponent(
      'TextField',
      'input',
      [
        {
          name: 'label',
          type: 'string',
          label: 'Label',
          description: 'Input field label',
        },
        {
          name: 'hint',
          type: 'string',
          label: 'Hint',
          description: 'Placeholder text',
        },
        {
          name: 'value',
          type: 'string',
          label: 'Value',
          description: 'Initial value',
        },
        {
          name: 'obscureText',
          type: 'boolean',
          label: 'Obscure Text',
          description: 'Hide text (for passwords)',
          default: false,
        },
        {
          name: 'keyboardType',
          type: 'enum',
          label: 'Keyboard Type',
          options: ['text', 'number', 'email', 'phone', 'multiline'],
          default: 'text',
        },
        {
          name: 'maxLines',
          type: 'number',
          label: 'Max Lines',
          default: 1,
        },
        {
          name: 'enabled',
          type: 'boolean',
          label: 'Enabled',
          default: true,
        },
        {
          name: 'required',
          type: 'boolean',
          label: 'Required',
          default: false,
        },
      ],
      {
        label: 'Input',
        hint: 'Enter text',
        obscureText: false,
        keyboardType: 'text',
        maxLines: 1,
        enabled: true,
        required: false,
      }
    );

    // 9. Column - Vertical layout
    await upsertComponent(
      'Column',
      'layout',
      [
        {
          name: 'children',
          type: 'array',
          label: 'Children',
          description: 'List of child widgets',
          required: true,
          default: [],
        },
        {
          name: 'mainAxisAlignment',
          type: 'enum',
          label: 'Main Axis Alignment',
          options: ['start', 'end', 'center', 'spaceBetween', 'spaceAround', 'spaceEvenly'],
          default: 'start',
        },
        {
          name: 'crossAxisAlignment',
          type: 'enum',
          label: 'Cross Axis Alignment',
          options: ['start', 'end', 'center', 'stretch', 'baseline'],
          default: 'start',
        },
        {
          name: 'mainAxisSize',
          type: 'enum',
          label: 'Main Axis Size',
          options: ['min', 'max'],
          default: 'max',
        },
      ],
      {
        children: [],
        mainAxisAlignment: 'start',
        crossAxisAlignment: 'start',
        mainAxisSize: 'max',
      }
    );

    // 10. Row - Horizontal layout
    await upsertComponent(
      'Row',
      'layout',
      [
        {
          name: 'children',
          type: 'array',
          label: 'Children',
          required: true,
          default: [],
        },
        {
          name: 'mainAxisAlignment',
          type: 'enum',
          label: 'Main Axis Alignment',
          options: ['start', 'end', 'center', 'spaceBetween', 'spaceAround', 'spaceEvenly'],
          default: 'start',
        },
        {
          name: 'crossAxisAlignment',
          type: 'enum',
          label: 'Cross Axis Alignment',
          options: ['start', 'end', 'center', 'stretch', 'baseline'],
          default: 'center',
        },
        {
          name: 'mainAxisSize',
          type: 'enum',
          label: 'Main Axis Size',
          options: ['min', 'max'],
          default: 'max',
        },
      ],
      {
        children: [],
        mainAxisAlignment: 'start',
        crossAxisAlignment: 'center',
        mainAxisSize: 'max',
      }
    );

    // 11. Padding
    await upsertComponent(
      'Padding',
      'layout',
      [
        {
          name: 'padding',
          type: 'object',
          label: 'Padding',
          description: 'Padding values',
          required: true,
          properties: [
            { name: 'all', type: 'number', label: 'All Sides' },
            { name: 'horizontal', type: 'number', label: 'Horizontal' },
            { name: 'vertical', type: 'number', label: 'Vertical' },
            { name: 'top', type: 'number', label: 'Top' },
            { name: 'bottom', type: 'number', label: 'Bottom' },
            { name: 'left', type: 'number', label: 'Left' },
            { name: 'right', type: 'number', label: 'Right' },
          ],
        },
        {
          name: 'child',
          type: 'object',
          label: 'Child Widget',
          required: true,
        },
      ],
      {
        padding: { all: 16 },
      }
    );

    // 12. SizedBox
    await upsertComponent(
      'SizedBox',
      'layout',
      [
        {
          name: 'width',
          type: 'number',
          label: 'Width',
          description: 'Width in pixels',
        },
        {
          name: 'height',
          type: 'number',
          label: 'Height',
          description: 'Height in pixels',
        },
        {
          name: 'child',
          type: 'object',
          label: 'Child Widget',
        },
      ],
      {
        width: null,
        height: null,
      }
    );

    // 13. Spacer
    await upsertComponent(
      'Spacer',
      'layout',
      [
        {
          name: 'flex',
          type: 'number',
          label: 'Flex',
          description: 'Flex factor',
          default: 1,
        },
      ],
      {
        flex: 1,
      }
    );

    // 14. Divider
    await upsertComponent(
      'Divider',
      'display',
      [
        {
          name: 'height',
          type: 'number',
          label: 'Height',
          default: 1,
        },
        {
          name: 'thickness',
          type: 'number',
          label: 'Thickness',
          default: 1,
        },
        {
          name: 'color',
          type: 'color',
          label: 'Color',
          default: '#E0E0E0',
        },
        {
          name: 'indent',
          type: 'number',
          label: 'Indent',
          default: 0,
        },
        {
          name: 'endIndent',
          type: 'number',
          label: 'End Indent',
          default: 0,
        },
      ],
      {
        height: 1,
        thickness: 1,
        color: '#E0E0E0',
        indent: 0,
        endIndent: 0,
      }
    );

    // 15. Icon
    await upsertComponent(
      'Icon',
      'display',
      [
        {
          name: 'icon',
          type: 'string',
          label: 'Icon Name',
          description: 'Icon identifier (e.g., add, delete, home)',
          required: true,
        },
        {
          name: 'size',
          type: 'number',
          label: 'Size',
          default: 24,
        },
        {
          name: 'color',
          type: 'color',
          label: 'Color',
          default: '#000000',
        },
      ],
      {
        icon: 'add',
        size: 24,
        color: '#000000',
      }
    );

    // 16. Expanded
    await upsertComponent(
      'Expanded',
      'layout',
      [
        {
          name: 'flex',
          type: 'number',
          label: 'Flex',
          default: 1,
        },
        {
          name: 'child',
          type: 'object',
          label: 'Child Widget',
          required: true,
        },
      ],
      {
        flex: 1,
      }
    );

    // 17. Container
    await upsertComponent(
      'Container',
      'layout',
      [
        {
          name: 'width',
          type: 'number',
          label: 'Width',
        },
        {
          name: 'height',
          type: 'number',
          label: 'Height',
        },
        {
          name: 'padding',
          type: 'object',
          label: 'Padding',
          properties: [
            { name: 'all', type: 'number', label: 'All Sides' },
            { name: 'horizontal', type: 'number', label: 'Horizontal' },
            { name: 'vertical', type: 'number', label: 'Vertical' },
          ],
        },
        {
          name: 'margin',
          type: 'object',
          label: 'Margin',
          properties: [
            { name: 'all', type: 'number', label: 'All Sides' },
            { name: 'horizontal', type: 'number', label: 'Horizontal' },
            { name: 'vertical', type: 'number', label: 'Vertical' },
          ],
        },
        {
          name: 'decoration',
          type: 'object',
          label: 'Decoration',
          properties: [
            { name: 'color', type: 'color', label: 'Background Color' },
            { name: 'borderRadius', type: 'number', label: 'Border Radius' },
            { name: 'borderWidth', type: 'number', label: 'Border Width' },
            { name: 'borderColor', type: 'color', label: 'Border Color' },
          ],
        },
        {
          name: 'child',
          type: 'object',
          label: 'Child Widget',
        },
      ],
      {
        padding: { all: 0 },
        margin: { all: 0 },
      }
    );

    // 18. Card
    await upsertComponent(
      'Card',
      'display',
      [
        {
          name: 'title',
          type: 'string',
          label: 'Title',
        },
        {
          name: 'subtitle',
          type: 'string',
          label: 'Subtitle',
        },
        {
          name: 'content',
          type: 'string',
          label: 'Content',
        },
        {
          name: 'elevation',
          type: 'number',
          label: 'Elevation',
          default: 2,
        },
        {
          name: 'margin',
          type: 'object',
          label: 'Margin',
          properties: [
            { name: 'all', type: 'number', label: 'All Sides', default: 8 },
          ],
        },
        {
          name: 'child',
          type: 'object',
          label: 'Child Widget',
        },
      ],
      {
        elevation: 2,
        margin: { all: 8 },
      }
    );

    // 19. Image
    await upsertComponent(
      'Image',
      'media',
      [
        {
          name: 'src',
          type: 'string',
          label: 'Image Source',
          description: 'Image URL or asset path',
          required: true,
        },
        {
          name: 'width',
          type: 'number',
          label: 'Width',
        },
        {
          name: 'height',
          type: 'number',
          label: 'Height',
        },
        {
          name: 'fit',
          type: 'enum',
          label: 'Fit',
          options: ['cover', 'contain', 'fill', 'fitWidth', 'fitHeight', 'none', 'scaleDown'],
          default: 'cover',
        },
        {
          name: 'alignment',
          type: 'enum',
          label: 'Alignment',
          options: ['center', 'topLeft', 'topRight', 'bottomLeft', 'bottomRight', 'topCenter', 'bottomCenter', 'leftCenter', 'rightCenter'],
          default: 'center',
        },
        {
          name: 'borderRadius',
          type: 'number',
          label: 'Border Radius',
          default: 0,
        },
      ],
      {
        src: '',
        fit: 'cover',
        alignment: 'center',
        borderRadius: 0,
      }
    );

    // 20. Carousel
    await upsertComponent(
      'Carousel',
      'media',
      [
        {
          name: 'images',
          type: 'array',
          label: 'Images',
          description: 'Array of image URLs',
          required: true,
          default: [],
          properties: [
            { name: 'url', type: 'string', label: 'Image URL', required: true },
            { name: 'title', type: 'string', label: 'Title' },
            { name: 'description', type: 'string', label: 'Description' },
          ],
        },
        {
          name: 'height',
          type: 'number',
          label: 'Height',
          default: 200,
        },
        {
          name: 'autoPlay',
          type: 'boolean',
          label: 'Auto Play',
          default: true,
        },
        {
          name: 'autoPlayInterval',
          type: 'number',
          label: 'Auto Play Interval',
          default: 3000,
        },
        {
          name: 'showIndicators',
          type: 'boolean',
          label: 'Show Indicators',
          default: true,
        },
        {
          name: 'aspectRatio',
          type: 'number',
          label: 'Aspect Ratio',
          default: 16 / 9,
        },
      ],
      {
        images: [],
        height: 200,
        autoPlay: true,
        autoPlayInterval: 3000,
        showIndicators: true,
        aspectRatio: 16 / 9,
      }
    );

    // 21. ListView
    await upsertComponent(
      'ListView',
      'display',
      [
        {
          name: 'items',
          type: 'array',
          label: 'Items',
          description: 'List of items to display',
          required: true,
          default: [],
        },
        {
          name: 'itemBuilder',
          type: 'object',
          label: 'Item Builder',
          description: 'Template for each item',
          required: true,
        },
        {
          name: 'scrollDirection',
          type: 'enum',
          label: 'Scroll Direction',
          options: ['vertical', 'horizontal'],
          default: 'vertical',
        },
        {
          name: 'padding',
          type: 'object',
          label: 'Padding',
          properties: [
            { name: 'all', type: 'number', label: 'All Sides', default: 0 },
          ],
        },
      ],
      {
        items: [],
        scrollDirection: 'vertical',
        padding: { all: 0 },
      }
    );

    // 22. GridView
    await upsertComponent(
      'GridView',
      'display',
      [
        {
          name: 'items',
          type: 'array',
          label: 'Items',
          required: true,
          default: [],
        },
        {
          name: 'itemBuilder',
          type: 'object',
          label: 'Item Builder',
          required: true,
        },
        {
          name: 'crossAxisCount',
          type: 'number',
          label: 'Cross Axis Count',
          description: 'Number of columns',
          default: 2,
        },
        {
          name: 'crossAxisSpacing',
          type: 'number',
          label: 'Cross Axis Spacing',
          default: 8,
        },
        {
          name: 'mainAxisSpacing',
          type: 'number',
          label: 'Main Axis Spacing',
          default: 8,
        },
        {
          name: 'childAspectRatio',
          type: 'number',
          label: 'Child Aspect Ratio',
          default: 1,
        },
      ],
      {
        items: [],
        crossAxisCount: 2,
        crossAxisSpacing: 8,
        mainAxisSpacing: 8,
        childAspectRatio: 1,
      }
    );

    return successResponse(
      {
        results,
        message: `Successfully seeded ${results.length} components`,
      },
      'Components seeded successfully'
    );
  } catch (error) {
    console.error('Seed components error:', error);
    return serverErrorResponse('Failed to seed components', (error as Error).message);
  }
}

export const POST = requireAdmin(seedComponents);
