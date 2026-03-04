import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/api-middleware';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse, validationErrorResponse, serverErrorResponse } from '@/lib/api-response';
import { z } from 'zod';
import type { AuthenticatedRequest } from '@/lib/api-middleware';

const createComponentSchema = z.object({
  name: z.string().min(1, 'Component name is required').max(100),
  category: z.enum(['layout', 'input', 'display', 'navigation', 'form', 'media']),
  propsSchema: z.array(z.record(z.unknown(), z.unknown())),
  defaultProps: z.record(z.unknown(), z.unknown()),
  version: z.string().optional(),
  visibility: z.enum(['PUBLIC', 'PRIVATE', 'BETA']).optional(),
});

async function getComponents(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as any;
    const visibility = searchParams.get('visibility') as any;
    const search = searchParams.get('search') || '';

    // Build where clause
    const where: any = {};
    if (category) {
      where.category = category;
    }
    if (visibility) {
      where.visibility = visibility;
    }
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const components = await prisma.platformComponent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    return successResponse(
      {
        components,
      },
      'Components retrieved successfully'
    );
  } catch (error) {
    console.error('Get components error:', error);
    return serverErrorResponse('Failed to get components', (error as Error).message);
  }
}

async function createComponent(request: AuthenticatedRequest) {
  try {
    if (!request.user) {
      throw new Error('User not found');
    }

    const body = await request.json();

    // Validate input
    const validationResult = createComponentSchema.safeParse(body);
    if (!validationResult.success) {
      const errors: Record<string, string[]> = {};
      validationResult.error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(err.message);
      });
      return validationErrorResponse(errors);
    }

    const data = validationResult.data;

    // Create component
    const component = await prisma.platformComponent.create({
      data: {
        name: data.name,
        category: data.category,
        propsSchema: data.propsSchema,
        defaultProps: data.defaultProps,
        version: data.version || '1.0.0',
        visibility: data.visibility || 'PUBLIC',
        createdBy: request.user.id,
      },
    });

    return successResponse(
      {
        component,
      },
      'Component created successfully',
      201
    );
  } catch (error) {
    console.error('Create component error:', error);
    return serverErrorResponse('Failed to create component', (error as Error).message);
  }
}

export const GET = requireAdmin(getComponents);
export const POST = requireAdmin(createComponent);
