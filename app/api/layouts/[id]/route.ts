import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api-middleware';
import { prisma } from '@/lib/db';
import { successResponse, notFoundResponse, forbiddenResponse, errorResponse, validationErrorResponse, serverErrorResponse } from '@/lib/api-response';
import { z } from 'zod';
import type { AuthenticatedRequest } from '@/lib/api-middleware';
import { validateRexaJson } from '@/lib/rexa/validation';

const updateLayoutSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  screenName: z
    .string()
    .max(100)
    .regex(/^[a-z0-9_-]*$/, 'Screen name must be lowercase alphanumeric with _ or -')
    .optional(),
  rootNode: z.record(z.unknown(), z.unknown()).optional(),
  rexaJson: z.record(z.unknown(), z.unknown()).optional(),
  version: z.number().int().positive().optional(),
});

async function getLayout(request: AuthenticatedRequest) {
  try {
    const url = new URL(request.url);
    const layoutId = url.pathname.split('/').pop();

    if (!layoutId) {
      return errorResponse('Layout ID is required', 400);
    }

    const layout = await prisma.layout.findUnique({
      where: { id: layoutId },
      include: {
        project: true,
      },
    });

    if (!layout) {
      return notFoundResponse('Layout not found');
    }

    // Check ownership or admin
    if (layout.project.userId !== request.user?.id && request.user?.role !== 'ADMIN' && request.user?.role !== 'SUPER_ADMIN') {
      return forbiddenResponse('You do not have permission to access this layout');
    }

    return successResponse(
      {
        layout,
      },
      'Layout retrieved successfully'
    );
  } catch (error) {
    console.error('Get layout error:', error);
    return serverErrorResponse('Failed to get layout', (error as Error).message);
  }
}

async function updateLayout(request: AuthenticatedRequest) {
  try {
    const url = new URL(request.url);
    const layoutId = url.pathname.split('/').pop();

    if (!layoutId) {
      return errorResponse('Layout ID is required', 400);
    }

    const body = await request.json();

    // Validate input
    const validationResult = updateLayoutSchema.safeParse(body);
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

    // Check if layout exists
    const existingLayout = await prisma.layout.findUnique({
      where: { id: layoutId },
      include: {
        project: true,
      },
    });

    if (!existingLayout) {
      return notFoundResponse('Layout not found');
    }

    // Check ownership or admin
    if (existingLayout.project.userId !== request.user?.id && request.user?.role !== 'ADMIN' && request.user?.role !== 'SUPER_ADMIN') {
      return forbiddenResponse('You do not have permission to update this layout');
    }

    // Validate rexaJson if provided (REXA format validation)
    if (validationResult.data.rexaJson) {
      // Ensure rexaJson is an object
      let rexaJsonToValidate = validationResult.data.rexaJson;
      if (typeof rexaJsonToValidate === 'string') {
        try {
          rexaJsonToValidate = JSON.parse(rexaJsonToValidate);
        } catch (e) {
          return errorResponse(`Invalid rexaJson format: ${(e as Error).message}`, 400);
        }
      }
      
      if (typeof rexaJsonToValidate !== 'object' || Array.isArray(rexaJsonToValidate)) {
        return errorResponse('rexaJson must be an object', 400);
      }
      
      const rexaValidation = validateRexaJson(rexaJsonToValidate);
      if (!rexaValidation.valid) {
        return errorResponse(`REXA JSON validation failed: ${rexaValidation.error}`, 422);
      }
    }

    // Note: rootNode is in builder format (componentType, props, children)
    // and should NOT be validated as REXA JSON. It will be converted to REXA
    // format during publish, at which point it will be validated.

    // Increment version if rootNode is updated
    const updateData: any = { ...validationResult.data };
    if (updateData.rootNode && !updateData.version) {
      updateData.version = existingLayout.version + 1;
    }

    // Update layout
    const layout = await prisma.layout.update({
      where: { id: layoutId },
      data: updateData,
    });

    return successResponse(
      {
        layout,
      },
      'Layout updated successfully'
    );
  } catch (error) {
    console.error('Update layout error:', error);
    return serverErrorResponse('Failed to update layout', (error as Error).message);
  }
}

async function deleteLayout(request: AuthenticatedRequest) {
  try {
    const url = new URL(request.url);
    const layoutId = url.pathname.split('/').pop();

    if (!layoutId) {
      return errorResponse('Layout ID is required', 400);
    }

    // Check if layout exists
    const layout = await prisma.layout.findUnique({
      where: { id: layoutId },
      include: {
        project: true,
      },
    });

    if (!layout) {
      return notFoundResponse('Layout not found');
    }

    // Check ownership or admin
    if (layout.project.userId !== request.user?.id && request.user?.role !== 'ADMIN' && request.user?.role !== 'SUPER_ADMIN') {
      return forbiddenResponse('You do not have permission to delete this layout');
    }

    // Delete layout
    await prisma.layout.delete({
      where: { id: layoutId },
    });

    return successResponse(null, 'Layout deleted successfully');
  } catch (error) {
    console.error('Delete layout error:', error);
    return serverErrorResponse('Failed to delete layout', (error as Error).message);
  }
}

export const GET = requireAuth(getLayout);
export const PATCH = requireAuth(updateLayout);
export const DELETE = requireAuth(deleteLayout);
