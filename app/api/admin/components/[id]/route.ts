import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/api-middleware';
import { prisma } from '@/lib/db';
import { successResponse, notFoundResponse, errorResponse, validationErrorResponse, serverErrorResponse } from '@/lib/api-response';
import { z } from 'zod';
import type { AuthenticatedRequest } from '@/lib/api-middleware';

const updateComponentSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  category: z.enum(['layout', 'input', 'display', 'navigation', 'form', 'media']).optional(),
  propsSchema: z.array(z.record(z.unknown(), z.unknown())).optional(),
  defaultProps: z.record(z.unknown(), z.unknown()).optional(),
  version: z.string().optional(),
  visibility: z.enum(['PUBLIC', 'PRIVATE', 'BETA']).optional(),
});

async function getComponent(request: AuthenticatedRequest) {
  try {
    const url = new URL(request.url);
    const componentId = url.pathname.split('/').pop();

    if (!componentId) {
      return errorResponse('Component ID is required', 400);
    }

    const component = await prisma.platformComponent.findUnique({
      where: { id: componentId },
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

    if (!component) {
      return notFoundResponse('Component not found');
    }

    return successResponse(
      {
        component,
      },
      'Component retrieved successfully'
    );
  } catch (error) {
    console.error('Get component error:', error);
    return serverErrorResponse('Failed to get component', (error as Error).message);
  }
}

async function updateComponent(request: AuthenticatedRequest) {
  try {
    const url = new URL(request.url);
    const componentId = url.pathname.split('/').pop();

    if (!componentId) {
      return errorResponse('Component ID is required', 400);
    }

    const body = await request.json();

    // Validate input
    const validationResult = updateComponentSchema.safeParse(body);
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

    // Check if component exists
    const existingComponent = await prisma.platformComponent.findUnique({
      where: { id: componentId },
    });

    if (!existingComponent) {
      return notFoundResponse('Component not found');
    }

    // Update component
    const component = await prisma.platformComponent.update({
      where: { id: componentId },
      data: validationResult.data,
    });

    return successResponse(
      {
        component,
      },
      'Component updated successfully'
    );
  } catch (error) {
    console.error('Update component error:', error);
    return serverErrorResponse('Failed to update component', (error as Error).message);
  }
}

async function deleteComponent(request: AuthenticatedRequest) {
  try {
    const url = new URL(request.url);
    const componentId = url.pathname.split('/').pop();

    if (!componentId) {
      return errorResponse('Component ID is required', 400);
    }

    // Check if component exists
    const component = await prisma.platformComponent.findUnique({
      where: { id: componentId },
    });

    if (!component) {
      return notFoundResponse('Component not found');
    }

    // Delete component
    await prisma.platformComponent.delete({
      where: { id: componentId },
    });

    return successResponse(null, 'Component deleted successfully');
  } catch (error) {
    console.error('Delete component error:', error);
    return serverErrorResponse('Failed to delete component', (error as Error).message);
  }
}

export const GET = requireAdmin(getComponent);
export const PATCH = requireAdmin(updateComponent);
export const DELETE = requireAdmin(deleteComponent);
