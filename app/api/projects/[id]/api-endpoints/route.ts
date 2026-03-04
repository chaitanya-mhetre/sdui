import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api-middleware';
import { prisma } from '@/lib/db';
import { successResponse, notFoundResponse, forbiddenResponse, errorResponse, validationErrorResponse, serverErrorResponse } from '@/lib/api-response';
import { z } from 'zod';
import type { AuthenticatedRequest } from '@/lib/api-middleware';

const createApiEndpointSchema = z.object({
  name: z.string().min(1, 'Endpoint name is required').max(100),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
  url: z.string().url('Invalid URL'),
  headers: z.record(z.string()).optional(),
  body: z.record(z.unknown(), z.unknown()).optional(),
  responseSchema: z.record(z.unknown(), z.unknown()).optional(),
  description: z.string().max(500).optional(),
});

async function getApiEndpoints(request: AuthenticatedRequest) {
  try {
    const url = new URL(request.url);
    const projectId = url.pathname.split('/')[3]; // /api/projects/[id]/api-endpoints

    if (!projectId) {
      return errorResponse('Project ID is required', 400);
    }

    // Check if project exists and user has access
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return notFoundResponse('Project not found');
    }

    if (project.userId !== request.user?.id && request.user?.role !== 'ADMIN' && request.user?.role !== 'SUPER_ADMIN') {
      return forbiddenResponse('You do not have permission to access this project');
    }

    const endpoints = await prisma.apiEndpoint.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(
      {
        endpoints,
      },
      'API endpoints retrieved successfully'
    );
  } catch (error) {
    console.error('Get API endpoints error:', error);
    return serverErrorResponse('Failed to get API endpoints', (error as Error).message);
  }
}

async function createApiEndpoint(request: AuthenticatedRequest) {
  try {
    const url = new URL(request.url);
    const projectId = url.pathname.split('/')[3];

    if (!projectId) {
      return errorResponse('Project ID is required', 400);
    }

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

    // Check if project exists and user has access
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return notFoundResponse('Project not found');
    }

    if (project.userId !== request.user?.id && request.user?.role !== 'ADMIN' && request.user?.role !== 'SUPER_ADMIN') {
      return forbiddenResponse('You do not have permission to create endpoints in this project');
    }

    // Create API endpoint
    const endpoint = await prisma.apiEndpoint.create({
      data: {
        projectId,
        name: validationResult.data.name,
        method: validationResult.data.method,
        url: validationResult.data.url,
        headers: validationResult.data.headers || {},
        body: validationResult.data.body,
        responseSchema: validationResult.data.responseSchema,
        description: validationResult.data.description,
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

export const GET = requireAuth(getApiEndpoints);
export const POST = requireAuth(createApiEndpoint);
