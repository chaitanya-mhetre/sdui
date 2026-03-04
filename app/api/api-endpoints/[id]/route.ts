import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api-middleware';
import { prisma } from '@/lib/db';
import { successResponse, notFoundResponse, forbiddenResponse, errorResponse, validationErrorResponse, serverErrorResponse } from '@/lib/api-response';
import { z } from 'zod';
import type { AuthenticatedRequest } from '@/lib/api-middleware';

const updateApiEndpointSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']).optional(),
  url: z.string().url().optional(),
  headers: z.record(z.string()).optional(),
  body: z.record(z.unknown(), z.unknown()).optional(),
  responseSchema: z.record(z.unknown(), z.unknown()).optional(),
  description: z.string().max(500).optional(),
});

async function getApiEndpoint(request: AuthenticatedRequest) {
  try {
    const url = new URL(request.url);
    const endpointId = url.pathname.split('/').pop();

    if (!endpointId) {
      return errorResponse('API endpoint ID is required', 400);
    }

    const endpoint = await prisma.apiEndpoint.findUnique({
      where: { id: endpointId },
      include: {
        project: true,
      },
    });

    if (!endpoint) {
      return notFoundResponse('API endpoint not found');
    }

    // Check ownership or admin
    if (endpoint.project.userId !== request.user?.id && request.user?.role !== 'ADMIN' && request.user?.role !== 'SUPER_ADMIN') {
      return forbiddenResponse('You do not have permission to access this endpoint');
    }

    return successResponse(
      {
        endpoint,
      },
      'API endpoint retrieved successfully'
    );
  } catch (error) {
    console.error('Get API endpoint error:', error);
    return serverErrorResponse('Failed to get API endpoint', (error as Error).message);
  }
}

async function updateApiEndpoint(request: AuthenticatedRequest) {
  try {
    const url = new URL(request.url);
    const endpointId = url.pathname.split('/').pop();

    if (!endpointId) {
      return errorResponse('API endpoint ID is required', 400);
    }

    const body = await request.json();

    // Validate input
    const validationResult = updateApiEndpointSchema.safeParse(body);
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

    // Check if endpoint exists
    const existingEndpoint = await prisma.apiEndpoint.findUnique({
      where: { id: endpointId },
      include: {
        project: true,
      },
    });

    if (!existingEndpoint) {
      return notFoundResponse('API endpoint not found');
    }

    // Check ownership or admin
    if (existingEndpoint.project.userId !== request.user?.id && request.user?.role !== 'ADMIN' && request.user?.role !== 'SUPER_ADMIN') {
      return forbiddenResponse('You do not have permission to update this endpoint');
    }

    // Update endpoint
    const endpoint = await prisma.apiEndpoint.update({
      where: { id: endpointId },
      data: validationResult.data,
    });

    return successResponse(
      {
        endpoint,
      },
      'API endpoint updated successfully'
    );
  } catch (error) {
    console.error('Update API endpoint error:', error);
    return serverErrorResponse('Failed to update API endpoint', (error as Error).message);
  }
}

async function deleteApiEndpoint(request: AuthenticatedRequest) {
  try {
    const url = new URL(request.url);
    const endpointId = url.pathname.split('/').pop();

    if (!endpointId) {
      return errorResponse('API endpoint ID is required', 400);
    }

    // Check if endpoint exists
    const endpoint = await prisma.apiEndpoint.findUnique({
      where: { id: endpointId },
      include: {
        project: true,
      },
    });

    if (!endpoint) {
      return notFoundResponse('API endpoint not found');
    }

    // Check ownership or admin
    if (endpoint.project.userId !== request.user?.id && request.user?.role !== 'ADMIN' && request.user?.role !== 'SUPER_ADMIN') {
      return forbiddenResponse('You do not have permission to delete this endpoint');
    }

    // Delete endpoint
    await prisma.apiEndpoint.delete({
      where: { id: endpointId },
    });

    return successResponse(null, 'API endpoint deleted successfully');
  } catch (error) {
    console.error('Delete API endpoint error:', error);
    return serverErrorResponse('Failed to delete API endpoint', (error as Error).message);
  }
}

export const GET = requireAuth(getApiEndpoint);
export const PATCH = requireAuth(updateApiEndpoint);
export const DELETE = requireAuth(deleteApiEndpoint);
