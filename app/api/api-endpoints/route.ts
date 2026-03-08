import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-middleware';
import { prisma } from '@/lib/db';
import { successResponse, serverErrorResponse, validationErrorResponse, errorResponse } from '@/lib/api-response';
import { z } from 'zod';
import type { AuthenticatedRequest } from '@/lib/api-middleware';

const createApiEndpointSchema = z.object({
  projectId: z.string().min(1),
  name: z.string().min(1).max(100),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
  url: z.string().url(),
  headers: z.record(z.string()).optional(),
  body: z.record(z.unknown()).optional(),
  responseSchema: z.record(z.unknown()).optional(),
  description: z.string().max(500).optional(),
});

/**
 * GET List all API endpoints for the current user
 */
async function listApiEndpoints(request: AuthenticatedRequest) {
  try {
    const userId = request.user?.id;

    if (!userId) {
      return serverErrorResponse('User ID not found');
    }

    const endpoints = await prisma.apiEndpoint.findMany({
      where: {
        project: {
          userId: userId,
        },
      },
      include: {
        project: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return successResponse(
      {
        endpoints,
      },
      'API endpoints retrieved successfully'
    );
  } catch (error) {
    console.error('List API endpoints error:', error);
    return serverErrorResponse('Failed to fetch API endpoints', (error as Error).message);
  }
}

/**
 * POST Create a new API endpoint
 */
async function createApiEndpoint(request: AuthenticatedRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = createApiEndpointSchema.safeParse(body);
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

    const { projectId, ...data } = validationResult.data;

    // Check project ownership
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return serverErrorResponse('Project not found');
    }

    if (project.userId !== request.user?.id && request.user?.role !== 'ADMIN' && request.user?.role !== 'SUPER_ADMIN') {
      return errorResponse('You do not have permission to add endpoints to this project', 403, 'FORBIDDEN');
    }

    // Create endpoint
    const endpoint = await prisma.apiEndpoint.create({
      data: {
        ...data,
        headers: data.headers as any,
        body: data.body as any,
        responseSchema: data.responseSchema as any,
        projectId,
      },
    });

    return successResponse(
      {
        endpoint,
      },
      'API endpoint created successfully',
      201
    );
  } catch (error) {
    console.error('Create API endpoint error:', error);
    return serverErrorResponse('Failed to create API endpoint', (error as Error).message);
  }
}

export const GET = requireAuth(listApiEndpoints);
export const POST = requireAuth(createApiEndpoint);
